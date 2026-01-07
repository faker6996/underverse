pipeline {
  agent any
  options {
    timestamps()
    skipDefaultCheckout(true)
  }

  environment {
    APP_NAME       = "underverse"
    IMAGE_TAG      = "latest"
    DOCKER_IMAGE   = "${APP_NAME}:${IMAGE_TAG}"
    DEPLOY_PORT    = "3007"
    CONTAINER_NAME = "${APP_NAME}"
    NEXT_TELEMETRY_DISABLED = "1"
    NPM_CONFIG_CACHE = "${WORKSPACE}/.npm"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install Dependencies') {
      steps {
        sh """
          npm ci --prefer-offline
        """
      }
    }

    stage('Lint') {
      steps {
        sh """
          npm run lint || true
        """
      }
    }

    stage('Build Docker Image') {
      steps {
        script {
          sh "docker build -t ${DOCKER_IMAGE} ."
        }
      }
    }

    stage('Deploy') {
      steps {
        sh """
          docker stop ${CONTAINER_NAME} || true
          docker rm ${CONTAINER_NAME} || true
          docker run -d \
            --name ${CONTAINER_NAME} \
            --restart unless-stopped \
            -p ${DEPLOY_PORT}:3000 \
            -e NODE_ENV=production \
            -e NEXT_TELEMETRY_DISABLED=1 \
            ${DOCKER_IMAGE}
        """
      }
    }

    stage('Healthcheck') {
      steps {
        sh """
          set -e
          echo "Waiting for application to start..."
          for i in \$(seq 1 30); do
            if command -v curl >/dev/null 2>&1; then
              if curl -fsS "http://127.0.0.1:${DEPLOY_PORT}/" >/dev/null; then
                echo "✅ Application is healthy!"
                exit 0
              fi
            else
              if wget -qO- "http://127.0.0.1:${DEPLOY_PORT}/" >/dev/null; then
                echo "✅ Application is healthy!"
                exit 0
              fi
            fi
            echo "Attempt \$i/30 - waiting..."
            sleep 2
          done
          echo "❌ Healthcheck failed for ${CONTAINER_NAME}"
          docker logs --tail=200 ${CONTAINER_NAME} || true
          exit 1
        """
      }
    }

    stage('Cleanup') {
      steps {
        sh """
          echo "🧹 Cleaning up old images..."
          docker image prune -f || true
        """
      }
    }
  }

  post {
    success {
      echo "✅ Deployment successful! App running at http://192.168.210.100:${DEPLOY_PORT}"
    }
    failure {
      echo "❌ Deployment failed!"
      sh "docker logs --tail=100 ${CONTAINER_NAME} || true"
    }
    always {
      cleanWs()
    }
  }
}
