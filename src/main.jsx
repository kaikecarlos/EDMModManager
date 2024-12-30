import { render } from "preact";
import App from "./pages/App";
import { BrowserRouter, Routes, Route } from "react-router";
import { LayoutSideBar } from "./components/layout/layoutsidebar";
import RootLayout from "./components/layout/layout";
import { InstalledMods } from "./pages/installedMods";
import ModDetails from "./pages/modDetails";
import { Downloads } from "./pages/downloads";

const root = document.getElementById("root");

render(
    <BrowserRouter>
        <Routes>
            <Route element={<RootLayout />}>
                <Route index path="/" element={<App />} />
                <Route path="/mods" element={<InstalledMods />} />
                <Route path="/mod/:id" element={<ModDetails />} />
                <Route path="/downloads" element={<Downloads />} />
            </Route>
        </Routes>
    </BrowserRouter>
, root);