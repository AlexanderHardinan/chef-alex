import React from "react";

export default function GoldLock({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M17 10V8a5 5 0 0 0-10 0v2"
        stroke="#D4AF37"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M7 10h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z"
        stroke="#D4AF37"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M12 14v3"
        stroke="#D4AF37"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
