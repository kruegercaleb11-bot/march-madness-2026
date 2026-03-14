interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  highlight?: boolean;
}

export default function StatCard({ label, value, sub, highlight }: StatCardProps) {
  return (
    <div
      className={`rounded-xl p-4 flex flex-col gap-1 ${
        highlight
          ? "bg-gradient-to-br from-blue-900 to-blue-800 border border-blue-600"
          : "bg-gray-800 border border-gray-700"
      }`}
    >
      <span className="text-xs text-gray-400 uppercase tracking-wide">{label}</span>
      <span className={`text-2xl font-bold ${highlight ? "text-blue-300" : "text-white"}`}>
        {value}
      </span>
      {sub && <span className="text-xs text-gray-500">{sub}</span>}
    </div>
  );
}
