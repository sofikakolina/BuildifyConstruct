'use client'
import "@/styles/globals.css";
import Navbar from "@/components/navigation/Navbar";
import { NavbarHeight } from "@/components/navigation/Sizes";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Navbar/>
      <div
        className="h-full"
        style={{ height: `calc(100vh - ${NavbarHeight}px)` }}
      >
        {children}
      </div>
    </div>
  );
}
