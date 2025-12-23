import axios from 'axios';

// API Base URL - use same origin for CloudFront setup, else use env variable or localhost
// When deployed on CloudFront, API requests are routed via the same domain
const API_URL = process.env.REACT_APP_API_URL || '';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Task API functions
export const taskApi = {
    /**
     * Get all tasks with optional filtering
     */
    getTasks: async (params = {}) => {
        const response = await api.get('/tasks', { params });
        return response.data;
    },

    /**
     * Get a single task by ID
     */
    getTask: async (id) => {
        const response = await api.get(`/tasks/${id}`);
        return response.data;
    },

    /**
     * Create a new task
     */
    createTask: async (taskData) => {
        const response = await api.post('/tasks', taskData);
        return response.data;
    },

    /**
     * Update an existing task
     */
    updateTask: async (id, taskData) => {
        const response = await api.put(`/tasks/${id}`, taskData);
        return response.data;
    },

    /**
     * Delete a task
     */
    deleteTask: async (id) => {
        const response = await api.delete(`/tasks/${id}`);
        return response.data;
    },

    /**
     * Check API health
     */
    healthCheck: async () => {
        const response = await api.get('/health');
        return response.data;
    },
};

// AI API functions
export const aiApi = {
    /**
     * Check AI status
     */
    getStatus: async () => {
        const response = await api.get('/ai/status');
        return response.data;
    },

    /**
     * Parse natural language into a task
     */
    parseText: async (text) => {
        const response = await api.post('/ai/parse', { text });
        return response.data;
    },

    /**
     * Parse and create a task in one step
     */
    parseAndCreate: async (text) => {
        const response = await api.post('/ai/parse-and-create', { text });
        return response.data;
    },

    /**
     * Get AI-powered task prioritization
     */
    prioritizeTasks: async (taskIds) => {
        const response = await api.post('/ai/prioritize', { task_ids: taskIds });
        return response.data;
    },

    /**
     * Auto-categorize a task
     */
    categorizeTask: async (taskId) => {
        const response = await api.post(`/ai/categorize/${taskId}`);
        return response.data;
    },

    /**
     * Get productivity insights
     */
    getInsights: async () => {
        const response = await api.get('/ai/insights');
        return response.data;
    },
};

export default api;
