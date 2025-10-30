"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CalendarEvent {
  id: string
  title: string
  date: string // YYYY-MM-DD
  time?: string
  description?: string
  courseCode?: string
  type: "class" | "assignment" | "meeting" | "other"
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isAddingEvent, setIsAddingEvent] = useState(false)
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: "",
    date: selectedDate.toISOString().split("T")[0],
    type: "other",
  })

  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: "1",
      title: "INFO1111 Lecture",
      date: "2025-04-02",
      time: "10:00",
      courseCode: "INFO1111",
      type: "class",
    },
    {
      id: "2",
      title: "COMP2123 Tutorial",
      date: "2025-04-03",
      time: "14:30",
      courseCode: "COMP2123",
      type: "class",
    },
    {
      id: "3",
      title: "INFO2222 Assignment",
      date: "2025-04-05",
      time: "18:00",
      courseCode: "INFO2222",
      type: "assignment",
    },
    {
      id: "4",
      title: "111",
      date: "2025-04-07",
      courseCode: "111",
      type: "other",
    },
    {
      id: "5",
      title: "11111",
      date: "2025-04-24",
      courseCode: "11111",
      type: "other",
    },
  ])

  // Calendar navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  // Get day of week for first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  // Format date as YYYY-MM-DD
  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  // Check if a date has events
  const hasEvents = (date: string) => {
    return events.some((event) => event.date === date)
  }

  // Get events for a specific date
  const getEventsForDate = (date: string) => {
    return events.filter((event) => event.date === date)
  }

  // Handle adding a new event
  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date) return

    const event: CalendarEvent = {
      id: `event-${Date.now()}`,
      title: newEvent.title,
      date: newEvent.date,
      time: newEvent.time,
      description: newEvent.description,
      courseCode: newEvent.courseCode,
      type: newEvent.type as "class" | "assignment" | "meeting" | "other",
    }

    setEvents([...events, event])
    setNewEvent({
      title: "",
      date: selectedDate.toISOString().split("T")[0],
      type: "other",
    })

    setIsAddingEvent(false)
  }

  // Render calendar
  const renderCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      const prevMonthDate = new Date(year, month, 0 - (firstDayOfMonth - i - 1))
      days.push(
        <div key={`prev-${i}`} className="p-2 text-center text-gray-400">
          {prevMonthDate.getDate()}
        </div>,
      )
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateString = formatDate(date)
      const isToday = new Date().toDateString() === date.toDateString()
      const isSelected = selectedDate.toDateString() === date.toDateString()
      const dayEvents = getEventsForDate(dateString)

      days.push(
        <div
          key={day}
          className={`p-2 min-h-[80px] border border-gray-100 ${
            isToday ? "bg-blue-50" : ""
          } ${isSelected ? "bg-blue-100" : ""}`}
          onClick={() => {
            setSelectedDate(date)
          }}
        >
          <div className="text-right mb-1">{day}</div>
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map((event) => (
              <div
                key={event.id}
                className={`text-xs p-1 rounded truncate ${
                  event.type === "class"
                    ? "bg-blue-100 text-blue-800"
                    : event.type === "assignment"
                      ? "bg-amber-100 text-amber-800"
                      : event.type === "meeting"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                }`}
              >
                {event.time && `${event.time} · `}
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500 text-center">+{dayEvents.length - 2} more</div>
            )}
          </div>
        </div>,
      )
    }

    // Add empty cells for days after the last day of the month
    const totalCells = Math.ceil((daysInMonth + firstDayOfMonth) / 7) * 7
    for (let i = daysInMonth + firstDayOfMonth; i < totalCells; i++) {
      const nextMonthDate = new Date(year, month + 1, i - daysInMonth - firstDayOfMonth + 1)
      days.push(
        <div key={`next-${i}`} className="p-2 text-center text-gray-400">
          {nextMonthDate.getDate()}
        </div>,
      )
    }

    return days
  }

  // Month names
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  // Day names
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="p-6 w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-gray-500">Manage your schedule and set reminders.</p>
        </div>
        <Button
          onClick={() => {
            setNewEvent({
              ...newEvent,
              date: selectedDate.toISOString().split("T")[0],
            })
            setIsAddingEvent(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Event
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" onClick={prevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {dayNames.map((day) => (
                  <div key={day} className="p-2 text-center font-medium text-gray-500">
                    {day}
                  </div>
                ))}
                {renderCalendar()}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </CardTitle>
              <p className="text-sm text-gray-500">
                {getEventsForDate(formatDate(selectedDate)).length} event
                {getEventsForDate(formatDate(selectedDate)).length !== 1 ? "s" : ""}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getEventsForDate(formatDate(selectedDate)).length > 0 ? (
                  getEventsForDate(formatDate(selectedDate)).map((event) => (
                    <div key={event.id} className="border-l-4 pl-3 py-1 border-l-primary">
                      <h3 className="font-medium">{event.title}</h3>
                      {event.time && <p className="text-sm text-gray-500">{event.time}</p>}
                      {event.description && <p className="text-sm mt-1">{event.description}</p>}
                      {event.courseCode && <p className="text-xs text-gray-500 mt-1">{event.courseCode}</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No events scheduled</p>
                )}
              </div>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => {
                  setNewEvent({
                    ...newEvent,
                    date: selectedDate.toISOString().split("T")[0],
                  })
                  setIsAddingEvent(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Event
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Event Dialog */}
      <Dialog open={isAddingEvent} onOpenChange={setIsAddingEvent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>Create a new event for your calendar</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time (optional)</Label>
                <Input
                  id="time"
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Event Type</Label>
              <Select value={newEvent.type} onValueChange={(value) => setNewEvent({ ...newEvent, type: value as any })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="class">Class</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseCode">Course Code (optional)</Label>
              <Input
                id="courseCode"
                value={newEvent.courseCode}
                onChange={(e) => setNewEvent({ ...newEvent, courseCode: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingEvent(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEvent}>Add Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
