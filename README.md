# Taskify - Todo Application

A sleek, responsive, and interactive Todo List web application. Built with a modern glassmorphism UI and powered by a robust backend using Node.js, Express, and MongoDB.

##  Features

- **Modern UI**: A beautifully crafted Light Mode theme using glassmorphism, vibrant gradients, and dynamic micro-animations.
- **Task Management**: Create tasks, set due dates and times, and seamlessly mark them as complete (which automatically deletes them).
- **Persistent Data**: All tasks are securely saved and retrieved from a MongoDB Atlas database.
- **Responsive Design**: Works perfectly across mobile, tablet, and desktop viewports.

##  Architecture & Tech Stack

This application follows a classic 3-Tier Client-Server Architecture (MEN Stack + Vanilla Frontend).

- **Frontend**: Vanilla HTML5, CSS3, and JavaScript (`/public` directory).
- **Backend**: Node.js and Express.js (`server.js`).
- **Database**: MongoDB (via Mongoose ODM).

##  Getting Started

You can run this application directly via Node.js or using Docker.

### Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher) installed locally.
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (or local MongoDB instance).

### Option 1: Running Locally (Node.js)

1. **Clone the repository** (if applicable) and navigate to the project directory:
   ```bash
   cd ListApplication
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your MongoDB connection string:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0...mongodb.net/todoapp
   PORT=3000
   ```
   *(Note: Ensure the IP address you are running the server from is whitelisted in your MongoDB Atlas Network Access settings!)*

4. **Start the server**:
   ```bash
   npm run dev
   ```
   The application will be running at `http://localhost:3000`.

### Option 2: Running with Docker

Since a `Dockerfile` is included, you can easily containerize and run the app.

1. **Build the Docker image**:
   ```bash
   docker build -t taskify-app .
   ```

2. **Run the container** (Make sure to pass your environment variables):
   ```bash
   docker run -p 3000:3000 --env-file .env taskify-app
   ```
   The application will be accessible at `http://localhost:3000`.

##  API Reference

The Express backend exposes a RESTful API to interact with the tasks.

### `GET /todos`
Retrieves a list of all tasks from the database.
- **Response (200 OK):** Array of Todo objects.

### `POST /todos`
Creates a new task.
- **Request Body:**
  ```json
  {
    "title": "Buy groceries",
    "completed": false,
    "dueDate": "2023-12-31T10:00:00.000Z" (Optional)
  }
  ```
- **Response (201 Created):** The created Todo object.

### `GET /todos/:id`
Retrieves a single task by its unique ID.
- **Response (200 OK):** The requested Todo object.

### `PUT /todos/:id`
Updates an existing task by its ID.
- **Request Body:** Fields to update (`title`, `completed`, or `dueDate`).
- **Response (200 OK):** The updated Todo object.

### `DELETE /todos/:id`
Deletes a task by its ID (triggered in the UI when the completion checkbox is clicked).
- **Response (200 OK):** `{ "message": "Todo deleted successfully" }`

## 🧪 API Testing with Postman

A comprehensive Postman collection is included for testing all API endpoints with 30+ automated test cases.

### Quick Start

1. **Download Postman** from [postman.com](https://www.postman.com/downloads/)

2. **Import the collection and environment**:
   - Open Postman → Click **Import** button
   - Import `Postman_Collection.json` (the test suite)
   - Import `Postman_Environment.json` (the environment variables)

3. **Start your server**:
   ```bash
   npm run dev
   ```

4. **Run the tests**:
   - Click the **Runner** button in Postman
   - Select the imported collection
   - Click **Run** to execute all tests

### Test Coverage

The Postman collection includes tests for:

- ✅ **GET /todos** - Retrieve all todos with response validation
- ✅ **POST /todos (Valid)** - Create todo with success case
- ✅ **POST /todos (Invalid)** - Create todo with error handling
- ✅ **GET /todos/:id** - Retrieve single todo by ID
- ✅ **GET /todos/:id (Invalid)** - Handle non-existent todos
- ✅ **PUT /todos/:id** - Update todo with full data
- ✅ **PUT /todos/:id (Invalid)** - Handle update errors
- ✅ **PUT /todos/:id (Partial)** - Test partial updates
- ✅ **DELETE /todos/:id** - Delete todo
- ✅ **DELETE /todos/:id (Invalid)** - Handle delete errors

### Test Features

Each test includes:
- **Status code validation** - Ensures correct HTTP status
- **Response structure validation** - Verifies JSON format
- **Data type checking** - Validates field types
- **Response time checks** - Performance validation
- **Environment variable usage** - Data sharing between requests
- **Error message validation** - Proper error handling

### Running Tests via CLI

Use Newman (Postman's CLI tool) for CI/CD integration:

```bash
# Install Newman globally
npm install -g newman

# Run the collection
newman run Postman_Collection.json \
  -e Postman_Environment.json \
  -r json,html \
  --reporter-html-export results.html
```

### Detailed Testing Guide

For complete documentation on:
- Environment setup
- How to modify test cases
- CI/CD integration
- Custom test creation
- Troubleshooting

See [POSTMAN_TESTING_GUIDE.md](./POSTMAN_TESTING_GUIDE.md)

---

## 🔄 CI/CD Integration

### GitLab CI/CD Pipeline

Automated API testing is configured to run on every merge request and commit to main/develop branches.

**File**: `.gitlab-ci.yml`

**Pipeline Features**:
- ✅ Automatic test execution on every commit
- ✅ MongoDB service integration
- ✅ Parallel job execution
- ✅ HTML & JSON test reports
- ✅ Automatic retry on infrastructure failures
- ✅ Code linting with ESLint
- ✅ Unit test coverage reports

**Pipeline Stages**:
1. **Build** - Install dependencies & Newman CLI
2. **Test** - Run Postman tests, linting, unit tests
3. **Report** - Archive test results and HTML reports

**How it Works**:
- Starts MongoDB service
- Launches the Todo API server
- Runs all 30+ Postman test cases
- Generates detailed HTML report
- Reports results back to merge request

**Example MR Status**:
```
✓ build:dependencies
✓ test:api:postman (30/30 tests passed)
✓ lint:eslint
✓ test:unit
✓ report:postman
```

### Run Tests Locally (Simulate CI)

```bash
# Start MongoDB locally
docker run -d -p 27017:27017 mongo:6.0

# Install dependencies
npm install
npm install -g newman

# Start server
npm start &

# Run test collection
newman run Postman_Collection.json \
  -e Postman_Environment.json \
  -g globals.json \
  -r json,html \
  --reporter-html-export postman-report.html
```

### View Pipeline Results

1. Navigate to **CI/CD → Pipelines** in GitLab
2. Click on your pipeline
3. Download `postman-report.html` from artifacts
4. View detailed test results in HTML format

### For Complete GitLab CI/CD Documentation

See [GITLAB_CICD_GUIDE.md](./GITLAB_CICD_GUIDE.md) for:
- Detailed pipeline configuration
- Environment setup
- Troubleshooting
- Advanced features
- Performance optimization
