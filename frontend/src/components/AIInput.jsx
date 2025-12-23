import React, { useState } from 'react';

/**
 * AIInput - Natural language input component for AI task creation
 */
const AIInput = ({ onTaskCreated, disabled }) => {
    const [text, setText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim() || isProcessing) return;

        setIsProcessing(true);
        setError(null);
        setPreview(null);

        try {
            const { aiApi } = await import('../services/api');
            const result = await aiApi.parseAndCreate(text);

            if (result.task) {
                onTaskCreated(result.task);
                setText('');
                setPreview({
                    ...result.task,
                    confidence: result.task.confidence
                });

                // Clear preview after 3 seconds
                setTimeout(() => setPreview(null), 3000);
            }
        } catch (err) {
            console.error('AI parsing failed:', err);
            setError('Failed to process. Try being more specific or use the manual form.');
        } finally {
            setIsProcessing(false);
        }
    };

    const examplePrompts = [
        "Call mom tomorrow at 5pm",
        "Finish project report by Friday urgent",
        "Buy groceries this weekend"
    ];

    const handleExampleClick = (example) => {
        setText(example);
    };

    const priorityColors = {
        low: 'bg-gray-500',
        medium: 'bg-blue-500',
        high: 'bg-orange-500',
        urgent: 'bg-red-500'
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

    return (
        <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-2xl p-6 border border-purple-500/30 mb-8">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🤖</span>
                <h2 className="text-xl font-semibold text-white">AI Task Assistant</h2>
                <span className="px-2 py-0.5 bg-purple-500/30 text-purple-300 text-xs rounded-full">
                    Powered by Gemini
                </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Input and Button - Stacked layout */}
                <div className="space-y-3">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="What do you need to do?"
                        className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-lg"
                        disabled={disabled || isProcessing}
                    />
                    <button
                        type="submit"
                        disabled={!text.trim() || isProcessing || disabled}
                        className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-indigo-600 transition flex items-center justify-center gap-2 text-lg shadow-lg shadow-purple-500/25"
                    >
                        {isProcessing ? (
                            <>
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Processing with AI...</span>
                            </>
                        ) : (
                            <>
                                <span className="text-xl">✨</span>
                                <span>Create Task with AI</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Example prompts */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-gray-400 text-sm">Try:</span>
                    {examplePrompts.map((example, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => handleExampleClick(example)}
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-gray-300 text-sm transition hover:border-purple-500/50"
                        >
                            {example}
                        </button>
                    ))}
                </div>
            </form>

            {/* Error message */}
            {error && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            {/* Success preview */}
            {preview && (
                <div className="mt-4 p-4 bg-green-500/20 border border-green-500/30 rounded-xl animate-fadeIn">
                    <div className="flex items-center gap-2 text-green-300 mb-2">
                        <span className="text-xl">✅</span>
                        <span className="font-semibold">Task Created Successfully!</span>
                        <span className="text-xs text-green-400/70 bg-green-500/20 px-2 py-0.5 rounded-full">
                            {Math.round((preview.confidence || 0.5) * 100)}% confidence
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="text-white font-medium text-lg">{preview.title}</span>
                        <span className={`px-2 py-1 ${priorityColors[preview.priority] || 'bg-gray-500'} text-white text-xs rounded-full font-medium`}>
                            {preview.priority}
                        </span>
                        <span className="text-gray-300 text-sm flex items-center gap-1">
                            <span>{categoryIcons[preview.category] || '📌'}</span>
                            <span>{preview.category}</span>
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIInput;
