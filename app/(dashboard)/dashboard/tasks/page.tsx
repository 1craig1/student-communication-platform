"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Types for our task management
type Priority = "low" | "medium" | "high"
type Status = "todo" | "in-progress" | "done"

interface Task {
  id: string
  title: string
  description: string
  priority: Priority
  status: Status
  dueDate?: string
  courseUnitId: string
}

interface CourseUnit {
  id: string
  code: string
  name: string
  description: string
  tasks: number
  completed: number
}

export default function TasksPage() {
  // Sample data
  const [courseUnits, setCourseUnits] = useState<CourseUnit[]>([
    {
      id: "info1111",
      code: "INFO1111",
      name: "Introduction to Information Technology",
      description: "Introduction to Information Technology",
      tasks: 3,
      completed: 1,
    },
    {
      id: "info2222",
      code: "INFO2222",
      name: "Web Information Technologies",
      description: "Web Information Technologies",
      tasks: 3,
      completed: 0,
    },
    {
      id: "comp2123",
      code: "COMP2123",
      name: "Data Structures and Algorithms",
      description: "Data Structures and Algorithms",
      tasks: 3,
      completed: 0,
    },
    {
      id: "111",
      code: "111",
      name: "11",
      description: "rfgh",
      tasks: 0,
      completed: 0,
    },
    {
      id: "info1111-rfgh",
      code: "info1111",
      name: "rfgh",
      description: "",
      tasks: 0,
      completed: 0,
    },
  ])

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1111",
      title: "1111",
      description: "",
      priority: "low",
      status: "todo",
      courseUnitId: "111",
    },
    {
      id: "group-project",
      title: "Group Project: Website Development",
      description: "Develop a responsive website for a fictional business",
      priority: "high",
      status: "in-progress",
      dueDate: "2025/5/10",
      courseUnitId: "info2222",
    },
    {
      id: "javascript-exercise",
      title: "JavaScript Exercise",
      description: "Complete the JavaScript exercises in Chapter 8",
      priority: "medium",
      status: "in-progress",
      dueDate: "2025/4/8",
      courseUnitId: "info2222",
    },
  ])

  const [selectedCourseUnit, setSelectedCourseUnit] = useState<CourseUnit | null>(
    courseUnits.find((unit) => unit.id === "info2222") || null,
  )

  const [isAddingTask, setIsAddingTask] = useState(false)
  const [isAddingCourseUnit, setIsAddingCourseUnit] = useState(false)
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
  })
  const [newCourseUnit, setNewCourseUnit] = useState<Partial<CourseUnit>>({
    code: "",
    name: "",
    description: "",
  })

  // Filter tasks by selected course unit and status
  const filteredTasks = (status: Status) => {
    if (!selectedCourseUnit) return []
    return tasks.filter((task) => task.courseUnitId === selectedCourseUnit.id && task.status === status)
  }

  const handleAddTask = () => {
    if (!selectedCourseUnit || !newTask.title) return

    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      description: newTask.description || "",
      priority: (newTask.priority as Priority) || "medium",
      status: (newTask.status as Status) || "todo",
      dueDate: newTask.dueDate,
      courseUnitId: selectedCourseUnit.id,
    }

    setTasks([...tasks, task])

    // Update course unit task count
    setCourseUnits(
      courseUnits.map((unit) => (unit.id === selectedCourseUnit.id ? { ...unit, tasks: unit.tasks + 1 } : unit)),
    )

    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      status: "todo",
    })

    setIsAddingTask(false)
  }

  const handleAddCourseUnit = () => {
    if (!newCourseUnit.code || !newCourseUnit.name) return

    const courseUnit: CourseUnit = {
      id: `${newCourseUnit.code}-${Date.now()}`,
      code: newCourseUnit.code,
      name: newCourseUnit.name,
      description: newCourseUnit.description || "",
      tasks: 0,
      completed: 0,
    }

    setCourseUnits([...courseUnits, courseUnit])
    setNewCourseUnit({
      code: "",
      name: "",
      description: "",
    })

    setIsAddingCourseUnit(false)
  }

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, status: Status) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData("taskId")

    // Update task status
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          // If moving to done, update completed count
          if (status === "done" && task.status !== "done") {
            setCourseUnits(
              courseUnits.map((unit) =>
                unit.id === task.courseUnitId ? { ...unit, completed: unit.completed + 1 } : unit,
              ),
            )
          }
          // If moving from done, update completed count
          else if (task.status === "done" && status !== "done") {
            setCourseUnits(
              courseUnits.map((unit) =>
                unit.id === task.courseUnitId ? { ...unit, completed: Math.max(0, unit.completed - 1) } : unit,
              ),
            )
          }
          return { ...task, status }
        }
        return task
      }),
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Course Tasks</h1>
          <p className="text-gray-500">Manage your tasks for each course unit.</p>
        </div>
        <Button onClick={() => setIsAddingTask(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Course Units</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-4 pb-2">
                <Input placeholder="Search courses..." className="mb-4" />
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                {courseUnits.map((unit) => (
                  <button
                    key={unit.id}
                    className={`w-full text-left p-3 hover:bg-gray-50 border-l-4 ${
                      selectedCourseUnit?.id === unit.id ? "border-primary bg-gray-50" : "border-transparent"
                    }`}
                    onClick={() => setSelectedCourseUnit(unit)}
                  >
                    <div className="font-medium">{unit.code}</div>
                    <div className="text-sm text-gray-600">{unit.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {unit.tasks} tasks • {unit.completed} completed
                    </div>
                  </button>
                ))}
              </div>
              <div className="p-4 border-t">
                <Button variant="outline" className="w-full" onClick={() => setIsAddingCourseUnit(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Course Unit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          {selectedCourseUnit && (
            <>
              <div className="mb-4">
                <h2 className="text-2xl font-bold">{selectedCourseUnit.code}</h2>
                <p className="text-gray-600">{selectedCourseUnit.name}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-medium text-gray-500 mb-2">TO DO</h3>
                  <div
                    className="bg-gray-50 rounded-md p-2 min-h-[300px]"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, "todo")}
                  >
                    {filteredTasks("todo").map((task) => (
                      <div
                        key={task.id}
                        className="bg-white p-3 rounded-md shadow-sm mb-2 cursor-move"
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                      >
                        <div className="flex items-center mb-1">
                          <Badge
                            variant="outline"
                            className={`${
                              task.priority === "high"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : task.priority === "medium"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-green-50 text-green-700 border-green-200"
                            }`}
                          >
                            {task.priority}
                          </Badge>
                        </div>
                        <h4 className="font-medium">{task.title}</h4>
                        {task.description && <p className="text-sm text-gray-600 mt-1">{task.description}</p>}
                        {task.dueDate && <p className="text-xs text-gray-500 mt-2">Due: {task.dueDate}</p>}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500 mb-2">IN PROGRESS</h3>
                  <div
                    className="bg-gray-50 rounded-md p-2 min-h-[300px]"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, "in-progress")}
                  >
                    {filteredTasks("in-progress").map((task) => (
                      <div
                        key={task.id}
                        className="bg-white p-3 rounded-md shadow-sm mb-2 cursor-move"
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                      >
                        <div className="flex items-center mb-1">
                          <Badge
                            variant="outline"
                            className={`${
                              task.priority === "high"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : task.priority === "medium"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-green-50 text-green-700 border-green-200"
                            }`}
                          >
                            {task.priority}
                          </Badge>
                        </div>
                        <h4 className="font-medium">{task.title}</h4>
                        {task.description && <p className="text-sm text-gray-600 mt-1">{task.description}</p>}
                        {task.dueDate && <p className="text-xs text-gray-500 mt-2">Due: {task.dueDate}</p>}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500 mb-2">DONE</h3>
                  <div
                    className="bg-gray-50 rounded-md p-2 min-h-[300px]"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, "done")}
                  >
                    {filteredTasks("done").map((task) => (
                      <div
                        key={task.id}
                        className="bg-white p-3 rounded-md shadow-sm mb-2 cursor-move"
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                      >
                        <div className="flex items-center mb-1">
                          <Badge
                            variant="outline"
                            className={`${
                              task.priority === "high"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : task.priority === "medium"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-green-50 text-green-700 border-green-200"
                            }`}
                          >
                            {task.priority}
                          </Badge>
                        </div>
                        <h4 className="font-medium">{task.title}</h4>
                        {task.description && <p className="text-sm text-gray-600 mt-1">{task.description}</p>}
                        {task.dueDate && <p className="text-xs text-gray-500 mt-2">Due: {task.dueDate}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>Create a new task for {selectedCourseUnit?.code}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) => setNewTask({ ...newTask, priority: value as Priority })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingTask(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Course Unit Dialog */}
      <Dialog open={isAddingCourseUnit} onOpenChange={setIsAddingCourseUnit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Course Unit</DialogTitle>
            <DialogDescription>Create a new course unit to organize your tasks</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Course Code</Label>
              <Input
                id="code"
                value={newCourseUnit.code}
                onChange={(e) => setNewCourseUnit({ ...newCourseUnit, code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Course Name</Label>
              <Input
                id="name"
                value={newCourseUnit.name}
                onChange={(e) => setNewCourseUnit({ ...newCourseUnit, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newCourseUnit.description}
                onChange={(e) => setNewCourseUnit({ ...newCourseUnit, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingCourseUnit(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCourseUnit}>Add Course Unit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
