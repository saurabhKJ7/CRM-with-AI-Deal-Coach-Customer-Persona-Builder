"use client"

import * as React from "react"
import { BarChart3, Calendar, Contact, DollarSign, Home, MessageSquareQuote, Settings, Users, LineChart, Bot } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const navigation = [
  {
    title: "Main",
    items: [
      { title: "Dashboard", icon: Home, url: "/" },
      { title: "Contacts", icon: Users, url: "/contacts", secondaryIcon: Bot },
      { title: "Deals", icon: DollarSign, url: "/deals", secondaryIcon: Bot },
      { title: "Activities", icon: Calendar, url: "/activities" },
      { title: "Reports", icon: BarChart3, url: "/reports" },
      { title: "Insights", icon: MessageSquareQuote, url: "/objection-handler", secondaryIcon: Bot },
      { title: "Deal Analysis", icon: LineChart, url: "/deal-analysis", secondaryIcon: Bot },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [activeItem, setActiveItem] = React.useState("")
  
  React.useEffect(() => {
    // Get current path to set active item
    const path = window.location.pathname;
    
    if (path === "/") {
      setActiveItem("Dashboard");
    } else if (path.includes("/contacts")) {
      setActiveItem("Contacts");
    } else if (path.includes("/deals")) {
      setActiveItem("Deals");
    } else if (path.includes("/activities")) {
      setActiveItem("Activities");
    } else if (path.includes("/reports")) {
      setActiveItem("Reports");
    } else if (path.includes("/deal-analysis")) {
      setActiveItem("Deal Analysis");
    } else if (path.includes("/settings")) {
      setActiveItem("Settings");
    }
  }, []);

  return (
    <Sidebar className="border-r border-gray-200" {...props}>
      <SidebarHeader className="border-b border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600">
            <Contact className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">CRM Pro</h2>
            <p className="text-xs text-gray-500">Sales Management</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        {navigation.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={activeItem === item.title}
                      className="w-full justify-start px-3 py-2 text-sm font-medium rounded-md hover:bg-blue-50 hover:text-blue-700 data-[active=true]:bg-blue-100 data-[active=true]:text-blue-700"
                    >
                      <a href={item.url} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <div className="flex items-center gap-1">
                          <span>{item.title}</span>
                          {item.secondaryIcon && (
                            <item.secondaryIcon className="h-3 w-3 text-blue-600" />
                          )}
                        </div>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="w-full justify-start px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50"
            >
              <a href="/settings" className="flex items-center gap-3">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
