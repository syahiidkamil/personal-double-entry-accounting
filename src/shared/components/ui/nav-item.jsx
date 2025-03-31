import React from "react";
import { cn } from "@/lib/utils";

const NavItem = React.forwardRef(
  (
    {
      children,
      className,
      active = false,
      icon: Icon,
      collapsed = false,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center py-3 rounded-md text-base font-medium",
          active
            ? "bg-accent text-accent-foreground font-bold"
            : "text-foreground hover:bg-muted",
          collapsed ? "justify-center px-2" : "px-3",
          className
        )}
        {...props}
      >
        {active && !collapsed && (
          <div className="absolute left-0 inset-y-0 w-2 bg-primary rounded-r-full"></div>
        )}

        {Icon && (
          <Icon
            className={cn(
              "flex-shrink-0 h-6 w-6",
              active ? "text-primary" : "text-muted-foreground"
            )}
          />
        )}

        {!collapsed && children && <span className="ml-3">{children}</span>}
      </div>
    );
  }
);

NavItem.displayName = "NavItem";

export { NavItem };