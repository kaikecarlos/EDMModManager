import { Outlet } from "react-router";
import { LayoutSideBar } from "./layoutsidebar";

export default function RootLayout() {
    return (
        <div className="flex h-screen">
            <LayoutSideBar />
            <main className="flex-1 overflow-auto p-4">
                <Outlet />
            </main>
        </div>
    );
}