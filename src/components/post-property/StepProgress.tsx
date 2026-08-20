"use client";

import React from "react";
import { Check } from "lucide-react";

export interface StepProgressProps {
  currentStep: number; // 1 to 7
  totalSteps?: number;
  onStepClick?: (step: number) => void;
}

const STEP_TITLES = [
  "Property Type",
  "Location",
  "Property Details",
  "Photos",
  "Pricing",
  "Amenities",
  "Review",
];

export function StepProgress({
  currentStep,
  totalSteps = 7,
  onStepClick,
}: StepProgressProps) {
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="w-full bg-white rounded-2xl border border-border-default p-4 shadow-soft">
      {/* MOBILE PROGRESS INDICATOR */}
      <div className="md:hidden space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-primary-navy">
            Step {currentStep} of {totalSteps}:{" "}
            <span className="text-accent-gold-hover">{STEP_TITLES[currentStep - 1]}</span>
          </span>
          <span className="text-text-muted">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-bg-light rounded-full overflow-hidden border border-border-subtle">
          <div
            className="h-full bg-primary-navy transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* DESKTOP HORIZONTAL STEPPER */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* Continuous Connecting Line */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-border-default -z-0" />
        <div
          className="absolute top-4 left-6 h-0.5 bg-primary-navy transition-all duration-300 -z-0"
          style={{
            width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
          }}
        />

        {STEP_TITLES.map((title, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <div
              key={title}
              onClick={() => {
                if (isCompleted && onStepClick) {
                  onStepClick(stepNumber);
                }
              }}
              className={`flex flex-col items-center relative z-10 transition-all ${
                isCompleted
                  ? "cursor-pointer group"
                  : isActive
                  ? "cursor-default"
                  : "opacity-60 cursor-not-allowed"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-soft-xs ${
                  isCompleted
                    ? "bg-success-green text-white group-hover:scale-105"
                    : isActive
                    ? "bg-primary-navy text-white ring-4 ring-primary-navy/15 scale-110"
                    : "bg-white border-2 border-border-default text-text-muted"
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : stepNumber}
              </div>

              <span
                className={`text-[11px] mt-1.5 font-semibold transition-colors text-center ${
                  isActive
                    ? "text-primary-navy font-bold"
                    : isCompleted
                    ? "text-text-primary group-hover:text-primary-navy"
                    : "text-text-muted"
                }`}
              >
                {title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StepProgress;
