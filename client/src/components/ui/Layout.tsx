import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Flame, MessageCircle, User, Rocket, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function Layout({ children, hideNav = false }: LayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Flame, label: "探探", hasDot: false },
    { href: "/entertainment", icon: Rocket, label: "展示", hasDot: false },
    { href: "/matches", icon: MessageCircle, label: "消息", hasDot: true },
    { href: "/discover", icon: ShieldCheck, label: "发现", hasDot: false },
    { href: "/profile", icon: User, label: "我", hasDot: false },
  ];

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-background relative overflow-hidden">
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-hide">
        {children}
      </main>
      
      {!hideNav && (
        <nav className="h-16 border-t border-slate-50 bg-white/95 backdrop-blur-md flex items-center justify-around px-2 safe-bottom z-50">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className="group flex flex-col items-center justify-center w-14 relative">
                <item.icon className={cn(
                  "w-6 h-6 transition-all duration-300",
                  isActive ? "text-orange-500 scale-110" : "text-slate-400 group-hover:text-slate-600"
                )} />
                {item.hasDot && (
                  <span className="absolute top-0 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                )}
                <span className={cn(
                  "text-[10px] mt-1 font-medium transition-colors",
                  isActive ? "text-orange-500" : "text-slate-400"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
