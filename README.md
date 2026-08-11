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
