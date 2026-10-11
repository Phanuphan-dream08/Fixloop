import { ReportStatus } from '@/types';
import { STATUS_META } from '@/lib/constants';

interface StatusBadgeProps {
  status: ReportStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export default function StatusBadge({ status, size = 'md', showIcon = true }: StatusBadgeProps) {
  const meta = STATUS_META[status] || STATUS_META['รอตรวจสอบ'];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-bold',
    md: 'text-sm px-3 py-1 font-extrabold',
    lg: 'text-base md:text-lg px-4 py-2 font-black',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#1c1b1b] ${meta.badgeClass} ${sizeClasses[size]}`}
    >
      {showIcon && (
        <span className="material-symbols-outlined text-sm align-middle">
          {meta.icon}
        </span>
      )}
      <span>{status}</span>
    </span>
  );
}
