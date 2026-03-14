interface BarProps {
  value: number;      // 0–100
  max?: number;       // denominator for width calc (default 100)
  color?: string;     // tailwind bg class
  label?: string;
  showValue?: boolean;
}

export default function Bar({
  value,
  max = 100,
  color = "bg-blue-500",
  label,
  showValue = true,
}: BarProps) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-xs text-gray-400 mb-0.5">
          <span>{label}</span>
          {showValue && <span>{value.toFixed(1)}%</span>}
        </div>
      )}
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
