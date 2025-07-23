#!/bin/sh
set -e

# Wait for database to be ready
wait_for_db() {
    echo "Waiting for database to be ready..."
    until npx prisma db push --preview-feature 2>/dev/null; do
        echo "Database is unavailable - sleeping for 2 seconds"
        sleep 2
    done
    echo "Database is ready!"
}

# Run database migrations
run_migrations() {
    echo "Running database migrations..."
    npx prisma migrate deploy
    echo "Migrations completed!"
}

# Generate Prisma client if needed
generate_client() {
    echo "Generating Prisma client..."
    npx prisma generate
    echo "Prisma client generated!"
}

# Seed database if SEED_DATABASE is set
seed_database() {
    if [ "$SEED_DATABASE" = "true" ]; then
        echo "Seeding database..."
        npx prisma db seed
        echo "Database seeded!"
    fi
}

# Main entrypoint logic
main() {
    echo "Starting LPG Distributor SaaS application..."
    
    # Only run database operations if DATABASE_URL is set
    if [ -n "$DATABASE_URL" ]; then
        wait_for_db
        generate_client
        
        # Run migrations in production
        if [ "$NODE_ENV" = "production" ]; then
            run_migrations
        fi
        
        seed_database
    else
        echo "No DATABASE_URL found, skipping database operations"
        generate_client
    fi
    
    echo "Starting Next.js server..."
    exec npm start
}

# Handle shutdown gracefully
cleanup() {
    echo "Received SIGTERM, shutting down gracefully..."
    # Add any cleanup operations here
    exit 0
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

# Run main function
main "$@"