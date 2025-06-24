# API Testing Guide

This directory contains HTTP request files for testing the Realtime Chat App API. These files can be used with REST Client extensions in VS Code or JetBrains IDEs.

## Files

- **api-test.http**: Comprehensive test script that tests all API endpoints in the correct order
- **login.http**: Tests the login endpoint
- **logout.http**: Tests the logout endpoint
- **message.http**: Tests message-related endpoints
- **signup.http**: Tests the signup endpoint

## How to Use

### Using the Comprehensive Test Script

1. Open `api-test.http` in your IDE with a REST Client extension
2. Run the requests in order from top to bottom
3. For endpoints that require a user ID (like message endpoints), replace the placeholder ID with an actual user ID from the response of the "Get users for sidebar" request
4. For endpoints that require image data, replace the placeholder base64 string with an actual base64 encoded image if needed

### Testing Authentication Flow

1. Run the signup request in `signup.http` to create a new user
2. Run the login request in `login.http` to authenticate and get a JWT token
3. The JWT token will be stored in cookies and automatically included in subsequent requests
4. Test other endpoints that require authentication
5. Finally, run the logout request in `logout.http` to clear the JWT token

### Testing Message Endpoints

1. First authenticate using the login request
2. Run the "Get users for sidebar" request to get a list of users
3. Use a user ID from the response to replace `:userId` in the other message requests
4. Test getting messages, sending text messages, and sending messages with images

## Notes

- All endpoints except signup and login require authentication
- The JWT token is stored in cookies and automatically included in requests after login
- For testing the update-profile and message with image endpoints, you'll need to provide valid base64 encoded images