interface TagProps {
  label: string;
  variant?: "green" | "red" | "blue" | "orange" | "gray" | "yellow";
}

const variants = {
  green:  "bg-green-900 text-green-300 border border-green-700",
  red:    "bg-red-900 text-red-300 border border-red-700",
  blue:   "bg-blue-900 text-blue-300 border border-blue-700",
  orange: "bg-orange-900 text-orange-300 border border-orange-700",
  gray:   "bg-gray-800 text-gray-400 border border-gray-600",
  yellow: "bg-yellow-900 text-yellow-300 border border-yellow-700",
};

export default function Tag({ label, variant = "gray" }: TagProps) {
  return (
    <span className={`inline-block text-xs px-1.5 py-0.5 rounded font-mono ${variants[variant]}`}>
      {label}
    </span>
  );
}
