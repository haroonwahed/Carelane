import type { SVGProps } from "react";

interface CarelaneMarkProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function CarelaneMark({ size = 22, ...props }: CarelaneMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* Center circle */}
      <circle cx="11" cy="11" r="2.2" fill="currentColor" />
      {/* Four arms — NW, NE, SW, SE */}
      <line x1="11" y1="11" x2="4.5" y2="4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="11" y1="11" x2="17.5" y2="4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="11" y1="11" x2="4.5" y2="17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="11" y1="11" x2="17.5" y2="17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Small endpoint dots */}
      <circle cx="4.5" cy="4.5" r="1.6" fill="currentColor" opacity="0.7" />
      <circle cx="17.5" cy="4.5" r="1.6" fill="currentColor" opacity="0.7" />
      <circle cx="4.5" cy="17.5" r="1.6" fill="currentColor" opacity="0.7" />
      <circle cx="17.5" cy="17.5" r="1.6" fill="currentColor" opacity="0.7" />
    </svg>
  );
}
