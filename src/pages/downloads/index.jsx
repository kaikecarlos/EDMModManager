import { Channel, invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { Minus, Trash } from "lucide-react";
import { Checkbox } from "../../components/ui/checkbox";



export const Downloads = () => {
  const [downloads, setDownloads] = useState([]);

  const loadDownloads = () => {
    const savedDownloads = JSON.parse(localStorage.getItem("@downloads")) || [];
    setDownloads(savedDownloads);
  };

  const updateDownload = (url, changes) => {
    console.log("Updating download status", url, changes);
    setDownloads((prev) => {
      const updatedDownloads = prev.map((download) =>
        download.url === url ? { ...download, ...changes } : download
      );
      localStorage.setItem("@downloads", JSON.stringify(updatedDownloads));
      return updatedDownloads;
    });
  };

  useEffect(() => {
    loadDownloads();
  }, [downloads])

  const startPendingDownloads = async () => {
    const downloads = JSON.parse(localStorage.getItem("@downloads")) || [];
    for (const mod of downloads) {
      if (mod.status === "pending") {
        updateDownload(mod.url, { status: "downloading", progress: 0 });
        const onEvent = new Channel();

        onEvent.onmessage = (message) => {
          switch (message.event) {
            case "downloadStarted":
              break;

            case "downloadProgress":
              updateDownload(message.data.url, { status: "downloading", progress: message.data.progress });
              break;

            case "processCompleted":
              updateDownload(message.data.url, { status: "completed", progress: 100 });
              break;
          }
        };

        try {
          await invoke("install_mod", {
            url: mod.url,
            gameFolderPath: localStorage.getItem("@gamepath") + "\\BepInEx\\plugins",
            uniqueName: mod.uniqueName,
            modInfo: JSON.stringify(mod),
            onEvent: onEvent
          });
        } catch (error) {
          console.error(`Failed to install mod ${mod.name}:`, error);
          updateDownload(mod.url, { status: "failed" });
        }
      }
    }
  };


  useEffect(() => {
    loadDownloads();
    startPendingDownloads();
  }, []);


  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Downloads</h1>
      </div>

      {downloads.map((mod) => (
        <Card key={mod.url} className="mb-4">
          <CardContent className="flex items-center justify-between p-4">
            <div className="w-1/8 h-[75px] sm:h-[100px] md:h-[125px] lg:h-[100px] xl:h-[125px] rounded-xl overflow-hidden">
              <img
                src={mod.image || `https://placehold.co/256x256/FFFFFF/000000/svg?text=${mod.slug}`} // Use a placeholder if no image
                alt={mod.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-2/4 pl-4 flex-1">
              <h3 className="text-xl font-bold">{mod.name}</h3>
              <p className="text-sm text-gray-500">{mod.author}</p>
              <p className="text-sm">{mod.description}</p>
            </div>

            <div className="w-1/4 flex flex-col items-end">
              {mod.status === "downloading" || mod.status === "extracting" ? (
                <Progress value={mod.progress || 0} />
              ) : mod.status === "completed" ? (
                <span className="text-green-500">Instalado</span>
              ) : (
                <span className="text-gray-500">{mod.status}</span>
              )}
              <Button
                className="bg-red-500 text-white p-4 rounded mt-2"
                onClick={() => {
                  const updated = downloads.filter((d) => d.url !== mod.url);
                  setDownloads(updated);
                  localStorage.setItem("@downloads", JSON.stringify(updated));
                }}
              >
                <Minus />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
