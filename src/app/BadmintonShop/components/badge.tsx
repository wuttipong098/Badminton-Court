import { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  variant: "success" | "destructive";
};

export function Badge({ children, variant }: BadgeProps) {
  const color = variant === "success" ? "bg-green-500" : "bg-red-500";
  return (
    <span className={`px-3 py-1 text-white rounded-full ${color}`}>
      {children}
    </span>
  );
}