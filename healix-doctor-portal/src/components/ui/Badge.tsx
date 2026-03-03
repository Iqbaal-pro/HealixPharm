type BadgeVariant = "blue" | "green" | "red" | "yellow" | "slate";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  blue:   "bg-blue-500/10 text-blue-400 border-blue-500/20",
  green:  "bg-green-500/10 text-green-400 border-green-500/20",
  red:    "bg-red-500/10 text-red-400 border-red-500/20",
  yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  slate:  "bg-slate-700/50 text-slate-400 border-slate-600",
};

export default function Badge({ children, variant = "blue" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full
                  text-xs font-semibold border ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}