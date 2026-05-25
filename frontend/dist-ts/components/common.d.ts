import type { ReactNode } from "react";
export declare const card = "rounded-2xl border border-slate-200 bg-white shadow-sm";
export declare const primaryButton = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-teal-700 px-6 font-black text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300";
export declare const secondaryButton = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 font-bold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400";
export declare const coralButton = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-coral-500 px-6 font-black text-white transition hover:bg-coral-600";
export declare const field = "min-h-11 rounded-2xl border border-slate-300 bg-slate-50 px-4 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100";
export declare function SectionTitle({ icon, title, detail }: {
    icon: ReactNode;
    title: string;
    detail: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function SectionHeader({ title, detail }: {
    title: string;
    detail: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function Input({ label, value, onChange }: {
    label: string;
    value: string;
    onChange?: (value: string) => void;
}): import("react/jsx-runtime").JSX.Element;
export declare function TextArea({ label, value, onChange }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}): import("react/jsx-runtime").JSX.Element;
export declare function Select({ label, value, options, onChange }: {
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
}): import("react/jsx-runtime").JSX.Element;
export declare function Metric({ icon, label, value }: {
    icon: ReactNode;
    label: string;
    value: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function MetricPanel({ icon, label, value, detail }: {
    icon: ReactNode;
    label: string;
    value: string;
    detail: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function Logo({ label, large }: {
    label: string;
    large?: boolean;
}): import("react/jsx-runtime").JSX.Element;
export declare function Avatar({ label, large }: {
    label: string;
    large?: boolean;
}): import("react/jsx-runtime").JSX.Element;
export declare function SkillRow({ skills }: {
    skills: string[];
}): import("react/jsx-runtime").JSX.Element;
export declare function EmptyState({ title, detail }: {
    title: string;
    detail: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function CompactList({ items }: {
    items: string[];
}): import("react/jsx-runtime").JSX.Element;
export declare function Modal({ title, children, onClose }: {
    title: string;
    children: ReactNode;
    onClose: () => void;
}): import("react/jsx-runtime").JSX.Element;
export declare function initials(name: string): string;
export declare function labelFor(value: string): string;
