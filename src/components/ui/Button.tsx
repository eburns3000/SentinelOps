import { LucideIcon } from 'lucide-react';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md';
  icon?: LucideIcon;
  iconRight?: LucideIcon;
}

const variants = {
  primary:
    'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white border-transparent shadow-sm',
  secondary:
    'bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 border-slate-700 hover:border-slate-600',
  ghost:
    'bg-transparent hover:bg-slate-800 active:bg-slate-900 text-slate-400 hover:text-slate-200 border-transparent',
  danger:
    'bg-red-600/10 hover:bg-red-600/20 active:bg-red-600/30 text-red-400 hover:text-red-300 border-red-500/30',
  outline:
    'bg-transparent hover:bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg border font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 13 : 15} className="flex-shrink-0" />}
      {children}
      {IconRight && <IconRight size={size === 'sm' ? 13 : 15} className="flex-shrink-0" />}
    </button>
  );
}
