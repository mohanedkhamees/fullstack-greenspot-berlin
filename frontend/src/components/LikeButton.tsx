import { useState } from "react";

interface Props {
  label?: string;
}

export const LikeButton: React.FC<Props> = ({ label = "Like" }) => {
  const [count, setCount] = useState<number>(0);

  return (
    <button
      className="like-button"
      onClick={() => setCount((prev) => prev + 1)}
    >
      {label} ({count})
    </button>
  );
};
