"use client";

import { money } from "@/lib/format";
import { Icon } from "./Icon";

interface StepperProps {
  label: string;
  value: number;
  step?: number;
  onChange: (next: number) => void;
}

export function Stepper({ label, value, step = 5, onChange }: StepperProps) {
  return (
    <div className="stepper">
      <div className="stepper-label">{label}</div>
      <div className="stepper-row">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(Math.max(0, value - step))}
        >
          <Icon name="minus" size={16} />
        </button>
        <span className="stepper-value">{money(value)}</span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(value + step)}
        >
          <Icon name="plus" size={16} />
        </button>
      </div>
    </div>
  );
}
