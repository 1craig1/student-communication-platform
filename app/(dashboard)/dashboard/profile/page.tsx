"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"
import { useUser } from "@/contexts/user-context"
import { updateUserProfile, updateUserPassword } from "@/lib/auth-service"

export default function ProfilePage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const { user, setUser } = useUser()

  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    department: user?.department || "",
    year: user?.year || "",
  })

  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  const [notifications, setNotifications] = useState({
    email: true,
    assignments: true,
    groupMessages: true,
    announcements: false,
    reminders: true,
  })

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)

    // Update user profile
    const updatedUser = updateUserProfile(user.id, {
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      department: profile.department,
      year: profile.year,
    })

    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false)

      if (updatedUser) {
        setUser(updatedUser)
        toast({
          title: "Profile updated",
          description: "Your profile information has been updated successfully.",
        })
      } else {
        toast({
          title: "Update failed",
          description: "Failed to update profile. Please try again.",
          variant: "destructive",
        })
      }
    }, 1500)
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Password strength validation
    if (password.new.length < 8) {
      toast({
        title: "Password too short",
        description: "New password must be at least 8 characters long.",
        variant: "destructive",
      })
      return
    }

    if (!/[A-Z]/.test(password.new)) {
      toast({
        title: "Password too weak",
        description: "New password must contain at least one uppercase letter.",
        variant: "destructive",
      })
      return
    }

    if (!/[a-z]/.test(password.new)) {
      toast({
        title: "Password too weak",
        description: "New password must contain at least one lowercase letter.",
        variant: "destructive",
      })
      return
    }

    if (!/[0-9]/.test(password.new)) {
      toast({
        title: "Password too weak",
        description: "New password must contain at least one number.",
        variant: "destructive",
      })
      return
    }

    if (password.new !== password.confirm) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Update user password with secure hashing
      const success = await updateUserPassword(user.id, password.current, password.new)

      if (success) {
        toast({
          title: "Password changed",
          description: "Your password has been changed successfully.",
        })
        setPassword({
          current: "",
          new: "",
          confirm: "",
        })
      } else {
        toast({
          title: "Update failed",
          description: "Current password is incorrect. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating password:", error)
      toast({
        title: "Update failed",
        description: "An error occurred while updating your password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Notification preferences updated",
        description: "Your notification preferences have been updated successfully.",
      })
    }, 1500)
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

  if (!user) {
    return <div>Loading profile...</div>
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-gray-500">Manage your account settings and preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <Card className="w-full md:w-64 h-fit">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src="/placeholder.svg" alt="Profile" />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-gray-500">{user.studentId}</p>
              <p className="text-sm text-gray-500 mt-1">{user.department || "No department"}</p>
              <p className="text-sm text-gray-500">{user.year || "No year"}</p>
              <Button variant="outline" className="mt-4 w-full">
                Change Avatar
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex-1">
          <Tabs defaultValue="profile">
            <TabsList className="mb-4">
              <TabsTrigger value="profile">Profile Information</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal information and contact details</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="studentId">Student ID</Label>
                        <Input id="studentId" value={user.studentId} disabled />
                        <p className="text-xs text-gray-500">Student ID cannot be changed</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          value={profile.department}
                          onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="year">Year</Label>
                        <Input
                          id="year"
                          value={profile.year}
                          onChange={(e) => setProfile({ ...profile, year: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button type="submit" className="mt-6" disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your password to keep your account secure</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={password.current}
                          onChange={(e) => setPassword({ ...password, current: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={password.new}
                          onChange={(e) => setPassword({ ...password, new: e.target.value })}
                        />
                        <p className="text-xs text-gray-500">
                          Password must be at least 8 characters and include uppercase, lowercase, and numbers
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={password.confirm}
                          onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button type="submit" className="mt-6" disabled={isLoading}>
                      {isLoading ? "Changing..." : "Change Password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Manage how you receive notifications and alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleNotificationUpdate}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="emailNotifications" className="text-base">
                            Email Notifications
                          </Label>
                          <p className="text-sm text-gray-500">Receive notifications via email</p>
                        </div>
                        <Switch
                          id="emailNotifications"
                          checked={notifications.email}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="assignmentNotifications" className="text-base">
                            Assignment Updates
                          </Label>
                          <p className="text-sm text-gray-500">Notifications about new and due assignments</p>
                        </div>
                        <Switch
                          id="assignmentNotifications"
                          checked={notifications.assignments}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, assignments: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="groupNotifications" className="text-base">
                            Group Messages
                          </Label>
                          <p className="text-sm text-gray-500">Notifications for new group messages</p>
                        </div>
                        <Switch
                          id="groupNotifications"
                          checked={notifications.groupMessages}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, groupMessages: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="announcementNotifications" className="text-base">
                            Announcements
                          </Label>
                          <p className="text-sm text-gray-500">Notifications for course announcements</p>
                        </div>
                        <Switch
                          id="announcementNotifications"
                          checked={notifications.announcements}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, announcements: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="reminderNotifications" className="text-base">
                            Reminders
                          </Label>
                          <p className="text-sm text-gray-500">Notifications for upcoming deadlines and events</p>
                        </div>
                        <Switch
                          id="reminderNotifications"
                          checked={notifications.reminders}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, reminders: checked })}
                        />
                      </div>
                    </div>
                    <Button type="submit" className="mt-6" disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save Preferences"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security and encryption keys</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500 mb-2">
                        Add an extra layer of security to your account by enabling two-factor authentication
                      </p>
                      <Button variant="outline">Enable 2FA</Button>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">Encryption Keys</h3>
                      <p className="text-sm text-gray-500 mb-2">
                        Your messages are end-to-end encrypted. You can regenerate your encryption keys if you suspect they are compromised.
                      </p>
                      <Button variant="outline" disabled>
                        Regenerate Keys (Coming Soon)
                      </Button>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">Account Activity</h3>
                      <p className="text-sm text-gray-500 mb-2">
                        View recent login activity and manage authorized devices.
                      </p>
                      <Button variant="outline" disabled>
                        View Activity (Coming Soon)
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

