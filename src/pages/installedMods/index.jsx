import { invoke } from "@tauri-apps/api/core"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { useEffect, useState } from "preact/hooks"
import { Button } from "../../components/ui/button"
import { AlertTriangle, Loader, Loader2, Trash } from "lucide-react"
import { Checkbox } from "../../components/ui/checkbox"
import axios from "axios"
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert"
import { AlertDialog, AlertDialogContent, AlertDialogTitle } from "../../components/ui/alert-dialog"
import { Label } from "../../components/ui/label"
import { listen } from "@tauri-apps/api/event"


export const InstalledMods = () => {
    const [userInstalledMods, setUserInstalledMods] = useState([])
    const [updatesChecked, setUpdatesChecked] = useState(false);
    const [hasConfirmUninstall, setHasConfirmUninstall] = useState(true);
    const [selectedMod, setSelectedMod] = useState({});
    const [uninstallModal, setUninstallModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const getInstalledMods = async () => {
        let mods = await invoke('search_for_mods');
        mods = JSON.parse(mods);
        mods = mods.map(mod => JSON.parse(mod));
        console.log(mods)
        setUserInstalledMods(mods);
        setUpdatesChecked(false);
    };

    const verifyUpdates = async () => {
        const updatedMods = await Promise.all(
            userInstalledMods.map(async (mod) => {
                let ghAuthor = mod.repo.split('/')[3];
                let ghRepo = mod.repo.split('/')[4];
                let latestRelease = await axios.get(`https://api.github.com/repos/${ghAuthor}/${ghRepo}/releases/latest`);
                latestRelease = latestRelease.data;
                if (Math.abs(new Date(latestRelease.published_at) - new Date(mod.latestReleaseDate)) < 30000) {
                    return mod;
                } else {
                    mod.downloadUrl = latestRelease.assets[0].browser_download_url;
                    mod.latestReleaseDate = latestRelease.published_at;
                    return { ...mod, hasUpdates: true };
                }

            })
        );
        setUserInstalledMods(updatedMods);
    };

    const updateMod = async (mod) => {
        const downloads = JSON.parse(localStorage.getItem("@downloads")) || [];
        const newDownload = {
            ...mod,
            url: mod.downloadUrl,
            status: "pending",
            progress: 0,
        };
        downloads.push(newDownload);
        localStorage.setItem("@downloads", JSON.stringify(downloads));

        await navigate("/downloads");
    }

    const uninstallMod = async () => {
        let mod = selectedMod;
        setLoading(true)
        await invoke('uninstall_mod', {
            gameFolderPath: localStorage.getItem("@gamepath") + "\\BepInEx", uniqueName: mod.uniqueName,
            modInfo: JSON.stringify(mod)
        });

        getInstalledMods();
    }

    useEffect(() => {
        const fetchAndVerify = async () => {
            await getInstalledMods();
        };
        let doNotAskAgain = localStorage.getItem("@doNotAskAgain");
        if (doNotAskAgain) {
            setHasConfirmUninstall(false);
        }

        fetchAndVerify();

        const unlistenUninstall = listen("process_completed", () => {
            setUninstallModal(false);
            fetchAndVerify()
        });

        return () => {
            unlistenUninstall.then((unlisten) => unlisten());
        }


    }, []);

    useEffect(() => {
        if (userInstalledMods.length > 0 && !updatesChecked) {
            verifyUpdates();
            setUpdatesChecked(true);
        }
    }, [userInstalledMods, updatesChecked]);

    return (
        <div>
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Mods Instalados</h1>
            </div>

            {userInstalledMods.map((mod) => (
                <>
                    <Card className="mt-4">
                        {mod.hasUpdates && (
                            <Alert variant="warning" className="mb-2 bg-yellow-400 text-black">
                                <AlertTriangle className="h-4 w-4" color="#000" />
                                <AlertTitle>Esse mod tem uma atualização pendente</AlertTitle>
                            </Alert>
                        )}
                        <CardContent className="flex items-center justify-between p-4">
                            <div className="p-3">
                                <Checkbox
                                    checked={mod.active}
                                    onChange={() => { }}
                                />
                            </div>
                            <div className="w-1/8 h-[75px] sm:h-[100px] md:h-[125px] lg:h-[100px] xl:h-[125px] rounded-xl overflow-hidden">
                                <img
                                    src={mod.image ? mod.image : `https://placehold.co/256x256/FFFFFF/000000/svg?text=${mod.slug}`}
                                    alt={mod.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="w-2/4 pl-4 flex-1">
                                <h3 className="text-xl font-bold">{mod.name}</h3>
                                <p className="text-sm text-gray-500">{mod.author}</p>
                                <p className="text-sm">{mod.description}</p>
                            </div>

                            <div className="w-1/4 flex justify-end">
                                <Button className="bg-red-500 text-white p-4 rounded" onClick={() => {
                                    setSelectedMod(mod)
                                    setUninstallModal(true)
                                }}>
                                    <Trash />
                                </Button>
                                {mod.hasUpdates && (
                                    <Button onClick={() => updateMod(mod)} className="bg-yellow-500 text-white p-2 ml-2 rounded">Atualizar</Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </>

            ))}

            {uninstallModal && (
                <AlertDialog defaultOpen={true} onClose={() => setUninstallModal(false)}>
                    <AlertDialogContent>
                        <AlertDialogTitle>Desinstalar mod</AlertDialogTitle>
                        <AlertDescription>
                            Tem certeza que deseja desinstalar o mod?
                        </AlertDescription>
                        <div className="flex flex-end gap-2">
                            {loading ? (
                                <>
                                    <Button disabled className="bg-gray-500 text-white p-2 rounded">
                                        <Loader2 className="animate-spin" />
                                        Por favor, aguarde
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button className="bg-red-500 text-white p-2 rounded" onClick={uninstallMod}>Desinstalar</Button>
                                    <Button className="bg-gray-500 text-white p-2 rounded">Cancelar</Button>
                                </>
                            )}

                        </div>
                    </AlertDialogContent>
                </AlertDialog>
            )}

        </div>
    )
}
