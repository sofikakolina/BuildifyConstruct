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
            <div
                className="absolute bottom-0 right-0 p-10"
                style={{
                    height: `calc(100vh - ${NavbarHeight}px)`,
                    width: `calc(100vw - ${SidebarWidth}px)`,
                }}
            >
                {children}
            </div>
        </div>
    );
}
