document.addEventListener('DOMContentLoaded', () => {
  const todoForm = document.getElementById('todo-form');
  const todoInput = document.getElementById('todo-input');
  const todoDate = document.getElementById('todo-date');
  const todoList = document.getElementById('todo-list');
  const taskCount = document.getElementById('task-count');
  const emptyState = document.getElementById('empty-state');

  // Fetch and display todos on load
  fetchTodos();

  todoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = todoInput.value.trim();
    if (!title) return;
    const dueDate = todoDate.value ? new Date(todoDate.value).toISOString() : null;

    try {
      const response = await fetch('/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, completed: false, dueDate })
      });

      if (response.ok) {
        const newTodo = await response.json();
        addTodoToDOM(newTodo);
        todoInput.value = '';
        todoDate.value = '';
        updateTaskCount();
        checkEmptyState();
      } else {
        const errData = await response.json();
        alert(`Failed to add task: ${errData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding todo:', error);
      alert('Network error while adding task. Please check the console.');
    }
  });

  async function fetchTodos() {
    try {
      const response = await fetch('/todos');
      const todos = await response.json();
      
      todoList.innerHTML = ''; // Clear existing
      todos.forEach(todo => addTodoToDOM(todo));
      
      updateTaskCount();
      checkEmptyState();
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  }

  function addTodoToDOM(todo) {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.dataset.id = todo._id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        deleteTodo(todo._id, li);
      }
    });

    const textContainer = document.createElement('div');
    textContainer.className = 'todo-text-container';
    
    const span = document.createElement('span');
    span.className = 'todo-text';
    span.textContent = todo.title;
    textContainer.appendChild(span);

    if (todo.dueDate) {
      const dateSpan = document.createElement('span');
      dateSpan.className = 'todo-date';
      const d = new Date(todo.dueDate);
      dateSpan.textContent = d.toLocaleString(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      textContainer.appendChild(dateSpan);
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>';
    deleteBtn.addEventListener('click', () => deleteTodo(todo._id, li));

    li.appendChild(checkbox);
    li.appendChild(textContainer);
    li.appendChild(deleteBtn);

    todoList.appendChild(li);
  }

  async function deleteTodo(id, listItem) {
    try {
      const response = await fetch(`/todos/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Add fade out animation
        listItem.style.opacity = '0';
        listItem.style.transform = 'translateY(-10px)';
        setTimeout(() => {
          listItem.remove();
          updateTaskCount();
          checkEmptyState();
        }, 200);
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  }

  function updateTaskCount() {
    const items = todoList.querySelectorAll('.todo-item').length;
    taskCount.textContent = `${items} task${items !== 1 ? 's' : ''}`;
  }

  function checkEmptyState() {
    const items = todoList.querySelectorAll('.todo-item').length;
    if (items === 0) {
      emptyState.classList.remove('hidden');
    } else {
      emptyState.classList.add('hidden');
    }
  }
});
