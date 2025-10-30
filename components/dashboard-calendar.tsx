"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Task {
  id: number
  title: string
  dueDate: Date
  priority: "high" | "medium" | "low"
}

interface DashboardCalendarProps {
  tasks: Task[]
}

export function DashboardCalendar({ tasks }: DashboardCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  // Get tasks for the selected date
  const tasksForSelectedDate = tasks.filter(
    (task) => selectedDate && format(task.dueDate, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
  )

  // Get all dates that have tasks
  const datesWithTasks = tasks.map((task) => task.dueDate)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2" />
          Calendar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{ hasTask: datesWithTasks }}
            modifiersStyles={{
              hasTask: { backgroundColor: "rgb(219 234 254)", borderRadius: "9999px" }
            }}
            className="rounded-md border"
          />
          
          <div className="flex-1">
            <h3 className="font-semibold mb-2">
              {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
            </h3>
            {tasksForSelectedDate.length > 0 ? (
              <div className="space-y-2">
                {tasksForSelectedDate.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                    <span className="text-sm">{task.title}</span>
                    <Badge
                      variant={
                        task.priority === "high"
                          ? "destructive"
                          : task.priority === "medium"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No tasks scheduled for this date.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 