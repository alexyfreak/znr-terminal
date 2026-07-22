import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Auth from '@/pages/Auth';
import ParentDashboard from '@/pages/ParentDashboard';
import TeacherDashboard from '@/pages/TeacherDashboard';
import Chat from '@/pages/Chat';
function AppContent() {
    const { user, isLoading } = useAuth();
    const [inChat, setInChat] = useState(false);
    if (isLoading) {
        return (_jsx("div", { className: "flex min-h-dvh items-center justify-center bg-zn-page", children: _jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-2 border-zn-text-faint border-t-zn-text" }) }));
    }
    if (inChat) {
        return _jsx(Chat, { onClose: () => setInChat(false) });
    }
    if (!user) {
        return _jsx(Auth, {});
    }
    if (user.role === 'parent') {
        return _jsx(ParentDashboard, { onOpenChat: () => setInChat(true) });
    }
    return _jsx(TeacherDashboard, { onOpenChat: () => setInChat(true) });
}
export default function App() {
    return (_jsx(AuthProvider, { children: _jsx(AppContent, {}) }));
}
