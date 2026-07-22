import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTelegram } from '@/hooks/useTelegram';
import { ClipboardList, UserCheck, User } from 'lucide-react';
import Button from '@/components/ui/Button';
const roles = [
    { value: 'parent', label: 'Parent', icon: User },
    { value: 'sinf_rahbar', label: 'Sinf Rahbar', icon: UserCheck },
];
export default function Auth() {
    const { login, isLoading } = useAuth();
    const { user: tgUser, haptic } = useTelegram();
    const [selectedRole, setSelectedRole] = useState('parent');
    const handleLogin = async () => {
        haptic('heavy');
        const id = tgUser?.id || 1000001;
        await login(id, selectedRole);
    };
    return (_jsxs("div", { className: "safe-top safe-x flex min-h-dvh flex-col items-center justify-center bg-zn-page px-6", children: [_jsxs("div", { className: "mb-10 text-center", children: [_jsx("div", { className: "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-zn-card bg-zn-surface", children: _jsx(ClipboardList, { size: 32, className: "text-zn-text" }) }), _jsx("h1", { className: "font-sans text-2xl font-bold text-zn-text", children: "Zunoora" }), _jsx("p", { className: "mt-1 text-sm text-zn-text-muted", children: "School Document Assistant" })] }), _jsxs("div", { className: "mb-8 w-full max-w-xs", children: [_jsx("p", { className: "mb-3 text-center text-xs font-medium uppercase tracking-wider text-zn-text-faint", children: "Login as" }), _jsx("div", { className: "flex gap-3", children: roles.map((r) => {
                            const Icon = r.icon;
                            const isActive = selectedRole === r.value;
                            return (_jsxs("button", { onClick: () => {
                                    setSelectedRole(r.value);
                                    haptic('light');
                                }, className: `flex flex-1 flex-col items-center gap-2 rounded-zn-btn border-2 px-4 py-5 transition ${isActive
                                    ? 'border-zn-text bg-zn-surface'
                                    : 'border-transparent bg-zn-elevated'}`, children: [_jsx(Icon, { size: 28, className: isActive ? 'text-zn-text' : 'text-zn-text-muted' }), _jsx("span", { className: `text-xs font-semibold ${isActive ? 'text-zn-text' : 'text-zn-text-muted'}`, children: r.label })] }, r.value));
                        }) })] }), _jsx(Button, { fullWidth: true, disabled: isLoading, onClick: handleLogin, children: isLoading ? 'Connecting...' : 'Continue via Telegram' }), tgUser && (_jsxs("p", { className: "mt-4 text-xs text-zn-text-faint", children: ["Telegram: ", tgUser.first_name, " ", tgUser.last_name || ''] }))] }));
}
