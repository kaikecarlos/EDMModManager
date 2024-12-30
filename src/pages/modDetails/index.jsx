import { ChevronLeft, ChevronRight, User, Tag, Download, Github, Home, ImageIcon } from 'lucide-react'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "../../components/ui/carousel"
import { useEffect, useState } from "preact/hooks"
import { Link, useNavigate, useParams } from 'react-router'
import { invoke } from '@tauri-apps/api/core'

// Mock data for the mod
const modData = {
    name: "Campanha SDOL",
    description: "Adiciona uma nova missão à campanha principal do jogo, com novos inimigos, armas e mecânicas inspirados e retirados do spin-off de Ordem Paranormal Sinais do Outro Lado.",
    author: "NatureCrafter",
    version: "2.1.3",
    downloads: 1500000,
    githubUrl: "https://github.com/naturecrafter/epic-landscape-overhaul",
    screenshots: [
        "https://placehold.co/800x400/FFFFFF/000000/svg",
        "https://placehold.co/800x400/fcba03/000000/svg",
        "https://placehold.co/800x400/FFFFFF/000000/svg",
        "https://placehold.co/800x400/FFFFFF/000000/svg",
        "https://placehold.co/800x400/FFFFFF/000000/svg",
    ],
}


export default function ModDetails() {
    const [mainImageIndex, setMainImageIndex] = useState(0)
    const { id } = useParams()
    const [mod, setMod] = useState(null)
    let navigate = useNavigate()

    const hasScreenshots = false

    useEffect(() => {
        getModData()
    })

    const getModData = async () => {
        const database = localStorage.getItem('@modsDatabase')
        if (!database) return
        const mods = JSON.parse(database)
        const mod = mods.releases.find((mod) => mod.slug === id)
        if (!mod) return
        setMod(mod)
    }

    const installMod = async (mod) => {
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
    };

    return (
        <div class="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Button variant="outline" size="sm" onClick={() => navigate('/')}>
                    <Home className="mr-2 h-4 w-4" />
                    Voltar ao início
                </Button>
            </div>
            {mod && (
                <Card class="overflow-hidden">
                    <div class="p-6">
                        <h2 class="text-3xl font-bold">{mod.name}</h2>
                        <div class="flex flex-wrap gap-4 mt-2">
                            <div class="flex items-center">
                                <User class="w-4 h-4 mr-2" />
                                <span>{mod.author}</span>
                            </div>
                            <div class="flex items-center">
                                <Tag class="w-4 h-4 mr-2" />
                                <span>{mod.version}</span>
                            </div>
                            <div class="flex items-center">
                                <Download class="w-4 h-4 mr-2" />
                                <span>0 downloads</span>
                            </div>
                            <a
                                href={mod.repo}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="flex items-center hover:underline"
                            >
                                <Github class="w-4 h-4 mr-2" />
                                <span>GitHub</span>
                            </a>
                        </div>
                    </div>
                    <div class="p-0">
                        {hasScreenshots && (
                            <div class="relative aspect-[2/1] w-full max-w-3xl mx-auto">
                                <img
                                    src={modData.screenshots[mainImageIndex]}
                                    alt={`Mod screenshot ${mainImageIndex + 1}`}
                                    class="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {hasScreenshots ? (
                            <div class="relative mt-4 p-4">
                                <div class="overflow-x-auto sm:overflow-hidden">
                                    <div class="flex space-x-4 px-8">
                                        {modData.screenshots.map((src, index) => (
                                            <img
                                                key={index}
                                                src={src}
                                                alt={`Screenshot ${index + 1}`}
                                                width={150}
                                                height={90}
                                                class={`rounded-md cursor-pointer transition-opacity hover:opacity-80 ${index === mainImageIndex ? 'border-2 border-primary' : ''}`}
                                                onClick={() => setMainImageIndex(index)}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <button
                                    class="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-1 rounded-r-md"
                                    onClick={() => {
                                        const container = document.querySelector('.overflow-x-auto')
                                        if (container) container.scrollLeft -= 200
                                    }}
                                >
                                    <ChevronLeft class="text-white" />
                                </button>
                                <button
                                    class="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-1 rounded-l-md"
                                    onClick={() => {
                                        const container = document.querySelector('.overflow-x-auto')
                                        if (container) container.scrollLeft += 200
                                    }}
                                >
                                    <ChevronRight class="text-white" />
                                </button>
                            </div>
                        ) : (
                            <div class="mt-4 p-4 bg-gray-100 rounded-md">
                                <div class="flex items-center justify-center text-gray-500">
                                    <ImageIcon class="w-6 h-6 mr-2" />
                                    <span>Sem screenshots disponíveis para esse mod</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 p-6">
                        <div class="w-full sm:w-auto mb-4 sm:mb-0 sm:mr-4">
                            <Button size="lg" onClick={() => installMod(mod)}>Instalar Mod</Button>
                        </div>
                        <div class="w-full sm:flex-1">
                            <p class="text-gray-300">{mod.description}</p>
                        </div>
                    </div>
                </Card>
            )}

        </div>
    )
}

