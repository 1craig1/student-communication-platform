"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, MessageSquare, ListTodo, Calendar, Users, FileText, LogOut, User } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUser } from "@/contexts/user-context"

export function MainSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, setUser } = useUser()

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      current: pathname === "/dashboard",
    },
    {
      name: "Messages",
      href: "/dashboard/messages",
      icon: MessageSquare,
      current: pathname === "/dashboard/messages",
    },
    {
      name: "Tasks",
      href: "/dashboard/tasks",
      icon: ListTodo,
      current: pathname === "/dashboard/tasks",
    },
    {
      name: "Calendar",
      href: "/dashboard/calendar",
      icon: Calendar,
      current: pathname === "/dashboard/calendar",
    },
    {
      name: "Groups",
      href: "/dashboard/groups",
      icon: Users,
      current: pathname.startsWith("/dashboard/groups"),
    },
    {
      name: "Documents",
      href: "/dashboard/documents",
      icon: FileText,
      current: pathname === "/dashboard/documents",
    },
  ]

  const handleSignOut = () => {
    // Clear user from context and session storage
    setUser(null)
    sessionStorage.removeItem("currentUser")
    router.push("/sign-in")
  }

  // Get user initials for avatar
  const getInitials = () => {
    if (!user?.name) return "U"
    return user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="p-4">
          <h1 className="text-xl font-bold">WorkSpace</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navigation.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild isActive={item.current}>
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center w-full space-x-3 hover:bg-gray-100 rounded-md p-2 transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" alt={user?.name || "User"} />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{user?.name || "User"}</p>
                <p className="text-xs text-gray-500">{user?.studentId || ""}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
