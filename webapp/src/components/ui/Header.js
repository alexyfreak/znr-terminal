import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ArrowLeft, MessageCircle } from 'lucide-react';
export default function Header({ title, onBack, onChat }) {
    return (_jsxs("header", { className: "safe-top flex items-center justify-between border-b border-zn-border px-4 pb-3 pt-2", children: [_jsxs("div", { className: "flex items-center gap-3", children: [onBack && (_jsx("button", { onClick: onBack, className: "rounded-zn-btn p-1 text-zn-text-muted hover:text-zn-text", children: _jsx(ArrowLeft, { size: 22 }) })), _jsx("h1", { className: "font-sans text-lg font-semibold text-zn-text", children: title })] }), onChat && (_jsx("button", { onClick: onChat, className: "rounded-zn-btn p-2 text-zn-text-muted hover:text-zn-text", children: _jsx(MessageCircle, { size: 22 }) }))] }));
}
