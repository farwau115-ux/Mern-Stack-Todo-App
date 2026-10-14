
import { useEffect, useState } from 'react'

const API_URL = 'http://localhost:8000/Todos'

function App() {
    const [todos, setTodos] = useState([])
    const [task, setTask] = useState('')
    const [editId, setEditId] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Fetch all Todos
    const fetchTodos = async () => {
        try {
            const response = await fetch(API_URL)

            if (!response.ok) {
                throw new Error('Failed to fetch tasks')
            }

            const data = await response.json()
            setTodos(data)
            setError('')
        } catch (err) {
            setError('Backend se connection nahi ho raha. Server check karo.')
            console.error(err)
        }
    }

    useEffect(() => {
        fetchTodos()
    }, [])

    // Add or Update Todo
    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!task.trim()) {
            setError('Please task enter karo!')
            return
        }

        setLoading(true)
        setError('')

        try {
            const url = editId
                ? `${API_URL}/${editId}`
                : API_URL

            const response = await fetch(url, {
                method: editId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    task: task.trim()
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Task save nahi hua')
            }

            setTask('')
            setEditId(null)
            await fetchTodos()
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Edit Todo
    const handleEdit = (todo) => {
        setTask(todo.task)
        setEditId(todo._id)
        setError('')
    }

    // Cancel editing
    const handleCancel = () => {
        setTask('')
        setEditId(null)
        setError('')
    }

    // Complete or uncomplete Todo
    const handleToggle = async (todo) => {
        try {
            const response = await fetch(
                `${API_URL}/${todo._id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        completed: !todo.completed
                    })
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Status update failed')
            }

            await fetchTodos()
        } catch (err) {
            setError(err.message)
        }
    }

    // Delete Todo
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            'Are you sure you want to delete this task?'
        )

        if (!confirmDelete) return

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Delete failed')
            }

            if (editId === id) {
                handleCancel()
            }

            await fetchTodos()
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <div className="container">
            <h1>My Todo App 📝</h1>

            <form onSubmit={handleSubmit} className="todo-form">
                <input
                    type="text"
                    placeholder="Enter your task..."
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                />

                <button type="submit" disabled={loading}>
                    {loading
                        ? 'Please wait...'
                        : editId
                            ? 'Update Task'
                            : 'Add Task'}
                </button>

                {editId && (
                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>
                )}
            </form>

            {error && <p className="error">{error}</p>}

            {todos.length === 0 ? (
                <p className="empty">No tasks yet. Add your first task!</p>
            ) : (
                <ul className="todo-list">
                    {todos.map((todo) => (
                        <li key={todo._id} className="todo-item">
                            <label className="todo-label">
                                <input
                                    type="checkbox"
                                    checked={todo.completed}
                                    onChange={() => handleToggle(todo)}
                                />

                                <span
                                    className={
                                        todo.completed ? 'completed' : ''
                                    }
                                >
                                    {todo.task}
                                </span>
                            </label>

                            <div className="todo-actions">
                                <button
                                    type="button"
                                    className="edit-btn"
                                    onClick={() => handleEdit(todo)}
                                >
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    className="delete-btn"
                                    onClick={() => handleDelete(todo._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default App
