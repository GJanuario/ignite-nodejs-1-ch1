const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const user = users.find(user => user.username === username)

  if (!user) {
    return response.status(400).json({ error: 'User does not exist' })
  }

  request.user = user

  return next()
}

function checksExistsTodo(request, response, next) {
  const { user } = request
  const { id } = request.params

  const { todos } = user

  const todo = todos.find(todo => todo.id === id)

  if (!todo) {
    response.status(404).json({ error: 'Todo does not exist', todo, todos })
  }

  request.todo = todo
  request.todos = todos

  next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body
  const usernameExists = users.some(user => user.username === username)

  if (usernameExists) {
    return response.status(400).json({ error: 'Username not available' })
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { todos } = user

  return response.json(todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  const { todos } = user

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  todos.push(todo)

  response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { todo } = request
  const { title, deadline } = request.body

  todo.title = title
  todo.deadline = deadline

  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { todo } = request

  todo.done = true

  response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { todo, todos } = request

  const todoIndex = todos.findIndex(todoIndex => todoIndex.id === todo.id)

  todos.splice(todoIndex, 1)

  return response.status(204).send()
});

module.exports = app;