"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import "./layout.scss";
import "./globals.css";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 50 && currentScrollY > lastScrollY) {
        setHeaderVisible(false);
      } else {
        setHeaderVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <html lang="en">
      <body className="root-layout">
        <Sidebar />
        <div className="layout-main">
          <div className={`layout-header ${headerVisible ? "" : "hidden"}`}>
            <div className="header-wrapper">
              <Header />
            </div>
          </div>

          <div className="layout-header-space" />
          <main className="layout-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
