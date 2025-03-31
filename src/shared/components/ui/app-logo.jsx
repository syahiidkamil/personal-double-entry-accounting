import React from "react";
import { cn } from "@/lib/utils";

const AppLogo = React.forwardRef(
  ({ icon: Icon, className, size = "default", ...props }, ref) => {
    const sizeClasses = {
      default: "w-8 h-8",
      sm: "w-6 h-6",
      md: "w-9 h-9",
      lg: "w-10 h-10",
    };

    const iconSizeClasses = {
      default: "h-5 w-5",
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "bg-primary text-primary-foreground rounded-md flex items-center justify-center",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {Icon && <Icon className={iconSizeClasses[size]} />}
      </div>
    );
  }
);

AppLogo.displayName = "AppLogo";

export { AppLogo };