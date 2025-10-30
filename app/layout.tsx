import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { UserProvider } from "@/contexts/user-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Student Workspace",
  description: "A platform for students to manage assignments and collaborate",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="light" enableColorScheme>
            <UserProvider>
              <SidebarProvider>
                {children}
                <Toaster />
              </SidebarProvider>
            </UserProvider>
          </ThemeProvider>
      </body>
    </html>
  )
}
