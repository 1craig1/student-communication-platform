"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { type User, getUserById } from "@/lib/auth-service"

interface UserContextType {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load user from session storage on initial render
    const loadUser = () => {
      const userId = sessionStorage.getItem("currentUser")
      if (userId) {
        const loadedUser = getUserById(userId)
        setUser(loadedUser)
      }
      setIsLoading(false)
    }

    loadUser()
  }, [])

  // Update session storage when user changes
  useEffect(() => {
    if (user) {
      sessionStorage.setItem("currentUser", user.id)
    } else {
      sessionStorage.removeItem("currentUser")
    }
  }, [user])

  return <UserContext.Provider value={{ user, isLoading, setUser }}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
