"use client"

import { ObjectionHandlerChat } from '@/components/objection-handler'
import { AppSidebar } from "@/components/app-sidebar"
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
import { Card, CardContent } from "@/components/ui/card"
import { Brain, Lightbulb, MessageSquare } from "lucide-react"

export default function ObjectionHandlerPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="p-0 bg-background">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white/80 backdrop-blur-sm">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">CRM</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Insights</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        
        <div className="p-6">
          <div className="flex flex-col gap-8 max-w-6xl">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex p-2 rounded-full bg-blue-100 mb-4">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-blue-900 mb-2">Insights</h1>
              <p className="text-lg text-blue-700">
                Get AI-powered responses to handle customer objections effectively.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="bg-white p-3 rounded-full">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-900">Objection Handling</h3>
                    <p className="text-sm text-blue-700">Get expert responses to common sales objections</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-sm">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="bg-white p-3 rounded-full">
                    <Lightbulb className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-purple-900">Persuasive Responses</h3>
                    <p className="text-sm text-purple-700">Craft compelling answers to win over prospects</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="bg-white p-3 rounded-full">
                    <Brain className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-green-900">AI-Powered</h3>
                    <p className="text-sm text-green-700">Leverage advanced AI to close more deals</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <ObjectionHandlerChat />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
