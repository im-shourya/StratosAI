import { ButtonHTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--color-primary)] text-white rounded-[10px] hover:brightness-110 active:scale-[0.98] shadow-md hover:shadow-lg",
        glass:
          "glass rounded-[10px] hover:bg-[var(--glass-bg-elevated)] text-[var(--color-text-primary)]",
        ghost:
          "text-[var(--color-text-primary)] hover:bg-[rgba(0,0,0,0.04)] rounded-[10px]",
        danger:
          "bg-[var(--color-danger)] text-white rounded-[10px] hover:brightness-110 active:scale-[0.98]",
      },
      size: {
        sm: "px-3 py-1.5 text-sm gap-1.5",
        md: "px-4 py-2.5 text-sm gap-2",
        lg: "px-6 py-3 text-base gap-2.5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode;
}

export function Button({
  children,
  variant,
  size,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </button>
  );
}
