import "./globals.css";

import type { ReactNode } from "react";
import TopNav from "./_components/top-nav";

export const metadata = {
  title: "TRAVEL.aw Seattle",
  description: "Seattle planning and in-city deterministic experience scaffold",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <header className="topbar">
            <div className="topbar-inner">
              <a className="brand" href="/">
                TRAVEL.aw
              </a>
              <TopNav />
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
