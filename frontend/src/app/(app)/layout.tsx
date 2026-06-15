"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { MeshBackground } from "@/components/MeshBackground";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative flex flex-col md:flex-row">
      <MeshBackground />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        <main className="flex-1 p-4 md:p-8 pb-24 lg:pb-8 overflow-y-auto">
          {children}
        </main>
      </div>
      <MobileTabBar />
    </div>
  );
}
