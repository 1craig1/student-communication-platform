import type React from "react"
import { MainSidebar } from "@/components/main-sidebar"
import { UserProvider } from "@/contexts/user-context"
import { AuthGuard } from "@/components/auth-guard"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UserProvider>
      <AuthGuard>
        <div className="flex h-screen">
          <MainSidebar />
          <div className="flex-1 overflow-auto">{children}</div>
        </div>
      </AuthGuard>
    </UserProvider>
  )
}
