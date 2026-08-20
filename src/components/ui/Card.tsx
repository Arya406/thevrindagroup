import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  interactive?: boolean;
}

export function Card({
  className = "",
  hoverEffect = false,
  interactive = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-xl border border-border-default bg-white text-text-primary shadow-soft transition-all duration-200 ${
        hoverEffect ? "hover:shadow-soft-md hover:border-border-dark" : ""
      } ${
        interactive
          ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-soft-md active:translate-y-0"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex flex-col space-y-1.5 p-5 pb-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-lg font-semibold leading-tight text-text-primary tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-sm text-text-secondary ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex items-center p-5 pt-0 border-t border-border-subtle mt-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
