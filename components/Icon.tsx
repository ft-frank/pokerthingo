import type { SVGProps } from "react";

type IconName =
  | "plus"
  | "minus"
  | "chevron-right"
  | "arrow-left"
  | "arrow-right"
  | "trash";

const paths: Record<IconName, string> = {
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  "chevron-right": "M9 6l6 6-6 6",
  "arrow-left": "M19 12H5M12 19l-7-7 7-7",
  "arrow-right": "M5 12h14M12 5l7 7-7 7",
  trash: "M4 7h16M10 11v6M14 11v6M5 7l1 13a1 1 0 001 1h10a1 1 0 001-1l1-13M9 7V4h6v3",
};

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 20, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      <path d={paths[name]} />
    </svg>
  );
}
