'use client'

import { useNavigate } from "react-router"
import { Card, CardContent } from "../ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel"

export default function OtherMods({ mods }) {
  let navigate = useNavigate()
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
          {mods.map((mod) => (
            <CarouselItem key={mod.slug} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
              <Card className="overflow-hidden" onClick={() => navigate(`/mod/${mod.slug}`)}>
                <CardContent className="p-0">
                  <div className="relative aspect-[2/3]">
                    <img 
                        src={mod.image ? mod.image : `https://placehold.co/400x600/FFFFFF/000000/svg?text=${mod.slug}` }
                        alt={mod.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex flex-col justify-end p-6">
                      <h3 className="text-xl font-semibold text-white mb-2">{mod.name}</h3>
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

