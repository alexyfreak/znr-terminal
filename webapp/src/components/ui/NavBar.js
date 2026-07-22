import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Home, ClipboardList, MessageCircle, User } from 'lucide-react';
const items = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'ariza', label: 'Ariza', icon: ClipboardList },
    { key: 'chat', label: 'Chat', icon: MessageCircle },
    { key: 'profile', label: 'Profile', icon: User },
];
export default function NavBar({ active, onNavigate }) {
    return (_jsx("nav", { className: "safe-bottom flex items-center justify-around border-t border-zn-border bg-zn-page px-2 pt-2", children: items.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (_jsxs("button", { onClick: () => onNavigate(item.key), className: "flex flex-col items-center gap-0.5 px-3 py-1", children: [_jsx(Icon, { size: 22, className: isActive ? 'text-zn-text' : 'text-zn-text-faint' }), _jsx("span", { className: `text-[10px] font-medium ${isActive ? 'text-zn-text' : 'text-zn-text-faint'}`, children: item.label })] }, item.key));
        }) }));
}
