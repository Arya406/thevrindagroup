"use client";

import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  actionHref,
  onActionClick,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-border-default bg-white p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-3.5 shadow-soft-xs">
      <div className="w-12 h-12 rounded-xl bg-bg-light border border-border-subtle flex items-center justify-center text-text-muted shadow-soft-xs">
        <Icon className="w-6 h-6 text-primary-navy/70" />
      </div>

      <div className="space-y-1 max-w-sm">
        <h3 className="text-sm sm:text-base font-bold text-primary-navy">
          {title}
        </h3>
        <p className="text-xs text-text-secondary leading-relaxed">
          {description}
        </p>
      </div>

      {actionText && (
        <div className="pt-2">
          {actionHref ? (
            <Link href={actionHref}>
              <Button variant="primary" size="sm" className="text-xs font-bold shadow-soft-xs">
                {actionText}
              </Button>
            </Link>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={onActionClick}
              className="text-xs font-bold shadow-soft-xs"
            >
              {actionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
