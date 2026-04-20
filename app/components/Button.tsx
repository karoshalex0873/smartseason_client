import type { IconType } from "react-icons";
import { FiLoader } from "react-icons/fi";

type ButtonProps = {
  label: string;
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "outline";
  icon?: IconType;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const Button = ({
  label,
  onClick,
  disabled = false,
  loading = false,
  type = "button",
  variant = "primary",
  icon: Icon,
  iconPosition = "left",
  fullWidth = false,
  size = "md",
  className = "",
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  const baseClasses = "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-60 disabled:pointer-events-none";

  const sizeClasses = {
    sm: "px-4 py-2 text-xs rounded-lg",
    md: "px-6 py-3 text-sm rounded-xl",
    lg: "px-8 py-4 text-base rounded-2xl",
  };

  const variantClasses = {
    primary: "bg-primary text-white shadow-sm hover:bg-primary/90 active:scale-[0.98]",
    secondary: "border-2 border-slate-200 bg-white text-slate-700 shadow-md hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]",
    outline: "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-white active:scale-[0.98]",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`}
    >
      {loading ? (
        <FiLoader className="h-5 w-5 animate-spin" />
      ) : (
        Icon && iconPosition === "left" && <Icon className="h-5 w-5" />
      )}
      <span>{label}</span>
      {!loading && Icon && iconPosition === "right" && <Icon className="h-5 w-5" />}
    </button>
  );
};

export default Button;
