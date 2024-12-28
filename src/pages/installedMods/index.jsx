import { invoke } from "@tauri-apps/api/core"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { useEffect, useState } from "preact/hooks"
import { Button } from "../../components/ui/button"
import { Trash } from "lucide-react"


export const InstalledMods = () => {
    const [userInstalledMods, setUserInstalledMods] = useState([])

    const getInstalledMods = async () => {
        let mods = await invoke('search_for_mods')
        mods = JSON.parse(mods)
        setUserInstalledMods(mods)
    }
    
    useEffect(() => {
        getInstalledMods()
    }, [])

    return (
        <div>
            {userInstalledMods.map((mod) => (
                <Card>
                    <CardContent className="flex items-center justify-between p-4">
                        <div className="w-1/8 h-[75px] sm:h-[100px] md:h-[125px] lg:h-[100px] xl:h-[125px] rounded-xl overflow-hidden">
                            <img
                                src={mod.image}
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
                            <Button className="bg-red-500 text-white p-4 rounded">
                                <Trash />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}