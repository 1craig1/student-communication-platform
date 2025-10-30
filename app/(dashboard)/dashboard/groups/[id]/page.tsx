"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Plus, UserPlus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Member {
  id: string
  name: string
  initials: string
  avatar?: string
}

interface Task {
  id: string
  title: string
  description: string
  dueDate: string
  status: "todo" | "in-progress" | "done"
}

interface Document {
  id: string
  title: string
  modifiedBy: string
  modifiedDate: string
}

interface Meeting {
  id: string
  title: string
  date: string
  time: string
  platform: string
}

export default function GroupDetailPage({ params }: { params: { id: string } }) {
  const groupId = Number.parseInt(params.id)

  // Sample data for the group
  const [group, setGroup] = useState({
    id: groupId,
    name: groupId === 1 ? "INFO2222 Group 7" : "COMP2123 Study Group",
    description:
      groupId === 1 ? "Web Information Technologies Project Group" : "Data Structures and Algorithms Study Group",
  })

  const [members, setMembers] = useState<Member[]>([
    {
      id: "jd",
      name: "John Doe",
      initials: "JD",
    },
    {
      id: "js",
      name: "Jane Smith",
      initials: "JS",
    },
    {
      id: "mj",
      name: "Mike Johnson",
      initials: "MJ",
    },
    {
      id: "sw",
      name: "Sarah Wilson",
      initials: "SW",
    },
  ])

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "task1",
      title: "Complete Project Proposal",
      description: "Draft and submit the initial project proposal",
      dueDate: "Apr 10, 2024",
      status: "in-progress",
    },
    {
      id: "task2",
      title: "Design Database Schema",
      description: "Create the database schema for the project",
      dueDate: "Apr 15, 2024",
      status: "todo",
    },
  ])

  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "doc1",
      title: "Project Requirements",
      modifiedBy: "John Doe",
      modifiedDate: "Mar 28, 10:30 AM",
    },
    {
      id: "doc2",
      title: "Meeting Minutes",
      modifiedBy: "Sarah Wilson",
      modifiedDate: "Mar 27, 2:15 PM",
    },
  ])

  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: "meeting1",
      title: "Weekly Progress Meeting",
      date: "Apr 3, 2024",
      time: "14:00",
      platform: "Zoom",
    },
  ])

  const [isAddingMember, setIsAddingMember] = useState(false)
  const [newMember, setNewMember] = useState("")

  const handleAddMember = () => {
    if (!newMember) return

    // Generate initials from the name
    const initials = newMember
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()

    const member: Member = {
      id: `member-${Date.now()}`,
      name: newMember,
      initials,
    }

    setMembers([...members, member])
    setNewMember("")
    setIsAddingMember(false)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{group.name}</h1>
          <p className="text-gray-500">{group.description}</p>
        </div>
        <Button onClick={() => setIsAddingMember(true)}>
          <UserPlus className="h-4 w-4 mr-2" /> Add Members
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Tasks</CardTitle>
            <p className="text-sm text-gray-500">Group tasks and assignments</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{task.title}</h3>
                    <Badge
                      variant="outline"
                      className={
                        task.status === "done"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : task.status === "in-progress"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                      }
                    >
                      {task.status === "in-progress" ? "in progress" : task.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                  <p className="text-xs text-gray-500">Due: {task.dueDate}</p>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add Task
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Documents</CardTitle>
            <p className="text-sm text-gray-500">Shared files and resources</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="border rounded-md p-4">
                  <div className="flex items-center mb-2">
                    <FileText className="h-5 w-5 mr-2 text-gray-400" />
                    <h3 className="font-medium">{doc.title}</h3>
                  </div>
                  <p className="text-xs text-gray-500">
                    Modified by {doc.modifiedBy} · {doc.modifiedDate}
                  </p>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add Document
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Meetings</CardTitle>
            <p className="text-sm text-gray-500">Upcoming and past meetings</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="border rounded-md p-4">
                  <h3 className="font-medium mb-1">{meeting.title}</h3>
                  <p className="text-sm text-gray-600">
                    {meeting.date} at {meeting.time} · {meeting.platform}
                  </p>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Schedule Meeting
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Members</CardTitle>
            <p className="text-sm text-gray-500">Group participants</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {members.map((member) => (
                <div key={member.id} className="flex items-center p-2 rounded-md hover:bg-gray-50">
                  <Avatar className="h-8 w-8 mr-3">
                    {member.avatar ? <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} /> : null}
                    <AvatarFallback>{member.initials}</AvatarFallback>
                  </Avatar>
                  <span>{member.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Member Dialog */}
      <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Group Member</DialogTitle>
            <DialogDescription>Search for a student by name or ID to add to the group</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="member">Student Name or ID</Label>
              <Input
                id="member"
                placeholder="Search..."
                value={newMember}
                onChange={(e) => setNewMember(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingMember(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember}>Add Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
