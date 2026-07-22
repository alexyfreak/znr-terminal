import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { MessageCircle, ChevronLeft, Send, CheckCheck, FileText } from 'lucide-react';
import Screen from '@/components/ui/Screen';
function ChatList({ contacts, onSelect, }) {
    return (_jsxs("div", { className: "flex-1 overflow-y-auto", children: [contacts.length === 0 && (_jsx("div", { className: "flex flex-1 items-center justify-center pt-20", children: _jsxs("div", { className: "text-center", children: [_jsx(MessageCircle, { size: 40, className: "mx-auto mb-3 text-zn-text-faint" }), _jsx("p", { className: "text-sm text-zn-text-muted", children: "No conversations yet" })] }) })), contacts.map((c) => (_jsxs("button", { onClick: () => onSelect(c), className: "flex w-full items-center gap-3 border-b border-zn-border px-4 py-3 text-left active:bg-zn-surface", children: [_jsx("div", { className: "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zn-elevated", children: _jsx(FileText, { size: 20, className: "text-zn-text-muted" }) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-sm font-semibold text-zn-text", children: c.full_name }), c.last_time && (_jsx("span", { className: "text-[11px] text-zn-text-faint", children: c.last_time }))] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "truncate text-xs text-zn-text-muted", children: c.last_message }), c.unread > 0 && (_jsx("span", { className: "ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-zn-info-accent text-[10px] font-bold text-black", children: c.unread }))] })] })] }, c.id)))] }));
}
function ChatThread({ contact, messages, onSend, onBack, }) {
    const { user } = useAuth();
    const handleSubmit = (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const input = form.querySelector('[name="message"]');
        if (input?.value) {
            onSend(input.value);
            input.value = '';
        }
    };
    return (_jsxs("div", { className: "flex flex-1 flex-col", children: [_jsxs("div", { className: "flex items-center gap-3 border-b border-zn-border px-4 py-3", children: [_jsx("button", { onClick: onBack, className: "rounded-zn-btn p-1 text-zn-text-muted", children: _jsx(ChevronLeft, { size: 22 }) }), _jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-zn-elevated", children: _jsx(FileText, { size: 16, className: "text-zn-text-muted" }) }), _jsx("p", { className: "text-sm font-semibold text-zn-text", children: contact.full_name })] }), _jsx("div", { className: "flex-1 space-y-2 overflow-y-auto px-4 py-4", children: messages.map((m) => {
                    const isMine = m.sender_id === user?.id;
                    return (_jsx("div", { className: `flex ${isMine ? 'justify-end' : 'justify-start'}`, children: _jsxs("div", { className: `max-w-[80%] rounded-zn-input px-4 py-2.5 ${isMine ? 'bg-zn-info-accent text-black' : 'bg-zn-surface text-zn-text'}`, children: [_jsx("p", { className: "text-sm", children: m.text }), _jsxs("div", { className: `mt-0.5 flex items-center justify-end gap-1 ${isMine ? 'text-black/60' : 'text-zn-text-faint'}`, children: [_jsx("span", { className: "text-[10px]", children: new Date(m.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) }), isMine && _jsx(CheckCheck, { size: 12 })] })] }) }, m.id));
                }) }), _jsxs("form", { onSubmit: handleSubmit, className: "safe-bottom flex items-center gap-2 border-t border-zn-border px-4 py-3", children: [_jsx("input", { name: "message", placeholder: "Write a message...", autoFocus: true, className: "min-w-0 flex-1 rounded-zn-input bg-zn-elevated px-4 py-2.5 text-sm text-zn-text placeholder-zn-text-faint outline-none" }), _jsx("button", { type: "submit", className: "flex h-10 w-10 items-center justify-center rounded-full bg-zn-info-accent", children: _jsx(Send, { size: 16, className: "text-black" }) })] })] }));
}
export default function Chat({ onClose }) {
    const { user } = useAuth();
    const { contacts, activeContact, messages, openChat, goBack, sendMessage } = useChat(user?.id || '', user?.role || 'parent');
    return (_jsx(Screen, { children: activeContact ? (_jsx(ChatThread, { contact: activeContact, messages: messages, onSend: sendMessage, onBack: goBack })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center gap-3 border-b border-zn-border px-4 py-3", children: [_jsx("button", { onClick: onClose, className: "rounded-zn-btn p-1 text-zn-text-muted", children: _jsx(ChevronLeft, { size: 22 }) }), _jsx("h1", { className: "font-sans text-lg font-semibold text-zn-text", children: "Messages" })] }), _jsx(ChatList, { contacts: contacts, onSelect: openChat })] })) }));
}
