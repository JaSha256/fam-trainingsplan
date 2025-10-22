#!/usr/bin/env zsh
# Deployment script for FAM Trainingsplan
# Supports multiple deployment targets

set -euo pipefail

# Color output
autoload -U colors && colors
print_success() { echo "${fg[green]}✓${reset_color} $@" }
print_info() { echo "${fg[blue]}ℹ${reset_color} $@" }
print_error() { echo "${fg[red]}✗${reset_color} $@" }
print_header() { echo "\n${fg[cyan]}━━━ $@ ━━━${reset_color}" }

# Configuration
PROJECT_NAME="fam-trainingsplan"
BUILD_DIR="dist"
BACKUP_DIR="backups"

# Show usage
usage() {
    cat << EOF
Usage: $0 [OPTIONS] TARGET

Deploy FAM Trainingsplan to production

TARGETS:
    local       Deploy to local web server (/var/www/html)
    nginx       Deploy to nginx web root
    apache      Deploy to Apache web root
    github      Deploy to GitHub Pages
    preview     Start preview server locally

OPTIONS:
    -h, --help          Show this help message
    -b, --build         Build before deploying (default)
    --no-build          Skip build step
    --backup            Create backup before deploying
    --analyze           Build with bundle analyzer

EXAMPLES:
    $0 preview                  # Preview build locally
    $0 --build local            # Build and deploy to local server
    $0 --backup nginx           # Backup and deploy to nginx
    $0 --analyze github         # Build with analyzer and deploy to GitHub
EOF
    exit 0
}

# Parse arguments
BUILD=true
BACKUP=false
ANALYZE=false
TARGET=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            ;;
        -b|--build)
            BUILD=true
            shift
            ;;
        --no-build)
            BUILD=false
            shift
            ;;
        --backup)
            BACKUP=true
            shift
            ;;
        --analyze)
            ANALYZE=true
            shift
            ;;
        *)
            TARGET=$1
            shift
            ;;
    esac
done

# Validate target
if [[ -z "$TARGET" ]]; then
    print_error "No target specified"
    usage
fi

print_header "FAM Trainingsplan Deployment"

# Build step
if $BUILD; then
    print_header "Building for production"

    if $ANALYZE; then
        print_info "Building with bundle analyzer..."
        ANALYZE=true npm run build
    else
        npm run build
    fi

    print_success "Build completed"
fi

# Check build directory exists
if [[ ! -d "$BUILD_DIR" ]]; then
    print_error "Build directory '$BUILD_DIR' not found"
    print_info "Run with --build flag to build first"
    exit 1
fi

# Backup function
create_backup() {
    local target_dir=$1

    if [[ -d "$target_dir" ]]; then
        print_info "Creating backup..."
        mkdir -p "$BACKUP_DIR"
        local backup_file="$BACKUP_DIR/${PROJECT_NAME}-$(date +%Y%m%d-%H%M%S).tar.gz"
        tar -czf "$backup_file" -C "$target_dir" .
        print_success "Backup created: $backup_file"
    fi
}

# Deploy functions
deploy_local() {
    local target="/var/www/html"
    print_header "Deploying to local server: $target"

    if $BACKUP; then
        create_backup "$target"
    fi

    print_info "Copying files..."
    sudo rsync -av --delete "$BUILD_DIR/" "$target/"
    print_success "Deployed to $target"
}

deploy_nginx() {
    local target="/usr/share/nginx/html"
    print_header "Deploying to nginx: $target"

    if $BACKUP; then
        create_backup "$target"
    fi

    print_info "Copying files..."
    sudo rsync -av --delete "$BUILD_DIR/" "$target/"

    print_info "Copying nginx config..."
    sudo cp nginx.conf /etc/nginx/sites-available/$PROJECT_NAME

    print_success "Deployed to $target"
    print_info "Enable site: sudo ln -s /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/"
    print_info "Reload nginx: sudo nginx -t && sudo systemctl reload nginx"
}

deploy_apache() {
    local target="/var/www/html/$PROJECT_NAME"
    print_header "Deploying to Apache: $target"

    if $BACKUP; then
        create_backup "$target"
    fi

    print_info "Creating directory..."
    sudo mkdir -p "$target"

    print_info "Copying files..."
    sudo rsync -av --delete "$BUILD_DIR/" "$target/"

    print_info "Copying .htaccess..."
    sudo cp .htaccess "$target/"

    print_success "Deployed to $target"
    print_info "Restart Apache: sudo systemctl restart apache2 (or httpd)"
}

deploy_github() {
    print_header "Deploying to GitHub Pages"

    if ! command -v gh &>/dev/null; then
        print_error "GitHub CLI (gh) not found"
        print_info "Install: pacman -S github-cli"
        exit 1
    fi

    print_info "Pushing to gh-pages branch..."

    # Create temporary directory
    local temp_dir=$(mktemp -d)
    cp -r "$BUILD_DIR"/* "$temp_dir/"

    cd "$temp_dir"
    git init
    git add -A
    git commit -m "Deploy to GitHub Pages - $(date +%Y-%m-%d-%H:%M:%S)"
    git branch -M gh-pages
    git remote add origin "$(git config --get remote.origin.url)" 2>/dev/null || true
    git push -f origin gh-pages

    cd -
    rm -rf "$temp_dir"

    print_success "Deployed to GitHub Pages"
    print_info "Visit: https://yourusername.github.io/$PROJECT_NAME"
}

deploy_preview() {
    print_header "Starting preview server"

    print_info "Server will start at http://localhost:4173"
    npm run preview
}

# Execute deployment
case $TARGET in
    local)
        deploy_local
        ;;
    nginx)
        deploy_nginx
        ;;
    apache)
        deploy_apache
        ;;
    github)
        deploy_github
        ;;
    preview)
        deploy_preview
        ;;
    *)
        print_error "Unknown target: $TARGET"
        usage
        ;;
esac

print_header "Deployment complete!"
