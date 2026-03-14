interface SeedBadgeProps {
  seed: number;
  size?: "sm" | "md";
}

const seedColor = (seed: number) => {
  if (seed === 1)  return "bg-yellow-400 text-yellow-900";
  if (seed <= 4)   return "bg-blue-500 text-white";
  if (seed <= 8)   return "bg-green-600 text-white";
  if (seed <= 12)  return "bg-orange-500 text-white";
  return "bg-gray-500 text-white";
};

export default function SeedBadge({ seed, size = "md" }: SeedBadgeProps) {
  const sz = size === "sm" ? "text-xs w-5 h-5" : "text-sm w-6 h-6";
  return (
    <span
      className={`inline-flex items-center justify-center rounded font-bold ${sz} ${seedColor(seed)}`}
    >
      {seed}
    </span>
  );
}
