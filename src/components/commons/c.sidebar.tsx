"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Folder, Users, Settings, Shield, KeyRound, CircleUserRound } from "lucide-react";
import "./c.sidebar.scss";

const sidebarNavItems = [
  {
    display: "Folder",
    icon: <Folder size={18} strokeWidth={2.5} />,
    to: "/folder",
    section: "folder",
  },
  {
    display: "Users",
    icon: <Users size={18} strokeWidth={2.5} />,
    to: "/users",
    section: "users",
  },
  {
    display: "Roles",
    icon: <Shield size={18} strokeWidth={2.5} />,
    to: "/roles",
    section: "roles",
  },
  {
    display: "Permissions",
    icon: <KeyRound size={18} strokeWidth={2.5} />,
    to: "/permissions",
    section: "permissions",
  },
  {
    display: "App Config",
    icon: <Settings size={18} strokeWidth={2.5} />,
    to: "/app-config",
    section: "app-config",
  },
  {
    display: "Profile",
    icon: <CircleUserRound size={18} strokeWidth={2.5} />,
    to: "/my-profile",
    section: "my-profile",
  },
];

export default function Sidebar() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [stepHeight, setStepHeight] = useState(0);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    // set chiều cao cho indicator
    setTimeout(() => {
      const sidebarItem = sidebarRef.current?.querySelector(
        ".sidebar__menu__item"
      ) as HTMLElement;
      if (sidebarItem && indicatorRef.current) {
        indicatorRef.current.style.height = `${sidebarItem.clientHeight}px`;
        setStepHeight(sidebarItem.clientHeight);
      }
    }, 100);
  }, []);

  useEffect(() => {
    const curPath = pathname.split("/")[1];
    const activeItem = sidebarNavItems.findIndex(
      (item) => item.section === curPath
    );
    setActiveIndex(curPath.length === 0 ? 0 : activeItem);
  }, [pathname]);

  return (
    <div className="sidebar">
      <div className="sidebar__logo">CloudBox</div>
      <div ref={sidebarRef} className="sidebar__menu">
        <div
          ref={indicatorRef}
          className="sidebar__menu__indicator"
          style={{
            transform: `translateX(-50%) translateY(${activeIndex * stepHeight
              }px)`,
          }}
        ></div>
        {sidebarNavItems.map((item, index) => (
          <Link href={item.to} key={index}>
            <div
              className={`sidebar__menu__item ${activeIndex === index ? "active" : ""
                }`}
            >
              <div className="sidebar__menu__item__icon">{item.icon}</div>
              <div className="sidebar__menu__item__text">{item.display}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
