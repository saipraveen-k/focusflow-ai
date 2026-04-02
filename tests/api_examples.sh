#!/bin/bash
# FocusFlow AI - API Examples and Integration Tests
# This script provides examples for testing all major API endpoints

# Configuration
BASE_URL="${API_BASE_URL:-http://localhost:5000}"
ML_URL="${ML_BASE_URL:-http://localhost:5001}"
AUTH_TOKEN="${AUTH_TOKEN:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Check if jq is installed
check_dependencies() {
    if ! command -v jq &> /dev/null; then
        print_error "jq is not installed. Please install jq for JSON parsing."
        echo "Ubuntu/Debian: sudo apt-get install jq"
        echo "macOS: brew install jq"
        exit 1
    fi
}

# ============================================
# Health Check Endpoints
# ============================================
test_health() {
    print_header "Health Check Endpoints"
    
    # Backend health
    print_info "Testing Backend Health..."
    RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/health")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        print_success "Backend is healthy"
        echo "$BODY" | jq .
    else
        print_error "Backend health check failed (HTTP $HTTP_CODE)"
    fi
    
    # ML Service health
    print_info "Testing ML Service Health..."
    RESPONSE=$(curl -s -w "\n%{http_code}" "$ML_URL/health")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        print_success "ML Service is healthy"
        echo "$BODY" | jq .
    else
        print_error "ML Service health check failed (HTTP $HTTP_CODE)"
    fi
}

# ============================================
# Authentication Endpoints
# ============================================
test_auth() {
    print_header "Authentication Endpoints"
    
    # Register new user
    print_info "Registering new test user..."
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/register" \
        -H "Content-Type: application/json" \
        -d '{
            "username": "test_user",
            "email": "test@example.com",
            "password": "testpass123"
        }')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 409 ]; then
        print_success "User registration handled (201 created or 409 exists)"
        echo "$BODY" | jq .
    else
        print_error "User registration failed (HTTP $HTTP_CODE)"
        echo "$BODY"
    fi
    
    # Login with demo user
    print_info "Logging in with demo user..."
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "demo@focusflow.ai",
            "password": "demo123"
        }')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        print_success "Login successful"
        AUTH_TOKEN=$(echo "$BODY" | jq -r '.token')
        echo "$BODY" | jq .
        export AUTH_TOKEN
    else
        print_error "Login failed (HTTP $HTTP_CODE)"
        echo "$BODY"
    fi
    
    # Get current user
    print_info "Getting current user profile..."
    RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/auth/me" \
        -H "Authorization: Bearer $AUTH_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        print_success "User profile retrieved"
        echo "$BODY" | jq .
    else
        print_error "Failed to get user profile (HTTP $HTTP_CODE)"
    fi
}

# ============================================
# User Management Endpoints
# ============================================
test_user_management() {
    print_header "User Management Endpoints"
    
    # Update activity mode
    print_info "Updating activity mode to 'study'..."
    RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/api/users/activity" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"activity": "study"}')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        print_success "Activity mode updated"
        echo "$BODY" | jq .
    else
        print_error "Failed to update activity mode (HTTP $HTTP_CODE)"
    fi
    
    # Update preferences
    print_info "Updating user preferences..."
    RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/api/users/preferences" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "focusModes": {
                "study": {
                    "enabled": true,
                    "allowedApps": ["gmail", "whatsapp"],
                    "blockedApps": ["instagram", "tiktok"],
                    "priorityContacts": ["teacher", "professor"]
                }
            },
            "aiSettings": {
                "sensitivity": 0.8
            }
        }')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        print_success "Preferences updated"
        echo "$BODY" | jq .
    else
        print_error "Failed to update preferences (HTTP $HTTP_CODE)"
    fi
}

# ============================================
# Notification Processing Endpoints
# ============================================
test_notifications() {
    print_header "Notification Processing Endpoints"
    
    # Process a notification (study mode - should block social media)
    print_info "Processing Instagram notification during study mode..."
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/notifications/process" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "app": "instagram",
            "sender": "friend",
            "message": "Check out my new post!"
        }')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        print_success "Notification processed"
        echo "$BODY" | jq .
    else
        print_error "Failed to process notification (HTTP $HTTP_CODE)"
    fi
    
    # Process a notification (study mode - should show educational content)
    print_info "Processing WhatsApp notification from teacher during study mode..."
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/notifications/process" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "app": "whatsapp",
            "sender": "teacher",
            "message": "URGENT: Assignment due tomorrow"
        }')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        print_success "Notification processed"
        echo "$BODY" | jq .
    else
        print_error "Failed to process notification (HTTP $HTTP_CODE)"
    fi
    
    # Get notification history
    print_info "Getting notification history..."
    RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/notifications" \
        -H "Authorization: Bearer $AUTH_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        print_success "Notification history retrieved"
        echo "$BODY" | jq '.notifications | .[0:3]'
    else
        print_error "Failed to get notification history (HTTP $HTTP_CODE)"
    fi
}

# ============================================
# ML Service Endpoints
# ============================================
test_ml_service() {
    print_header "ML Service Endpoints"
    
    # Get model info
    print_info "Getting ML model information..."
    RESPONSE=$(curl -s -w "\n%{http_code}" "$ML_URL/model_info")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        print_success "Model info retrieved"
        echo "$BODY" | jq .
    else
        print_error "Failed to get model info (HTTP $HTTP_CODE)"
    fi
    
    # Single prediction
    print_info "Testing single ML prediction..."
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$ML_URL/predict" \
        -H "Content-Type: application/json" \
        -d '{
            "app": "whatsapp",
            "sender": "teacher",
            "message": "URGENT: Assignment due tomorrow",
            "activity": "study",
            "timestamp": 1693526400,
            "is_weekday": 1
        }')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        print_success "ML prediction successful"
        echo "$BODY" | jq .
    else
        print_error "ML prediction failed (HTTP $HTTP_CODE)"
    fi
    
    # Batch prediction
    print_info "Testing batch ML predictions..."
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$ML_URL/batch_predict" \
        -H "Content-Type: application/json" \
        -d '{
            "notifications": [
                {
                    "app": "instagram",
                    "sender": "friend",
                    "message": "Check out my new post!",
                    "activity": "study",
                    "timestamp": 1693526400,
                    "is_weekday": 1
                },
                {
                    "app": "slack",
                    "sender": "manager",
                    "message": "Team meeting in 5 mins",
                    "activity": "work",
                    "timestamp": 1693526400,
                    "is_weekday": 1
                },
                {
                    "app": "whatsapp",
                    "sender": "emergency",
                    "message": "URGENT: Call me back",
                    "activity": "sleep",
                    "timestamp": 1693526400,
                    "is_weekday": 0
                }
            ]
        }')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        print_success "Batch predictions successful"
        echo "$BODY" | jq .
    else
        print_error "Batch predictions failed (HTTP $HTTP_CODE)"
    fi
}

# ============================================
# Analytics Endpoints
# ============================================
test_analytics() {
    print_header "Analytics Endpoints"
    
    # Get analytics summary
    print_info "Getting analytics summary..."
    RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/analytics/summary" \
        -H "Authorization: Bearer $AUTH_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        print_success "Analytics summary retrieved"
        echo "$BODY" | jq .
    else
        print_error "Failed to get analytics summary (HTTP $HTTP_CODE)"
    fi
    
    # Get daily statistics
    print_info "Getting daily statistics..."
    RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/analytics/daily" \
        -H "Authorization: Bearer $AUTH_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        print_success "Daily statistics retrieved"
        echo "$BODY" | jq .
    else
        print_error "Failed to get daily statistics (HTTP $HTTP_CODE)"
    fi
    
    # Get app-wise statistics
    print_info "Getting app-wise statistics..."
    RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/analytics/apps" \
        -H "Authorization: Bearer $AUTH_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        print_success "App statistics retrieved"
        echo "$BODY" | jq .
    else
        print_error "Failed to get app statistics (HTTP $HTTP_CODE)"
    fi
}

# ============================================
# Feedback System
# ============================================
test_feedback() {
    print_header "Feedback System"
    
    # Get first notification ID
    RESPONSE=$(curl -s "$BASE_URL/api/notifications" \
        -H "Authorization: Bearer $AUTH_TOKEN")
    NOTIF_ID=$(echo "$RESPONSE" | jq -r '.notifications[0]._id // empty')
    
    if [ -z "$NOTIF_ID" ]; then
        print_error "No notifications found to test feedback"
        return
    fi
    
    # Submit feedback
    print_info "Submitting feedback for notification $NOTIF_ID..."
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/notifications/$NOTIF_ID/feedback" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "agreed": true,
            "rating": 5,
            "comment": "Correct decision"
        }')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        print_success "Feedback submitted"
        echo "$BODY" | jq .
    else
        print_error "Failed to submit feedback (HTTP $HTTP_CODE)"
    fi
}

# ============================================
# Run All Tests
# ============================================
run_all_tests() {
    print_header "FocusFlow AI - Complete API Test Suite"
    
    check_dependencies
    
    test_health
    test_auth
    
    if [ -z "$AUTH_TOKEN" ]; then
        print_error "Authentication failed. Cannot run remaining tests."
        exit 1
    fi
    
    test_user_management
    test_notifications
    test_ml_service
    test_analytics
    test_feedback
    
    print_header "All Tests Completed"
    print_success "API integration tests passed!"
}

# Show usage
show_usage() {
    echo "FocusFlow AI API Test Suite"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  all          Run all tests (default)"
    echo "  health       Test health endpoints"
    echo "  auth         Test authentication"
    echo "  users        Test user management"
    echo "  notifications Test notification processing"
    echo "  ml           Test ML service"
    echo "  analytics    Test analytics endpoints"
    echo "  feedback     Test feedback system"
    echo ""
    echo "Environment Variables:"
    echo "  API_BASE_URL   Backend API URL (default: http://localhost:5000)"
    echo "  ML_BASE_URL    ML Service URL (default: http://localhost:5001)"
    echo "  AUTH_TOKEN     JWT token for authenticated requests"
    echo ""
    echo "Examples:"
    echo "  $0 all                    # Run all tests"
    echo "  API_BASE_URL=http://api.example.com $0 health  # Test with custom URL"
}

# Main entry point
case "${1:-all}" in
    all)
        run_all_tests
        ;;
    health)
        check_dependencies
        test_health
        ;;
    auth)
        check_dependencies
        test_auth
        ;;
    users)
        check_dependencies
        test_auth > /dev/null 2>&1
        test_user_management
        ;;
    notifications)
        check_dependencies
        test_auth > /dev/null 2>&1
        test_notifications
        ;;
    ml)
        check_dependencies
        test_ml_service
        ;;
    analytics)
        check_dependencies
        test_auth > /dev/null 2>&1
        test_analytics
        ;;
    feedback)
        check_dependencies
        test_auth > /dev/null 2>&1
        test_feedback
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        echo "Unknown command: $1"
        show_usage
        exit 1
        ;;
esac