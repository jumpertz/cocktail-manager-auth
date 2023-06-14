pipeline {
    agent any

    stages {
        stage('Install Node.js') {
            steps {
                sh '''
                    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
                    . ~/.nvm/nvm.sh
                    nvm install --lts
                '''
            }
        }

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    . ~/.nvm/nvm.sh
                    nvm use --lts
                    npm ci
                '''
            }
        }

        stage('Test') {
            steps {
                sh '''
                    . ~/.nvm/nvm.sh
                    nvm use --lts
                    npm test
                '''
            }
        }

        stage('Build') {
            steps {
                sh '''
                    . ~/.nvm/nvm.sh
                    nvm use --lts
                    npm run build
                '''
            }
        }
    }

    post {
        always {
            echo 'This will always run'
        }
        failure {
            echo 'This will run only if failed'
        }
    }
}
