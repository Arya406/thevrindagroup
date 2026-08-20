import React from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-gold text-dark-navy font-semibold hover:bg-accent-gold-hover shadow-soft-xs active:brightness-95",
  secondary:
    "bg-primary-navy text-white font-medium hover:bg-dark-navy shadow-soft-xs active:brightness-95",
  outline:
    "border border-border-default bg-white text-text-primary font-medium hover:bg-bg-light hover:border-border-dark active:bg-bg-subtle",
  ghost:
    "bg-transparent text-text-primary font-medium hover:bg-bg-light hover:text-primary-navy active:bg-bg-subtle",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs rounded-md gap-1.5",
  md: "h-10 px-4 text-sm rounded-lg gap-2",
  lg: "h-12 px-6 text-base rounded-lg gap-2.5",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center text-center font-sans select-none whitespace-nowrap cursor-pointer transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none leading-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
        ) : (
          leftIcon && (
            <span className="inline-flex items-center justify-center shrink-0">
              {leftIcon}
            </span>
          )
        )}
        {children && (
          <span className="inline-flex items-center justify-center leading-none">
            {children}
          </span>
        )}
        {!isLoading && rightIcon && (
          <span className="inline-flex items-center justify-center shrink-0">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
