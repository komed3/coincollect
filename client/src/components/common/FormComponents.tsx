import { clsx, type ClassValue } from 'clsx';

function cn( ...inputs: ClassValue[] ) {
    return clsx( inputs );
}

interface FieldProps {
    label: string;
    error?: string;
    required?: boolean;
}

export const FormField = ( { label, error, required, children }: FieldProps & { children: React.ReactNode } ) => (
    <div className="space-y-1.5 w-full">
        <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">
            {label} { required && <span className="text-amber-500">*</span> }
        </label>
        { children }
        { error && <p className="text-[10px] text-red-500 uppercase tracking-tight">{error}</p> }
    </div>
);

export const Input = ( { className, ...props }: React.InputHTMLAttributes< HTMLInputElement > ) => (
    <input
        className={ cn(
            "w-full bg-slate-50 border border-slate-200 p-3 text-sm focus:outline-none focus:border-slate-400 transition-colors placeholder:text-slate-300",
            className
        ) }
        { ...props }
    />
);

export const Select = ( { className, children, ...props }: React.SelectHTMLAttributes< HTMLSelectElement > ) => (
    <select
        className={ cn(
            "w-full bg-slate-50 border border-slate-200 p-3 text-sm focus:outline-none focus:border-slate-400 transition-colors appearance-none cursor-pointer",
            className
        ) }
        { ...props }
    >
        { children }
    </select>
);

export const TextArea = ( { className, ...props }: React.TextareaHTMLAttributes< HTMLTextAreaElement > ) => (
    <textarea
        className={ cn(
            "w-full bg-slate-50 border border-slate-200 p-3 text-sm focus:outline-none focus:border-slate-400 transition-colors placeholder:text-slate-300 min-h-[100px]",
            className
        )}
        { ...props }
    />
);
