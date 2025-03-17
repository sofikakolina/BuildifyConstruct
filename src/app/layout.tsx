'use client'
import localFont from "next/font/local";
import "../styles/globals.css";
import { NavbarHeight } from "../components/navigation/Sizes";
import { SessionProvider } from "next-auth/react";
import { Provider } from 'react-redux'
import { store } from "@/lib/store"
import { Toaster } from 'react-hot-toast';

const geistSans = localFont({
  src: "../public/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../public/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <SessionProvider>
        <Provider store={store}>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            {/* <Dashboard /> */}
            <div
              className="h-full"
              style={{ height: `calc(100vh - ${NavbarHeight}px)` }}
            >
              {children}
            </div>
            <Toaster />
          </body>
        </Provider>
      </SessionProvider>
    </html>
  );
}
