import { Meta } from "@/layouts/Meta";
import { cn } from "@/utils";
import { type ReactNode } from "react";
import {Header} from "./Header";

interface LayoutProps {
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Layout({
  className,
  meta,
  children,
  ...props
}: LayoutProps) {
  return (
    <div 
      className={cn(
        "flex min-h-screen flex-col justify-between",
        className
      )}
      {...props}
    >
      <Meta 
        title="Create a Listing | Superteam Earn" 
        description="Create a listing on Superteam Earn and gain access to thousands of high quality talent" 
      />
      <Header />
      <div className="flex flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}