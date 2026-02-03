import type { MouseEventHandler } from "react";

interface LikeButtonProps {
  label: string;
  count: number;
  onClick: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

export default function LikeButton({
  label,
  count,
  onClick,
  className,
}: LikeButtonProps) {
  return (
    <button type="button" onClick={onClick} className={className}>
      {label} ({count})
    </button>
  );
}
