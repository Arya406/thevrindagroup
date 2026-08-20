import React from "react";
import { ShieldCheck, Sparkles, Star, User, Building } from "lucide-react";

export type BadgeVariant =
  | "rera"
  | "owner"
  | "agent"
  | "new"
  | "featured"
  | "default"
  | "outline"
  | "gold"
  | "green";

export type BadgeSize = "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  showDefaultIcon?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  rera: "bg-success-green-light text-success-green border border-success-green-border font-semibold",
  owner: "bg-primary-navy/5 text-primary-navy border border-primary-navy/15 font-medium",
  agent: "bg-slate-100 text-slate-700 border border-slate-200 font-medium",
  new: "bg-accent-gold-light text-[#9E6E18] border border-accent-gold-muted font-semibold",
  featured: "bg-primary-navy text-white border border-primary-navy font-semibold shadow-soft-xs",
  default: "bg-bg-light text-text-primary border border-border-default font-medium",
  outline: "bg-transparent text-text-secondary border border-border-default font-medium",
  gold: "bg-accent-gold text-dark-navy border border-accent-gold font-semibold",
  green: "bg-success-green text-white border border-success-green font-semibold",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[11px] gap-1 rounded",
  md: "px-2.5 py-1 text-xs gap-1.5 rounded-md",
};

function getDefaultIcon(variant: BadgeVariant, size: BadgeSize) {
  const iconSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
  switch (variant) {
    case "rera":
      return <ShieldCheck className={`${iconSize} text-success-green shrink-0`} />;
    case "new":
      return <Sparkles className={`${iconSize} text-[#9E6E18] shrink-0`} />;
    case "featured":
      return <Star className={`${iconSize} text-accent-gold fill-accent-gold shrink-0`} />;
    case "owner":
      return <User className={`${iconSize} text-primary-navy shrink-0`} />;
    case "agent":
      return <Building className={`${iconSize} text-slate-600 shrink-0`} />;
    default:
      return null;
  }
}

export function Badge({
  className = "",
  variant = "default",
  size = "md",
  icon,
  showDefaultIcon = true,
  children,
  ...props
}: BadgeProps) {
  const renderedIcon = icon ?? (showDefaultIcon ? getDefaultIcon(variant, size) : null);

  return (
    <span
      className={`inline-flex items-center tracking-wide uppercase select-none transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {renderedIcon}
      <span>{children}</span>
    </span>
  );
}

/**
 * Pre-configured convenience badges matching real-estate requirements
 */
export function ReraBadge({
  size = "md",
  className = "",
  text = "RERA VERIFIED",
  ...props
}: Omit<BadgeProps, "variant"> & { text?: string }) {
  return (
    <Badge variant="rera" size={size} className={className} {...props}>
      {text}
    </Badge>
  );
}

export function OwnerBadge({
  size = "md",
  className = "",
  text = "OWNER",
  ...props
}: Omit<BadgeProps, "variant"> & { text?: string }) {
  return (
    <Badge variant="owner" size={size} className={className} {...props}>
      {text}
    </Badge>
  );
}

export function AgentBadge({
  size = "md",
  className = "",
  text = "AGENT",
  ...props
}: Omit<BadgeProps, "variant"> & { text?: string }) {
  return (
    <Badge variant="agent" size={size} className={className} {...props}>
      {text}
    </Badge>
  );
}

export function NewBadge({
  size = "md",
  className = "",
  text = "NEW",
  ...props
}: Omit<BadgeProps, "variant"> & { text?: string }) {
  return (
    <Badge variant="new" size={size} className={className} {...props}>
      {text}
    </Badge>
  );
}

export function FeaturedBadge({
  size = "md",
  className = "",
  text = "FEATURED",
  ...props
}: Omit<BadgeProps, "variant"> & { text?: string }) {
  return (
    <Badge variant="featured" size={size} className={className} {...props}>
      {text}
    </Badge>
  );
}

export default Badge;
