import type { SVGProps } from "react";

interface CarelaneMarkProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

/**
 * Carelane brand mark — a dagger cross (†):
 * long vertical arm rising above a horizontal crossbar.
 * Represents care coordination: a care cross plus a junction/route.
 * Uses currentColor so it inherits its parent's colour.
 */
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
      {/* Vertical arm — longer above crossbar, shorter below */}
      <line
        x1="11" y1="2"
        x2="11" y2="20"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Horizontal crossbar — placed at ~35% from top */}
      <line
        x1="3.5" y1="8.5"
        x2="18.5" y2="8.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
