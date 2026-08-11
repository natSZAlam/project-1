"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Dices, History, NotebookTabs } from "lucide-react";

const TABS = [
  { href: "/", label: "Decide", icon: Dices },
  { href: "/catalog", label: "Catalog", icon: NotebookTabs },
  { href: "/plan", label: "Plan", icon: CalendarDays },
  { href: "/log", label: "History", icon: History },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 border-t-4 border-foreground bg-card"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto grid max-w-2xl grid-cols-4 gap-1.5 p-2">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex cursor-pointer flex-col items-center gap-0.5 rounded-2xl border-[3px] py-2 text-[11px] font-extrabold transition-all ${
                active
                  ? "border-foreground bg-primary text-primary-foreground shadow-[3px_3px_0_var(--color-foreground)]"
                  : "border-transparent text-muted-foreground hover:border-foreground/30"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon
                key={active ? pathname : "inactive"}
                size={20}
                strokeWidth={active ? 2.75 : 2.25}
                className={active ? "animate-pop-in" : ""}
                aria-hidden="true"
              />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
