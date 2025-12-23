import React from 'react';

/**
 * TaskItem Component - Enhanced with priority and category display
 */
const TaskItem = ({ task, onToggleComplete, onEdit, onDelete }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const priorityConfig = {
        low: { color: 'bg-gray-500', label: 'Low' },
        medium: { color: 'bg-blue-500', label: 'Medium' },
        high: { color: 'bg-orange-500', label: 'High' },
        urgent: { color: 'bg-red-500 animate-pulse', label: 'Urgent' }
    };

    const categoryIcons = {
        work: '💼',
        personal: '👤',
        health: '🏥',
        finance: '💰',
        learning: '📚',
        errands: '🛒',
        other: '📌'
    };

    const priority = priorityConfig[task.priority] || priorityConfig.medium;
    const categoryIcon = categoryIcons[task.category] || categoryIcons.other;

    return (
        <div
            className={`task-card animate-slide-up ${task.completed ? 'opacity-70' : ''}`}
        >
            <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                    onClick={() => onToggleComplete(task)}
                    className={`flex-shrink-0 w-6 h-6 mt-0.5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${task.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-slate-500 hover:border-primary-400 hover:bg-primary-500/10'
                        }`}
                    title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                >
                    {task.completed && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </button>

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3
                            className={`font-medium text-lg ${task.completed
                                ? 'text-slate-400 line-through'
                                : 'text-white'
                                }`}
                        >
                            {task.title}
                        </h3>

                        {/* Priority Badge */}
                        <span className={`px-2 py-0.5 ${priority.color} text-white text-xs rounded-full font-medium`}>
                            {priority.label}
                        </span>

                        {/* Category Icon */}
                        <span className="text-sm" title={task.category}>
                            {categoryIcon}
                        </span>

                        {/* AI Generated Badge */}
                        {task.ai_generated && (
                            <span className="px-2 py-0.5 bg-purple-500/30 text-purple-300 text-xs rounded-full flex items-center gap-1">
                                <span>🤖</span> AI
                            </span>
                        )}
                    </div>

                    {task.description && (
                        <p className={`mt-1 text-sm ${task.completed ? 'text-slate-500' : 'text-slate-400'}`}>
                            {task.description}
                        </p>
                    )}

                    <div className="mt-2 flex items-center gap-3 flex-wrap">
                        {/* Due date */}
                        {task.due_date && (
                            <span className={`text-xs flex items-center gap-1 ${new Date(task.due_date) < new Date() && !task.completed
                                    ? 'text-red-400'
                                    : 'text-slate-400'
                                }`}>
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Due: {formatDate(task.due_date)}
                            </span>
                        )}

                        <span className="text-xs text-slate-500">
                            Created {formatDate(task.created_at)}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onEdit(task)}
                        className="p-2 text-slate-400 hover:text-primary-400 hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                        title="Edit task"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                        </svg>
                    </button>

                    <button
                        onClick={() => onDelete(task)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                        title="Delete task"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskItem;
