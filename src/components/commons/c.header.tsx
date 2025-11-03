"use client";

import { Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { authApi } from "@/modules/auth/auth.api";
import { useRouter } from "next/navigation";
import "./c.header.scss";
import { User } from "@/modules/users/user.entity";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authApi.me();
        setUser(res.data ?? null);
      } catch (err) {
        console.error("Failed to load user info:", err);
      }
    };
    fetchUser();
  }, []);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    router.replace("/login");
  };

  const handleGoProfile = () => {
    setShowMenu(false);
    router.push("/my-profile");
  };

  return (
    <header className="header">
      <div className="header__left">
        <div className="header__search">
          <Search size={16} className="icon" />
          <input type="text" placeholder="Search ..." />
        </div>
      </div>

      <div className="header__right" ref={menuRef}>
        <button>Upgrade</button>

        <div
          className="avatar"
          onClick={() => setShowMenu((prev) => !prev)}
        >
          <img
            src={user?.avatar || "/images/default-avatar.png"}
            alt="avatar"
          />
        </div>

        {showMenu && (
          <div className="user-menu">
            <div className="user-menu__info">
              <img
                src={user?.avatar || "/images/default-avatar.png"}
                alt="avatar"
                className="user-menu__avatar"
              />
              <div>
                <p className="name">{user?.name}</p>
                <p className="email">{user?.email}</p>
              </div>
            </div>

            <button className="profile" onClick={handleGoProfile}>
              My Profile
            </button>

            <button className="logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
