pipeline {
    agent any

    environment {
        NODE_ENV = 'test'
    }

    stages {
        stage('Checkout') {
            steps {
                // Checks out the project into the workspace
                checkout scm
            }
        }

        stage('Install') {
            steps {
                // Installs project dependencies
                sh 'npm ci'
            }
        }

        stage('Test') {
            steps {
                // Runs the tests
                sh 'npm test'
            }
        }

        stage('Build') {
            steps {
                // Builds the project
                sh 'npm run build'
            }
        }
    }

    post {
        always {
            // Always run this, regardless of build status
            echo 'This will always run'
        }
        success {
            // Only run this if the build was successful
            echo 'This will run only if successful'
        }
        failure {
            // Only run this if the build was a failure
            echo 'This will run only if failed'
        }
        unstable {
            // Only run this if the build was marked as unstable
            echo 'This will run only if the run was marked as unstable'
        }
        changed {
            // Only run this if the state of the Pipeline has changed
            // i.e. the Pipeline was previously failing but is now successful
            echo 'This will run only if the state of the Pipeline has changed'
        }
    }
}
