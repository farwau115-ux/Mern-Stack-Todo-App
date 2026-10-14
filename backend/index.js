
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 8000

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected Successfully!'))
    .catch((error) => console.log('MongoDB Error:', error.message))

// Todo Schema
const todoSchema = new mongoose.Schema({
    task: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

// Todo Model
const Todo = mongoose.model('Todo', todoSchema)

// 1. Add New Todo
app.post('/Todos', async (req, res) => {
    try {
        const { task } = req.body

        if (!task || !task.trim()) {
            return res.status(400).json({
                message: 'Task is required'
            })
        }

        const newTodo = new Todo({
            task: task.trim()
        })

        await newTodo.save()

        res.status(201).json({
            message: 'Todo Added Successfully!',
            todo: newTodo
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Error saving Todo'
        })
    }
})

// 2. Get All Todos
app.get('/Todos', async (req, res) => {
    try {
        const todos = await Todo.find().sort({
            createdAt: -1
        })

        res.status(200).json(todos)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Error fetching Todos'
        })
    }
})

// 3. Get Single Todo
app.get('/Todos/:id', async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id)

        if (!todo) {
            return res.status(404).json({
                message: 'Todo not found'
            })
        }

        res.status(200).json(todo)
    } catch (error) {
        console.log(error)
        res.status(400).json({
            message: 'Invalid Todo ID'
        })
    }
})

// 4. Update Task or Completion Status
app.put('/Todos/:id', async (req, res) => {
    try {
        const { task, completed } = req.body
        const updates = {}

        // Update task only when provided
        if (task !== undefined) {
            if (typeof task !== 'string' || !task.trim()) {
                return res.status(400).json({
                    message: 'Task cannot be empty'
                })
            }

            updates.task = task.trim()
        }

        // Update completed status only when provided
        if (completed !== undefined) {
            if (typeof completed !== 'boolean') {
                return res.status(400).json({
                    message: 'Completed must be true or false'
                })
            }

            updates.completed = completed
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: 'Provide task or completed to update'
            })
        }

        const updatedTodo = await Todo.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            {
                new: true,
                runValidators: true
            }
        )

        if (!updatedTodo) {
            return res.status(404).json({
                message: 'Todo not found'
            })
        }

        res.status(200).json({
            message: 'Todo Updated Successfully!',
            todo: updatedTodo
        })
    } catch (error) {
        console.log(error)
        res.status(400).json({
            message: 'Error updating Todo'
        })
    }
})

// 5. Delete Todo
app.delete('/Todos/:id', async (req, res) => {
    try {
        const deletedTodo = await Todo.findByIdAndDelete(
            req.params.id
        )

        if (!deletedTodo) {
            return res.status(404).json({
                message: 'Todo not found'
            })
        }

        res.status(200).json({
            message: 'Todo Deleted Successfully!',
            todo: deletedTodo
        })
    } catch (error) {
        console.log(error)
        res.status(400).json({
            message: 'Error deleting Todo'
        })
    }
})

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
