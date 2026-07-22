import { jsx as _jsx } from "react/jsx-runtime";
const statusConfig = {
    pending: { label: 'Pending', bg: 'bg-zn-warning-bg', text: 'text-zn-warning-text' },
    approved: { label: 'Approved', bg: 'bg-zn-success-bg', text: 'text-zn-success-text' },
    rejected: { label: 'Rejected', bg: 'bg-zn-error-bg', text: 'text-zn-error-text' },
};
export default function StatusBadge({ status }) {
    const c = statusConfig[status];
    return (_jsx("span", { className: `rounded-zn-btn px-3 py-1 text-xs font-medium ${c.bg} ${c.text}`, children: c.label }));
}
