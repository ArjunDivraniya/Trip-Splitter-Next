import Link from "next/link";
import { forwardRef } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to?: string;
  href?: string;
  className?: string;
  activeClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, to, href, children, ...props }, ref) => {
    const pathname = usePathname() || "/";
    const target = to || href || "/";
    const isActive = pathname === target || pathname.startsWith(String(target));

    return (
      <Link href={target} ref={ref} {...props} className={cn(className, isActive && activeClassName)}>
        {children}
      </Link>
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
