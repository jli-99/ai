import React from "react";

/* ---------------- Button ---------------- */

export const Button = ({
    children,
    className = "",
    ...props
}) => (
    <button
        className={`px-4 py-2 rounded-md text-sm font-medium transition 
      bg-slate-900 text-white hover:bg-slate-800 
      disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
    >
        {children}
    </button>
);

/* ---------------- Input ---------------- */

export const Input = (props) => (
    <input
        className="w-full h-10 px-3 rounded-md border border-slate-200 
               focus:outline-none focus:ring-2 focus:ring-slate-400"
        {...props}
    />
);

/* ---------------- Label ---------------- */

export const Label = ({ children, ...props }) => (
    <label
        className="text-sm font-medium text-slate-700"
        {...props}
    >
        {children}
    </label>
);

/* ---------------- Dialog ---------------- */

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

export const DialogHeader = ({ children }) => (
    <div className="mb-4">{children}</div>
);

export const DialogTitle = ({ children }) => (
    <h2 className="text-xl font-bold tracking-tight">
        {children}
    </h2>
);
