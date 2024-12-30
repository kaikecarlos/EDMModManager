import '../index.css'
import { Card, CardContent } from "../components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel"
import OtherMods from '../components/othermods';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useEffect, useState } from 'preact/hooks';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { AlertCircle, Folder } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';

import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from "@tauri-apps/api/core"
import { listen } from '@tauri-apps/api/event';
import { Progress } from '../components/ui/progress';
import { useNavigate } from 'react-router';
import axios from 'axios';


function App() {
  const [mods, setMods] = useState([])
  const [featuredMods, setFeaturedMods] = useState([])
  const [isGamePath, setIsGamePath] = useState(false)
  const [isBepinex, setIsBepinex] = useState(true)
  const [bepinexInstallDialog, setBepinexInstallDialog] = useState(false)
  const [showAlert, setShowAlert] = useState(false)

  let navigate = useNavigate()

  useEffect(() => {
    if (localStorage.getItem('@gamepath') !== null) {
      setIsGamePath(true)
    } else {
      setIsGamePath(false)
    }
  }, [isGamePath])

  useEffect(() => {
    verifyBepinex()
  }, [isBepinex])

  useEffect(() => {
    getModsDatabase()
    const unlistenCloseRequested = listen("tauri://close-requested", () => {
      localStorage.getItem('@modsDatabase') && localStorage.removeItem('@modsDatabase')
    });
    return () => {
      unlistenCloseRequested.then((unlisten) => unlisten());
    }
  }, [])

  const handleGamePath = (value) => {
    localStorage.setItem('@gamepath', value)
    setIsGamePath(true)
  }

  const getModsDatabase = async () => {
    const cachedMods = localStorage.getItem('@modsDatabase');
    if (cachedMods) {
      const modsData = JSON.parse(cachedMods);
      setMods(modsData.releases);
      setFeaturedMods(getRandomFeaturedMods(modsData.releases));
    } else {
      setShowAlert(true);
      const mods = await axios.get('https://raw.githubusercontent.com/kaikecarlos/edm-mod-db/refs/heads/source/database.json');
      localStorage.setItem('@modsDatabase', JSON.stringify(mods.data));
      setMods(mods.data.releases);
      setFeaturedMods(getRandomFeaturedMods(mods.data.releases));
    }
  }
  
  
  const getRandomFeaturedMods = (mods) => {
    const featured = [];
    for (let i = 0; i < 3; i++) {
      const random = Math.floor(Math.random() * mods.length);
      featured.push(mods[random]);
    }
    return featured;
  }

  const verifyBepinex = async () => {
    const bepinex = await invoke('verify_bepinex', { gameFolderPath: localStorage.getItem('@gamepath') })
    if (bepinex) {
      setIsBepinex(true)
    } else {
      setIsBepinex(false)
    }
  }

  const handleBepinexInstall = () => {
    setBepinexInstallDialog(true)
  }

  const handleBepinexClose = () => {
    setBepinexInstallDialog(false)
    setIsBepinex(true)
  }

  return (
    <div className="w-full mb-12">
      {showAlert && (
        <Alert variant="destructive">
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            Falha ao carregar o banco de dados de mods. Por favor, tente novamente.
          </AlertDescription>
        </Alert>
      )}
      {isBepinex ? (<></>) : (
        <div className="bg-red-600 z-[1000] w-full flex items-center justify-between fixed top-0 left-0 p-4">
          <h1>O BepInEx não está devidamente instalado</h1>
          <Button onClick={handleBepinexInstall}>Verificar</Button>
        </div>
      )}
      {bepinexInstallDialog ? (<InstallBepinexDialog callback={handleBepinexClose} />) : (<></>)}
      {isGamePath ? (
        <></>
      ) : (
        <AlertEditGamePath callback={handleGamePath} />
      )}
      <h2 className="text-3xl font-semibold mb-4">Home</h2>
      <div className="relative">
        <Carousel className="w-full">
          <CarouselContent>
            {featuredMods.map((mod) => (
              <CarouselItem key={mod.slug}>
                <Card className="border-none" onClick={() => navigate(`/mod/${mod.slug}`)}>
                  <CardContent className="flex items-center justify-center p-0">
                    <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[400px] xl:h-[500px] rounded-xl overflow-hidden">
                      <img
                        src={mod.image ? mod.image : `https://placehold.co/400x600/FFFFFF/000000/svg?text=${mod.slug}` }
                        alt={mod.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                        <h3 className="text-2xl font-bold text-white">{mod.name}</h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
      <OtherMods mods={mods} />
    </div>
  );
}

const AlertEditGamePath = ({ callback }) => {

  const [folderName, setFolderName] = useState('')

  const openDialog = async () => {
    const result = await open({
      directory: true
    })
    setFolderName(result)
  }

  return (
    <AlertDialog defaultOpen={true}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Definir o caminho do jogo</AlertDialogTitle>
          <AlertDialogDescription>
            Selecione a pasta onde o jogo está instalado.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex w-full items-center gap-2">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="folderName">Local</Label>
            <div className="flex w-full">
              <Input
                type="text"
                id="folderName"
                defaultValue="C:\Program Files (x86)\Steam\steamapps\common\Enigma of Fear"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Caminho do jogo"
                className="flex-grow rounded-r-none"
              />
              <Button
                type="button"
                variant="outline"
                className="rounded-l-none border-l-0"
                onClick={openDialog}
              >
                <Folder className="h-4 w-4" />
                <span className="sr-only">Selecione uma pasta</span>
              </Button>
            </div>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => callback(folderName)}>
            Aceitar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

const InstallBepinexDialog = ({ callback }) => {
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [message, setMessage] = useState("Deseja instalar?");

  useEffect(() => {
    const unlistenDownloadStarted = listen("download_started", () => {
      setIsDownloading(true);
      setMessage("Baixando BepInEx...");
    });

    const unlistenDownloadProgress = listen("download-progress", (event) => {
      setProgress(event.payload);
    });

    const unlistenExtractionStarted = listen("extraction_started", () => {
      setMessage("Extraindo BepInEx...");
    });

    const unlistenExtractionProgress = listen("extraction-progress", (event) => {
      setProgress(event.payload);
    });

    const unlistenProcessCompleted = listen("process_completed", () => {
      setMessage("BepInEx instalado com sucesso!");
      setIsDownloading(false);
      setProgress(100);
    });

    return () => {
      unlistenDownloadStarted.then((unlisten) => unlisten());
      unlistenDownloadProgress.then((unlisten) => unlisten());
      unlistenExtractionStarted.then((unlisten) => unlisten());
      unlistenExtractionProgress.then((unlisten) => unlisten());
      unlistenProcessCompleted.then((unlisten) => unlisten());
    };
  }, []);

  const handleInstall = () => {
    setMessage("Instalação iniciada!");
    setIsDownloading(true);

    callDownloadBepinex();
  };
  const callDownloadBepinex = async () => {
    await invoke("download_bepinex", { gameFolderPath: "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Enigma of Fear\\TESTE" });
  }
  return (
    <AlertDialog defaultOpen={true}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Instalar BepInEx</AlertDialogTitle>
          <AlertDialogDescription>
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {isDownloading && <Progress value={progress} />}
        {!isDownloading && (
          <AlertDialogFooter>
            <AlertDialogAction onClick={(e) => e.preventDefault()} asChild>
              <Button onClick={() => {
                if (progress === 100) {
                  callback();
                } else {
                  handleInstall();
                }
              }}>{progress === 100 ? "Feito" : "Sim"}</Button>
            </AlertDialogAction>
            {progress === 100 ? (<></>) : (
              <AlertDialogCancel>Não</AlertDialogCancel>
            )}
          </AlertDialogFooter>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};


export default App;
