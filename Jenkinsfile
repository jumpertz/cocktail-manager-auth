    environment {
        SONARSERVER = 'CocktailManager-auth'
        SONARSCANNER = 'CocktailManager-auth'
    }
stage('Sonarqube') {
    environment {
        scannerHome = tool "${SONARSCANNER}"
    }
    steps {
        withSonarQubeEnv("${SONARSERVER}") {
            sh "${scannerHome}/bin/sonar-scanner"
        }
        timeout(time: 10, unit: 'MINUTES') {
            waitForQualityGate abortPipeline: true
        }
    }
}