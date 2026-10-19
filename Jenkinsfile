
pipeline {
    agent any

    environment {
        DOCKER_HOST = 'tcp://jenkins-docker:2375'
        DB_HOST = 'jenkins-docker'
        DB_PORT = '5433'
        DB_USER = 'taskuser'
        DB_PASSWORD = 'localdev123'
        DB_NAME = 'taskmanager'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Source code checked out by Jenkins.'
            }
        }

        stage('Start Test Database') {
            steps {
                sh '''
                    docker run -d --rm \
                      --name task-manager-test-db \
                      --network jenkins \
                      -e POSTGRES_USER=taskuser \
                      -e POSTGRES_PASSWORD=localdev123 \
                      -e POSTGRES_DB=taskmanager \
                      postgres:18
                '''
            }
        }

        stage('Install and Test') {
            steps {
                sh '''
                    docker run --rm \
                      --network jenkins \
                      -e DB_HOST=jenkins-docker \
                      -e DB_PORT=5433 \
                      -e DB_USER=taskuser \
                      -e DB_PASSWORD=localdev123 \
                      -e DB_NAME=taskmanager \
                      -v "$WORKSPACE:/app" \
                      -w /app \
                      node:24-alpine sh -c "npm ci && npm test"
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    docker build \
                      -t cloud-task-manager:jenkins \
                      "$WORKSPACE"
                '''
            }
        }
    }

    post {
        always {
            sh 'docker rm -f task-manager-test-db || true'
        }
    }
}
