pipeline {
  agent {
    kubernetes {
      label 'kubedeploy-agent'
      yaml '''
        apiVersion: v1
        kind: Pod
        spec:
          containers:
          - name: kubectl
            image: eclipsefdn/kubectl:okd-c1
            command:
            - cat
            tty: true
            resources:
              limits:
                cpu: 1
                memory: 1Gi
            volumeMounts:
            - mountPath: "/home/default/.kube"
              name: "dot-kube"
              readOnly: false
          - name: eks
            image: eclipsefdn/aws:alpine-latest
            command:
            - cat
            tty: true
            resources:
              limits:
                cpu: 1
                memory: 1Gi
            volumeMounts:
            - mountPath: "/home/default/.kube"
              name: "dot-kube"
              readOnly: false
          - name: jnlp
            resources:
              limits:
                cpu: 1
                memory: 1Gi
          volumes:
          - name: "dot-kube"
            emptyDir: {}
      '''
    }
  }

  environment {
    APP_NAME = 'open-vsx-org'
    NAMESPACE = 'foundation-internal-webdev-apps'
    IMAGE_NAME = 'ghcr.io/eclipsefdn/openvsx-website'
    CONTAINER_NAME = 'open-vsx-org'
    IMAGE_TAG = sh(
      script: """
        if [ "${env.TAG_NAME}" = "" ]; then
          printf ${env.TAG_NAME}-${env.BUILD_NUMBER}
        else
          printf \$(git rev-parse --short ${env.GIT_COMMIT})-${env.BUILD_NUMBER}
        fi
      """,
      returnStdout: true
    )
  }

  options {
    buildDiscarder(logRotator(numToKeepStr: '10'))
    timeout(time: 30, unit: 'MINUTES')
  }

  stages {
    stage('Build docker image') {
      agent {
        label 'docker-build'
      }
      steps {
        sh '''
          docker build --pull -t ${IMAGE_NAME}:${IMAGE_TAG} .
        '''
      }
    }

    stage('Push docker image') {
      agent {
        label 'docker-build'
      }
      steps {
        withDockerRegistry([credentialsId: 'a56a2346-7fc5-4f91-a624-073197e5f5c8', url: 'https://ghcr.io/']) {
          sh '''
            docker push ${IMAGE_NAME}:${IMAGE_TAG}
          '''
        }
      }
    }

    stage('Deploy test') {
      when {
        branch 'test'
      }
      steps {
        container('kubectl') {
          withKubeConfig([credentialsId: 'ci-bot-okd-c1-token', serverUrl: 'https://api.okd-c1.eclipse.org:6443']) {
            sh '''
              ./kubernetes/helm-deploy.sh test "${IMAGE_TAG}"
            '''
          }
        }
      }
    }

    stage('Deploy staging') {
      when {
        branch 'main'
      }
      steps {
        container('kubectl') {
          withKubeConfig([credentialsId: 'ci-bot-okd-c1-token', serverUrl: 'https://api.okd-c1.eclipse.org:6443']) {
            sh '''
              ./kubernetes/helm-deploy.sh staging "${IMAGE_TAG}"
            '''
          }
        }
      }
    }

    stage('Deploy production') {
      when {
        branch 'production'
      }
      steps {
        container('kubectl') {
          withKubeConfig([credentialsId: 'ci-bot-okd-c1-token', serverUrl: 'https://api.okd-c1.eclipse.org:6443']) {
            sh '''
              ./kubernetes/helm-deploy.sh production "${IMAGE_TAG}"
            '''
          }
        }
      }
    }

    // Fetch chart dependencies once: the parallel deploys below share this workspace and
    // would otherwise race on charts/openvsx/charts/ and the Helm repo cache.
    stage('Prepare aws-main deploy') {
      when {
        branch 'aws-main'
      }
      steps {
        container('eks') {
          sh './kubernetes/helm-deps.sh'
        }
      }
    }

    // aws-test and aws-staging deploy side by side on the staging cluster (separate
    // namespaces/releases). failFast false: a failed aws-test deploy does not abort
    // aws-staging (the build is still marked failed). Each branch gets its own kubeconfig
    // so the concurrent `aws eks update-kubeconfig` calls don't write the same file.
    stage('Deploy aws-main') {
      when {
        branch 'aws-main'
      }
      failFast false
      parallel {
        stage('Deploy aws-test') {
          steps {
            container('eks') {
              withCredentials([
                string(credentialsId: 'jenkins-openvsx-aws-key-id',     variable: 'AWS_ACCESS_KEY_ID'),
                string(credentialsId: 'jenkins-openvsx-aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY'),
              ]) {
                sh '''
                  set -e
                  export AWS_DEFAULT_REGION=eu-central-1
                  export KUBECONFIG="${HOME}/.kube/config-aws-test"
                  aws eks update-kubeconfig --name eks-staging-openvsx --region eu-central-1
                  SKIP_HELM_DEPS=1 ./kubernetes/helm-deploy.sh aws-test "${IMAGE_TAG}"
                '''
              }
            }
          }
        }

        stage('Deploy aws-staging') {
          steps {
            container('eks') {
              withCredentials([
                string(credentialsId: 'jenkins-openvsx-aws-key-id',     variable: 'AWS_ACCESS_KEY_ID'),
                string(credentialsId: 'jenkins-openvsx-aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY'),
              ]) {
                sh '''
                  set -e
                  export AWS_DEFAULT_REGION=eu-central-1
                  export KUBECONFIG="${HOME}/.kube/config-aws-staging"
                  aws eks update-kubeconfig --name eks-staging-openvsx --region eu-central-1
                  SKIP_HELM_DEPS=1 ./kubernetes/helm-deploy.sh aws-staging "${IMAGE_TAG}"
                '''
              }
            }
          }
        }
      }
    }

    stage('Deploy aws-production') {
      when {
        branch 'aws-production'
      }
      steps {
        container('eks') {
          withCredentials([
            string(credentialsId: 'jenkins-openvsx-aws-key-id',     variable: 'AWS_ACCESS_KEY_ID'),
            string(credentialsId: 'jenkins-openvsx-aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY'),
          ]) {
            sh '''
              set -e
              export AWS_DEFAULT_REGION=eu-central-1
              aws eks update-kubeconfig --name eks-production-openvsx --region eu-central-1
              ./kubernetes/helm-deploy.sh aws-production "${IMAGE_TAG}"
            '''
          }
        }
      }
    }
  }

  post {
    failure {
      mail to: 'ci-admin@eclipse.org',
        subject: "[open-vsx.org] Build Failure ${currentBuild.fullDisplayName} - ${env.BRANCH_NAME}",
        mimeType: 'text/html',
        body: "Project: ${env.JOB_NAME}<br/>Build Number: ${env.BUILD_NUMBER}<br/>Build URL: ${env.BUILD_URL}<br/>Console: ${env.BUILD_URL}/console"
    }
    fixed {
      mail to: 'ci-admin@eclipse.org',
        subject: "[open-vsx.org] Back to normal ${currentBuild.fullDisplayName} - ${env.BRANCH_NAME}",
        mimeType: 'text/html',
        body: "Project: ${env.JOB_NAME}<br/>Build Number: ${env.BUILD_NUMBER}<br/>Build URL: ${env.BUILD_URL}<br/>Console: ${env.BUILD_URL}/console"
    }
    cleanup {
      deleteDir() /* clean up workspace */
    }
  }
}
