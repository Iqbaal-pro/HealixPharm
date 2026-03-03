import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

const variantClasses: Record<string, string> = {
  primary:   "btn-primary",
  secondary: "btn-secondary",
  ghost:     "text-blue-400 hover:text-blue-300 transition-colors cursor-pointer bg-transparent border-none p-0",
};

const sizeClasses: Record<string, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${variantClasses[variant]} ${variant !== "ghost" ? sizeClasses[size] : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}