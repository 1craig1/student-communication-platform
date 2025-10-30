"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Upload, Search, Folder, File, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUser } from "@/contexts/user-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { searchUsersByStudentId, type User as UserType } from "@/lib/auth-service"

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

interface Document {
  id: string
  name: string
  type: string
  size: string
  uploadedAt: Date
  uploadedBy: string
  category: string
  sharedWith?: string[] // Array of user IDs this document is shared with
}

// Helper function to load documents from localStorage
function loadDocuments(): Document[] {
  if (typeof window === 'undefined') return []
  const storedDocs = localStorage.getItem('documents')
  if (!storedDocs) return []
  return JSON.parse(storedDocs).map((doc: any) => ({
    ...doc,
    uploadedAt: new Date(doc.uploadedAt)
  }))
}

// Helper function to save documents to localStorage
function saveDocuments(docs: Document[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem('documents', JSON.stringify(docs))
}

export default function DocumentsPage() {
  const { user } = useUser()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [documents, setDocuments] = useState<Document[]>(() => {
    // Initialize with default documents if none exist in localStorage
    const storedDocs = loadDocuments()
    if (storedDocs.length === 0) {
      const defaultDocs = [
        {
          id: "1",
          name: "Project Proposal.pdf",
          type: "pdf",
          size: "2.4 MB",
          uploadedAt: new Date(2024, 2, 15),
          uploadedBy: "John Doe",
          category: "Projects",
        },
        {
          id: "2",
          name: "Meeting Notes.docx",
          type: "docx",
          size: "1.2 MB",
          uploadedAt: new Date(2024, 2, 20),
          uploadedBy: "Jane Smith",
          category: "Meetings",
        },
        {
          id: "3",
          name: "Research Paper.pdf",
          type: "pdf",
          size: "4.8 MB",
          uploadedAt: new Date(2024, 2, 25),
          uploadedBy: "Mike Johnson",
          category: "Research",
        },
      ]
      saveDocuments(defaultDocs)
      return defaultDocs
    }
    return storedDocs
  })
  const [isSharing, setIsSharing] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [shareSearchQuery, setShareSearchQuery] = useState("")
  const [shareSearchResults, setShareSearchResults] = useState<UserType[]>([])

  const categories = ["All", "Projects", "Meetings", "Research", "Assignments"]

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === null || doc.category === selectedCategory
    const isSharedWithMe = doc.sharedWith?.includes(user?.id || "")
    return (matchesSearch && matchesCategory) || isSharedWithMe
  })

  const handleShare = (doc: Document) => {
    setSelectedDoc(doc)
    setIsSharing(true)
  }

  const handleShareSearch = () => {
    if (!shareSearchQuery.trim()) {
      setShareSearchResults([])
      return
    }
    const results = searchUsersByStudentId(shareSearchQuery).filter(
      (u) => u.id !== user?.id && !selectedDoc?.sharedWith?.includes(u.id)
    )
    setShareSearchResults(results)
  }

  const handleShareWithUser = (userToShare: UserType) => {
    if (!selectedDoc) return

    const updatedDocs = documents.map(doc =>
      doc.id === selectedDoc.id
        ? {
            ...doc,
            sharedWith: [...(doc.sharedWith || []), userToShare.id],
          }
        : doc
    )

    setDocuments(updatedDocs)
    saveDocuments(updatedDocs)

    setShareSearchQuery("")
    setShareSearchResults([])
    toast({
      title: "Document shared",
      description: `Shared "${selectedDoc.name}" with ${userToShare.name}`,
    })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const file = files[0]
      
      // Create a new document object
      const newDoc: Document = {
        id: Date.now().toString(),
        name: file.name,
        type: file.name.split('.').pop()?.toLowerCase() || 'unknown',
        size: formatFileSize(file.size),
        uploadedAt: new Date(),
        uploadedBy: user?.name || "You",
        category: "Projects", // Default category, could be made selectable
      }

      // Add the new document to the list and save to localStorage
      const updatedDocs = [newDoc, ...documents]
      setDocuments(updatedDocs)
      saveDocuments(updatedDocs)

      // Reset the file input
      event.target.value = ''
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Documents</h1>
        <p className="text-gray-500">Manage and organize your documents</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2">
            <Folder className="h-4 w-4" />
            New Folder
          </Button>
          <Button className="gap-2 relative">
            <Upload className="h-4 w-4" />
            Upload
            <Input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
            />
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6 overflow-x-auto">
        {categories.map((category) => (
          <Button
            key={category}
            onClick={() => setSelectedCategory(category === "All" ? null : category)}
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map((doc) => (
          <Card key={doc.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <CardTitle className="text-lg truncate">{doc.name}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="h-8 w-8 p-0 flex-shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Download</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare(doc)}>Share</DropdownMenuItem>
                    <DropdownMenuItem>Move to folder</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500 space-y-1">
                <p>Size: {doc.size}</p>
                <p>Uploaded: {doc.uploadedAt.toLocaleDateString()}</p>
                <p>By: {doc.uploadedBy}</p>
                <p>Category: {doc.category}</p>
                {doc.sharedWith && doc.sharedWith.length > 0 && (
                  <p className="text-blue-500">Shared with {doc.sharedWith.length} people</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isSharing} onOpenChange={setIsSharing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Document</DialogTitle>
            <DialogDescription>Search for users to share with</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Search by student ID or name..."
                value={shareSearchQuery}
                onChange={(e) => {
                  setShareSearchQuery(e.target.value)
                  handleShareSearch()
                }}
                className="flex-1"
                autoFocus
              />
            </div>
            <div className="max-h-60 overflow-y-auto">
              {shareSearchResults.length ? (
                shareSearchResults.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarFallback>{getInitials(r.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{r.name}</p>
                        <p className="text-xs text-gray-500">{r.studentId}</p>
                      </div>
                    </div>
                    <Button onClick={() => handleShareWithUser(r)}>
                      Share
                    </Button>
                  </div>
                ))
              ) : shareSearchQuery ? (
                <p className="text-center text-gray-500 py-4">No users found</p>
              ) : (
                <p className="text-center text-gray-500 py-4">Enter query to search</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
