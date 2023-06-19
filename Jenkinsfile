pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Test') {
            steps {
                sh 'npm run test:cov'
            }
        }

        stage('SonarQube analysis') {
            steps {
                script {
                    if (env.BRANCH_NAME == 'main') {
                        withSonarQubeEnv('My SonarQube Server') {
                            sh 'npm run sonar'
                        }
                    }
                }
            }
        }
        
        stage('Archive Code Coverage') {
          steps {
            archiveArtifacts artifacts: 'coverage/**', onlyIfSuccessful: true
          }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
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
