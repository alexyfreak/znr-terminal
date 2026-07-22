import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { ClipboardList, Check, X, AlertTriangle, Award, Plus, Image, } from 'lucide-react';
import Screen from '@/components/ui/Screen';
import Header from '@/components/ui/Header';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import NavBar from '@/components/ui/NavBar';
import { useAuth } from '@/hooks/useAuth';
import { useTeacherArizas, useAllChildren, useBildirgis, uploadFile } from '@/hooks/useData';
function ArizaModerationCard({ ariza, childName, onApprove, onReject, }) {
    return (_jsxs("div", { className: "rounded-zn-popover border border-zn-border bg-zn-surface p-4", children: [_jsxs("div", { className: "mb-3 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-zn-text", children: childName }), _jsxs("p", { className: "text-xs text-zn-text-muted", children: [ariza.date_from, " \u2192 ", ariza.date_to] })] }), _jsx(StatusBadge, { status: ariza.status })] }), _jsx("p", { className: "mb-3 text-xs text-zn-text-faint", children: ariza.reason_text }), ariza.doctor_paper_url && (_jsxs("a", { href: ariza.doctor_paper_url, target: "_blank", rel: "noopener noreferrer", className: "mb-3 flex items-center gap-2 rounded-zn-input bg-zn-elevated px-3 py-2", children: [_jsx(Image, { size: 16, className: "text-zn-info-accent" }), _jsx("span", { className: "text-xs text-zn-info-accent", children: "View doctor paper" })] })), ariza.status === 'pending' && (_jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { onClick: () => onApprove(ariza.id), className: "flex flex-1 items-center justify-center gap-1.5 rounded-zn-btn bg-zn-success-bg py-2.5 text-sm font-semibold text-zn-success-text", children: [_jsx(Check, { size: 16 }), "Approve"] }), _jsxs("button", { onClick: () => onReject(ariza.id), className: "flex flex-1 items-center justify-center gap-1.5 rounded-zn-btn bg-zn-error-bg py-2.5 text-sm font-semibold text-zn-error-text", children: [_jsx(X, { size: 16 }), "Reject"] })] }))] }));
}
function BildirgiForm({ onSubmit, }) {
    const { children: allStudents } = useAllChildren();
    const [studentId, setStudentId] = useState('');
    const [type, setType] = useState('praise');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    useEffect(() => {
        if (allStudents.length > 0 && !studentId) {
            setStudentId(allStudents[0].id);
        }
    }, [allStudents, studentId]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!studentId || !title)
            return;
        let image_url;
        if (file) {
            try {
                image_url = (await uploadFile(file)) ?? undefined;
            }
            catch { /* ignore */ }
        }
        onSubmit({ student_id: studentId, teacher_id: '', type, title, description, image_url });
        setTitle('');
        setDescription('');
        setFile(null);
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 px-4 py-4", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-xs font-medium text-zn-text-muted", children: "Student" }), _jsx("select", { value: studentId, onChange: (e) => setStudentId(e.target.value), className: "w-full rounded-zn-input bg-zn-elevated px-4 py-3 text-sm text-zn-text", children: allStudents.map((s) => (_jsxs("option", { value: s.id, children: [s.full_name, " (", s.class_name, ")"] }, s.id))) })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-xs font-medium text-zn-text-muted", children: "Type" }), _jsx("div", { className: "flex gap-3", children: ['praise', 'violation'].map((t) => (_jsxs("button", { type: "button", onClick: () => setType(t), className: `flex flex-1 items-center justify-center gap-2 rounded-zn-btn border-2 py-2.5 text-sm font-semibold transition ${type === t
                                ? t === 'praise'
                                    ? 'border-zn-success-text bg-zn-success-bg text-zn-success-text'
                                    : 'border-zn-error-text bg-zn-error-bg text-zn-error-text'
                                : 'border-transparent bg-zn-elevated text-zn-text-muted'}`, children: [t === 'praise' ? _jsx(Award, { size: 16 }) : _jsx(AlertTriangle, { size: 16 }), t === 'praise' ? 'Praise' : 'Violation'] }, t))) })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-xs font-medium text-zn-text-muted", children: "Title" }), _jsx("input", { value: title, onChange: (e) => setTitle(e.target.value), placeholder: "e.g. Excellent participation", className: "w-full rounded-zn-input bg-zn-elevated px-4 py-3 text-sm text-zn-text placeholder-zn-text-faint", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-xs font-medium text-zn-text-muted", children: "Description (optional)" }), _jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), placeholder: "Details...", rows: 2, className: "w-full resize-none rounded-zn-input bg-zn-elevated px-4 py-3 text-sm text-zn-text placeholder-zn-text-faint" })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-xs font-medium text-zn-text-muted", children: "Photo (optional)" }), _jsx("input", { type: "file", accept: "image/*", onChange: (e) => setFile(e.target.files?.[0] || null), className: "w-full text-sm text-zn-text-muted file:mr-3 file:rounded-zn-btn file:border-0 file:bg-zn-surface file:px-4 file:py-2 file:text-sm file:text-zn-text" })] }), _jsx(Button, { type: "submit", fullWidth: true, children: "Submit Bildirgi" })] }));
}
export default function TeacherDashboard({ onOpenChat }) {
    const { user } = useAuth();
    const { arizas, moderate } = useTeacherArizas();
    const { children } = useAllChildren();
    const { bildirgis, create: createBildirgi } = useBildirgis();
    const [tab, setTab] = useState('home');
    const [showBildirgiForm, setShowBildirgiForm] = useState(false);
    const [localBildirgis, setLocalBildirgis] = useState([]);
    const pendingCount = arizas.filter((a) => a.status === 'pending').length;
    const handleApprove = async (id) => {
        if (!user)
            return;
        await moderate(id, 'approved', user.id);
    };
    const handleReject = async (id) => {
        if (!user)
            return;
        await moderate(id, 'rejected', user.id);
    };
    const handleBildirgi = async (data) => {
        if (!user)
            return;
        const result = await createBildirgi({ ...data, teacher_id: user.id });
        if (result.data) {
            const student = children.find((s) => s.id === data.student_id);
            setLocalBildirgis((prev) => [{
                    id: result.data.id,
                    studentName: student?.full_name || 'Unknown',
                    type: data.type,
                    title: data.title,
                }, ...prev]);
        }
        setShowBildirgiForm(false);
    };
    const childName = (childId) => children.find((c) => c.id === childId)?.full_name || 'Unknown';
    const content = () => {
        switch (tab) {
            case 'home':
                return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-2 gap-3 px-4 pb-4 pt-4", children: [_jsxs("div", { className: "rounded-zn-popover bg-zn-surface p-4", children: [_jsx(ClipboardList, { size: 20, className: "mb-2 text-zn-warning-accent" }), _jsx("p", { className: "text-2xl font-bold text-zn-text", children: pendingCount }), _jsx("p", { className: "text-xs text-zn-text-muted", children: "Pending Arizas" })] }), _jsxs("div", { className: "rounded-zn-popover bg-zn-surface p-4", children: [_jsx(Award, { size: 20, className: "mb-2 text-zn-info-accent" }), _jsx("p", { className: "text-2xl font-bold text-zn-text", children: children.length }), _jsx("p", { className: "text-xs text-zn-text-muted", children: "Students" })] })] }), _jsx("div", { className: "flex items-center justify-between px-4 py-2", children: _jsx("h3", { className: "font-sans text-sm font-semibold text-zn-text-muted uppercase tracking-wider", children: "Class Stats" }) }), _jsxs("div", { className: "space-y-2 px-4 pb-6", children: [_jsxs("div", { className: "flex items-center justify-between rounded-zn-input bg-zn-surface px-4 py-3", children: [_jsx("span", { className: "text-sm text-zn-text", children: "Attendance (avg)" }), _jsx("span", { className: "text-sm font-semibold text-zn-success-text", children: "94%" })] }), _jsxs("div", { className: "flex items-center justify-between rounded-zn-input bg-zn-surface px-4 py-3", children: [_jsx("span", { className: "text-sm text-zn-text", children: "Bildirgi this month" }), _jsx("span", { className: "text-sm font-semibold text-zn-text", children: bildirgis.length + localBildirgis.length })] })] }), (localBildirgis.length > 0 || bildirgis.length > 0) && (_jsxs(_Fragment, { children: [_jsx("div", { className: "px-4 pb-2", children: _jsx("h3", { className: "font-sans text-sm font-semibold text-zn-text-muted uppercase tracking-wider", children: "Recent Entries" }) }), _jsx("div", { className: "space-y-1 px-4 pb-6", children: [...localBildirgis, ...bildirgis.slice(0, 10).map((b) => ({
                                            id: b.id,
                                            studentName: childName(b.student_id),
                                            type: b.type,
                                            title: b.title,
                                        }))].slice(0, 20).map((b) => (_jsxs("div", { className: "flex items-center gap-3 rounded-zn-input bg-zn-surface px-4 py-3", children: [b.type === 'praise' ? (_jsx(Award, { size: 16, className: "text-zn-success-text" })) : (_jsx(AlertTriangle, { size: 16, className: "text-zn-error-text" })), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: "text-sm text-zn-text", children: b.title }), _jsx("p", { className: "text-xs text-zn-text-muted", children: b.studentName })] })] }, b.id))) })] }))] }));
            case 'ariza':
                return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center justify-between px-4 py-3", children: [_jsx("h2", { className: "font-sans text-sm font-semibold text-zn-text-muted uppercase tracking-wider", children: "Ariza Moderation" }), _jsxs("button", { onClick: () => setShowBildirgiForm(!showBildirgiForm), className: "flex items-center gap-1 rounded-zn-btn bg-zn-surface px-3 py-1.5 text-xs font-medium text-zn-text", children: [_jsx(Plus, { size: 14 }), showBildirgiForm ? 'Close' : 'Bildirgi'] })] }), showBildirgiForm && _jsx(BildirgiForm, { onSubmit: handleBildirgi }), _jsxs("div", { className: "space-y-3 px-4 pb-6", children: [arizas.length === 0 && (_jsx("p", { className: "text-sm text-zn-text-faint text-center py-4", children: "No ariza requests" })), arizas.map((a) => (_jsx(ArizaModerationCard, { ariza: a, childName: childName(a.child_id), onApprove: handleApprove, onReject: handleReject }, a.id)))] })] }));
            case 'chat':
                onOpenChat();
                return null;
            default:
                return (_jsx("div", { className: "flex flex-1 items-center justify-center", children: _jsx("p", { className: "text-sm text-zn-text-muted", children: "Profile settings" }) }));
        }
    };
    return (_jsxs(Screen, { children: [_jsx(Header, { title: "Sinf Rahbar", onChat: onOpenChat }), _jsx("div", { className: "flex-1 overflow-y-auto", children: content() }), _jsx(NavBar, { active: tab, onNavigate: setTab, role: "sinf_rahbar" })] }));
}
