import { hashPassword, verifyPassword, generateKeyPair } from "./security-utils"

// This simulates a database of users
// In a real application, you would use a proper database like Supabase, Firebase, etc.

export interface User {
  id: string
  name: string
  studentId: string
  email: string
  passwordHash: string // Changed from password to passwordHash
  passwordSalt: string // Added salt for password hashing
  department?: string
  year?: string
  phone?: string
  publicKey?: string // Added for E2EE
  privateKey?: string // Added for E2EE (in a real app, this would be stored client-side only)
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  encryptedText: string // Changed from text to encryptedText
  signature: string // Added for message integrity
  timestamp: string
  read: boolean
}

// Initial users for testing
const users: User[] = [
  {
    id: "1",
    name: "John Doe",
    studentId: "s12345678",
    email: "john.doe@student.edu",
    passwordHash: "", // Will be populated on first run
    passwordSalt: "", // Will be populated on first run
    department: "Computer Science",
    year: "3rd Year",
    phone: "+1 (555) 123-4567",
  },
  {
    id: "2",
    name: "Jane Smith",
    studentId: "s23456789",
    email: "jane.smith@student.edu",
    passwordHash: "", // Will be populated on first run
    passwordSalt: "", // Will be populated on first run
    department: "Information Systems",
    year: "2nd Year",
  },
  {
    id: "3",
    name: "Mike Johnson",
    studentId: "s34567890",
    email: "mike.johnson@student.edu",
    passwordHash: "", // Will be populated on first run
    passwordSalt: "", // Will be populated on first run
    department: "Computer Science",
    year: "4th Year",
  },
  {
    id: "4",
    name: "Sarah Wilson",
    studentId: "s45678901",
    email: "sarah.wilson@student.edu",
    passwordHash: "", // Will be populated on first run
    passwordSalt: "", // Will be populated on first run
    department: "Data Science",
    year: "3rd Year",
  },
]

// Initialize users with hashed passwords and key pairs
async function initializeUsers() {
  for (const user of users) {
    if (!user.passwordHash || !user.passwordSalt) {
      // Default password for testing
      const defaultPassword = "password123"
      const { hash, salt } = await hashPassword(defaultPassword)
      user.passwordHash = hash
      user.passwordSalt = salt
    }

    if (!user.publicKey || !user.privateKey) {
      try {
        // Generate key pair for E2EE
        const { publicKey, privateKey } = await generateKeyPair()
        user.publicKey = publicKey
        user.privateKey = privateKey
      } catch (error) {
        console.error("Error generating key pair:", error)
      }
    }
  }
}

// Call initializeUsers but don't wait for it to complete
// This allows the app to continue loading while keys are being generated
if (typeof window !== "undefined") {
  initializeUsers().catch(console.error)
}

// Store messages between users
const messages: Message[] = []

// Generate a unique student ID
export function generateStudentId(): string {
  // Format: s + 8 random digits
  const randomDigits = Math.floor(10000000 + Math.random() * 90000000).toString()
  const studentId = `s${randomDigits}`

  // Check if the ID already exists
  if (users.some((user) => user.studentId === studentId)) {
    return generateStudentId() // Try again if it exists
  }

  return studentId
}

// Sign up a new user with secure password storage
export async function signUp(name: string, email: string, password: string): Promise<User | null> {
  // Check if email already exists
  if (users.some((user) => user.email === email)) {
    return null
  }

  // Hash the password
  const { hash, salt } = await hashPassword(password)

  // Generate key pair for E2EE
  let publicKey = ""
  let privateKey = ""
  try {
    const keyPair = await generateKeyPair()
    publicKey = keyPair.publicKey
    privateKey = keyPair.privateKey
  } catch (error) {
    console.error("Error generating key pair during signup:", error)
  }

  const newUser: User = {
    id: (users.length + 1).toString(),
    name,
    studentId: generateStudentId(),
    email,
    passwordHash: hash,
    passwordSalt: salt,
    publicKey,
    privateKey,
  }

  users.push(newUser)

  // Save to localStorage for persistence
  saveToLocalStorage()

  return newUser
}

// Sign in a user with secure password verification
export async function signIn(emailOrStudentId: string, password: string): Promise<User | null> {
  // Find user by email or student ID
  const user = users.find((user) => user.email === emailOrStudentId || user.studentId === emailOrStudentId)

  if (!user) return null

  // Verify the password using PBKDF2
  const isPasswordValid = await verifyPassword(password, user.passwordHash, user.passwordSalt)

  return isPasswordValid ? user : null
}

// Get user by ID
export function getUserById(id: string): User | null {
  return users.find((user) => user.id === id) || null
}

// Get user by student ID
export function getUserByStudentId(studentId: string): User | null {
  return users.find((user) => user.studentId === studentId) || null
}

// Search users by student ID (partial match)
export function searchUsersByStudentId(query: string): User[] {
  if (!query) return []
  return users.filter(
    (user) =>
      user.studentId.toLowerCase().includes(query.toLowerCase()) ||
      user.name.toLowerCase().includes(query.toLowerCase()),
  )
}

// Update user profile
export function updateUserProfile(id: string, updates: Partial<User>): User | null {
  const userIndex = users.findIndex((user) => user.id === id)
  if (userIndex === -1) return null

  // Don't allow changing studentId or password directly
  const { studentId, passwordHash, passwordSalt, ...allowedUpdates } = updates

  users[userIndex] = {
    ...users[userIndex],
    ...allowedUpdates,
  }

  // Save to localStorage for persistence
  saveToLocalStorage()

  return users[userIndex]
}

// Update user password with secure hashing
export async function updateUserPassword(id: string, currentPassword: string, newPassword: string): Promise<boolean> {
  const userIndex = users.findIndex((user) => user.id === id)
  if (userIndex === -1) return false

  const user = users[userIndex]

  // Verify current password
  const isCurrentPasswordValid = await verifyPassword(currentPassword, user.passwordHash, user.passwordSalt)
  if (!isCurrentPasswordValid) return false

  // Hash the new password
  const { hash, salt } = await hashPassword(newPassword)

  // Update the user's password hash and salt
  users[userIndex] = {
    ...user,
    passwordHash: hash,
    passwordSalt: salt,
  }

  // Save to localStorage for persistence
  saveToLocalStorage()

  return true
}

// Get all users
export function getAllUsers(): User[] {
  return users
}

// Get all users except the current user
export function getOtherUsers(currentUserId: string): User[] {
  return users.filter((user) => user.id !== currentUserId)
}

// Get user's public key
export function getUserPublicKey(userId: string): string | null {
  const user = getUserById(userId)
  return user?.publicKey || null
}

// Send an encrypted message 
export async function sendEncryptedMessage(
  senderId: string,
  receiverId: string,
  text: string,
  senderPrivateKey: string,
  recipientPublicKey: string,
): Promise<Message | null> {
  try {
    // Import the encryption functions
    const { encryptMessage, signMessage } = await import("./security-utils")

    // Encrypt the message with recipient's public key
    const encryptedText = await encryptMessage(text, recipientPublicKey)

    // Sign the message with sender's private key
    const signature = await signMessage(encryptedText, senderPrivateKey)

    const message: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      senderId,
      receiverId,
      encryptedText,
      signature,
      timestamp: new Date().toISOString(),
      read: false,
    }

    messages.push(message)

    // Save to localStorage for persistence
    saveToLocalStorage()

    return message
  } catch (error) {
    console.error("Error sending encrypted message:", error)
    return null
  }
}

// Get messages between two users
export function getMessagesBetweenUsers(userId1: string, userId2: string): Message[] {
  return messages
    .filter(
      (message) =>
        (message.senderId === userId1 && message.receiverId === userId2) ||
        (message.senderId === userId2 && message.receiverId === userId1),
    )
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
}

// Mark messages as read
export function markMessagesAsRead(senderId: string, receiverId: string): void {
  messages.forEach((message) => {
    if (message.senderId === senderId && message.receiverId === receiverId) {
      message.read = true
    }
  })

  // Save to localStorage for persistence
  saveToLocalStorage()
}

// Get unread message count from a specific sender
export function getUnreadMessageCount(senderId: string, receiverId: string): number {
  return messages.filter(
    (message) => message.senderId === senderId && message.receiverId === receiverId && !message.read,
  ).length
}

// Get contacts for a user (people they've messaged with)
export function getUserContacts(userId: string): string[] {
  const contactIds = new Set<string>()

  messages.forEach((message) => {
    if (message.senderId === userId) {
      contactIds.add(message.receiverId)
    }
    if (message.receiverId === userId) {
      contactIds.add(message.senderId)
    }
  })

  return Array.from(contactIds)
}

// Get the last message between two users
export function getLastMessageBetweenUsers(userId1: string, userId2: string): Message | null {
  const userMessages = getMessagesBetweenUsers(userId1, userId2)
  if (userMessages.length === 0) return null

  return userMessages[userMessages.length - 1]
}

// Load data from localStorage on initialization
function loadFromLocalStorage() {
  try {
    const savedUsers = localStorage.getItem("workspace_users")
    const savedMessages = localStorage.getItem("workspace_messages")

    if (savedUsers) {
      users.length = 0 // Clear the array
      users.push(...JSON.parse(savedUsers))
    }

    if (savedMessages) {
      messages.length = 0 // Clear the array
      messages.push(...JSON.parse(savedMessages))
    }
  } catch (error) {
    console.error("Error loading data from localStorage:", error)
  }
}

// Save data to localStorage
function saveToLocalStorage() {
  try {
    localStorage.setItem("workspace_users", JSON.stringify(users))
    localStorage.setItem("workspace_messages", JSON.stringify(messages))
  } catch (error) {
    console.error("Error saving data to localStorage:", error)
  }
}

// Initialize by loading from localStorage
if (typeof window !== "undefined") {
  loadFromLocalStorage()
}
