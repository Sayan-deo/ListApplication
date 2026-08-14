require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Todo = require('./models/Todo');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/todoapp';

if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Failed to connect to MongoDB', err));
}

// GET /todos — get all todos
app.get('/todos', async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /todos — create a new todo
app.post('/todos', async (req, res) => {
  try {
    const { title, completed, dueDate } = req.body;
    const newTodo = new Todo({ title, completed, dueDate });
    const savedTodo = await newTodo.save();
    res.status(201).json(savedTodo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /todos/:id — get a single todo by id
app.get('/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ error: 'Todo not found' });
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /todos/:id — update a single todo by id
app.put('/todos/:id', async (req, res) => {
  try {
    const { title, completed, dueDate } = req.body;
    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id,
      { title, completed, dueDate },
      { new: true, runValidators: true }
    );
    if (!updatedTodo) return res.status(404).json({ error: 'Todo not found' });
    res.json(updatedTodo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /todos/:id — delete a single todo by id
app.delete('/todos/:id', async (req, res) => {
  try {
    const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
    if (!deletedTodo) return res.status(404).json({ error: 'Todo not found' });
    res.json({ message: 'Todo deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = { app };
