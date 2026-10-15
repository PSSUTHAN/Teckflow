import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'blue' | 'amber' | 'emerald' | 'rose' | 'slate';
  onClick?: () => void;
  active?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  icon: Icon,
  variant = 'blue',
  onClick,
  active = false,
}) => {
  const variantStyles = {
    blue: {
      accent: 'text-blue-600',
      bg: 'bg-blue-50/50',
      iconBg: 'bg-blue-100 text-blue-700',
      activeBorder: 'border-blue-500 ring-1 ring-blue-500',
    },
    amber: {
      accent: 'text-amber-600',
      bg: 'bg-amber-50/50',
      iconBg: 'bg-amber-100 text-amber-700',
      activeBorder: 'border-amber-500 ring-1 ring-amber-500',
    },
    emerald: {
      accent: 'text-emerald-600',
      bg: 'bg-emerald-50/50',
      iconBg: 'bg-emerald-100 text-emerald-700',
      activeBorder: 'border-emerald-500 ring-1 ring-emerald-500',
    },
    rose: {
      accent: 'text-rose-600',
      bg: 'bg-rose-50/50',
      iconBg: 'bg-rose-100 text-rose-700',
      activeBorder: 'border-rose-500 ring-1 ring-rose-500',
    },
    slate: {
      accent: 'text-slate-700',
      bg: 'bg-slate-50',
      iconBg: 'bg-slate-200 text-slate-700',
      activeBorder: 'border-slate-500 ring-1 ring-slate-500',
    },
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-sm' : ''
      } ${active ? variantStyles.activeBorder : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">
            {label}
          </p>
          <p className="text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            {value.toLocaleString()}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${variantStyles.iconBg} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
