# ******************************************************************************
# Copyright (c) 2025 Precies. Software OU and others
#
# This program and the accompanying materials are made available under the
# terms of the Eclipse Public License v. 2.0 which is available at
# http://www.eclipse.org/legal/epl-2.0.
#
# SPDX-License-Identifier: EPL-2.0
# ******************************************************************************
import os
import asyncio
import socket
import subprocess
from utils import pod_host, pod_name

def redis_cli(args, logger):
    try:
        user = os.getenv("REDIS_USERNAME")
        cmd = f"redis-cli --user {user} {args}"
        logger.debug(cmd)
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            check=True
        )

        output = result.stdout.strip()
        # logger.debug(output)
        return output
    except subprocess.CalledProcessError as e:
        error = e.stderr.strip()
        logger.error(error)
        logger.error(e.stdout.strip())
        return error
    except FileNotFoundError:
        error = "redis-cli not found. Is it installed and in your PATH?"
        logger.error(error)
        return error

def redis_cli_cmd(command, logger, host, port=6379):
    return redis_cli(f"-h {host} -p {str(port)} {command}", logger)

async def wait_until_redis_node_reachable(index, name, service_name, logger):
    pname = pod_name(name, index)
    phost = pod_host(pname, service_name)
    logger.info(f"Waiting for Redis node '{pname}' to be reachable...")
    reachable = False
    while not reachable:
        reachable = redis_cli_cmd("PING", logger, phost) == "PONG"
        if not reachable:
            await asyncio.sleep(2)

    logger.info(f"{pname} is reachable.")

async def wait_until_node_is_known(name, index, service_name, logger):
    self_host = pod_host(pod_name(name, index), service_name)
    nodes = redis_cli_cmd("CLUSTER NODES", logger, self_host).splitlines()
    myself = next((node for node in nodes if self_host in node), None).split()
    search = f"{myself[0]} {myself[1]}"
    logger.debug(f"Searching for '{search}'")

    found = 0
    while found < index:
        found = 0
        for i in range(0, index):
            other_host = pod_host(pod_name(name, i), service_name)
            nodes = redis_cli_cmd("CLUSTER NODES", logger, other_host).splitlines()
            other = next((node for node in nodes if node.startswith(search)), None)
            if other is not None:
                found += 1
            logger.debug(f"Found {found}/{index}")
        if found < index:
            await asyncio.sleep(2)

    return myself[0]

async def wait_until_node_deleted(name, index, service_name, expected_nodes, logger):
    host_name = pod_host(pod_name(name, index), service_name)
    actual_nodes = -1
    while actual_nodes != expected_nodes:
        nodes = redis_cli_cmd("CLUSTER NODES", logger, host_name).splitlines()
        actual_nodes = len(nodes)
        logger.debug(f"Node deleted? expected: {expected_nodes}, actual: {actual_nodes}")
        if actual_nodes != expected_nodes:
            await asyncio.sleep(2)

async def wait_until_redis_reshard_complete(reshard_host, name, service_name, total, logger):
    complete_count = 0
    reshard_search = f"{reshard_host}:6379"
    logger.info("Waiting for Redis reshard command to complete...")
    while complete_count < total:
        complete_count = 0
        for i in range(0, total):
            host_name = pod_host(pod_name(name, i), service_name)

            line_index = -1
            lines = await redis_cluster_check(host_name, logger)
            for i in range(0, len(lines)):
                if lines[i].endswith(reshard_search):
                    line_index = i + 1
                    break

            if line_index != -1:
                line = lines[line_index].strip()
                logger.debug(f"LINE: {line}")
                if line.startswith("slots: (0 slots)"):
                    complete_count += 1
                    logger.info(f"Reshard complete for {reshard_host}")
        if complete_count < total:
            await asyncio.sleep(2)

async def wait_until_redis_node_added(name, index, service_name, logger):
    for i in range(0, index + 1):
        pname = pod_name(name, i)
        logger.info(f"Waiting for Redis node '{pname}' to be added...")
        new_node = True
        while new_node:
            new_node = is_cluster_unhealthy(pod_host(pname, service_name), logger)
            if new_node:
                await asyncio.sleep(2)

async def wait_until_redis_cluster_healthy(pod_host, logger):
    unhealthy = True
    logger.info("Waiting for Redis cluster to stabilize...")
    while unhealthy:
        unhealthy = is_cluster_unhealthy(pod_host, logger)
        if unhealthy:
            await asyncio.sleep(2)

async def redis_cluster_create(replicas, name, service_name, logger):
    hosts = ""
    for i in range(0, replicas):
        hosts += f"{pod_host(pod_name(name, i), service_name)}:6379 "

    redis_cli(f"--cluster create {hosts}--cluster-replicas 1 --cluster-yes", logger)

def is_new_redis_node(host_name, logger):
    nodes = redis_cli_cmd("CLUSTER NODES", logger, host_name).splitlines()
    return len(nodes) == 1 and " myself,master " in nodes[0]

def get_first_master_without_replica(host_name, myself, logger):
    nodes = redis_cli_cmd("CLUSTER NODES", logger, host_name).splitlines()
    masters = [node.split()[0] for node in nodes if "master " in node]
    masters = [master for master in masters if master != myself]
    replica_search = "slave "
    replicas = []
    for node in nodes:
        if replica_search in node:
            start = node.index(replica_search) + len(replica_search)
            end = node.index(" ", start)
            replicas.append(node[start:end])

    logger.debug(f"MASTERS: [{', '.join(masters)}]")
    logger.debug(f"REPLICAS: [{', '.join(replicas)}]")
    master = next((master for master in masters if master not in replicas), None)
    logger.debug(f"Found master: {master}, myself: {myself}")
    return master

def is_cluster_unhealthy(host_name, logger):
    checks = redis_cli(rf"--cluster check {host_name}:6379 | grep -E '\[OK\] All nodes agree about slots configuration.|\[OK\] All 16384 slots covered.|\[WARNING\]'", logger).splitlines()
    return len(checks) != 2 or any(check.startswith('[WARNING]') for check in checks)

def rebalance_redis_cluster(ip_addr, logger):
    retries = 0
    rebalanced = False
    while not rebalanced and retries < 3:
        output = redis_cli(f"--cluster rebalance {ip_addr}:6379 --cluster-use-empty-masters", logger)
        if " ERR " in output:
            redis_cli(f"--cluster fix {ip_addr}:6379", logger)
            retries += 1
        else:
            rebalanced = True

async def redis_cluster_check(host_name, logger):
    valid = False
    cluster_check_output = ""
    while not valid:
        cluster_check_output = redis_cli(f"--cluster check {host_name}:6379", logger)
        all_agree = "[OK] All nodes agree about slots configuration." in cluster_check_output 
        all_covered = "[OK] All 16384 slots covered." in cluster_check_output
        no_warnings = "[WARNING]" not in cluster_check_output
        valid = all_agree and all_covered and no_warnings
        if not valid:
            await asyncio.sleep(2)

    return cluster_check_output.splitlines()

async def get_redis_master_node(host_name, logger):
    node_slots = 0
    node_id = redis_cli_cmd("CLUSTER MYID", logger, host_name)
    node_search = f"M: {node_id} {host_name}:6379"
    line_index = -1
    lines = await redis_cluster_check(host_name, logger)
    for i in range(0, len(lines)):
        logger.debug(f"LINE: '{lines[i]}'")
        logger.debug(f"SEARCH: '{node_search}'")
        if lines[i] == node_search:
            line_index = i + 1
            break

    if line_index != -1:
        line = lines[line_index]
        start_search = "] ("
        start_index = line.index(start_search) + len(start_search)
        end_search = " slots) master"
        end_index = len(line) - len(end_search)
        node_slots = int(line[start_index:end_index])

    return node_id, node_slots

async def find_redis_master_node_to_reshard_to(name, service_name, start, limit, logger):
    cluster_host = pod_host(pod_name(name, 0), service_name)
    lines = await redis_cluster_check(cluster_host, logger)
    for i in range(start, limit):
        master_host = pod_host(pod_name(name, i), service_name)
        start_search = "M: "
        end_search = f" {master_host}:6379"
        for line in lines:
            if line.startswith(start_search) and line.endswith(end_search):
                return line[len(start_search):len(line) - len(end_search)]

async def create_redis_cluster(replicas, name, service_name, logger):
    logger.info("Creating Redis cluster...")
    for i in range(0, replicas):
        await wait_until_redis_node_reachable(i, name, service_name, logger)
    
    if not is_new_redis_node(pod_host(pod_name(name, replicas - 1), service_name), logger):
        logger.info("Cluster already exists, skipping creation")
        return

    await redis_cluster_create(replicas, name, service_name, logger)
    logger.info("Created Redis cluster")

async def remove_redis_cluster_nodes(current_nodes, new_nodes, name, service_name, logger):
    remove_count = current_nodes - new_nodes
    logger.info(f"Removing {remove_count} nodes from Redis cluster...")

    cluster_master_index = 0
    for i in range(0, remove_count):
        pod_index = current_nodes - i - 1
        node_host = pod_host(pod_name(name, pod_index), service_name)
        node_id, node_slots = await get_redis_master_node(node_host, logger)
        is_master = node_slots > 0
        if is_master:
            node_ip = socket.gethostbyname(node_host)
            cluster_to = await find_redis_master_node_to_reshard_to(name, service_name, cluster_master_index, new_nodes, logger)
            redis_cli(f"--cluster reshard {node_ip}:6379 --cluster-from {node_id} --cluster-to {cluster_to} --cluster-slots {str(node_slots)} --cluster-yes", logger)
            await wait_until_redis_reshard_complete(node_host, name, service_name, current_nodes, logger)
            cluster_master_index += 1

    did_reshard = cluster_master_index > 0
    if did_reshard:
        for i in range(0, current_nodes):
            host_name = pod_host(pod_name(name, i), service_name)
            await wait_until_redis_cluster_healthy(host_name, logger)

        cluster_host = pod_host(pod_name(name, 0), service_name)
        cluster_ip = socket.gethostbyname(cluster_host)
        rebalance_redis_cluster(cluster_ip, logger)
        for i in range(0, current_nodes):
            host_name = pod_host(pod_name(name, i), service_name)
            await wait_until_redis_cluster_healthy(host_name, logger)

    for i in range(0, remove_count):
        pod_index = current_nodes - i - 1
        node_host = pod_host(pod_name(name, pod_index), service_name)
        node_ip = socket.gethostbyname(node_host)
        node_id = redis_cli_cmd("CLUSTER MYID", logger, node_host)
        redis_cli(f"--cluster del-node {node_ip}:6379 {node_id}", logger)
        redis_cli_cmd("FLUSHDB", logger, node_host)
        for x in range(0, pod_index):
            host_name = pod_host(pod_name(name, x), service_name)
            await wait_until_redis_cluster_healthy(host_name, logger)
        for x in range(0, pod_index):
            await wait_until_node_deleted(name, x, service_name, pod_index, logger)

async def add_redis_cluster_nodes(current_nodes, new_nodes, name, service_name, logger):
    logger.info(f"Adding {new_nodes - current_nodes} nodes to Redis cluster...")
    for i in range(current_nodes, new_nodes):
        await wait_until_redis_node_reachable(i, name, service_name, logger)
        pname = pod_name(name, i)
        phost = pod_host(pname, service_name)
        if not is_new_redis_node(phost, logger):
            logger.info(f"Pod {pname} is known Redis node, skipping")
            continue

        cluster_host = pod_host(pod_name(name, 0), service_name)
        new_ip = socket.gethostbyname(phost)
        ip = socket.gethostbyname(cluster_host)
        redis_cli(f"--cluster add-node {new_ip}:6379 {ip}:6379", logger)
        await wait_until_redis_node_added(name, i, service_name, logger)
        myself = await wait_until_node_is_known(name, i, service_name, logger)
        master_node_id = get_first_master_without_replica(cluster_host, myself, logger)
        if master_node_id is not None:
            redis_cli_cmd(f"CLUSTER REPLICATE {master_node_id}", logger, phost)
            logger.info(f"Added replica {pname} to Redis cluster")
        else:
            rebalance_redis_cluster(new_ip, logger)
            logger.info(f"Added master {pname} to Redis cluster")