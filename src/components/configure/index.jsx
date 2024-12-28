import { useEffect, useState } from "preact/hooks"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"

export const Configure = () => {
    const [gamepath, setGamepath] = useState('')
    const [bepinex, setBepinex] = useState('')

    useEffect(() => {
        let gamepath = localStorage.getItem('@gamepath')
        if (gamepath !== null) {
            setGamepath(localStorage.getItem('@gamepath'))
            setBepinex(gamepath + `\\BepInEx`)
        }
    }, [gamepath])
    return (
        <AlertDialog defaultOpen={true}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Configuração</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogDescription>
                    Edite as configurações do mod manager
                </AlertDialogDescription>
                <div className="flex w-full items-center gap-2">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="folderName">Local do jogo</Label>
                        <div className="w-full">
                            <Input
                                type="text"
                                id="folderName"
                                value={gamepath}
                                onChange={(e) => setGamepath(e.target.value)}
                                placeholder="Caminho do jogo"
                                className="flex-grow rounded-r-none"
                            />
                            <Label htmlFor="bepinex">Local do BepInEx</Label>

                            <Input
                                type="text"
                                id="bepinex"
                                value={bepinex}
                                disabled
                                placeholder="Caminho do BepInEx"
                                className="flex-grow rounded-r-none"
                            />
                        </div>
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogAction>Salvar</AlertDialogAction>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}