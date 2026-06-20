"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, Bell, Settings, User, LogOut, Hexagon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { fetchApi } from "@/lib/api";

export function TopNav() {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ first_name?: string, last_name?: string, email?: string } | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{ assessments?: any[], vendors?: any[] }>({});

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults({});
      return;
    }
    
    setIsSearching(true);
    const timer = setTimeout(() => {
      fetchApi(`/api/assessments/search?q=${encodeURIComponent(searchQuery)}`)
        .then(res => setSearchResults(res))
        .catch(console.error)
        .finally(() => setIsSearching(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const navLinks = [
    { name: "Home", href: "/dashboard" },
    { name: "Assessments", href: "/assessments" },
    { name: "Vendors", href: "/vendors" },
    { name: "Library", href: "/library" },
  ];

  useEffect(() => {
    fetchApi('/api/auth/me')
      .then(res => setUserProfile(res))
      .catch(err => console.error("Failed to load user profile in TopNav", err));
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name[0]}${userProfile.last_name[0]}`.toUpperCase();
    }
    if (userProfile?.email) {
      return userProfile.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const getDisplayName = () => {
    if (userProfile?.first_name || userProfile?.last_name) {
      return `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim();
    }
    return "User";
  };

  return (
    <header
      className="sticky top-6 z-50 mx-4 md:mx-8 px-6 py-4 flex items-center justify-between bg-white/60 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-white/50"
      style={{ borderRadius: "2rem" }}
    >
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center font-display text-xl font-bold tracking-tight text-black shrink-0">
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
                  ? "bg-white/60 backdrop-blur-md shadow-[0_8px_16px_rgba(0,0,0,0.04)] border border-white/60 text-black"
                  : "text-[#4B5563] hover:text-black hover:bg-white/40 hover:backdrop-blur-sm"
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
        <div className="hidden md:flex items-center relative" ref={searchRef}>
          <Search size={18} className="absolute left-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search assessments, vendors..."
            className="pl-11 pr-4 py-2.5 bg-white/50 border border-gray-200/60 rounded-full text-sm font-medium w-[260px] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all shadow-inner"
          />

          {isSearchOpen && searchQuery.length > 1 && (
            <div className="absolute top-full mt-2 w-full max-w-[400px] right-0 bg-white/95 backdrop-blur-3xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-white p-2 py-3 origin-top-right animate-in fade-in slide-in-from-top-2 duration-200 z-50 max-h-[400px] overflow-y-auto">
              {isSearching ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center animate-pulse">Searching...</div>
              ) : (
                <>
                  {(searchResults.assessments?.length ?? 0) > 0 && (
                    <div className="mb-2">
                      <h4 className="px-3 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Assessments</h4>
                      {searchResults.assessments?.map((item: any) => (
                        <Link
                          href={`/assessment/${item.id}/report`}
                          key={item.id}
                          onClick={() => setIsSearchOpen(false)}
                          className="flex flex-col px-3 py-2 hover:bg-black/5 rounded-xl transition-colors cursor-pointer"
                        >
                          <span className="text-sm font-medium text-black">{item.project_name}</span>
                          <span className="text-xs text-gray-500 flex gap-2">
                            <span>{item.department}</span>
                            <span>•</span>
                            <span className="truncate">{item.id.substring(0, 8)}...</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {(searchResults.vendors?.length ?? 0) > 0 && (
                    <div>
                      <h4 className="px-3 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Vendors</h4>
                      {searchResults.vendors?.map((item: any) => (
                        <Link
                          href={`/vendors`}
                          key={item._id}
                          onClick={() => setIsSearchOpen(false)}
                          className="flex flex-col px-3 py-2 hover:bg-black/5 rounded-xl transition-colors cursor-pointer"
                        >
                          <span className="text-sm font-medium text-black">{item.name}</span>
                          <span className="text-xs text-gray-500">{item.category}</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {searchResults.assessments?.length === 0 && searchResults.vendors?.length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">No results found for "{searchQuery}"</div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button className="md:hidden w-10 h-10 rounded-full flex items-center justify-center bg-white border border-gray-100 shadow-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors">
            <Search size={18} />
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-10 h-10 rounded-full ml-2 border-[3px] border-white shadow-sm overflow-hidden focus:outline-none hover:ring-2 hover:ring-purple-200 transition-all"
            >
              <div className="w-full h-full bg-gradient-to-tr from-[#A855F7] to-[#3B82F6] flex items-center justify-center text-white font-bold text-sm">
                {getInitials()}
              </div>
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-3xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-white p-2 py-3 origin-top-right animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <div className="px-4 py-2 mb-2 border-b border-gray-100">
                  <p className="font-semibold text-sm text-black">{getDisplayName()}</p>
                  <p className="text-xs text-gray-500">{userProfile?.email || "Loading..."}</p>
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
