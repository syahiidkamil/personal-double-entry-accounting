import React from "react";
import { cn } from "@/lib/utils";

const Avatar = React.forwardRef(
  ({ className, src, alt = "", fallback, size = "default", ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false);

    const sizeClasses = {
      default: "h-10 w-10",
      sm: "h-8 w-8",
      md: "h-9 w-9",
      lg: "h-12 w-12",
    };

    const fontSizeClasses = {
      default: "text-sm",
      sm: "text-xs",
      md: "text-base",
      lg: "text-base",
    };

    const handleImageError = () => setImageError(true);

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full bg-primary text-primary-foreground",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <div
            className={cn(
              "flex h-full w-full items-center justify-center font-medium",
              fontSizeClasses[size]
            )}
          >
            {fallback || alt?.charAt(0) || "?"}
          </div>
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

export { Avatar };