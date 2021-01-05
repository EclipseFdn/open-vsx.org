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
          imagePullPolicy: Always
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
          withKubeConfig([credentialsId: 'b04681b6-6fc2-4432-aaec-a6a8755b25ac', serverUrl: 'https://api.okd-c1.eclipse.org:6443']) {
            sh '''
              ./kubernetes/gen-deployment.sh staging "${IMAGE_NAME}:${IMAGE_TAG}" | kubectl apply -f -
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
          withKubeConfig([credentialsId: 'b04681b6-6fc2-4432-aaec-a6a8755b25ac', serverUrl: 'https://api.okd-c1.eclipse.org:6443']) {
            sh '''
              ./kubernetes/gen-deployment.sh production "${IMAGE_NAME}:${IMAGE_TAG}" | kubectl apply -f -
            '''
          }
        }
      }
    }
  }

  post {
    failure {
      mail to: 'mikael.barbero@eclipse-foundation.org',
        subject: "[open-vsx.org] Build Failure ${currentBuild.fullDisplayName}",
        mimeType: 'text/html',
        body: "Project: ${env.JOB_NAME}<br/>Build Number: ${env.BUILD_NUMBER}<br/>Build URL: ${env.BUILD_URL}<br/>Console: ${env.BUILD_URL}/console"
    }
    fixed {
      mail to: 'mikael.barbero@eclipse-foundation.org',
        subject: "[CBI] Back to normal ${currentBuild.fullDisplayName}",
        mimeType: 'text/html',
        body: "Project: ${env.JOB_NAME}<br/>Build Number: ${env.BUILD_NUMBER}<br/>Build URL: ${env.BUILD_URL}<br/>Console: ${env.BUILD_URL}/console"
    }
    cleanup {
      deleteDir() /* clean up workspace */
    }
  }
}
