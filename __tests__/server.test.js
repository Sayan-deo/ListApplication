const request = require('supertest');
const Todo = require('../models/Todo');
const { app } = require('../server');

describe('Todo model validation', () => {
  it('requires a title before saving', async () => {
    const todo = new Todo({ completed: false });

    await expect(todo.validate()).rejects.toThrow(/title/);
  });

  it('defaults completed to false when omitted', () => {
    const todo = new Todo({ title: 'Write tests' });

    expect(todo.completed).toBe(false);
  });

  it('stores an optional dueDate when provided', () => {
    const dueDate = new Date('2026-08-20T10:00:00Z');
    const todo = new Todo({ title: 'Ship feature', dueDate });

    expect(todo.dueDate).toEqual(dueDate);
  });
});

describe('GET /todos', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns all todos from the database with status 200', async () => {
    const todos = [
      { _id: '1', title: 'Buy milk', completed: false, dueDate: null },
      { _id: '2', title: 'Write tests', completed: true, dueDate: '2026-08-15T00:00:00.000Z' }
    ];

    jest.spyOn(Todo, 'find').mockResolvedValue(todos);

    const response = await request(app).get('/todos');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(todos);
    expect(Todo.find).toHaveBeenCalledTimes(1);
  });

  it('returns a 500 response when the database query fails', async () => {
    jest.spyOn(Todo, 'find').mockRejectedValue(new Error('DB failure'));

    const response = await request(app).get('/todos');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'DB failure' });
  });
});

describe('POST /todos', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates a new todo and returns status 201', async () => {
    const createdTodo = {
      _id: 'abc123',
      title: 'Pay rent',
      completed: false,
      dueDate: '2026-08-25T09:00:00.000Z'
    };

    jest.spyOn(Todo.prototype, 'save').mockResolvedValue(createdTodo);

    const response = await request(app)
      .post('/todos')
      .send({
        title: 'Pay rent',
        completed: false,
        dueDate: '2026-08-25T09:00:00.000Z'
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(createdTodo);
    expect(Todo.prototype.save).toHaveBeenCalledTimes(1);
  });

  it('returns 400 when the title is missing', async () => {
    const response = await request(app)
      .post('/todos')
      .send({ completed: false });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});

describe('GET /todos/:id', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns a single todo when id exists', async () => {
    const todo = {
      _id: 'todo-123',
      title: 'Clean the room',
      completed: false,
      dueDate: null
    };

    jest.spyOn(Todo, 'findById').mockResolvedValue(todo);

    const response = await request(app).get('/todos/todo-123');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(todo);
    expect(Todo.findById).toHaveBeenCalledWith('todo-123');
  });

  it('returns 404 when the todo does not exist', async () => {
    jest.spyOn(Todo, 'findById').mockResolvedValue(null);

    const response = await request(app).get('/todos/nonexistent-id');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Todo not found' });
  });

  it('returns 500 when the database lookup throws an error', async () => {
    jest.spyOn(Todo, 'findById').mockRejectedValue(new Error('Read failure'));

    const response = await request(app).get('/todos/failing-id');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Read failure' });
  });
});

describe('PUT /todos/:id', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('updates a todo and returns the updated record', async () => {
    const updatedTodo = {
      _id: 'todo-123',
      title: 'Updated title',
      completed: true,
      dueDate: '2026-08-18T00:00:00.000Z'
    };

    jest.spyOn(Todo, 'findByIdAndUpdate').mockResolvedValue(updatedTodo);

    const response = await request(app)
      .put('/todos/todo-123')
      .send({
        title: 'Updated title',
        completed: true,
        dueDate: '2026-08-18T00:00:00.000Z'
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(updatedTodo);
    expect(Todo.findByIdAndUpdate).toHaveBeenCalledWith(
      'todo-123',
      { title: 'Updated title', completed: true, dueDate: '2026-08-18T00:00:00.000Z' },
      { new: true, runValidators: true }
    );
  });

  it('returns 404 when trying to update a missing todo', async () => {
    jest.spyOn(Todo, 'findByIdAndUpdate').mockResolvedValue(null);

    const response = await request(app)
      .put('/todos/missing-id')
      .send({ title: 'No todo here' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Todo not found' });
  });

  it('returns 400 when validation fails during update', async () => {
    jest.spyOn(Todo, 'findByIdAndUpdate').mockRejectedValue(new Error('Validation failed'));

    const response = await request(app)
      .put('/todos/todo-123')
      .send({ title: '', completed: false });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Validation failed' });
  });
});

describe('DELETE /todos/:id', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deletes a todo and returns a success message', async () => {
    const deletedTodo = {
      _id: 'todo-123',
      title: 'Delete me',
      completed: false,
      dueDate: null
    };

    jest.spyOn(Todo, 'findByIdAndDelete').mockResolvedValue(deletedTodo);

    const response = await request(app).delete('/todos/todo-123');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Todo deleted successfully' });
    expect(Todo.findByIdAndDelete).toHaveBeenCalledWith('todo-123');
  });

  it('returns 404 when trying to delete a missing todo', async () => {
    jest.spyOn(Todo, 'findByIdAndDelete').mockResolvedValue(null);

    const response = await request(app).delete('/todos/missing-id');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Todo not found' });
  });

  it('returns 500 when the deletion operation fails', async () => {
    jest.spyOn(Todo, 'findByIdAndDelete').mockRejectedValue(new Error('Delete failure'));

    const response = await request(app).delete('/todos/failing-id');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Delete failure' });
  });
});
