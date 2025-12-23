import React from 'react';
import TaskItem from './TaskItem';

/**
 * TaskList Component
 * Displays list of tasks with filtering options
 */
const TaskList = ({
    tasks,
    total,
    filter,
    onFilterChange,
    onToggleComplete,
    onEdit,
    onDelete,
    loading
}) => {
    const completedCount = tasks.filter(t => t.completed).length;
    const pendingCount = tasks.filter(t => !t.completed).length;

    return (
        <div className="glass-card p-6">
            {/* Header with Stats */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                    📋 My Tasks
                </h2>
                <div className="flex items-center gap-3 text-sm">
                    <span className="text-slate-400">
                        {pendingCount} pending
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-green-400">
                        {completedCount} done
                    </span>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 p-1 bg-slate-800/50 rounded-xl">
                {[
                    { value: 'all', label: 'All' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'completed', label: 'Completed' },
                ].map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => onFilterChange(tab.value)}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${filter === tab.value
                                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Task List */}
            <div className="space-y-3">
                {loading ? (
                    // Loading skeleton
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="task-card animate-pulse">
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-slate-700 rounded-lg" />
                                    <div className="flex-1">
                                        <div className="h-5 bg-slate-700 rounded w-3/4 mb-2" />
                                        <div className="h-4 bg-slate-700 rounded w-1/2" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : tasks.length === 0 ? (
                    // Empty state
                    <div className="text-center py-12">
                        <div className="text-5xl mb-4">
                            {filter === 'completed' ? '🎯' : filter === 'pending' ? '✨' : '📝'}
                        </div>
                        <h3 className="text-lg font-medium text-slate-300 mb-1">
                            {filter === 'completed'
                                ? 'No completed tasks yet'
                                : filter === 'pending'
                                    ? 'All caught up!'
                                    : 'No tasks yet'}
                        </h3>
                        <p className="text-slate-500">
                            {filter === 'all'
                                ? 'Create your first task to get started'
                                : 'Tasks will appear here'}
                        </p>
                    </div>
                ) : (
                    // Task items
                    tasks.map((task) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            onToggleComplete={onToggleComplete}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))
                )}
            </div>

            {/* Footer Stats */}
            {total > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-700/50 text-center">
                    <p className="text-xs text-slate-500">
                        Showing {tasks.length} of {total} tasks
                    </p>
                </div>
            )}
        </div>
    );
};

export default TaskList;
