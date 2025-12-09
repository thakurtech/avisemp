"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from './api';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'OWNER' | 'MANAGER' | 'EMPLOYEE';
    designation?: string;
    department?: string;
    avatar?: string;
    managerId?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: { email: string; password: string; name: string; phone?: string; company?: string }) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('avis_token');
            if (!token) {
                setIsLoading(false);
                return;
            }

            const { user } = await authAPI.getMe();
            setUser(user);
            localStorage.setItem('avis_user', JSON.stringify(user));
        } catch (error) {
            // Token invalid or expired
            localStorage.removeItem('avis_token');
            localStorage.removeItem('avis_user');
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const { user } = await authAPI.login(email, password);
        setUser(user);
        localStorage.setItem('avis_user', JSON.stringify(user));
    };

    const register = async (data: { email: string; password: string; name: string; phone?: string; company?: string }) => {
        const { user } = await authAPI.register(data);
        setUser(user);
        localStorage.setItem('avis_user', JSON.stringify(user));
    };

    const logout = () => {
        setUser(null);
        authAPI.logout();
    };

    const refreshUser = async () => {
        try {
            const { user } = await authAPI.getMe();
            setUser(user);
            localStorage.setItem('avis_user', JSON.stringify(user));
        } catch (error) {
            logout();
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Helper to get role-based redirect path
export function getRoleDashboardPath(role: string): string {
    switch (role) {
        case 'OWNER':
            return '/dashboard/owner';
        case 'MANAGER':
            return '/dashboard/manager';
        default:
            return '/dashboard/employee';
    }
}
