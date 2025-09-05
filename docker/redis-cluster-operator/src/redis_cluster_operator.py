# ******************************************************************************
# Copyright (c) 2025 Precies. Software OU and others
#
# This program and the accompanying materials are made available under the
# terms of the Eclipse Public License v. 2.0 which is available at
# http://www.eclipse.org/legal/epl-2.0.
#
# SPDX-License-Identifier: EPL-2.0
# ******************************************************************************
import asyncio
import os
import socket
import subprocess
import yaml
import kopf
import kubernetes
from kubernetes.client.rest import ApiException
from redis_cli import (
    redis_cli, 
    redis_cli_cmd, 
    is_new_redis_node, 
    redis_cluster_create, 
    is_cluster_unhealthy,
    wait_until_redis_node_reachable,
    wait_until_node_is_known,
    get_first_master_without_replica,
    rebalance_redis_cluster,
    redis_cluster_check,
    get_redis_master_node,
    wait_until_node_deleted,
    create_redis_cluster,
    add_redis_cluster_nodes,
    remove_redis_cluster_nodes
)
from utils import pod_host, pod_name

def create_config_data(name, namespace, labels):
    path = os.path.join(os.path.dirname(__file__), 'templates', 'configmap.yaml')
    with open(path, "rt") as f:
        tmpl = f.read()
        text = tmpl.format(name=name, namespace=namespace, labels=labels)
        data = yaml.safe_load(text)
        kopf.adopt(data)
        return data

def create_service_data(name, sts_name, namespace, labels):
    path = os.path.join(os.path.dirname(__file__), 'templates', 'service.yaml')
    with open(path, "rt") as f:
        tmpl = f.read()
        text = tmpl.format(name=name, sts_name=sts_name, namespace=namespace, labels=labels)
        data = yaml.safe_load(text)
        kopf.adopt(data)
        return data

def create_statefulset_data(spec, name, namespace, labels, service_name, secret_name, config_name, pvc_name, acl_name, maxmemory):
    path = os.path.join(os.path.dirname(__file__), 'templates', 'statefulset.yaml')
    with open(path, "rt") as f:
        tmpl = f.read()
        text = tmpl.format(
            name=name,
            namespace=namespace,
            labels=labels, spec=spec,
            service_name=service_name,
            secret_name=secret_name,
            config_name=config_name,
            pvc_name=pvc_name,
            acl_name=acl_name,
            maxmemory=maxmemory
        )
        data = yaml.safe_load(text)
        kopf.adopt(data)
        return data

def statefulset_patch_replicas(name, namespace, replicas, apps_api):
    apps_api.patch_namespaced_stateful_set(
        name=name,
        namespace=namespace,
        body={
            "spec": {
                "replicas": replicas
            }
        }
    )

def statefulset_patch_container(name, namespace, container_name, key, value, apps_api):
    apps_api.patch_namespaced_stateful_set(
        name=name,
        namespace=namespace,
        body={
            "spec": {
                "template": {
                    "spec":{
                        "containers":[{
                            "name": container_name,
                            key: value
                        }]
                    }
                }
            }
        }
    )

def statefulset_patch_container_image(name, namespace, container_name, image, apps_api):
    statefulset_patch_container(name, namespace, container_name, "image", image, apps_api)

def statefulset_patch_container_image_pull_policy(name, namespace, container_name, image_pull_policy, apps_api):
    statefulset_patch_container(name, namespace, container_name, "imagePullPolicy", image_pull_policy, apps_api)

def statefulset_patch_container_resources(name, namespace, container_name, resources, apps_api):
    statefulset_patch_container(name, namespace, container_name, "resources", resources, apps_api)

def statefulset_patch_container_maxmemory(name, namespace, container_name, maxmemory, apps_api):
    env = [{"name": "MAXMEMORY", "value": maxmemory}]
    statefulset_patch_container(name, namespace, container_name, "env", env, apps_api)

def pvc_patch_storage(name, namespace, storage, core_api):
    core_api.patch_namespaced_persistent_volume_claim(
        name=name,
        namespace=namespace,
        body={
            "spec": {
                "resources": {
                    "requests":{
                        "storage": f"{storage}Gi"
                    }
                }
            }
        }
    )

def validate_spec(spec):
    replicas = spec.get('replicas')
    validate_replicas(replicas)

def validate_replicas(replicas):
    if replicas < 6:
        raise kopf.PermanentError(f"Replicas must be at least 6. Got {replicas!r}.")

def validate_host(name, service_name):
    host_name = pod_host(name, service_name)
    char_count = len(host_name)
    if char_count > 46:
        raise kopf.PermanentError(f"Host name must be 46 chars or less. Got {char_count}.")

def validate_secret(secret_name, namespace, core_api):
    try:
        secret_obj = core_api.read_namespaced_secret(name=secret_name, namespace=namespace)
        secret_data = secret_obj.data
        keys = [
            'REDIS_CLI_PASSWORD', 
            'REDIS_CLI_USERNAME', 
            'REDIS_METRICS_PASSWORD', 
            'REDIS_METRICS_USERNAME', 
            'REDIS_OPENVSX_PASSWORD', 
            'REDIS_OPENVSX_USERNAME',
            'REDIS_REPLICA_PASSWORD',
            'REDIS_REPLICA_USERNAME'
        ]
        for key in keys:
            if key not in secret_data:
                raise kopf.PermanentError(f"Secret {secret_name} must have {key}.")
    except ApiException as e:
        raise kopf.TemporaryError(f"Failed to read secret {secret_name}.") from e

def wait_until_pod_ready(index, name, namespace, core_api, logger):
    pname = pod_name(name, index)
    logger.info(f"Waiting for pod '{pname}' to be ready...")

    w = kubernetes.watch.Watch()
    for event in w.stream(core_api.list_namespaced_pod, namespace=namespace):
        pod = event['object']
        name = pod.metadata.name
        ready = False
        if pname == name:
            conditions = pod.status.conditions or []
            ready = any(cond.type == "Ready" and cond.status == "True" for cond in conditions)

        logger.debug(f"Event: {event['type']} - Pod: {name} - Ready: {ready}")
        if ready:
            break

    logger.info(f"{pname} is ready.")

def wait_until_pod_deleted(index, name, namespace, core_api, logger):
    pname = pod_name(name, index)
    logger.info(f"Waiting for pod '{pname}' to be deleted...")

    w = kubernetes.watch.Watch()
    for event in w.stream(core_api.list_namespaced_pod, namespace=namespace):
        pod = event['object']
        name = pod.metadata.name
        logger.debug(f"Event: {event['type']} - Pod: {name}")
        if pname == name and event['type'] == "DELETED":
            break

    logger.info(f"{pname} deleted.")

async def wait_until_pvc_capacity_increased(name, namespace, storage_gi, core_api, logger):
    logger.info(f"Waiting for {name} capacity to be increased")
    storage = f"{storage_gi}Gi"
    capacity_increased = False
    while not capacity_increased:
        status = core_api.read_namespaced_persistent_volume_claim_status(name, namespace)
        capacity_increased = status.capacity['storage'] == storage and any(cond.type == "FileSystemResizePending" for cond in status.conditions)
        if not capacity_increased:
            await asyncio.sleep(2)

    logger.info(f"{name} capacity increased")

@kopf.on.create('redisclusters')
async def create_fn(spec, name, namespace, labels, logger, **kwargs):
    validate_spec(spec)

    name = f"{name}-{labels['environment']}"
    config_name = f"{name}-config"
    pvc_name = f"{name}-data"
    service_name = f"{name}-service"
    acl_name = f"{name}-acl"
    validate_host(name, service_name)

    secret_name = f"redis-secret-{labels['environment']}"
    core_api = kubernetes.client.CoreV1Api()
    validate_secret(secret_name, namespace, core_api)

    cfg_data = create_config_data(config_name, namespace, labels)
    core_api.create_namespaced_config_map(namespace=namespace, body=cfg_data)
    logger.info("ConfigMap child is created")

    srv_data = create_service_data(service_name, name, namespace, labels)
    core_api.create_namespaced_service(namespace=namespace, body=srv_data)
    logger.info("Service child is created")

    sts_data = create_statefulset_data(spec, name, namespace, labels, service_name, secret_name, config_name, pvc_name, acl_name, spec['maxmemory'])
    apps_api = kubernetes.client.AppsV1Api()
    obj = apps_api.create_namespaced_stateful_set(namespace=namespace, body=sts_data)
    logger.info("StatefulSet child is created")

    return {
        'sts-name': obj.metadata.name, 
        'srv-name': service_name, 
        'cntr-name': obj.spec.template.spec.containers[0].name,
        'pvc-name': pvc_name,
        'cfg-name': config_name
    }

@kopf.on.field('redisclusters', field='spec.replicas')
async def on_replicas_change(old, new, status, namespace, logger, **kwargs):
    validate_replicas(new)

    name = status['create_fn']['sts-name']
    service_name = status['create_fn']['srv-name']
    core_api = kubernetes.client.CoreV1Api()
    apps_api = kubernetes.client.AppsV1Api()
    if old is None:
        wait_until_pod_ready(new - 1, name, namespace, core_api, logger)
        await create_redis_cluster(new, name, service_name, logger)
    elif new > old:
        statefulset_patch_replicas(name, namespace, new, apps_api)
        for i in range(old, new):
            wait_until_pod_ready(i, name, namespace, core_api, logger)

        await add_redis_cluster_nodes(old, new, name, service_name, logger)
    elif new < old:
        await remove_redis_cluster_nodes(old, new, name, service_name, logger)
        statefulset_patch_replicas(name, namespace, new, apps_api)

@kopf.on.field('redisclusters', field='spec.maxmemory')
async def on_maxmemory_change(spec, old, new, status, namespace, logger, **kwargs):
    if old is None:
        return

    logger.info(f"Maxmemory changed from {old} to {new}")

    name = status['create_fn']['sts-name']
    service_name = status['create_fn']['srv-name']
    container_name = status['create_fn']['cntr-name']
    apps_api = kubernetes.client.AppsV1Api()
    statefulset_patch_container_maxmemory(name, namespace, container_name, new, apps_api)

    replicas = spec.get('replicas')
    core_api = kubernetes.client.CoreV1Api()
    for index in range(replicas - 1, -1, -1):
        core_api.delete_namespaced_pod(pod_name(name, index), namespace)
        wait_until_pod_deleted(index, name, namespace, core_api, logger)
        wait_until_pod_ready(index, name, namespace, core_api, logger)
        await wait_until_redis_node_reachable(index, name, service_name, logger)

@kopf.on.field('redisclusters', field='spec.image')
def on_image_change(old, new, status, namespace, logger, **kwargs):
    if old is None:
        return

    logger.info(f"Image changed from {old} to {new}")

    name = status['create_fn']['sts-name']
    container_name = status['create_fn']['cntr-name']
    apps_api = kubernetes.client.AppsV1Api()
    statefulset_patch_container_image(name, namespace, container_name, new, apps_api)

@kopf.on.field('redisclusters', field='spec.imagePullPolicy')
def on_image_pull_policy_change(old, new, status, namespace, logger, **kwargs):
    if old is None:
        return

    logger.info(f"Image pull policy changed from {old} to {new}")

    name = status['create_fn']['sts-name']
    container_name = status['create_fn']['cntr-name']
    apps_api = kubernetes.client.AppsV1Api()
    statefulset_patch_container_image_pull_policy(name, namespace, container_name, new, apps_api)

@kopf.on.field('redisclusters', field='spec.resources')
def on_resources_change(old, new, status, namespace, logger, **kwargs):
    if old is None:
        return

    logger.info(f"Resources changed from {old} to {new}")

    name = status['create_fn']['sts-name']
    container_name = status['create_fn']['cntr-name']
    apps_api = kubernetes.client.AppsV1Api()
    statefulset_patch_container_resources(name, namespace, container_name, new, apps_api)

@kopf.on.field('redisclusters', field='spec.persistence.storageGi')
async def on_persistence_storage_change(spec, old, new, status, namespace, logger, **kwargs):
    if old is None:
        return

    logger.info(f"Storage changed from {old} to {new}")
    if new < old:
        raise kopf.PermanentError("New storage size must be greater than old storage size.")

    storage_api = kubernetes.client.StorageV1Api()
    storage_class_name = spec.get('persistence').get('storageClass')
    storage_class = storage_api.read_storage_class(name=storage_class_name)
    if not storage_class.allow_volume_expansion:
        raise kopf.PermanentError(f"Storage class '{storage_class_name}' does not allow volume expansion.")

    apps_api = kubernetes.client.AppsV1Api()
    core_api = kubernetes.client.CoreV1Api()
    replicas = spec.get('replicas')
    name = status['create_fn']['sts-name']
    pvc_name = status['create_fn']['pvc-name']
    statefulset_patch_replicas(name, namespace, 0, apps_api)
    for index in range(replicas - 1, -1, -1):
        wait_until_pod_deleted(index, name, namespace, core_api, logger)

    exception = None
    try:
        for index in range(0, replicas):
            pvc = f"{pvc_name}-{name}-{index}"
            pvc_patch_storage(pvc, namespace, new, core_api)
            await wait_until_pvc_capacity_increased(pvc, namespace, new, core_api, logger)
    except ApiException as e:
        exception = e

    statefulset_patch_replicas(name, namespace, replicas, apps_api)
    if exception is not None:
        raise kopf.TemporaryError("Failed to increase persistent volume capacity") from exception

@kopf.on.field('redisclusters', field='spec.persistence.storageClass', annotations={'update-storage-class-unsupported': kopf.ABSENT})
def update_fn(patch, old, new, **kwargs):
    if old is None:
        return

    patch.metadata.annotations['update-storage-class-unsupported'] = 'yes'
    raise kopf.PermanentError(f"Redis operator is unable to migrate from '{old}' to '{new}' storageClassName.")
