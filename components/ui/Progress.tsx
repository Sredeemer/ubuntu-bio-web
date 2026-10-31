"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import "./Progress.css";

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number | undefined;
  indicatorColor?: string | undefined;
}

export const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className = "", value = 0, indicatorColor, ...props }, ref) => {
  const clampedValue = Math.min(100, Math.max(0, value ?? 0));
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={`ubio-progress-root ${className}`}
      value={clampedValue}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="ubio-progress-indicator"
        style={{
          transform: `translateX(-${100 - clampedValue}%)`,
          ...(indicatorColor ? { backgroundColor: indicatorColor } : {}),
        }}
      />
    </ProgressPrimitive.Root>
  );
});

Progress.displayName = ProgressPrimitive.Root.displayName;
