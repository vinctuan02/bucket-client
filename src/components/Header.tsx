"use client";

import { Search } from "lucide-react";

export default function Header() {
    return (
        <header className="h-14 bg-white shadow-sm flex items-center justify-between px-6 sticky top-0 z-10">

            <div className="flex items-center gap-3">
                <h1 className="font-semibold text-lg">CloudBox</h1>
                <div className="flex items-center border rounded px-3 py-1 text-sm text-gray-500">
                    <Search size={16} className="mr-2" />
                    <input
                        type="text"
                        placeholder="Search files..."
                        className="outline-none bg-transparent w-40"
                    />
                </div>
            </div>

            {/* Bên phải */}
            <div className="flex items-center gap-4">
                <button className="text-sm hover:text-blue-600">Upgrade</button>
                <div className="w-8 h-8 rounded-full bg-gray-300" />
            </div>
        </header>
    );
}
