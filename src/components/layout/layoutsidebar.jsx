import * as React from 'react'
import { Home, Cog, Package, Download } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from '../ui/sidebar'
import { Button } from '../ui/button'
import { useState } from 'preact/hooks'
import { Configure } from '../configure'
import { invoke } from '@tauri-apps/api/core'

export function LayoutSideBar() {

  const [openConfig, setOpenConfig] = useState(false)

  const handleOpenConfig = () => {
    setOpenConfig(!openConfig)
  }

  const openGame = async () => {
    let gamepath = localStorage.getItem('@gamepath')
    invoke('launch_game', { gameFolderPath: gamepath })
  }

  return (
    <>
      {openConfig && <Configure />}
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild>
                  <a href="#">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Package className="size-4" />
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none">
                      <span className="font-semibold">EDM Mod Manager</span>
                      <span className="text-xs text-muted-foreground">Alpha v1.0.0</span>
                    </div>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/">
                    <Home className="mr-2 size-4" />
                    Home
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/downloads">
                    <Download className="mr-2 size-4" />
                    Downloads
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/mods">
                    <Package className="mr-2 size-4" />
                    Mods Instalados
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={handleOpenConfig}>
                  <a href="#">
                    <Cog className="mr-2 size-4" />
                    Configurações
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button onClick={openGame} className="h-10 hover:bg-primary/90 bg-primary text-primary-foreground shadow">Jogar</Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
      </SidebarProvider>
    </>
  )
}

