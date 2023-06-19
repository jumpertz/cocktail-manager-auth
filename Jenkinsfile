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
                sh 'npm ci --force'
            }
        }

        stage('Test and coverage') {
            steps {
                sh 'npm run test -- --coverage'
            }
        }

        stage('SonarQube analysis') {
            steps {
              sh 'ls -la coverage'
                script {
                    if (env.BRANCH_NAME == 'main') {
                        withSonarQubeEnv('My SonarQube Server') {
                            def scannerHome = tool 'SonarScanner 3.0';
                            withEnv(["JAVA_HOME=${ tool 'JDK8' }", "PATH+SONAR=${scannerHome}/bin"]) {
                                sh "sonar-scanner -Dsonar.projectKey=CocktailManager-Auth -Dsonar.sources=. -Dsonar.host.url=http://52.87.237.67:9000 -Dsonar.login=ubuntu -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info"
                            }
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
