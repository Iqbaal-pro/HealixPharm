type BadgeVariant = "blue" | "green" | "red" | "yellow" | "purple" | "slate";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

const styles: Record<BadgeVariant, React.CSSProperties> = {
  blue:   { background: "rgba(14,165,233,0.08)",  color: "#7dd3fc", border: "1px solid rgba(14,165,233,0.12)"  },
  green:  { background: "rgba(148,163,184,0.06)", color: "#94a3b8", border: "1px solid rgba(148,163,184,0.1)"  },
  red:    { background: "rgba(148,163,184,0.06)", color: "#94a3b8", border: "1px solid rgba(148,163,184,0.1)"  },
  yellow: { background: "rgba(148,163,184,0.06)", color: "#94a3b8", border: "1px solid rgba(148,163,184,0.1)"  },
  purple: { background: "rgba(14,165,233,0.08)",  color: "#7dd3fc", border: "1px solid rgba(14,165,233,0.12)"  },
  slate:  { background: "rgba(148,163,184,0.06)", color: "#64748b", border: "1px solid rgba(148,163,184,0.08)" },
};

export default function Badge({ children, variant = "blue" }: BadgeProps) {
  return (
    <span style={{
      ...styles[variant],
      display: "inline-flex",
      alignItems: "center",
      padding: "3px 10px",
      borderRadius: 99,
      fontSize: 11,
      fontWeight: 500,
      letterSpacing: 0.2,
      whiteSpace: "nowrap",
    }}>
      {children}
    </span>
  );
}