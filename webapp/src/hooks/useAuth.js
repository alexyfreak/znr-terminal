import { jsx as _jsx } from "react/jsx-runtime";
import { useState, useCallback, createContext, useContext } from 'react';
import { requireSupabase } from './useSupabase';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
    const [state, setState] = useState({
        user: null,
        isLoading: true,
        error: null,
    });
    const login = useCallback(async (telegramId, role) => {
        setState({ user: null, isLoading: true, error: null });
        try {
            const sb = requireSupabase();
            const { data, error } = await sb
                .from('users')
                .select('*')
                .eq('telegram_id', telegramId)
                .maybeSingle();
            if (error)
                throw error;
            if (data) {
                setState({ user: data, isLoading: false, error: null });
            }
            else {
                const name = telegramId === 2000001 ? 'Dilorom Salimova' : 'Aliya Karimova';
                const phone = '+998901234567';
                const { data: created, error: createErr } = await sb
                    .from('users')
                    .insert({ telegram_id: telegramId, full_name: name, phone, role })
                    .select()
                    .single();
                if (createErr)
                    throw createErr;
                setState({ user: created, isLoading: false, error: null });
            }
        }
        catch (err) {
            setState({ user: null, isLoading: false, error: err instanceof Error ? err.message : 'Login failed' });
        }
    }, []);
    const logout = useCallback(() => {
        setState({ user: null, isLoading: false, error: null });
    }, []);
    return (_jsx(AuthContext.Provider, { value: { ...state, login, logout }, children: children }));
}
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error('useAuth must be inside AuthProvider');
    return ctx;
}
