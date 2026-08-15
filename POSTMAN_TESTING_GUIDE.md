# Postman API Testing Guide

## Overview
This guide explains how to use the Postman collection for testing the Todo REST API.

## File: `Postman_Collection.json`

### How to Import the Collection

1. **Open Postman** (download from https://www.postman.com/downloads/)
2. **Click** the "Import" button (top-left corner)
3. **Select** "Upload Files" or paste the raw JSON
4. **Choose** `Postman_Collection.json`
5. **Click** "Import"

### Environment Setup

The collection includes environment variables that need to be configured:

#### Default Variables:
- **base_url**: `http://localhost:3000` (adjust if running on different host/port)
- **todo_id**: Auto-populated by setup request
- **todo_title**: Auto-populated by setup request

To customize the environment:
1. Click the **Environment** dropdown (top-right)
2. Click **Edit** next to your environment
3. Modify the `base_url` if needed
4. Click **Save**

---

## Test Cases Overview

### 0. Setup - Create Todo for Testing
**Purpose**: Creates a test todo and stores its ID for subsequent tests
- **Method**: POST
- **Endpoint**: `/todos`
- **Auto-saves**: Todo ID to environment variable `todo_id`

---

### 1. GET - Retrieve All Todos
**Purpose**: Tests fetching all todos from the database
- **Method**: GET
- **Endpoint**: `/todos`

**Test Cases** (5 tests):
✓ Status code is 200 OK
✓ Response time less than 500ms
✓ Response is an array
✓ Array contains valid todo objects with required properties
✓ Content-Type header is application/json

---

### 2. POST - Create New Todo (Valid Data)
**Purpose**: Tests creating a new todo with valid data
- **Method**: POST
- **Endpoint**: `/todos`
- **Body**:
  ```json
  {
    "title": "Complete project documentation",
    "completed": false,
    "dueDate": "2026-12-25"
  }
  ```

**Test Cases** (6 tests):
✓ Status code is 201 Created
✓ Response contains _id (MongoDB generated ID)
✓ Todo title matches request body
✓ Completed field defaults to false
✓ Due date is present in response
✓ CreatedAt timestamp is present

---

### 3. POST - Create Todo (Missing Required Field)
**Purpose**: Tests error handling when required field is missing
- **Method**: POST
- **Endpoint**: `/todos`
- **Body** (missing title):
  ```json
  {
    "completed": false,
    "dueDate": "2026-12-25"
  }
  ```

**Test Cases** (2 tests):
✓ Status code is 400 Bad Request
✓ Error message is present in response

---

### 4. GET - Retrieve Single Todo by ID
**Purpose**: Tests fetching a specific todo by ID
- **Method**: GET
- **Endpoint**: `/todos/:id` (uses stored `todo_id`)

**Test Cases** (4 tests):
✓ Status code is 200 OK
✓ Response is a single todo object
✓ Todo object has all required properties (_id, title, completed, createdAt)
✓ Returned todo ID matches requested ID

---

### 5. GET - Retrieve Todo with Invalid ID
**Purpose**: Tests error handling for non-existent todo
- **Method**: GET
- **Endpoint**: `/todos/invalid_id_12345`

**Test Cases** (2 tests):
✓ Status code is 404 Not Found
✓ Error message indicates "todo not found"

---

### 6. PUT - Update Todo (Valid Data)
**Purpose**: Tests updating an existing todo
- **Method**: PUT
- **Endpoint**: `/todos/:id` (uses stored `todo_id`)
- **Body**:
  ```json
  {
    "title": "Updated: Complete project documentation",
    "completed": true,
    "dueDate": "2026-12-20"
  }
  ```

**Test Cases** (5 tests):
✓ Status code is 200 OK
✓ Todo title is updated correctly
✓ Todo completed status is updated to true
✓ Todo ID remains unchanged
✓ CreatedAt timestamp is unchanged

---

### 7. PUT - Update Todo (Invalid ID)
**Purpose**: Tests error handling when updating non-existent todo
- **Method**: PUT
- **Endpoint**: `/todos/invalid_id_12345`

**Test Cases** (2 tests):
✓ Status code is 404 Not Found
✓ Error message indicates "todo not found"

---

### 8. PUT - Partial Update (Only Title)
**Purpose**: Tests updating only specific fields
- **Method**: PUT
- **Endpoint**: `/todos/:id` (uses stored `todo_id`)
- **Body**:
  ```json
  {
    "title": "Partial Update Test"
  }
  ```

**Test Cases** (3 tests):
✓ Status code is 200 OK
✓ Only title is updated
✓ Response contains all required fields

---

### 9. DELETE - Delete Todo
**Purpose**: Tests deleting a todo
- **Method**: DELETE
- **Endpoint**: `/todos/:id` (uses stored `todo_id`)

**Test Cases** (3 tests):
✓ Status code is 200 OK
✓ Success message is present
✓ Environment variable is cleared after deletion

---

### 10. DELETE - Delete Todo (Invalid ID)
**Purpose**: Tests error handling when deleting non-existent todo
- **Method**: DELETE
- **Endpoint**: `/todos/invalid_id_12345`

**Test Cases** (2 tests):
✓ Status code is 404 Not Found
✓ Error message indicates "todo not found"

---

## How to Run the Tests

### Run All Tests
1. Click the **Runner** button (left sidebar)
2. Select the imported collection
3. Click **Run** button
4. All 30+ test cases will execute sequentially

### Run Individual Test
1. Click on a specific request in the collection
2. Click **Send**
3. View test results in the **Tests** tab

### View Test Results
After running tests:
- **Green** checkmark = Test passed
- **Red** X = Test failed
- Test summary shows pass/fail count

---

## Common Test Assertions

### Status Code Tests
```javascript
pm.test('Status code is 200', function () {
    pm.response.to.have.status(200);
});
```

### Response Time Tests
```javascript
pm.test('Response time is less than 500ms', function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});
```

### JSON Body Tests
```javascript
pm.test('Response is an array', function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.be.an('array');
});
```

### Property Existence Tests
```javascript
pm.test('Response contains _id', function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('_id');
});
```

### Value Equality Tests
```javascript
pm.test('Title matches request', function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.title).to.equal('Expected Title');
});
```

---

## Prerequisites

Before running tests, ensure:

1. **Server is running**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

2. **MongoDB is running**
   - Local: `mongodb://127.0.0.1:27017/todoapp`
   - Or update `MONGODB_URI` in environment

3. **Port 3000 is accessible** (or update base_url in environment)

---

## Test Execution Order

The collection is designed to be run in order:

1. ✓ Setup (creates test todo)
2. ✓ GET all todos
3. ✓ POST create new todo (success case)
4. ✓ POST create todo (error case)
5. ✓ GET single todo
6. ✓ GET todo (error case)
7. ✓ PUT update todo
8. ✓ PUT update todo (error case)
9. ✓ PUT partial update
10. ✓ DELETE todo
11. ✓ DELETE todo (error case)

**Important**: Run tests in order from top to bottom for proper environment variable usage.

---

## Troubleshooting

### Tests Fail with Connection Error
- Verify server is running on `http://localhost:3000`
- Check firewall settings
- Verify MongoDB connection

### Environment Variables Not Working
- Make sure you're using the correct environment
- Check variable names match exactly (case-sensitive)
- Verify Setup request ran first

### Tests Pass Locally but Fail in CI/CD
- Ensure base_url is correctly set for your deployment
- Mock external services if needed
- Use collection-level pre-request scripts for setup

---

## Extending the Collection

### Adding New Test Cases

1. Right-click collection → **Add Request**
2. Set method and endpoint
3. Add test script in **Tests** tab:
   ```javascript
   pm.test('Your test name', function () {
       // Your assertions
   });
   ```

### Custom Pre-request Scripts

Add in **Pre-request Script** tab to:
- Generate dynamic data
- Set custom headers
- Calculate signatures

```javascript
pm.environment.set('timestamp', new Date().toISOString());
```

---

## Best Practices

1. **Keep base_url in environment** - Makes it easy to switch between local/staging/production
2. **Use meaningful test names** - Clearly describe what is being tested
3. **Test both success and error cases** - Ensure robust error handling
4. **Use environment variables** - Share data between requests
5. **Organize into folders** - Group related endpoints together
6. **Run collection regularly** - Integrate into CI/CD pipeline

---

## Export Test Results

1. After running tests, click the **Run Summary** button
2. Click **Export Results** icon
3. Choose format (JSON, HTML)
4. Save to file

---

## Integration with CI/CD

Run collection in CI/CD pipeline using Newman (Postman CLI):

```bash
# Install Newman
npm install -g newman

# Run collection
newman run Postman_Collection.json \
  -e environment.json \
  -r json,html \
  --reporter-html-export results.html
```

---

## API Response Examples

### Successful Todo Creation (201 Created)
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Complete project documentation",
  "completed": false,
  "dueDate": "2026-12-25T00:00:00.000Z",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "__v": 0
}
```

### Error Response (400 Bad Request)
```json
{
  "error": "Todo validation failed: title: Path `title` is required."
}
```

### Not Found Error (404)
```json
{
  "error": "Todo not found"
}
```

---

## Contact & Support

For issues or questions:
- Review the API endpoint documentation in `server.js`
- Check MongoDB connection status
- Verify request/response formats match API specification
