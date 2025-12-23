import React, { useState, useEffect } from 'react';
import { aiApi } from '../services/api';

/**
 * InsightsPanel - AI-powered productivity insights dashboard
 */
const InsightsPanel = () => {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const fetchInsights = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await aiApi.getInsights();
            setInsights(data);
        } catch (err) {
            console.error('Failed to fetch insights:', err);
            setError('Failed to load insights');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isExpanded && !insights) {
            fetchInsights();
        }
    }, [isExpanded]);

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
        <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 rounded-2xl border border-emerald-500/30 overflow-hidden">
            {/* Header - Always visible */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition"
            >
                <div className="flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    <h2 className="text-lg font-semibold text-white">AI Insights</h2>
                    <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-300 text-xs rounded-full">
                        Powered by Gemini
                    </span>
                </div>
                <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Expandable content */}
            {isExpanded && (
                <div className="p-4 pt-0 animate-fadeIn">
                    {loading && (
                        <div className="flex items-center justify-center py-8">
                            <svg className="animate-spin h-8 w-8 text-emerald-500" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                            ⚠️ {error}
                            <button
                                onClick={fetchInsights}
                                className="ml-2 underline hover:no-underline"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {insights && !loading && (
                        <div className="space-y-6">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white/5 rounded-xl p-4 text-center">
                                    <div className="text-3xl font-bold text-white">{insights.total_tasks}</div>
                                    <div className="text-gray-400 text-sm">Total Tasks</div>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4 text-center">
                                    <div className="text-3xl font-bold text-emerald-400">{insights.completed_tasks}</div>
                                    <div className="text-gray-400 text-sm">Completed</div>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4 text-center">
                                    <div className="text-3xl font-bold text-purple-400">
                                        {Math.round(insights.completion_rate * 100)}%
                                    </div>
                                    <div className="text-gray-400 text-sm">Completion Rate</div>
                                </div>
                            </div>

                            {/* AI Summary */}
                            <div className="bg-white/5 rounded-xl p-4">
                                <h3 className="text-emerald-400 font-medium mb-2 flex items-center gap-2">
                                    <span>🤖</span> AI Summary
                                </h3>
                                <p className="text-gray-300">{insights.ai_summary}</p>
                            </div>

                            {/* AI Tips */}
                            <div className="bg-white/5 rounded-xl p-4">
                                <h3 className="text-purple-400 font-medium mb-3 flex items-center gap-2">
                                    <span>💡</span> AI Productivity Tips
                                </h3>
                                <ul className="space-y-2">
                                    {insights.ai_tips.map((tip, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-gray-300">
                                            <span className="text-emerald-400">•</span>
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Category breakdown */}
                            {Object.keys(insights.tasks_by_category || {}).length > 0 && (
                                <div className="bg-white/5 rounded-xl p-4">
                                    <h3 className="text-blue-400 font-medium mb-3 flex items-center gap-2">
                                        <span>📁</span> By Category
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(insights.tasks_by_category).map(([cat, count]) => (
                                            <span key={cat} className="px-3 py-1 bg-white/10 rounded-full text-gray-300 text-sm">
                                                {categoryIcons[cat] || '📌'} {cat}: {count}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Priority breakdown */}
                            {Object.keys(insights.tasks_by_priority || {}).length > 0 && (
                                <div className="bg-white/5 rounded-xl p-4">
                                    <h3 className="text-orange-400 font-medium mb-3 flex items-center gap-2">
                                        <span>🎯</span> By Priority
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(insights.tasks_by_priority).map(([pri, count]) => (
                                            <span
                                                key={pri}
                                                className={`px-3 py-1 ${priorityColors[pri] || 'bg-gray-500'} rounded-full text-white text-sm`}
                                            >
                                                {pri}: {count}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Refresh button */}
                            <button
                                onClick={fetchInsights}
                                className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 text-sm transition flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh Insights
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default InsightsPanel;
