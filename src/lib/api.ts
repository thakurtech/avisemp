// API Service for connecting to the backend
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

// Get token from localStorage
const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('avis_token');
};

// API request helper
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'API request failed');
    }

    return data;
}

// ============ AUTH ============
export const authAPI = {
    login: async (email: string, password: string) => {
        const data = await apiRequest<{ token: string; user: any }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        localStorage.setItem('avis_token', data.token);
        return data;
    },

    register: async (userData: { email: string; password: string; name: string; phone?: string; company?: string }) => {
        const data = await apiRequest<{ token: string; user: any }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
        localStorage.setItem('avis_token', data.token);
        return data;
    },

    logout: () => {
        localStorage.removeItem('avis_token');
        localStorage.removeItem('avis_user');
        window.location.href = '/auth/login';
    },

    getMe: async () => {
        return apiRequest<{ user: any }>('/auth/me');
    },
};

// ============ USERS ============
export const usersAPI = {
    getAll: async () => {
        return apiRequest<{ users: any[] }>('/users');
    },

    getById: async (id: string) => {
        return apiRequest<{ user: any }>(`/users/${id}`);
    },

    create: async (userData: {
        email: string;
        password: string;
        name: string;
        phone?: string;
        role: 'MANAGER' | 'EMPLOYEE';
        designation?: string;
        department?: string;
        managerId?: string;
    }) => {
        return apiRequest<{ user: any }>('/users', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },

    update: async (id: string, userData: any) => {
        return apiRequest<{ user: any }>(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
    },

    delete: async (id: string) => {
        return apiRequest<{ message: string }>(`/users/${id}`, {
            method: 'DELETE',
        });
    },

    getManagers: async () => {
        return apiRequest<{ managers: any[] }>('/users/managers/list');
    },
};

// ============ TASKS ============
export const tasksAPI = {
    getAll: async (filters?: { status?: string; priority?: string }) => {
        const params = new URLSearchParams(filters as Record<string, string>).toString();
        return apiRequest<{ tasks: any[] }>(`/tasks${params ? `?${params}` : ''}`);
    },

    getById: async (id: string) => {
        return apiRequest<{ task: any }>(`/tasks/${id}`);
    },

    create: async (taskData: {
        title: string;
        description?: string;
        priority?: 'LOW' | 'MEDIUM' | 'HIGH';
        deadline?: string;
        assigneeId: string;
    }) => {
        return apiRequest<{ task: any }>('/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData),
        });
    },

    updateStatus: async (id: string, status: string) => {
        return apiRequest<{ task: any }>(`/tasks/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    },

    update: async (id: string, taskData: any) => {
        return apiRequest<{ task: any }>(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(taskData),
        });
    },

    delete: async (id: string) => {
        return apiRequest<{ message: string }>(`/tasks/${id}`, {
            method: 'DELETE',
        });
    },

    addComment: async (taskId: string, content: string) => {
        return apiRequest<{ comment: any }>(`/tasks/${taskId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content }),
        });
    },
};

// ============ ATTENDANCE ============
export const attendanceAPI = {
    getAll: async (filters?: { month?: number; year?: number }) => {
        const params = new URLSearchParams(filters as unknown as Record<string, string>).toString();
        return apiRequest<{ records: any[] }>(`/attendance${params ? `?${params}` : ''}`);
    },

    getToday: async () => {
        return apiRequest<{ isClockedIn: boolean; clockIn?: string; clockOut?: string }>('/attendance/today');
    },

    clockIn: async () => {
        return apiRequest<{ record: any; clockIn: string }>('/attendance/clock-in', {
            method: 'POST',
        });
    },

    clockOut: async () => {
        return apiRequest<{ record: any; hoursWorked: string }>('/attendance/clock-out', {
            method: 'POST',
        });
    },

    getStats: async () => {
        return apiRequest<{ present: number; absent: number; halfDay: number; totalHours: string }>('/attendance/stats');
    },
};

// ============ LEAVES ============
export const leavesAPI = {
    getAll: async (status?: string) => {
        const params = status ? `?status=${status}` : '';
        return apiRequest<{ leaves: any[] }>(`/leaves${params}`);
    },

    create: async (leaveData: {
        type: 'CASUAL' | 'SICK' | 'EARNED' | 'UNPAID';
        startDate: string;
        endDate: string;
        reason: string;
    }) => {
        return apiRequest<{ leave: any }>('/leaves', {
            method: 'POST',
            body: JSON.stringify(leaveData),
        });
    },

    approve: async (id: string) => {
        return apiRequest<{ leave: any }>(`/leaves/${id}/approve`, {
            method: 'PATCH',
        });
    },

    reject: async (id: string) => {
        return apiRequest<{ leave: any }>(`/leaves/${id}/reject`, {
            method: 'PATCH',
        });
    },

    getBalance: async () => {
        return apiRequest<{ balance: { casual: number; sick: number; earned: number }; used: any }>('/leaves/balance');
    },
};

// ============ DASHBOARD ============
export const dashboardAPI = {
    getStats: async () => {
        return apiRequest<any>('/dashboard/stats');
    },
};
