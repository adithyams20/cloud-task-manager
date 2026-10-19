
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'develop',
                    url: 'https://github.com/adithyams20/cloud-task-manager.git'
            }
        }

        stage('Check Environment') {
            steps {
                sh 'echo "Jenkins pipeline is running"'
                sh 'git --version'
            }
        }
    }
}
