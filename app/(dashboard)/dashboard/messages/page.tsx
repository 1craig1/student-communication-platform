"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Send, UserPlus, Lock, Video } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import {
  searchUsersByStudentId,
  getUserById,
  getUserContacts,
  getMessagesBetweenUsers,
  sendEncryptedMessage,
  markMessagesAsRead,
  getUnreadMessageCount,
  getLastMessageBetweenUsers,
  type User as UserType,
  type Message as ServiceMessage,
} from "@/lib/auth-service"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { encryptMessage, decryptMessage, signMessage, verifySignature } from "@/lib/security-utils"

type MessageType = {
  id: string
  senderId: string
  recipientId: string
  encryptedText: string
  signature: string
  timestamp: string
  encryptedTextSelf?: string
  signatureSelf?: string
}

interface Contact {
  id: string
  name: string
  initials: string
  avatar?: string
  lastMessage?: string
  lastMessageTime?: string
  unread: number
  online?: boolean
  studentId: string
  publicKey?: string
}

export default function MessagesPage() {
  const { user } = useUser()
  const { toast } = useToast()

  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [messages, setMessages] = useState<MessageType[]>([])
  const [decryptedMessages, setDecryptedMessages] = useState<Map<string, string>>(new Map())
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchingUser, setIsSearchingUser] = useState(false)
  const [userSearchQuery, setUserSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<UserType[]>([])
  const [isVideoCallActive, setIsVideoCallActive] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!user) return
    loadContacts()
  }, [user])

  // Add effect to handle search updates
  useEffect(() => {
    if (userSearchQuery.trim()) {
      handleSearchUser()
    } else {
      setSearchResults([])
    }
  }, [userSearchQuery])

  function getInitials(name: string): string {
    return name.split(" ").map((p) => p[0]).join("").toUpperCase()
  }

  function formatMessageTime(ts: string): string {
    const date = new Date(ts), now = new Date()
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
    const y = new Date(now); y.setDate(now.getDate() - 1)
    if (date.toDateString() === y.toDateString()) {
      return "Yesterday"
    }
    return date.toLocaleDateString()
  }

  function loadContacts() {
    if (!user) return
    const ids = getUserContacts(user.id)
    const list = ids
      .map((id) => {
        const u = getUserById(id)
        if (!u) return null
        const last = getLastMessageBetweenUsers(user.id, id)
        return {
          id: u.id,
          name: u.name,
          initials: getInitials(u.name),
          studentId: u.studentId,
          lastMessage: last ? "Encrypted message" : undefined,
          lastMessageTime: last ? formatMessageTime(last.timestamp) : undefined,
          unread: getUnreadMessageCount(id, user.id),
          online: Math.random() > 0.5,
          publicKey: u.publicKey,
        } as Contact
      })
      .filter(Boolean) as Contact[]

    setContacts(list)
    if (list.length && !selectedContact) {
      handleContactSelect(list[0])
    }
  }

  async function loadMessages(contactId: string) {
    if (!user) return
  
    // 1) Get original message list from server or local
    const svcList = getMessagesBetweenUsers(user.id, contactId)
    const initial: MessageType[] = svcList.map((m) => ({
      id:            m.id!,
      senderId:      m.senderId!,
      recipientId:   contactId,
      encryptedText: m.encryptedText!,
      signature:     m.signature!,
      timestamp:     m.timestamp!,
      // Note: Do not directly read encryptedTextSelf/signatureSelf here
    }))
    setMessages(initial)
  
    // 2) Decrypt and verify signature for each message
    const map = new Map<string, string>()
    for (const msg of initial) {
      if (msg.senderId === user.id) {
        // Sent by self: try to read self-encrypted blob from localStorage
        const raw = localStorage.getItem(`msg-self-${msg.id}`)
        if (raw) {
          try {
            const { encryptedTextSelf } = JSON.parse(raw)
            const text = await decryptMessage(encryptedTextSelf, user.privateKey!)
            map.set(msg.id, text)
            continue
          } catch {
            // If decryption fails, fallback to plaintext
          }
        }
        // Fallback: read your original plaintext
        // const plain = localStorage.getItem(`msg-plain-${msg.id}`)
        // map.set(msg.id, plain ?? "[Cannot display message]")
      } else {
        // Message from others: normal decryption and signature verification
        try {
          const text = await decryptMessage(msg.encryptedText, user.privateKey!)
          const senderPub = getUserById(msg.senderId)!.publicKey!
          const ok = await verifySignature(msg.encryptedText, msg.signature, senderPub)
          map.set(msg.id, ok ? text : "[Signature verification failed]")
        } catch {
          map.set(msg.id, "[Decryption failed]")
        }
      }
    }
    setDecryptedMessages(map)
  
    // 3) Mark as read and update unread count in contacts
    markMessagesAsRead(contactId, user.id)
    setContacts((p) =>
      p.map((c) => (c.id === contactId ? { ...c, unread: 0 } : c))
    )
  
    // 4) Scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  

  async function handleSendMessage() {
    if (!user || !selectedContact || !newMessage.trim()) {
      return
    }
  
    const userId = user.id
    const priv   = user.privateKey!
    const pub    = user.publicKey!
    const peerPub = selectedContact.publicKey!
    
    // 1) Send to server/local
    const svcMsg = await sendEncryptedMessage(
      userId,
      selectedContact.id,
      newMessage,
      priv,
      peerPub
    )
    if (!svcMsg) {
      return toast({ title: "Send failed", variant: "destructive" })
    }
  
    // 2) Encrypt for self and sign, store in localStorage
    const encryptedSelf = await encryptMessage(newMessage, pub)
    const signatureSelf = await signMessage(newMessage, priv)
  
    localStorage.setItem(
      `msg-self-${svcMsg.id}`,
      JSON.stringify({ encryptedTextSelf: encryptedSelf, signatureSelf })
    )
    // Optional: also store plaintext for fallback display
    // localStorage.setItem(`msg-plain-${svcMsg.id}`, newMessage)
  
    // 3) Build full message object and add to React state
    const fullMsg: MessageType = {
      id:            svcMsg.id!,
      senderId:      svcMsg.senderId!,
      recipientId:   selectedContact.id,
      encryptedText: svcMsg.encryptedText!,
      signature:     svcMsg.signature!,
      timestamp:     svcMsg.timestamp!,
      encryptedTextSelf: svcMsg.encryptedText!,
      signatureSelf: svcMsg.signature!,
    }
  
    setMessages((p) => [...p, fullMsg])
    setDecryptedMessages((p) => new Map(p).set(fullMsg.id, newMessage))
    setNewMessage("")
    
    // 4) Update last message and time in contacts list
    setContacts((p) =>
      p.map((c) =>
        c.id === selectedContact.id
          ? {
              ...c,
              lastMessage:     "Encrypted message",
              lastMessageTime: formatMessageTime(fullMsg.timestamp),
            }
          : c
      )
    )
  }
  

  function handleContactSelect(c: Contact) {
    setSelectedContact(c)
    setDecryptedMessages(new Map())
    loadMessages(c.id)
  }

  function handleSearchUser() {
    if (!userSearchQuery.trim()) {
      setSearchResults([])
      return
    }
    const results = searchUsersByStudentId(userSearchQuery).filter(
      (u) => u.id !== user?.id && !contacts.some((c) => c.id === u.id)
    )
    setSearchResults(results)
  }

  function handleAddContact(u: UserType) {
    if (!user) return
    const c: Contact = {
      id: u.id,
      name: u.name,
      initials: getInitials(u.name),
      studentId: u.studentId,
      unread: 0,
      online: Math.random() > 0.5,
      publicKey: u.publicKey,
    }
    setContacts((p) => [c, ...p])
    setIsSearchingUser(false)
    setUserSearchQuery("")
    setSearchResults([])
    handleContactSelect(c)
    toast({ title: "Contact added", description: `${c.name} added.` })
  }

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.studentId.includes(searchQuery)
  )

  async function handleStartVideoCall() {
    if (!selectedContact) return
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }, 
        audio: true 
      })
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
        // Ensure the video starts playing
        await localVideoRef.current.play().catch(console.error)
      }
      
      setIsVideoCallActive(true)
      
      // In a real app, you would:
      // 1. Create a WebRTC peer connection
      // 2. Exchange ICE candidates and SDP with the other user
      // 3. Handle the remote stream
      // For now, we'll just show the local video
    } catch (error) {
      console.error('Error accessing media devices:', error)
      toast({
        title: "Error",
        description: "Could not access camera and microphone",
        variant: "destructive"
      })
    }
  }

  function handleEndVideoCall() {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => {
        track.stop()
        stream.removeTrack(track)
      })
      localVideoRef.current.srcObject = null
    }
    setIsVideoCallActive(false)
  }

  // Add cleanup effect for video call
  useEffect(() => {
    return () => {
      if (localVideoRef.current?.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  if (!user) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full">
      {/* Contacts Pane */}
      <div className="w-80 border-r flex flex-col flex-shrink-0">
        <div className="p-4 border-b">
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search contacts..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="w-full" onClick={() => setIsSearchingUser(true)}>
            <UserPlus className="h-4 w-4 mr-2" /> Add Contact
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length ? (
            filtered.map((c) => (
              <button
                key={c.id}
                className={`w-full text-left p-3 border-b hover:bg-gray-50 flex items-center ${
                  selectedContact?.id === c.id ? "bg-gray-50" : ""
                }`}
                onClick={() => handleContactSelect(c)}
              >
                <Avatar className="h-10 w-10 mr-3">
                  {c.avatar && <AvatarImage src={c.avatar} alt={c.name} />}
                  <AvatarFallback>{c.initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <h3 className="font-medium truncate">{c.name}</h3>
                    <span className="text-xs text-gray-500 ml-2">{c.lastMessageTime}</span>
                  </div>
                  <p className="text-xs text-gray-500">{c.studentId}</p>
                  <p className="text-sm text-gray-600 truncate">{c.lastMessage}</p>
                </div>
                {c.unread > 0 && (
                  <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {c.unread}
                  </span>
                )}
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              {searchQuery ? "No contacts found" : "No contacts yet. Add one to start messaging."}
            </div>
          )}
        </div>
      </div>

      {/* Messages Pane */}
      <div className="flex-1 flex flex-col w-full">
        {selectedContact && (
          <>
            <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  {selectedContact.avatar && <AvatarImage src={selectedContact.avatar} alt={selectedContact.name} />}
                  <AvatarFallback>{selectedContact.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-medium">{selectedContact.name}</h2>
                  <p className="text-xs text-gray-500">
                    {selectedContact.studentId} • {selectedContact.online ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" onClick={() => handleStartVideoCall()}>
                  <Video className="h-4 w-4 mr-2" />
                  Video Call
                </Button>
                <div className="flex items-center text-green-600 text-sm">
                  <Lock className="h-4 w-4 mr-1" /> End-to-end encrypted
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 w-full">
              {messages.length ? (
                messages.map((m) => (
                  <div key={m.id} className={`flex ${m.senderId === user.id ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        m.senderId === user.id ? "bg-primary text-primary-foreground" : "bg-white shadow-sm"
                      }`}
                    >
                      <p>{decryptedMessages.get(m.id) ?? "Decrypting..."}</p>
                      <p className="text-xs mt-1 opacity-70">{formatMessageTime(m.timestamp)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  {contacts.length ? "No messages yet" : "Add a contact to start messaging"}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t bg-white flex-shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="flex items-center space-x-2"
              >
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* Add Contact Dialog */}
      <Dialog open={isSearchingUser} onOpenChange={setIsSearchingUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
            <DialogDescription>Search by student ID or name</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter student ID or name..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="flex-1"
                autoFocus
              />
            </div>
            <div className="max-h-60 overflow-y-auto">
              {searchResults.length ? (
                searchResults.map((r) => (
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
                    <Button size="sm" onClick={() => handleAddContact(r)}>
                      Add
                    </Button>
                  </div>
                ))
              ) : userSearchQuery ? (
                <p className="text-center text-gray-500 py-4">No students found</p>
              ) : (
                <p className="text-center text-gray-500 py-4">Enter query to search</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSearchingUser(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Call Dialog */}
      <Dialog open={isVideoCallActive} onOpenChange={setIsVideoCallActive}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Video Call with {selectedContact?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }} // Mirror the local video
              />
              <div className="absolute bottom-2 left-2 text-white text-sm bg-black/50 px-2 py-1 rounded">
                You
              </div>
            </div>
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 text-white text-sm bg-black/50 px-2 py-1 rounded">
                {selectedContact?.name}
              </div>
            </div>
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            <Button variant="outline" onClick={handleEndVideoCall}>
              End Call
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
