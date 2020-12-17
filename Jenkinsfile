@Library('common-shared') _

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
          image: eclipsefdn/kubectl:1.18-alpine
          command:
          - cat
          tty: true
          resources:
            limits:
              cpu: 1
              memory: 1Gi
        - name: jnlp
          resources:
            limits:
              cpu: 1
              memory: 1Gi
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

    stage('Deploy staging') {
      when {
        branch 'master'
      }
      steps {
        container('kubectl') {
          withKubeConfig([credentialsId: '6ad93d41-e6fc-4462-b6bc-297e360784fd', serverUrl: 'https://api.okd-c1.eclipse.org:6443']) {
            sh '''
              ./kubernetes/gen-deployment.sh staging ${IMAGE_NAME}:${IMAGE_TAG}
            '''
          }
        }
      }
    }

    stage('Deploy production') {
      when {
        tag "release-*"
      }
      steps {
        container('kubectl') {
          withKubeConfig([credentialsId: '6ad93d41-e6fc-4462-b6bc-297e360784fd', serverUrl: 'https://api.okd-c1.eclipse.org:6443']) {
            sh '''
              ./kubernetes/gen-deployment.sh production ${IMAGE_NAME}:${IMAGE_TAG}
            '''
          }
        }
      }
    }
  }

  post {
    always {
      deleteDir() /* clean up workspace */
      sendNotifications currentBuild
    }
  }
}
