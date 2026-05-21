const { verifyToken } = require('../../middleware/authMiddleware.js');
const { setupAuthRoutes } = require('./auth.routes.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const express = require('express'); 
const { PrismaClient } = require('../../prisma/generated/prisma');
const cors = require('cors'); 
const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

setupAuthRoutes(app, prisma, bcrypt, saltRounds, jwt);

app.get('/api/todos', async (req, res) => {
  try {
    const { userId } = req.query;
    const todo = await prisma.toDos.findMany({
      where: { userId : userId },
      include:{
        user:true
        }
          });
    res.json(todo);
  } catch (error) {
    console.error('Error fetching todo list:', error);
    res.status(500).json({ error: 'Failed to fetch todo list' });
  }
});

app.post('/api/todos', verifyToken, async (req, res) => {   
  try {
    const { todo } = req.body;                 
    if (!todo) {                              
      return res.status(400).json({ error: 'Todo is required' });
    }
    const userId = req.userId;
    if(!userId) {
      return res.status(400).json({error: 'User id missing'});
    }
    const newTodo = await prisma.toDos.create({
      data: { todo, userId }                           
    });
    res.status(201).json(newTodo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { id: _, posted_at, updated_at, ...updateTodo } = req.body;

    const updated = await prisma.toDos.update({
      where: { id },
      data: updateTodo
    });
    res.json(updated);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.toDos.delete({               
      where: { id }
    });
    res.json({ success: true, message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});

module.exports = {app}