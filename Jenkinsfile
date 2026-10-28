
pipeline {
    agent any

    environment {
        DOCKER_HOST = 'tcp://jenkins-docker:2375'
        DB_USER = 'taskuser'
        DB_PASSWORD = 'localdev123'
        DB_NAME = 'taskmanager'
        TEST_NETWORK = 'task-manager-ci'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Source code checked out by Jenkins.'
            }
        }

        stage('Prepare Test Environment') {
            steps {
                sh '''
                    docker network inspect "$TEST_NETWORK" >/dev/null 2>&1 ||
                        docker network create "$TEST_NETWORK"

                    docker rm -f task-manager-test-db 2>/dev/null || true

                    docker run -d \
                      --name task-manager-test-db \
                      --network "$TEST_NETWORK" \
                      -e POSTGRES_USER="$DB_USER" \
                      -e POSTGRES_PASSWORD="$DB_PASSWORD" \
                      -e POSTGRES_DB="$DB_NAME" \
                      postgres:18

                    for i in $(seq 1 30); do
                        if docker exec task-manager-test-db \
                            pg_isready -U "$DB_USER" -d "$DB_NAME"; then
                            echo "PostgreSQL is ready."
                            exit 0
                        fi
                        sleep 2
                    done

                    echo "PostgreSQL failed to become ready."
                    exit 1
                '''
            }
        }

        stage('Install and Test') {
            steps {
                sh '''
                    tar -czf - \
                      --exclude=.git \
                      --exclude=node_modules \
                      -C "$WORKSPACE" . |
                    docker run --rm -i \
                      --network "$TEST_NETWORK" \
                      -e DB_HOST=task-manager-test-db \
                      -e DB_PORT=5432 \
                      -e DB_USER="$DB_USER" \
                      -e DB_PASSWORD="$DB_PASSWORD" \
                      -e DB_NAME="$DB_NAME" \
                      node:24-alpine sh -c '
                        mkdir -p /workspace &&
                        tar -xzf - -C /workspace &&
                        cd /workspace &&
                        npm ci &&
                        npm test
                      '
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    tar -czf - \
                      --exclude=.git \
                      --exclude=node_modules \
                      -C "$WORKSPACE" . |
                    docker build \
                      -t cloud-task-manager:jenkins -
                '''
            }
        }
    }

    post {
        always {
            sh '''
                docker rm -f task-manager-test-db 2>/dev/null || true
                docker network rm "$TEST_NETWORK" 2>/dev/null || true
            '''
        }
    }
}
