import { createContext, useState, useContext, type ReactNode, useEffect } from 'react';
import type { LoginResponse } from '../interfaces/Auth';

interface AuthContextType {
    auth: LoginResponse | null;
    login: (authData: LoginResponse) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [auth, setAuth] = useState<LoginResponse | null>(() => {
        const storedAuth = localStorage.getItem('auth');
        return storedAuth ? JSON.parse(storedAuth) : null;
    });

    useEffect(() => {
        if (auth) {
            localStorage.setItem('auth', JSON.stringify(auth));
        } else {
            localStorage.removeItem('auth');
        }
    }, [auth]);

    const login = (authData: LoginResponse) => {
        setAuth(authData);
    };

    const logout = () => {
        setAuth(null);
    };

    const value = { auth, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}