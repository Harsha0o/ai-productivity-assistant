import React, { useState, useEffect } from 'react';

/**
 * TaskForm Component - Enhanced with priority, category, and due date
 */
const TaskForm = ({ onSubmit, editingTask, onCancelEdit }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [category, setCategory] = useState('other');
    const [dueDate, setDueDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const priorities = [
        { value: 'low', label: 'Low', color: 'bg-gray-500' },
        { value: 'medium', label: 'Medium', color: 'bg-blue-500' },
        { value: 'high', label: 'High', color: 'bg-orange-500' },
        { value: 'urgent', label: 'Urgent', color: 'bg-red-500' }
    ];

    const categories = [
        { value: 'work', label: '💼 Work' },
        { value: 'personal', label: '👤 Personal' },
        { value: 'health', label: '🏥 Health' },
        { value: 'finance', label: '💰 Finance' },
        { value: 'learning', label: '📚 Learning' },
        { value: 'errands', label: '🛒 Errands' },
        { value: 'other', label: '📌 Other' }
    ];

    // Populate form when editing
    useEffect(() => {
        if (editingTask) {
            setTitle(editingTask.title);
            setDescription(editingTask.description || '');
            setPriority(editingTask.priority || 'medium');
            setCategory(editingTask.category || 'other');
            setDueDate(editingTask.due_date ? editingTask.due_date.slice(0, 16) : '');
        } else {
            setTitle('');
            setDescription('');
            setPriority('medium');
            setCategory('other');
            setDueDate('');
        }
    }, [editingTask]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim()) return;

        setIsSubmitting(true);
        try {
            await onSubmit({
                title: title.trim(),
                description: description.trim() || null,
                priority,
                category,
                due_date: dueDate ? new Date(dueDate).toISOString() : null
            });

            // Clear form after successful submit (only if not editing)
            if (!editingTask) {
                setTitle('');
                setDescription('');
                setPriority('medium');
                setCategory('other');
                setDueDate('');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setTitle('');
        setDescription('');
        setPriority('medium');
        setCategory('other');
        setDueDate('');
        onCancelEdit();
    };

    return (
        <form onSubmit={handleSubmit} className="glass-card p-6 animate-fade-in">
            <h2 className="text-xl font-semibold text-white mb-4">
                {editingTask ? '✏️ Edit Task' : '➕ Add New Task'}
            </h2>

            <div className="space-y-4">
                {/* Title Input */}
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-1.5">
                        Task Title *
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="What needs to be done?"
                        className="input-field"
                        maxLength={255}
                        required
                    />
                </div>

                {/* Description Input */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1.5">
                        Description (optional)
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add more details about this task..."
                        className="input-field resize-none"
                        rows={2}
                    />
                </div>

                {/* Priority and Category Row */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Priority Select */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Priority
                        </label>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="input-field"
                        >
                            {priorities.map(p => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Category Select */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="input-field"
                        >
                            {categories.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Due Date */}
                <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-slate-300 mb-1.5">
                        Due Date (optional)
                    </label>
                    <input
                        type="datetime-local"
                        id="dueDate"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="input-field"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={!title.trim() || isSubmitting}
                        className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                {editingTask ? 'Saving...' : 'Adding...'}
                            </span>
                        ) : (
                            editingTask ? 'Save Changes' : 'Add Task'
                        )}
                    </button>

                    {editingTask && (
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </form>
    );
};

export default TaskForm;
