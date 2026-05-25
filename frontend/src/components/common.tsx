import type { ReactNode } from "react";
import { CheckCircle2, X } from "lucide-react";

export const card = "rounded-2xl border border-slate-200 bg-white shadow-sm";
export const primaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-teal-700 px-6 font-black text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300";
export const secondaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 font-bold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400";
export const coralButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-coral-500 px-6 font-black text-white transition hover:bg-coral-600";
export const field =
  "min-h-11 rounded-2xl border border-slate-300 bg-slate-50 px-4 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100";

export function SectionTitle({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-teal-50 text-teal-800">{icon}</div>
      <span>
        <strong className="block">{title}</strong>
        <small className="mt-0.5 block text-slate-500">{detail}</small>
      </span>
    </div>
  );
}

export function SectionHeader({ title, detail }: { title: string; detail: string }) {
  return (
    <div>
      <h2 className="text-xl font-black tracking-normal">{title}</h2>
      <p className="mt-1 text-slate-500">{detail}</p>
    </div>
  );
}

export function Input({ label, value, onChange }: { label: string; value: string; onChange?: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-600">
      {label}
      <input className={field} value={value} onChange={(event) => onChange?.(event.target.value)} readOnly={!onChange} />
    </label>
  );
}

export function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-600">
      {label}
      <textarea className={`${field} min-h-28 py-3`} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-600">
      {label}
      <select className={field} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

export function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="grid min-h-10 grid-cols-[22px_1fr_auto] items-center gap-2 text-slate-500">
      {icon}
      <span>{label}</span>
      <strong className="text-slate-900">{value}</strong>
    </div>
  );
}

export function MetricPanel({ icon, label, value, detail }: { icon: ReactNode; label: string; value: string; detail: string }) {
  return (
    <section className={`${card} grid gap-1 p-5`}>
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-teal-50 text-teal-800">{icon}</div>
      <span className="text-slate-500">{label}</span>
      <strong className="text-3xl">{value}</strong>
      <small className="text-slate-500">{detail}</small>
    </section>
  );
}

export function Logo({ label, large = false }: { label: string; large?: boolean }) {
  return <div className={`grid place-items-center rounded-2xl bg-[#e8f3ee] font-black text-teal-900 ${large ? "h-16 w-16" : "h-12 w-12"}`}>{label}</div>;
}

export function Avatar({ label, large = false }: { label: string; large?: boolean }) {
  return <div className={`grid place-items-center rounded-full bg-[#ffe6dc] font-black text-[#9a442b] ${large ? "h-14 w-14 text-lg" : "h-11 w-11"}`}>{label}</div>;
}

export function SkillRow({ skills }: { skills: string[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {skills.map((skill) => <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700" key={skill}>{skill}</span>)}
    </div>
  );
}

export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <strong>{title}</strong>
      <p className="mt-1 text-sm text-slate-500">{detail}</p>
    </div>
  );
}

export function CompactList({ items }: { items: string[] }) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <div className="grid grid-cols-[auto_1fr] items-start gap-2" key={item}>
          <CheckCircle2 className="text-teal-700" size={17} />
          <span className="text-sm text-slate-500">{item}</span>
        </div>
      ))}
    </div>
  );
}

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black">{title}</h2>
          <button className="grid h-9 w-9 place-items-center rounded-full bg-slate-100" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("");
}

export function labelFor(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}
