import React from "react";

/* =========================================================
   Button
========================================================= */

export const Button = ({
    children,
    className = "",
    ...props
}) => (
    <button
        className={`px-4 py-2 rounded-md text-sm font-medium transition
      bg-slate-900 text-white hover:bg-slate-800
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-[0.98] ${className}`}
        {...props}
    >
        {children}
    </button>
);

/* =========================================================
   Input
========================================================= */

export const Input = ({ className = "", ...props }) => (
    <input
        className={`w-full h-10 px-3 rounded-md border border-slate-200
      text-sm
      focus:outline-none focus:ring-2 focus:ring-slate-400
      ${className}`}
        {...props}
    />
);

/* =========================================================
   Label
========================================================= */

export const Label = ({ children, className = "", ...props }) => (
    <label
        className={`text-sm font-medium text-slate-700 ${className}`}
        {...props}
    >
        {children}
    </label>
);

/* =========================================================
   Dialog (Modal)
========================================================= */

export const Dialog = ({ open, onOpenChange, children }) => {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={() => onOpenChange(false)}
        >
            <div onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
};

export const DialogContent = ({ children, className = "" }) => (
    <div
        className={`bg-white rounded-xl shadow-xl p-6 w-full max-w-md ${className}`}
    >
        {children}
    </div>
);

export const DialogHeader = ({ children, className = "" }) => (
    <div className={`mb-4 ${className}`}>
        {children}
    </div>
);

export const DialogTitle = ({ children, className = "" }) => (
    <h2 className={`text-xl font-bold tracking-tight ${className}`}>
        {children}
    </h2>
);

/* =========================================================
   Tabs
========================================================= */

export const Tabs = ({ value, onValueChange, children }) => (
    <div data-value={value}>{children}</div>
);

export const TabsList = ({ children, className = "" }) => (
    <div
        className={`inline-flex rounded-lg bg-slate-100 p-1 ${className}`}
    >
        {children}
    </div>
);

export const TabsTrigger = ({
    value,
    children,
    onClick,
    className = "",
}) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 text-sm rounded-md transition
      text-slate-600 hover:text-slate-900 hover:bg-white
      ${className}`}
    >
        {children}
    </button>
);

export const TabsContent = ({ children, className = "" }) => (
    <div className={`mt-4 ${className}`}>
        {children}
    </div>
);

/* ================= SELECT ================= */

export const Select = ({ children }) => <div>{children}</div>;

export const SelectTrigger = ({ children, className = "" }) => (
    <div className={`border rounded-md px-3 py-2 cursor-pointer ${className}`}>
        {children}
    </div>
);

export const SelectValue = ({ placeholder }) => (
    <span className="text-slate-500">{placeholder}</span>
);

export const SelectContent = ({ children }) => (
    <div className="border rounded-md bg-white shadow mt-1">{children}</div>
);

export const SelectItem = ({ children, onClick }) => (
    <div
        onClick={onClick}
        className="px-3 py-2 hover:bg-slate-100 cursor-pointer"
    >
        {children}
    </div>
);
