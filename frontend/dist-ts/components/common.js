import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CheckCircle2, X } from "lucide-react";
export const card = "rounded-2xl border border-slate-200 bg-white shadow-sm";
export const primaryButton = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-teal-700 px-6 font-black text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300";
export const secondaryButton = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 font-bold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400";
export const coralButton = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-coral-500 px-6 font-black text-white transition hover:bg-coral-600";
export const field = "min-h-11 rounded-2xl border border-slate-300 bg-slate-50 px-4 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100";
export function SectionTitle({ icon, title, detail }) {
    return (_jsxs("div", { className: "mb-4 flex items-center gap-3", children: [_jsx("div", { className: "grid h-10 w-10 place-items-center rounded-2xl bg-teal-50 text-teal-800", children: icon }), _jsxs("span", { children: [_jsx("strong", { className: "block", children: title }), _jsx("small", { className: "mt-0.5 block text-slate-500", children: detail })] })] }));
}
export function SectionHeader({ title, detail }) {
    return (_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-black tracking-normal", children: title }), _jsx("p", { className: "mt-1 text-slate-500", children: detail })] }));
}
export function Input({ label, value, onChange }) {
    return (_jsxs("label", { className: "grid gap-2 text-sm font-bold text-slate-600", children: [label, _jsx("input", { className: field, value: value, onChange: (event) => onChange?.(event.target.value), readOnly: !onChange })] }));
}
export function TextArea({ label, value, onChange }) {
    return (_jsxs("label", { className: "grid gap-2 text-sm font-bold text-slate-600", children: [label, _jsx("textarea", { className: `${field} min-h-28 py-3`, value: value, onChange: (event) => onChange(event.target.value) })] }));
}
export function Select({ label, value, options, onChange }) {
    return (_jsxs("label", { className: "grid gap-2 text-sm font-bold text-slate-600", children: [label, _jsx("select", { className: field, value: value, onChange: (event) => onChange(event.target.value), children: options.map((option) => _jsx("option", { children: option }, option)) })] }));
}
export function Metric({ icon, label, value }) {
    return (_jsxs("div", { className: "grid min-h-10 grid-cols-[22px_1fr_auto] items-center gap-2 text-slate-500", children: [icon, _jsx("span", { children: label }), _jsx("strong", { className: "text-slate-900", children: value })] }));
}
export function MetricPanel({ icon, label, value, detail }) {
    return (_jsxs("section", { className: `${card} grid gap-1 p-5`, children: [_jsx("div", { className: "grid h-10 w-10 place-items-center rounded-2xl bg-teal-50 text-teal-800", children: icon }), _jsx("span", { className: "text-slate-500", children: label }), _jsx("strong", { className: "text-3xl", children: value }), _jsx("small", { className: "text-slate-500", children: detail })] }));
}
export function Logo({ label, large = false }) {
    return _jsx("div", { className: `grid place-items-center rounded-2xl bg-[#e8f3ee] font-black text-teal-900 ${large ? "h-16 w-16" : "h-12 w-12"}`, children: label });
}
export function Avatar({ label, large = false }) {
    return _jsx("div", { className: `grid place-items-center rounded-full bg-[#ffe6dc] font-black text-[#9a442b] ${large ? "h-14 w-14 text-lg" : "h-11 w-11"}`, children: label });
}
export function SkillRow({ skills }) {
    return (_jsx("div", { className: "mt-3 flex flex-wrap gap-2", children: skills.map((skill) => _jsx("span", { className: "rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700", children: skill }, skill)) }));
}
export function EmptyState({ title, detail }) {
    return (_jsxs("div", { className: "rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center", children: [_jsx("strong", { children: title }), _jsx("p", { className: "mt-1 text-sm text-slate-500", children: detail })] }));
}
export function CompactList({ items }) {
    return (_jsx("div", { className: "grid gap-3", children: items.map((item) => (_jsxs("div", { className: "grid grid-cols-[auto_1fr] items-start gap-2", children: [_jsx(CheckCircle2, { className: "text-teal-700", size: 17 }), _jsx("span", { className: "text-sm text-slate-500", children: item })] }, item))) }));
}
export function Modal({ title, children, onClose }) {
    return (_jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4", children: _jsxs("section", { className: "w-full max-w-md rounded-2xl bg-white p-5 shadow-xl", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsx("h2", { className: "text-xl font-black", children: title }), _jsx("button", { className: "grid h-9 w-9 place-items-center rounded-full bg-slate-100", onClick: onClose, children: _jsx(X, { size: 18 }) })] }), children] }) }));
}
export function initials(name) {
    return name.split(" ").map((part) => part[0]).join("");
}
export function labelFor(value) {
    return value.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}
//# sourceMappingURL=common.js.map