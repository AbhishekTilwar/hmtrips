#!/bin/bash

# ============================================================================
# Firebase Configuration Deployment Script
# ============================================================================
# This script deploys Firestore security rules and indexes to Firebase
# Run this script after making changes to firestore.rules or firestore.indexes.json
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# Helper Functions
# ============================================================================

print_header() {
    echo ""
    echo -e "${BLUE}============================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# ============================================================================
# Pre-flight Checks
# ============================================================================

print_header "Firebase Configuration Deployment"

print_info "Checking prerequisites..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    print_error "Firebase CLI is not installed"
    echo ""
    echo "Install it with: npm install -g firebase-tools"
    echo "Then login with: firebase login"
    exit 1
fi

print_success "Firebase CLI is installed"

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    print_error "Not logged in to Firebase"
    echo ""
    echo "Please login with: firebase login"
    exit 1
fi

print_success "Logged in to Firebase"

# Check if firestore.rules exists
if [ ! -f "firestore.rules" ]; then
    print_error "firestore.rules file not found"
    echo ""
    echo "Make sure you're running this script from the project root directory"
    exit 1
fi

print_success "firestore.rules file found"

# Check if firestore.indexes.json exists
if [ ! -f "firestore.indexes.json" ]; then
    print_error "firestore.indexes.json file not found"
    echo ""
    echo "Make sure you're running this script from the project root directory"
    exit 1
fi

print_success "firestore.indexes.json file found"

# ============================================================================
# Deployment
# ============================================================================

print_header "Deploying Configuration"

# Ask for confirmation
echo ""
read -p "This will deploy Firestore rules and indexes. Continue? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Deployment cancelled"
    exit 0
fi

echo ""
print_info "Starting deployment..."
echo ""

# Deploy Firestore rules
print_info "Deploying Firestore security rules..."
if firebase deploy --only firestore:rules; then
    print_success "Firestore security rules deployed successfully"
else
    print_error "Failed to deploy Firestore security rules"
    exit 1
fi

echo ""

# Deploy Firestore indexes
print_info "Deploying Firestore indexes..."
if firebase deploy --only firestore:indexes; then
    print_success "Firestore indexes deployed successfully"
else
    print_error "Failed to deploy Firestore indexes"
    print_warning "Note: Indexes may take several minutes to build"
    exit 1
fi

# ============================================================================
# Post-deployment
# ============================================================================

print_header "Deployment Complete"

print_success "All Firebase configurations deployed successfully!"
echo ""
print_info "Next steps:"
echo "  1. Check Firebase Console to verify rules are active"
echo "  2. Monitor index build status in Firebase Console > Firestore > Indexes"
echo "  3. Test your application to ensure everything works correctly"
echo ""
print_warning "Note: Firestore indexes may take 5-15 minutes to build"
print_warning "Your app may show errors until indexes are ready"
echo ""

# Show current Firebase project
PROJECT_ID=$(firebase use | grep "Active" | awk '{print $NF}' | tr -d '()')
if [ ! -z "$PROJECT_ID" ]; then
    print_info "Deployed to project: $PROJECT_ID"
    echo ""
    echo "Firebase Console: https://console.firebase.google.com/project/$PROJECT_ID/firestore"
fi

echo ""
print_success "Deployment script completed!"
echo ""
