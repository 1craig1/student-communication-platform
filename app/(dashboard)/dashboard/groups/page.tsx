"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, MessageSquare, Plus, Users } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"

interface Group {
  id: number
  name: string
  description: string
  type: string
  members: number
  tasks: number
  documents: number
  meetings: number
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([
    {
      id: 1,
      name: "INFO2222 Group 7",
      description: "Web Information Technologies Project Group",
      type: "Project Group",
      members: 4,
      tasks: 2,
      documents: 2,
      meetings: 1,
    },
    {
      id: 2,
      name: "COMP2123 Study Group",
      description: "Data Structures and Algorithms Study Group",
      type: "Study Group",
      members: 3,
      tasks: 1,
      documents: 1,
      meetings: 1,
    },
  ])

  const [isAddingGroup, setIsAddingGroup] = useState(false)
  const [newGroup, setNewGroup] = useState<Partial<Group>>({
    name: "",
    description: "",
    type: "Project Group",
  })

  const handleAddGroup = () => {
    if (!newGroup.name) return

    const group: Group = {
      id: Date.now(),
      name: newGroup.name,
      description: newGroup.description || "",
      type: newGroup.type || "Project Group",
      members: 1, // Current user
      tasks: 0,
      documents: 0,
      meetings: 0,
    }

    setGroups([...groups, group])
    setNewGroup({
      name: "",
      description: "",
      type: "Project Group",
    })

    setIsAddingGroup(false)
  }

  return (
    <div className="p-6 w-screen min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Groups</h1>
          <p className="text-gray-500">Manage your study groups and project teams.</p>
        </div>
        <Button onClick={() => setIsAddingGroup(true)}>
          <Plus className="h-4 w-4 mr-2" /> Create Group
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map((group) => (
          <Link href={`/dashboard/groups/${group.id}`} key={group.id}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{group.name}</CardTitle>
                <p className="text-sm text-gray-500">{group.description}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{group.members} members</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <FileText className="h-5 w-5 mb-1 text-gray-400" />
                    <div className="text-lg font-medium">{group.tasks}</div>
                    <div className="text-xs text-gray-500">Tasks</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <FileText className="h-5 w-5 mb-1 text-gray-400" />
                    <div className="text-lg font-medium">{group.documents}</div>
                    <div className="text-xs text-gray-500">Documents</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <MessageSquare className="h-5 w-5 mb-1 text-gray-400" />
                    <div className="text-lg font-medium">{group.meetings}</div>
                    <div className="text-xs text-gray-500">Meetings</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Add Group Dialog */}
      <Dialog open={isAddingGroup} onOpenChange={setIsAddingGroup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>Create a new study group or project team</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Group Type</Label>
              <Input
                id="type"
                value={newGroup.type}
                onChange={(e) => setNewGroup({ ...newGroup, type: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingGroup(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddGroup}>Create Group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
