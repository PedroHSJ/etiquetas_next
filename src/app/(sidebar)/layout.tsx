import "@/app/globals.css";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { NavigationProvider } from "@/contexts/NavigationContext";
import { NavigationLoading } from "@/components/ui/navigation-loading";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Toaster />
        <NavigationProvider>
          <OrganizationProvider>
            <NavigationLoading />
            <NotificationProvider>
              <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                  <header
                    className="flex h-16 shrink-0 items-center justify-between gap-2 
                        transition-[width,height] ease-linear 
                        group-has-data-[collapsible=icon]/sidebar-wrapper:h-12
                        border-b border-border
                        "
                  >
                    <div className="flex items-center gap-2 px-4">
                      <SidebarTrigger className="-ml-1" />
                      <Separator
                        orientation="vertical"
                        className="mr-2 data-[orientation=vertical]:h-4"
                      />
                    </div>
                    <div className="flex items-center gap-2 px-4">
                      <NotificationBell />
                    </div>
                  </header>
                  <Suspense
                    fallback={
                      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                          <div className="bg-muted/50 aspect-video rounded-xl" />
                          <div className="bg-muted/50 aspect-video rounded-xl" />
                          <div className="bg-muted/50 aspect-video rounded-xl" />
                        </div>
                        <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
                      </div>
                    }
                  >
                    <div className="p-6">{children}</div>
                  </Suspense>
                </SidebarInset>
              </SidebarProvider>
            </NotificationProvider>
          </OrganizationProvider>
        </NavigationProvider>
      </body>
    </html>
  );
}
