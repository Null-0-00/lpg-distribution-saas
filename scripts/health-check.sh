#!/bin/sh

# Health check script for Docker container
# Performs basic health checks on the application

set -e

# Configuration
HEALTH_ENDPOINT="http://localhost:${PORT:-3000}/api/health"
TIMEOUT=10
MAX_RETRIES=3

# Function to check HTTP endpoint
check_http() {
    local url=$1
    local timeout=${2:-$TIMEOUT}
    
    if command -v curl >/dev/null 2>&1; then
        curl -f -s --max-time "$timeout" "$url" >/dev/null
    elif command -v wget >/dev/null 2>&1; then
        wget -q --timeout="$timeout" --tries=1 -O /dev/null "$url"
    else
        echo "Neither curl nor wget available for health check"
        return 1
    fi
}

# Function to check database connectivity (if DATABASE_URL is set)
check_database() {
    if [ -n "$DATABASE_URL" ]; then
        # Use a simple Prisma query to check database connectivity
        node -e "
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();
            prisma.\$queryRaw\`SELECT 1\`.then(() => {
                console.log('Database connection OK');
                process.exit(0);
            }).catch((err) => {
                console.error('Database connection failed:', err.message);
                process.exit(1);
            }).finally(() => {
                prisma.\$disconnect();
            });
        " 2>/dev/null || return 1
    fi
}

# Function to check Redis connectivity (if REDIS_URL is set)
check_redis() {
    if [ -n "$REDIS_URL" ] && command -v redis-cli >/dev/null 2>&1; then
        redis-cli -u "$REDIS_URL" ping >/dev/null 2>&1 || return 1
    fi
}

# Function to check disk space
check_disk_space() {
    local usage
    usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$usage" -gt 90 ]; then
        echo "Disk space critical: ${usage}% used"
        return 1
    fi
}

# Function to check memory usage
check_memory() {
    local mem_available
    if [ -f /proc/meminfo ]; then
        mem_available=$(awk '/MemAvailable/ {print $2}' /proc/meminfo)
        # Check if less than 100MB available (in KB)
        if [ "$mem_available" -lt 102400 ]; then
            echo "Memory critical: less than 100MB available"
            return 1
        fi
    fi
}

# Main health check function
perform_health_check() {
    local retries=0
    local check_name=$1
    local check_function=$2
    
    while [ $retries -lt $MAX_RETRIES ]; do
        if $check_function; then
            echo "$check_name: OK"
            return 0
        else
            retries=$((retries + 1))
            if [ $retries -lt $MAX_RETRIES ]; then
                echo "$check_name: Failed (attempt $retries/$MAX_RETRIES), retrying..."
                sleep 1
            else
                echo "$check_name: Failed after $MAX_RETRIES attempts"
                return 1
            fi
        fi
    done
}

# Run all health checks
main() {
    echo "Starting health check..."
    
    # Critical checks (application must be healthy)
    if ! perform_health_check "HTTP endpoint" "check_http $HEALTH_ENDPOINT"; then
        echo "Health check failed: HTTP endpoint not responding"
        exit 1
    fi
    
    # Database check (only if DATABASE_URL is configured)
    if [ -n "$DATABASE_URL" ]; then
        if ! perform_health_check "Database" "check_database"; then
            echo "Health check failed: Database not accessible"
            exit 1
        fi
    fi
    
    # System resource checks (warnings only)
    if ! check_disk_space; then
        echo "Warning: Disk space is running low"
    fi
    
    if ! check_memory; then
        echo "Warning: Memory usage is high"
    fi
    
    # Redis check (optional, only warn if configured but failing)
    if [ -n "$REDIS_URL" ]; then
        if ! check_redis; then
            echo "Warning: Redis not accessible"
        fi
    fi
    
    echo "Health check passed"
    exit 0
}

# Execute main function
main "$@"