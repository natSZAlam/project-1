"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dices, NotebookTabs } from "lucide-react";

const TABS = [
  { href: "/", label: "Decide", icon: Dices },
  { href: "/catalog", label: "Catalog", icon: NotebookTabs },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 border-t border-border bg-card/95 backdrop-blur supports-backdrop-blur:bg-card/80"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto max-w-2xl grid grid-cols-2">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 py-3 text-sm font-medium transition-colors cursor-pointer ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 2}
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
