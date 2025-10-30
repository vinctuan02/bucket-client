"use client";

import { useEffect, useState } from "react";
import "./layout.scss";
import "./globals.css";
import Sidebar from "@/components/commons/c.sidebar";
import Header from "@/components/commons/c.header";

import { useRouter } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const router = useRouter();

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

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login"); // Nếu chưa login thì về login
    }
  }, [router]);

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
