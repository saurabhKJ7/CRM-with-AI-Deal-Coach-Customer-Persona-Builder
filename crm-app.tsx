"use client"

import * as React from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { AppSidebar } from "./components/app-sidebar"
import { Dashboard } from "./components/dashboard"
import { Contacts } from "./components/contacts"
import { Deals } from "./components/deals"
import { Activities } from "./components/activities"

export default function CRMApp() {
  const [currentPage, setCurrentPage] = React.useState("Dashboard")

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "Dashboard":
        return <Dashboard />
      case "Contacts":
        return <Contacts />
      case "Deals":
        return <Deals />
      case "Activities":
        return <Activities />
      default:
        return <Dashboard />
    }
  }

  const getBreadcrumbs = () => {
    return [
      { label: "CRM", href: "/" },
      { label: currentPage, href: `/${currentPage.toLowerCase()}` },
    ]
  }

  // Override the sidebar navigation to update current page
  React.useEffect(() => {
    const handleNavigation = (e: Event) => {
      const target = e.target as HTMLAnchorElement
      if (target.href) {
        e.preventDefault()
        const page = target.href.split("/").pop() || "dashboard"
        setCurrentPage(page.charAt(0).toUpperCase() + page.slice(1))
      }
    }

    document.addEventListener("click", handleNavigation)

    return () => {
      document.removeEventListener("click", handleNavigation)
    }
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {getBreadcrumbs().map((crumb, index) => (
                <React.Fragment key={crumb.label}>
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {index === getBreadcrumbs().length - 1 ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-6">{renderCurrentPage()}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
