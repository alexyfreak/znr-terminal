import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useChildren, useArizas, useBildirgis, uploadFile } from '@/hooks/useData';
import { ChevronDown, Plus, AlertTriangle, Award, Calendar, FileText } from 'lucide-react';
import Screen from '@/components/ui/Screen';
import Header from '@/components/ui/Header';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import NavBar from '@/components/ui/NavBar';
function ChildSelector({ children, selected, onChange, }) {
    const [open, setOpen] = useState(false);
    return (_jsxs("div", { className: "relative px-4 py-3", children: [_jsxs("button", { onClick: () => setOpen(!open), className: "flex w-full items-center justify-between rounded-zn-input bg-zn-surface px-4 py-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-zn-elevated", children: _jsx(FileText, { size: 18, className: "text-zn-text-muted" }) }), _jsxs("div", { className: "text-left", children: [_jsx("p", { className: "text-sm font-semibold text-zn-text", children: selected.full_name }), _jsx("p", { className: "text-xs text-zn-text-muted", children: selected.class_name })] })] }), _jsx(ChevronDown, { size: 18, className: "text-zn-text-muted" })] }), open && (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed inset-0 z-10", onClick: () => setOpen(false) }), _jsx("div", { className: "absolute left-4 right-4 top-full z-20 mt-1 overflow-hidden rounded-zn-popover bg-zn-surface shadow-2xl", children: children.map((c) => (_jsxs("button", { onClick: () => {
                                onChange(c);
                                setOpen(false);
                            }, className: `flex w-full items-center gap-3 px-4 py-3 text-left ${c.id === selected.id ? 'bg-zn-elevated' : ''}`, children: [_jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-zn-elevated", children: _jsx(FileText, { size: 18, className: "text-zn-text-muted" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-zn-text", children: c.full_name }), _jsx("p", { className: "text-xs text-zn-text-muted", children: c.class_name })] })] }, c.id))) })] }))] }));
}
function ArizaForm({ selectedChildId, onSubmit, }) {
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [reason, setReason] = useState('');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!dateFrom || !dateTo || !reason)
            return;
        setUploading(true);
        let doctor_paper_url;
        if (file) {
            try {
                doctor_paper_url = (await uploadFile(file)) ?? undefined;
            }
            catch {
                // Upload failed, submit without file
            }
        }
        onSubmit({ child_id: selectedChildId, date_from: dateFrom, date_to: dateTo, reason_text: reason, doctor_paper_url });
        setDateFrom('');
        setDateTo('');
        setReason('');
        setFile(null);
        setUploading(false);
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 px-4 py-4", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-xs font-medium text-zn-text-muted", children: "Date from" }), _jsx("input", { type: "date", value: dateFrom, onChange: (e) => setDateFrom(e.target.value), className: "w-full rounded-zn-input bg-zn-elevated px-4 py-3 text-sm text-zn-text placeholder-zn-text-faint", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-xs font-medium text-zn-text-muted", children: "Date to" }), _jsx("input", { type: "date", value: dateTo, onChange: (e) => setDateTo(e.target.value), className: "w-full rounded-zn-input bg-zn-elevated px-4 py-3 text-sm text-zn-text placeholder-zn-text-faint", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-xs font-medium text-zn-text-muted", children: "Reason" }), _jsx("textarea", { value: reason, onChange: (e) => setReason(e.target.value), placeholder: "Describe the reason...", rows: 3, className: "w-full resize-none rounded-zn-input bg-zn-elevated px-4 py-3 text-sm text-zn-text placeholder-zn-text-faint", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-xs font-medium text-zn-text-muted", children: "Doctor paper (optional)" }), _jsx("input", { type: "file", accept: "image/*,.pdf", onChange: (e) => setFile(e.target.files?.[0] || null), className: "w-full text-sm text-zn-text-muted file:mr-3 file:rounded-zn-btn file:border-0 file:bg-zn-surface file:px-4 file:py-2 file:text-sm file:text-zn-text" })] }), _jsx(Button, { type: "submit", fullWidth: true, disabled: uploading, children: uploading ? 'Uploading...' : 'Submit Ariza' })] }));
}
export default function ParentDashboard({ onOpenChat }) {
    const { user } = useAuth();
    const { children } = useChildren(user?.id);
    const { arizas, create: createAriza } = useArizas(user?.id);
    const { bildirgis } = useBildirgis();
    const [selectedChild, setSelectedChild] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [tab, setTab] = useState('home');
    useEffect(() => {
        if (children.length > 0 && !selectedChild) {
            setSelectedChild(children[0]);
        }
    }, [children, selectedChild]);
    const handleNewAriza = useCallback(async (data) => {
        await createAriza(data);
        setShowForm(false);
    }, [createAriza]);
    const childBildirgis = bildirgis.filter((b) => b.student_id === selectedChild?.id);
    const childArizas = arizas.filter((a) => a.child_id === selectedChild?.id);
    const praises = childBildirgis.filter((b) => b.type === 'praise');
    const violations = childBildirgis.filter((b) => b.type === 'violation');
    const content = () => {
        switch (tab) {
            case 'home':
                return (_jsxs(_Fragment, { children: [_jsx("div", { className: "px-4 pb-1 pt-4", children: _jsx("h2", { className: "font-sans text-sm font-semibold text-zn-text-muted uppercase tracking-wider", children: "Overview" }) }), _jsxs("div", { className: "flex gap-3 px-4 pb-4", children: [_jsxs("div", { className: "flex-1 rounded-zn-popover bg-zn-surface p-4", children: [_jsx(Calendar, { size: 20, className: "mb-2 text-zn-info-accent" }), _jsx("p", { className: "text-2xl font-bold text-zn-text", children: "96%" }), _jsx("p", { className: "text-xs text-zn-text-muted", children: "Attendance" })] }), _jsxs("div", { className: "flex-1 rounded-zn-popover bg-zn-surface p-4", children: [_jsx(Award, { size: 20, className: "mb-2 text-zn-success-text" }), _jsx("p", { className: "text-2xl font-bold text-zn-text", children: praises.length }), _jsx("p", { className: "text-xs text-zn-text-muted", children: "Praises" })] }), _jsxs("div", { className: "flex-1 rounded-zn-popover bg-zn-surface p-4", children: [_jsx(AlertTriangle, { size: 20, className: "mb-2 text-zn-warning-text" }), _jsx("p", { className: "text-2xl font-bold text-zn-text", children: violations.length }), _jsx("p", { className: "text-xs text-zn-text-muted", children: "Violations" })] })] }), _jsx("div", { className: "px-4 pb-2", children: _jsx("h3", { className: "font-sans text-sm font-semibold text-zn-text-muted uppercase tracking-wider", children: "Recent Bildirgi" }) }), _jsxs("div", { className: "space-y-1 px-4 pb-6", children: [childBildirgis.length === 0 && (_jsx("p", { className: "text-sm text-zn-text-faint text-center py-4", children: "No records yet" })), childBildirgis.map((b) => (_jsxs("div", { className: "flex items-start gap-3 rounded-zn-input bg-zn-surface px-4 py-3", children: [_jsx("div", { className: `mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${b.type === 'praise' ? 'bg-zn-success-bg' : 'bg-zn-error-bg'}`, children: b.type === 'praise' ? (_jsx(Award, { size: 14, className: "text-zn-success-text" })) : (_jsx(AlertTriangle, { size: 14, className: "text-zn-error-text" })) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: "text-sm font-semibold text-zn-text", children: b.title }), b.description && _jsx("p", { className: "text-xs text-zn-text-muted", children: b.description }), _jsx("p", { className: "mt-0.5 text-[11px] text-zn-text-faint", children: new Date(b.created_at).toLocaleDateString() })] })] }, b.id)))] })] }));
            case 'ariza':
                return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center justify-between px-4 py-3", children: [_jsx("h2", { className: "font-sans text-sm font-semibold text-zn-text-muted uppercase tracking-wider", children: "My Arizas" }), _jsxs("button", { onClick: () => setShowForm(!showForm), className: "flex items-center gap-1 rounded-zn-btn bg-zn-surface px-3 py-1.5 text-xs font-medium text-zn-text", children: [_jsx(Plus, { size: 14 }), showForm ? 'Close' : 'New'] })] }), showForm && selectedChild && (_jsx(ArizaForm, { selectedChildId: selectedChild.id, onSubmit: handleNewAriza })), _jsxs("div", { className: "space-y-2 px-4 pb-6", children: [childArizas.length === 0 && (_jsx("p", { className: "text-sm text-zn-text-faint text-center py-4", children: "No ariza requests" })), childArizas.map((a) => (_jsxs("div", { className: "rounded-zn-popover bg-zn-surface p-4", children: [_jsxs("div", { className: "mb-2 flex items-center justify-between", children: [_jsx("p", { className: "text-sm font-semibold text-zn-text", children: a.reason_text }), _jsx(StatusBadge, { status: a.status })] }), _jsxs("p", { className: "text-xs text-zn-text-muted", children: [a.date_from, " \u2192 ", a.date_to] })] }, a.id)))] })] }));
            case 'chat':
                onOpenChat();
                return null;
            default:
                return (_jsx("div", { className: "flex flex-1 items-center justify-center", children: _jsx("p", { className: "text-sm text-zn-text-muted", children: "Profile settings" }) }));
        }
    };
    return (_jsxs(Screen, { children: [_jsx(Header, { title: "Zunoora", onChat: onOpenChat }), selectedChild && (_jsx(ChildSelector, { children: children, selected: selectedChild, onChange: setSelectedChild })), _jsx("div", { className: "flex-1 overflow-y-auto", children: content() }), _jsx(NavBar, { active: tab, onNavigate: setTab, role: "parent" })] }));
}
