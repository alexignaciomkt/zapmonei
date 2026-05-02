import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: "gain" | "loss" | "neutral" | "success" | "danger";
  className?: string;
}

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  variant = "neutral",
  className,
}: DashboardCardProps) {
  const isGain = variant === "gain" || variant === "success";
  const isLoss = variant === "loss" || variant === "danger";

  return (
    <div className={cn("glass-card", className)}>
      <div className="flex justify-between items-start mb-4">
        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</p>
        {icon && <div className="p-2 bg-white/5 rounded-lg">{icon}</div>}
      </div>
      <div className="flex flex-col">
        <h2 className={cn(
          "text-3xl font-bold tracking-tight",
          isGain && "text-emerald-400",
          isLoss && "text-rose-400",
          (!isGain && !isLoss) && "text-white"
        )}>
          {typeof value === 'number' ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : value}
        </h2>
        {subtitle && (
          <p className="text-slate-500 text-xs mt-1 font-medium italic">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
