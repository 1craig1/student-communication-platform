import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, Users } from "lucide-react"
import { DashboardCalendar } from "@/components/dashboard-calendar"

export default function Dashboard() {
  // Sample data
  const groups = [
    {
      id: 1,
      name: "INFO2222 Group 7",
      description: "Web Information Technologies",
      assignments: 2,
      meetings: 1,
    },
    {
      id: 2,
      name: "COMP2123 Study Group",
      description: "Data Structures and Algorithms",
      assignments: 1,
      meetings: 1,
    },
  ]

  const inbox = [
    {
      id: 1,
      from: "university@student.sydney.edu.au",
      subject: "Important: Semester 2 Enrollment Information",
      date: "Mar 28, 10:30 AM",
      important: true,
    },
    {
      id: 2,
      from: "info2222@edstem.org",
      subject: "Assignment 2 Submission Reminder",
      date: "Mar 27, 2:15 PM",
      important: true,
    },
    {
      id: 3,
      from: "library@sydney.edu.au",
      subject: "Your requested book is available",
      date: "Mar 26, 9:00 AM",
      important: false,
    },
    {
      id: 4,
      from: "careers@sydney.edu.au",
      subject: "Upcoming Career Fair",
      date: "Mar 25, 4:45 PM",
      important: false,
    },
  ]

  const tasks = [
    {
      id: 1,
      title: "Finalize project proposal",
      dueDate: new Date(2024, 3, 2), // April 2, 2024
      priority: "high" as const,
    },
    {
      id: 2,
      title: "Review marketing materials",
      dueDate: new Date(2024, 3, 3), // April 3, 2024
      priority: "medium" as const,
    },
    {
      id: 3,
      title: "Team meeting preparation",
      dueDate: new Date(2024, 3, 3), // April 3, 2024
      priority: "medium" as const,
    },
    {
      id: 4,
      title: "Client presentation",
      dueDate: new Date(2024, 3, 5), // April 5, 2024
      priority: "high" as const,
    },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's an overview of your workspace.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {groups.map((group) => (
          <Link href={`/dashboard/groups/${group.id}`} key={group.id}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  {group.name}
                </CardTitle>
                <p className="text-sm text-gray-500">{group.description}</p>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  {group.assignments} Assignments, {group.meetings} Meetings
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              Inbox
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {inbox.map((email) => (
                <div key={email.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium flex items-center">
                      {email.important && <span className="text-amber-500 mr-1 text-xs"></span>}
                      {email.from}
                    </div>
                    <div className="text-xs text-gray-500">{email.date}</div>
                  </div>
                  <p className="text-sm text-gray-700">{email.subject}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Upcoming Tasks</CardTitle>
              <p className="text-sm text-gray-500">Tasks due soon</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {tasks.map((task) => (
                  <div key={task.id} className="p-4 flex items-start">
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 mr-3 ${
                        task.priority === "high"
                          ? "bg-red-500"
                          : task.priority === "medium"
                            ? "bg-amber-500"
                            : "bg-green-500"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-gray-500">
                        Due: {task.dueDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <DashboardCalendar tasks={tasks} />
        </div>
      </div>
    </div>
  )
}
