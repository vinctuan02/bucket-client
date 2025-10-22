"use client";

import { Search } from "lucide-react";
import "./Header.scss";

export default function Header() {
    return (
        <header className="header">
            <div className="header__left">
                {/* <h1>CloudBox</h1> */}
                <div className="header__search">
                    <Search size={16} className="icon" />
                    <input type="text" placeholder="Search ..." />
                </div>
            </div>

            <div className="header__right">
                <button>Upgrade</button>
                <div className="avatar" />
            </div>
        </header>
    );
}
