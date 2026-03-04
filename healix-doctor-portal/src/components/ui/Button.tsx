import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  style = {},
  children,
  ...props
}: ButtonProps) {
  const sizeStyles: React.CSSProperties =
    size === "sm"
      ? { padding: "6px 14px", fontSize: 12 }
      : size === "lg"
      ? { padding: "13px 28px", fontSize: 15 }
      : { padding: "10px 20px", fontSize: 14 };

  if (variant === "ghost") {
    return (
      <button
        style={{
          background: "none",
          border: "none",
          color: "#38bdf8",
          fontWeight: 600,
          cursor: "pointer",
          padding: 0,
          fontSize: size === "sm" ? 13 : 14,
          fontFamily: "DM Sans, sans-serif",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          opacity: 0.85,
          transition: "opacity 0.2s",
          ...style,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.85")}
        {...props}
      >
        {children}
      </button>
    );
  }

  if (variant === "secondary") {
    return (
      <button
        className={`btn-ghost ${className}`}
        style={{ ...sizeStyles, fontFamily: "DM Sans, sans-serif", ...style }}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      className={`btn-glow ${className}`}
      style={{ ...sizeStyles, fontFamily: "DM Sans, sans-serif", ...style }}
      {...props}
    >
      {children}
    </button>
  );
}