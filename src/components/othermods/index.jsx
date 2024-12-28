'use client'

import { Card, CardContent } from "../ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel"

const otherMods = [
  { id: 1, title: "UI Overhaul", image: "https://placehold.co/300x200/FFFFFF/000000/svg", description: "A complete redesign of the user interface" },
  { id: 2, title: "Sound Pack", image: "https://placehold.co/300x200/FFFFFF/000000/svg", description: "New and improved sound effects" },
  { id: 3, title: "Performance Boost", image: "https://placehold.co/300x200/FFFFFF/000000/svg", description: "Optimize your game for better FPS" },
  { id: 4, title: "Multiplayer Expansion", image: "https://placehold.co/300x200/FFFFFF/000000/svg", description: "New multiplayer modes and features" },
  { id: 5, title: "AI Enhancement", image: "https://placehold.co/300x200/FFFFFF/000000/svg", description: "Smarter and more challenging AI opponents" },
  { id: 6, title: "Weather System", image: "https://placehold.co/300x200/FFFFFF/000000/svg", description: "Dynamic weather effects" },
  { id: 7, title: "Custom Maps", image: "https://placehold.co/300x200/FFFFFF/000000/svg", description: "Create and share your own maps" },
  { id: 8, title: "Weapon Skins", image: "https://placehold.co/300x200/FFFFFF/000000/svg", description: "Customize your weapons with unique skins" },
]

export default function OtherMods() {
  return (
    <div className="w-full mb-12">
      <h2 className="text-3xl font-semibold mb-4">Mais baixados</h2>
      <Carousel
        opts={{
          dragFree: true,
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {otherMods.map((mod) => (
            <CarouselItem key={mod.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-[2/3]">
                    <img 
                      src={mod.image} 
                      alt={mod.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex flex-col justify-end p-6">
                      <h3 className="text-xl font-semibold text-white mb-2">{mod.title}</h3>
                      <p className="text-sm text-white/90 line-clamp-3">{mod.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}

