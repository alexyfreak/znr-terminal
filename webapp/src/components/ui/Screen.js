import { jsx as _jsx } from "react/jsx-runtime";
export default function Screen({ children }) {
    return (_jsx("main", { className: "safe-bottom safe-x mx-auto flex min-h-dvh max-w-md flex-col bg-zn-page", children: children }));
}
