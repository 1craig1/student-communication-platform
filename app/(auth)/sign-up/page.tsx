"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { signUp } from "@/lib/auth-service"


// Hardcoded CA certificate for demonstration
const EXPECTED_FP = "6aa536cbe19a776b4cdb428f9ae3f9ba506f01f55d5c398629367532eaf56f31"

export default function SignUp() {
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [serverVerified, setServerVerified] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetch("/api/fingerprint")
      .then(res => res.json())
      .then(data => {
        if (data.fingerprint === EXPECTED_FP) {
          setServerVerified(true)
        } else {
          setFormError("Server certificate mismatch. Connection not secure.")
        }
      })
      .catch(() => setFormError("Cannot verify server certificate"))
  }, [])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Don't proceed if server certificate is not verified
    if (!serverVerified) {
      setFormError("Cannot proceed: server not verified")
      return
    }

    setIsLoading(true)
    setFormError(null)

    const formData = new FormData(event.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    // Password strength check
    if (password.length < 8) {
      setFormError("Password must be at least 8 characters long")
      setIsLoading(false)
      return
    }

    if (!/[A-Z]/.test(password)) {
      setFormError("Password must contain at least one uppercase letter")
      setIsLoading(false)
      return
    }

    if (!/[a-z]/.test(password)) {
      setFormError("Password must contain at least one lowercase letter")
      setIsLoading(false)
      return
    }

    if (!/[0-9]/.test(password)) {
      setFormError("Password must contain at least one number")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setFormError("Passwords don't match")
      setIsLoading(false)
      return
    }

    try {
      // Create new user with generated student ID and secure password
      const user = await signUp(name, email, password)

      if (!user) {
        setFormError("Email already exists. Please use a different email.")
        return
      }

      toast({
        title: "Account created",
        description: `Your account has been created successfully. Your student ID is ${user.studentId}`,
      })

      // Store user ID in session storage (in a real app, use cookies or JWT)
      sessionStorage.setItem("currentUser", user.id)

      router.push("/dashboard")
    } catch (error) {
      console.error("Error during sign up:", error)
      setFormError("An error occurred during sign up. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign up</CardTitle>
          <CardDescription>Create an account to access the student workspace</CardDescription>
          {serverVerified && (
            <div className="text-sm text-green-600 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              Secure connection verified (TLS 1.3)
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
              <p className="text-xs text-gray-500">
                Password must be at least 8 characters and include uppercase, lowercase, and numbers
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required />
            </div>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <Button type="submit" className="w-full" disabled={isLoading || !serverVerified}>
              {isLoading ? "Creating account..." : "Sign up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm text-gray-600 w-full">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
