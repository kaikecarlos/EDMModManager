import { render } from "preact";
import App from "./pages/App";
import { BrowserRouter, Routes, Route } from "react-router";
import { LayoutSideBar } from "./components/layout/layoutsidebar";
import RootLayout from "./components/layout/layout";
import { InstalledMods } from "./pages/installedMods";

const root = document.getElementById("root");

render(
    <BrowserRouter>
        <Routes>
            <Route element={<RootLayout />}>
                <Route index path="/" element={<App />} />
                <Route path="/mods" element={<InstalledMods />} />
            </Route>
        </Routes>
    </BrowserRouter>
, root);