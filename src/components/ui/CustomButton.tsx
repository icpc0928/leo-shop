import { cn } from "@/lib/utils";

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export default function CustomButton({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: CustomButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium transition-colors cursor-pointer",
        variant === "primary" &&
          "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]",
        variant === "outline" &&
          "border border-foreground text-foreground hover:bg-foreground hover:text-white",
        variant === "ghost" && "text-foreground hover:text-[var(--color-primary)]",
        size === "sm" && "px-4 py-2 text-sm",
        size === "md" && "px-6 py-3 text-sm",
        size === "lg" && "px-8 py-4 text-base",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
