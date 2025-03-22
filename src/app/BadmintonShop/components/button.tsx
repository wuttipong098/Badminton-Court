import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  variant?: "default" | "destructive";
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  className = "",
  variant = "default",
  disabled = false,
}) => {
  const baseStyles = "px-4 py-2 rounded text-white font-semibold transition";
  const variantStyles =
    variant === "destructive" ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600";
  const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${disabledStyles} ${className}`}
      onClick={!disabled ? onClick : undefined} // ป้องกันการคลิกเมื่อ disabled
      disabled={disabled}
    >
      {children}
    </button>
  );
};
