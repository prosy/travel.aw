"use client";

import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
};

const navItems: NavItem[] = [
  { href: "/seattle", label: "Seattle" },
  { href: "/seattle/planning", label: "Planning" },
  { href: "/seattle/while-in-seattle", label: "While in Seattle" },
  { href: "/seattle/while-in-seattle/sports", label: "Sports" },
];

export default function TopNav() {
  const pathname = usePathname();
  const activeHref =
    navItems
      .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
      .sort((a, b) => b.href.length - a.href.length)[0]?.href ?? "";

  return (
    <nav className="top-links">
      {navItems.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={`top-link${activeHref === item.href ? " top-link-active" : ""}`}
          aria-current={activeHref === item.href ? "page" : undefined}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
