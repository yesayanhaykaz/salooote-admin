import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatsCard({ label, value, change, changeLabel, icon: Icon, iconBg, iconColor }) {
  const isPositive = change >= 0;
  return (
    <div className="stat-card fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon size={18} className={iconColor} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
            isPositive ? "bg-success-50 text-success-600" : "bg-danger-50 text-danger-600"
          }`}>
            {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-surface-900 mb-1">{value}</p>
      <p className="text-xs text-surface-400 font-medium">{label}</p>
      {changeLabel && <p className="text-[11px] text-surface-300 mt-1">{changeLabel}</p>}
    </div>
  );
}
