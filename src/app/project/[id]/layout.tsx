import Sidebar from "@/components/navigation/Sidebar";
import { NavbarHeight, SidebarWidth } from "@/components/navigation/Sizes";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>
            <Sidebar />
            <div className={`absolute bottom-0 right-0 h-[calc(100vh-${NavbarHeight}px)] w-[calc(100vw-${SidebarWidth}px)] p-10`}>
                {children}
            </div>
        </div>
    );
}
