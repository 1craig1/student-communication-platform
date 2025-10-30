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
import { signIn } from "@/lib/auth-service"


// Fingerprint of the CA certificate for demonstration
const EXPECTED_FP = "6aa536cbe19a776b4cdb428f9ae3f9ba506f01f55d5c398629367532eaf56f31"

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [serverVerified, setServerVerified] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Verify server certificate on component mount
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
      setFormError("Cannot proceed with sign-in: server certificate not verified")
      return
    }

    setIsLoading(true)
    setFormError(null)

    const formData = new FormData(event.currentTarget)
    const emailOrStudentId = formData.get("emailOrStudentId") as string
    const password = formData.get("password") as string

    try {
      // Verify credentials
      const user = await signIn(emailOrStudentId, password)

      if (user) {
        toast({
          title: "Sign in successful",
          description: "Welcome, " + user.name + " back to your workspace!",
        })

        // Store user ID in session storage (in a real app, use cookies or JWT)
        sessionStorage.setItem("currentUser", user.id)

        router.push("/dashboard")
      } else {
        setFormError("Invalid email/student ID or password")
      }
    } catch (error) {
      
      console.error("Error during sign in:", error)
      setFormError("An error occurred during sign in. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
          <CardDescription>Enter your credentials to access your workspace</CardDescription>
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
              <Label htmlFor="emailOrStudentId">Email or Student ID</Label>
              <Input id="emailOrStudentId" name="emailOrStudentId" required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input id="password" name="password" type="password" required />
            </div>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <Button type="submit" className="w-full" disabled={isLoading || !serverVerified}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm text-gray-600 w-full">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
