'use client';
import { useState, type ReactNode, type FormEvent } from 'react';
import { LoaderCircle } from 'lucide-react';
export function ActionForm({ children, submit = 'บันทึก', action, onDone }: {
    children: ReactNode;
    submit?: string;
    action: (data: FormData) => Promise<string | void>;
    onDone?: () => void;
}) { const [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [error, setError] = useState(''); async function handle(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const form = e.currentTarget; setBusy(true); setError(''); setMessage(''); try {
    const result = await action(new FormData(form));
    setMessage(result || 'บันทึกเรียบร้อยแล้ว');
    onDone?.();
}
catch (e) {
    setError((e as Error).message);
}
finally {
    setBusy(false);
} } return <form className="store-form" onSubmit={handle}>{children}<button className="button button-dark" type="submit" disabled={busy}>{busy && <LoaderCircle size={16} className="spin"/>}{busy ? 'กำลังทำรายการ…' : submit}</button><div aria-live="polite">{message && <p className="success-text" role="status">{message}</p>}{error && <p className="error-text" role="alert">{error}</p>}</div></form>; }
export function Field({ label, name, type = 'text', required = true, defaultValue = '', minLength, maxLength = 200, placeholder }: {
    label: string;
    name: string;
    type?: string;
    required?: boolean;
    defaultValue?: string;
    minLength?: number;
    maxLength?: number;
    placeholder?: string;
}) { return <label className="field"><span>{label}</span><input type={type} name={name} required={required} defaultValue={defaultValue} minLength={minLength} maxLength={maxLength} placeholder={placeholder}/></label>; }
export function TextField({ label, name, minLength = 10, maxLength = 3000, defaultValue = '', required = true }: {
    label: string;
    name: string;
    minLength?: number;
    maxLength?: number;
    defaultValue?: string;
    required?: boolean;
}) { return <label className="field"><span>{label}</span><textarea name={name} minLength={minLength} maxLength={maxLength} required={required} defaultValue={defaultValue} rows={4}/></label>; }
export const value = (d: FormData, n: string) => String(d.get(n) || '').trim();
