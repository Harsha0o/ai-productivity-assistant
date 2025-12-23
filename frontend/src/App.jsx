import React, { useState, useEffect, useCallback } from 'react';
import { taskApi, aiApi } from './services/api';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import AIInput from './components/AIInput';
import InsightsPanel from './components/InsightsPanel';

/**
 * Main App Component
 * AI-Powered Task Manager Application
 */
function App() {
    // State
    const [tasks, setTasks] = useState([]);
    const [totalTasks, setTotalTasks] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [editingTask, setEditingTask] = useState(null);
    const [notification, setNotification] = useState(null);
    const [aiEnabled, setAiEnabled] = useState(false);

    // Check AI status
    useEffect(() => {
        const checkAI = async () => {
            try {
                const status = await aiApi.getStatus();
                setAiEnabled(status.available);
            } catch {
                setAiEnabled(false);
            }
        };
        checkAI();
    }, []);

    // Show notification
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // Fetch tasks from API
    const fetchTasks = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {};
            if (filter === 'completed') params.completed = true;
            if (filter === 'pending') params.completed = false;

            const response = await taskApi.getTasks(params);
            setTasks(response.tasks);
            setTotalTasks(response.total);
        } catch (err) {
            console.error('Error fetching tasks:', err);
            setError('Failed to load tasks. Please check if the backend is running.');
        } finally {
            setLoading(false);
        }
    }, [filter]);

    // Load tasks on mount and filter change
    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // Handle AI task creation
    const handleAITaskCreated = (task) => {
        showNotification('🤖 Task created with AI!');
        fetchTasks();
    };

    // Create or update task
    const handleSubmit = async (taskData) => {
        try {
            if (editingTask) {
                await taskApi.updateTask(editingTask.id, taskData);
                showNotification('Task updated successfully');
                setEditingTask(null);
            } else {
                await taskApi.createTask(taskData);
                showNotification('Task created successfully');
            }
            fetchTasks();
        } catch (err) {
            console.error('Error saving task:', err);
            showNotification('Failed to save task', 'error');
        }
    };

    // Toggle task completion
    const handleToggleComplete = async (task) => {
        try {
            await taskApi.updateTask(task.id, { completed: !task.completed });
            showNotification(task.completed ? 'Task marked as pending' : 'Task completed! 🎉');
            fetchTasks();
        } catch (err) {
            console.error('Error updating task:', err);
            showNotification('Failed to update task', 'error');
        }
    };

    // Edit task
    const handleEdit = (task) => {
        setEditingTask(task);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Delete task
    const handleDelete = async (task) => {
        if (!window.confirm(`Delete "${task.title}"?`)) return;

        try {
            await taskApi.deleteTask(task.id);
            showNotification('Task deleted');
            fetchTasks();
        } catch (err) {
            console.error('Error deleting task:', err);
            showNotification('Failed to delete task', 'error');
        }
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setEditingTask(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Background decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 sm:py-12">
                {/* Header */}
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
                        <span className="bg-gradient-to-r from-primary-400 via-purple-400 to-accent-500 bg-clip-text text-transparent">
                            AI Task Manager
                        </span>
                    </h1>
                    <p className="text-slate-400 flex items-center justify-center gap-2">
                        Smart productivity powered by AI ✨
                        {aiEnabled && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                                AI Active
                            </span>
                        )}
                    </p>
                </header>

                {/* Notification Toast */}
                {notification && (
                    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg animate-slide-up ${notification.type === 'error'
                        ? 'bg-red-500/90 text-white'
                        : 'bg-green-500/90 text-white'
                        }`}>
                        {notification.message}
                    </div>
                )}

                {/* Error Banner */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400">
                        <p className="font-medium">⚠️ Connection Error</p>
                        <p className="text-sm mt-1">{error}</p>
                        <button
                            onClick={fetchTasks}
                            className="mt-2 text-sm underline hover:no-underline"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* AI Input Section */}
                {aiEnabled && (
                    <AIInput
                        onTaskCreated={handleAITaskCreated}
                        disabled={loading}
                    />
                )}

                {/* AI Insights Panel */}
                {aiEnabled && tasks.length > 0 && (
                    <div className="mb-6">
                        <InsightsPanel />
                    </div>
                )}

                {/* Traditional Task Form */}
                <div className="mb-6">
                    <TaskForm
                        onSubmit={handleSubmit}
                        editingTask={editingTask}
                        onCancelEdit={handleCancelEdit}
                    />
                </div>

                {/* Task List */}
                <TaskList
                    tasks={tasks}
                    total={totalTasks}
                    filter={filter}
                    onFilterChange={setFilter}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    loading={loading}
                />

                {/* Footer */}
                <footer className="mt-8 text-center text-sm text-slate-500">
                    <p>Built with FastAPI + React + PostgreSQL + Gemini AI 🤖</p>
                    <p className="mt-1">
                        <a
                            href="/docs"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-400 hover:underline"
                        >
                            View API Docs →
                        </a>
                    </p>
                </footer>
            </div>
        </div>
    );
}

export default App;
