#!/bin/bash

# Docker management script for Zoptal monorepo

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    printf "${1}${2}${NC}\n"
}

# Function to print usage
print_usage() {
    cat << EOF
Usage: $0 [COMMAND] [OPTIONS]

Commands:
    dev         Start development environment
    prod        Start production environment
    stop        Stop all containers
    clean       Remove all containers and volumes
    build       Build all Docker images
    logs        Show logs for all services
    status      Show status of all containers
    db          Database operations
    test        Run tests in Docker containers

Examples:
    $0 dev                    # Start development environment
    $0 prod                   # Start production environment
    $0 stop                   # Stop all containers
    $0 clean                  # Clean up everything
    $0 build --no-cache       # Rebuild all images
    $0 logs auth-service      # Show logs for auth service
    $0 db init                # Initialize database
    $0 db migrate             # Run database migrations
    $0 db seed                # Seed database with test data

EOF
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_color $RED "Error: Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to check if docker-compose is available
check_docker_compose() {
    if ! command -v docker-compose > /dev/null 2>&1; then
        print_color $RED "Error: docker-compose is not installed."
        exit 1
    fi
}

# Function to start development environment
start_dev() {
    print_color $BLUE "Starting Zoptal development environment..."
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_color $YELLOW "Creating .env file from .env.example..."
        cp .env.example .env
    fi
    
    # Start services
    docker-compose up -d --build
    
    print_color $GREEN "Development environment started successfully!"
    print_color $BLUE "Services available at:"
    echo "  - Web Main: http://localhost:3000"
    echo "  - Dashboard: http://localhost:3001"
    echo "  - Auth Service: http://localhost:4001"
    echo "  - Project Service: http://localhost:4002"
    echo "  - AI Service: http://localhost:4003"
    echo "  - Billing Service: http://localhost:4004"
    echo "  - Notification Service: http://localhost:4005"
    echo "  - Analytics Service: http://localhost:4006"
    echo "  - PostgreSQL: localhost:5432"
    echo "  - Redis: localhost:6379"
    echo "  - ClickHouse: localhost:8123"
}

# Function to start production environment
start_prod() {
    print_color $BLUE "Starting Zoptal production environment..."
    
    # Check for required environment variables
    if [ ! -f .env.production ]; then
        print_color $RED "Error: .env.production file not found. Please create it with production values."
        exit 1
    fi
    
    # Start services
    docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build
    
    print_color $GREEN "Production environment started successfully!"
}

# Function to stop all containers
stop_containers() {
    print_color $BLUE "Stopping all containers..."
    docker-compose down
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
    print_color $GREEN "All containers stopped."
}

# Function to clean up everything
clean_all() {
    print_color $YELLOW "This will remove all containers, images, and volumes. Continue? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_color $BLUE "Cleaning up..."
        
        # Stop all containers
        docker-compose down -v
        docker-compose -f docker-compose.prod.yml down -v 2>/dev/null || true
        
        # Remove all Zoptal-related containers
        docker ps -a --filter "name=zoptal-*" -q | xargs -r docker rm -f
        
        # Remove all Zoptal-related images
        docker images --filter "reference=*zoptal*" -q | xargs -r docker rmi -f
        
        # Remove unused volumes
        docker volume prune -f
        
        print_color $GREEN "Cleanup completed."
    else
        print_color $YELLOW "Cleanup cancelled."
    fi
}

# Function to build all images
build_images() {
    print_color $BLUE "Building all Docker images..."
    
    local build_args=""
    if [[ "$1" == "--no-cache" ]]; then
        build_args="--no-cache"
    fi
    
    docker-compose build $build_args
    
    print_color $GREEN "All images built successfully."
}

# Function to show logs
show_logs() {
    local service=$1
    if [ -n "$service" ]; then
        print_color $BLUE "Showing logs for $service..."
        docker-compose logs -f "$service"
    else
        print_color $BLUE "Showing logs for all services..."
        docker-compose logs -f
    fi
}

# Function to show container status
show_status() {
    print_color $BLUE "Container Status:"
    docker-compose ps
    
    print_color $BLUE "\nResource Usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" \
        $(docker-compose ps -q 2>/dev/null) 2>/dev/null || true
}

# Function to handle database operations
handle_db() {
    local operation=$1
    
    case $operation in
        init)
            print_color $BLUE "Initializing database..."
            docker-compose exec auth-service pnpm run db:push
            docker-compose exec auth-service pnpm run db:generate
            print_color $GREEN "Database initialized."
            ;;
        migrate)
            print_color $BLUE "Running database migrations..."
            docker-compose exec auth-service pnpm run db:migrate
            print_color $GREEN "Migrations completed."
            ;;
        seed)
            print_color $BLUE "Seeding database..."
            docker-compose exec auth-service pnpm run db:seed
            print_color $GREEN "Database seeded."
            ;;
        reset)
            print_color $YELLOW "This will reset the database. Continue? (y/N)"
            read -r response
            if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
                docker-compose exec auth-service pnpm run db:reset
                print_color $GREEN "Database reset."
            fi
            ;;
        backup)
            print_color $BLUE "Creating database backup..."
            docker-compose exec postgres pg_dump -U postgres zoptal > "backup_$(date +%Y%m%d_%H%M%S).sql"
            print_color $GREEN "Database backup created."
            ;;
        *)
            print_color $RED "Unknown database operation: $operation"
            echo "Available operations: init, migrate, seed, reset, backup"
            exit 1
            ;;
    esac
}

# Function to run tests
run_tests() {
    print_color $BLUE "Running tests in Docker containers..."
    
    # Run tests for each service
    services=("auth-service" "project-service" "ai-service" "billing-service" "notification-service" "analytics-service")
    
    for service in "${services[@]}"; do
        print_color $BLUE "Running tests for $service..."
        if docker-compose exec "$service" pnpm test; then
            print_color $GREEN "Tests passed for $service"
        else
            print_color $RED "Tests failed for $service"
        fi
    done
}

# Main script logic
main() {
    # Check prerequisites
    check_docker
    check_docker_compose
    
    # Change to script directory
    cd "$(dirname "$0")/.."
    
    # Parse command
    case $1 in
        dev)
            start_dev
            ;;
        prod)
            start_prod
            ;;
        stop)
            stop_containers
            ;;
        clean)
            clean_all
            ;;
        build)
            build_images "$2"
            ;;
        logs)
            show_logs "$2"
            ;;
        status)
            show_status
            ;;
        db)
            handle_db "$2"
            ;;
        test)
            run_tests
            ;;
        help|--help|-h)
            print_usage
            ;;
        *)
            print_color $RED "Unknown command: $1"
            print_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"