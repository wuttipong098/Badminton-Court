import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return <div className={`border rounded-lg p-4 shadow ${className}`}>{children}</div>;
};

export const CardContent: React.FC<CardProps> = ({ children, className = "" }) => {
  return <div className={`p-2 ${className}`}>{children}</div>;
};
