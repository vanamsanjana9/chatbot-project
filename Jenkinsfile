
pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
    }

    environment {
        FRONTEND_IMAGE = 'vanamsanjana9/chatbot-frontend'
        BACKEND_IMAGE  = 'vanamsanjana9/chatbot-backend'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install and Test') {
            steps {
                bat 'cd backend && npm ci'
                bat 'cd backend && npm run test --if-present'
                bat 'cd frontend\\chatbot-ui && npm ci'
                bat 'cd frontend\\chatbot-ui && npm run build'
            }
        }

        stage('Build Docker Images') {
            steps {
                bat 'docker build -t %FRONTEND_IMAGE%:%BUILD_NUMBER% -f frontend/chatbot-ui/Dockerfile frontend/chatbot-ui'
                bat 'docker build -t %BACKEND_IMAGE%:%BUILD_NUMBER% -f backend/Dockerfile backend'
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKERHUB_USER',
                        passwordVariable: 'DOCKERHUB_TOKEN'
                    )
                ]) {
                    bat 'echo %DOCKERHUB_TOKEN%| docker login -u %DOCKERHUB_USER% --password-stdin'
                    bat 'docker push %FRONTEND_IMAGE%:%BUILD_NUMBER%'
                    bat 'docker push %BACKEND_IMAGE%:%BUILD_NUMBER%'
                    bat 'docker logout'
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([
                    file(
                        credentialsId: 'kubeconfig',
                        variable: 'KUBECONFIG'
                    )
                ]) {
                    bat 'kubectl apply -f k8s/'
                    bat 'kubectl set image deployment/chatbot-frontend frontend=%FRONTEND_IMAGE%:%BUILD_NUMBER%'
                    bat 'kubectl set image deployment/chatbot-backend backend=%BACKEND_IMAGE%:%BUILD_NUMBER%'
                    bat 'kubectl rollout status deployment/chatbot-frontend --timeout=180s'
                    bat 'kubectl rollout status deployment/chatbot-backend --timeout=180s'
                    bat 'kubectl get pods'
                    bat 'kubectl get services'
                }
            }
        }
    }

    post {
        success {
            echo 'CI/CD pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check Console Output.'
        }
    }
}
