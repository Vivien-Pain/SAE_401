import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./../../libs/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        purple: "bg-purple-500 text-white hover:bg-purple-600",
        yellow: "bg-yellow-500 text-white hover:bg-yellow-600",
        cyan: "bg-cyan-500 text-white hover:bg-cyan-600",
        red: "bg-red-500 text-white hover:bg-red-600",
        gray: "bg-gray-500 text-white hover:bg-gray-600",
        green: "bg-green-500 text-white hover:bg-green-600",
        blue: "bg-blue-500 text-white hover:bg-blue-600",
        orange: "bg-orange-500 text-white hover:bg-orange-600",
        pink: "bg-pink-500 text-white hover:bg-pink-600",
      },
      size: {
        sm: "text-sm px-3 py-1.5",
        md: "text-base px-4 py-2",
        lg: "text-lg px-5 py-2.5",
      },
    },
    defaultVariants: {
      variant: "purple",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
