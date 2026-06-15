"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, Bell, Settings, User, LogOut, Hexagon } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function TopNav() {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { name: "Home", href: "/dashboard" },
    { name: "Assessments", href: "/assessments" },
    { name: "Vendors", href: "/vendors" },
    { name: "Library", href: "/library" },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className="sticky top-6 z-50 mx-4 md:mx-8 px-6 py-4 flex items-center justify-between bg-white/60 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-white/50"
      style={{ borderRadius: "2rem" }}
    >
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-black shrink-0">
        <Hexagon className="w-6 h-6 text-[#A855F7] fill-purple-100" />
        StratosAI
      </Link>

      {/* Centered Navigation Pills */}
      <nav className="hidden lg:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`px-5 py-2 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                isActive
                  ? "bg-[#111111] text-white shadow-md shadow-black/10"
                  : "text-[#4B5563] hover:text-black hover:bg-black/5"
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="hidden md:flex items-center relative">
          <Search size={18} className="absolute left-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search assessments, reports..."
            className="pl-11 pr-4 py-2.5 bg-white/50 border border-gray-200/60 rounded-full text-sm font-medium w-[260px] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all shadow-inner"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-gray-100 shadow-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors">
            <Search size={18} className="md:hidden" />
          </button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-gray-100 shadow-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors relative">
            <Bell size={18} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-10 h-10 rounded-full ml-2 border-[3px] border-white shadow-sm overflow-hidden focus:outline-none hover:ring-2 hover:ring-purple-200 transition-all"
            >
              <div className="w-full h-full bg-gradient-to-tr from-[#A855F7] to-[#3B82F6] flex items-center justify-center text-white font-bold text-sm">
                SM
              </div>
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white/80 backdrop-blur-2xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-white/60 p-2 py-3 origin-top-right animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <div className="px-4 py-2 mb-2 border-b border-gray-100/50">
                  <p className="font-semibold text-sm text-black">Sarah Mitchell</p>
                  <p className="text-xs text-gray-500">sarah@nexasolutions.com</p>
                </div>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-black hover:bg-black/5 rounded-xl transition-colors"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <Settings size={16} />
                  Settings
                </Link>
                <Link
                  href="/login"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-1"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <LogOut size={16} />
                  Sign out
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
