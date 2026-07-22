"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  Monitor,
  Server,
  Shield,
  Database,
  Wifi,
  LayoutDashboard,
  Settings,
  Users,
  LogOut,
  User,
  AlertTriangle,
  CheckCircle,
  Cloud,
  Code,
  Bug,
  Zap,
} from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

// Tilted Card Component
const TiltedCard = ({
  children,
  className = "",
  intensity = 10,
}: { children: React.ReactNode; className?: string; intensity?: number }) => {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const centerX = rect.width / 2
      const centerY = rect.height / 2

      const rotateX = ((y - centerY) / centerY) * -intensity
      const rotateY = ((x - centerX) / centerX) * intensity

      cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
    }
  }

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)"
    }
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-300 ease-out ${className}`}
      style={{
        transformStyle: "preserve-3d",
        transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      }}
    >
      {children}
    </div>
  )
}

// Menu Items
const menuItems = [
  { label: "Dashboard Home", icon: LayoutDashboard, action: "home", description: "System overview and metrics" },
  { label: "Network Infrastructure", icon: Wifi, action: "network", description: "Manage network systems" },
  { label: "Server Management", icon: Server, action: "servers", description: "Monitor server health" },
  { label: "Database Administration", icon: Database, action: "database", description: "Database operations" },
  { label: "Cybersecurity", icon: Shield, action: "security", description: "Security monitoring" },
/*  { label: "System Monitoring", icon: Monitor, action: "monitoring", description: "Real-time system status" },
  { label: "Cloud Services", icon: Cloud, action: "cloud", description: "Cloud infrastructure" },
  { label: "Software Development", icon: Code, action: "development", description: "Development projects" },
  { label: "IT Support Tickets", icon: Bug, action: "support", description: "Help desk management" },
  { label: "Digital Innovation", icon: Zap, action: "innovation", description: "Innovation initiatives" },
  { label: "User Management", icon: Users, action: "users", description: "System user accounts" },
  { label: "Settings", icon: Settings, action: "settings", description: "System preferences" },*/
]

// Mock API Simulators (Replace with real fetch later)
const fetchNetworkStatus = async () => {
  await new Promise((r) => setTimeout(r, 800))
  return [
    { name: "Main Network", status: "Online", latency: "12ms", uptime: "99.98%" },
    { name: "Backup Network", status: "Standby", latency: "—", uptime: "—" },
    { name: "DMZ Network", status: "Online", latency: "18ms", uptime: "99.7%" },
  ]
}

const fetchServers = async () => {
  await new Promise((r) => setTimeout(r, 600))
  return [
    { id: "SRV-001", name: "Web Server", status: "Active", cpu: "42%", memory: "64%" },
    { id: "SRV-002", name: "DB Server", status: "Active", cpu: "78%", memory: "89%" },
    { id: "SRV-003", name: "Backup Server", status: "Maintenance", cpu: "12%", memory: "30%" },
  ]
}

const fetchDatabases = async () => {
  await new Promise((r) => setTimeout(r, 700))
  return [
    { name: "Citizen Records DB", size: "420 GB", status: "Healthy", backups: "Daily" },
    { name: "HR System DB", size: "89 GB", status: "Healthy", backups: "Daily" },
    { name: "Finance DB", size: "210 GB", status: "Warning", backups: "Weekly" },
  ]
}

const fetchSecurityAlerts = async () => {
  await new Promise((r) => setTimeout(r, 500))
  return [
    { id: 1, type: "Brute Force", source: "192.168.10.45", time: "2 min ago", severity: "High" },
    { id: 2, type: "Phishing Email", source: "user@external.com", time: "15 min ago", severity: "Medium" },
    { id: 3, type: "Suspicious Login", source: "103.21.44.12", time: "1 hour ago", severity: "High" },
  ]
}

const fetchCloudServices = async () => {
  await new Promise((r) => setTimeout(r, 600))
  return [
    { provider: "AWS", service: "EC2", status: "Running", region: "us-east-1" },
    { provider: "Azure", service: "Blob Storage", status: "Healthy", region: "East US" },
    { provider: "GCP", service: "Cloud SQL", status: "Maintenance", region: "asia-southeast1" },
  ]
}

const fetchDevProjects = async () => {
  await new Promise((r) => setTimeout(r, 500))
  return [
    { name: "E-Gov Portal v2", lead: "Alice T.", progress: 75, status: "In Progress" },
    { name: "Digital ID System", lead: "Bob L.", progress: 30, status: "Planning" },
    { name: "AI Chatbot", lead: "Carol M.", progress: 90, status: "Testing" },
  ]
}

const fetchSupportTickets = async () => {
  await new Promise((r) => setTimeout(r, 400))
  return [
    { id: "TICK-1001", subject: "Printer Not Working", user: "John D.", priority: "Low", status: "Open" },
    { id: "TICK-1002", subject: "Email Access Issue", user: "Sarah K.", priority: "High", status: "In Progress" },
    { id: "TICK-1003", subject: "Software Installation", user: "Mike R.", priority: "Medium", status: "Open" },
  ]
}

const fetchInnovationInitiatives = async () => {
  await new Promise((r) => setTimeout(r, 500))
  return [
    { title: "Blockchain for Records", phase: "Research", impact: "High" },
    { title: "Smart City IoT Network", phase: "Pilot", impact: "Critical" },
    { title: "AI-Powered Analytics", phase: "Design", impact: "Medium" },
  ]
}

const fetchUsers = async () => {
  await new Promise((r) => setTimeout(r, 600))
  return [
    { name: "Alice Thompson", role: "Admin", dept: "IT", status: "Active" },
    { name: "Bob Lee", role: "User", dept: "Finance", status: "Active" },
    { name: "Carol Martinez", role: "Auditor", dept: "Compliance", status: "Inactive" },
  ]
}

const ITICTDashboard = () => {
  const [activeSection, setActiveSection] = useState("home")
  const router = useRouter()
  const [user, setUser] = useState<{
    name: string
    employeeId: string
    email: string
    role: string
    department: string
  } | null>(null)

  // Data states
  const [networkData, setNetworkData] = useState<any[]>([])
  const [serverData, setServerData] = useState<any[]>([])
  const [dbData, setDbData] = useState<any[]>([])
  const [securityData, setSecurityData] = useState<any[]>([])
  const [cloudData, setCloudData] = useState<any[]>([])
  const [devData, setDevData] = useState<any[]>([])
  const [ticketData, setTicketData] = useState<any[]>([])
  const [innovationData, setInnovationData] = useState<any[]>([])
  const [userData, setUserData] = useState<any[]>([])

  // Loading states
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      //router.push("/login")
      return
    }

    try {
      const parsed = JSON.parse(storedUser)
      setUser({
        name: parsed.name || "IT Manager",
        email: parsed.email || "it.manager@gov.ministry.com",
        role: "IT/ICT Manager",
        employeeId: parsed.employeeId || "IT001",
        department: "Information Technology",
      })
    } catch (err) {
      console.error("Invalid user in localStorage:", err)
      localStorage.removeItem("user")
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  // Load data when section is clicked
  const loadData = async (section: string) => {
    if (loading[section]) return
    setLoading((prev) => ({ ...prev, [section]: true }))

    try {
      switch (section) {
        case "network":
          const network = await fetchNetworkStatus()
          setNetworkData(network)
          break
        case "servers":
          const servers = await fetchServers()
          setServerData(servers)
          break
        case "database":
          const dbs = await fetchDatabases()
          setDbData(dbs)
          break
        case "security":
          const alerts = await fetchSecurityAlerts()
          setSecurityData(alerts)
          break
        case "cloud":
          const cloud = await fetchCloudServices()
          setCloudData(cloud)
          break
        case "development":
          const dev = await fetchDevProjects()
          setDevData(dev)
          break
        case "support":
          const tickets = await fetchSupportTickets()
          setTicketData(tickets)
          break
        case "innovation":
          const innovations = await fetchInnovationInitiatives()
          setInnovationData(innovations)
          break
        case "users":
          const users = await fetchUsers()
          setUserData(users)
          break
        default:
          break
      }
    } catch (err) {
      console.error(`Failed to load ${section}:`, err)
    } finally {
      setLoading((prev) => ({ ...prev, [section]: false }))
    }
  }

  const handleSectionClick = (section: string) => {
    setActiveSection(section)
    // Only load data if not already loaded or needs refresh
    if (!loading[section] && !getDataForSection(section)?.length) {
      loadData(section)
    }
  }

  const getDataForSection = (section: string) => {
    switch (section) {
      case "network": return networkData
      case "servers": return serverData
      case "database": return dbData
      case "security": return securityData
      case "cloud": return cloudData
      case "development": return devData
      case "support": return ticketData
      case "innovation": return innovationData
      case "users": return userData
      default: return []
    }
  }

  const renderContent = () => {
    const data = getDataForSection(activeSection)
    const isLoading = loading[activeSection]

    switch (activeSection) {
      case "home":
        return (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-[#1E40AF] to-[#1D4ED8] rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}! 💻</h1>
                  <p className="text-blue-100 text-lg mb-4">
                    IT/ICT Management Dashboard - Monitor systems and infrastructure
                  </p>
                  <div className="flex items-center gap-6 text-blue-100">
                    <div className="flex items-center gap-2">
                      <Monitor size={20} />
                      <span>IT Department</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield size={20} />
                      <span>System Security</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Server size={20} />
                      <span>Infrastructure</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <TiltedCard className="p-6 bg-white rounded-xl shadow-lg border hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">System Uptime</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">99.8%</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle size={24} className="text-green-600" />
                  </div>
                </div>
              </TiltedCard>

              <TiltedCard className="p-6 bg-white rounded-xl shadow-lg border hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Servers</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">24</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Server size={24} className="text-blue-600" />
                  </div>
                </div>
              </TiltedCard>

              <TiltedCard className="p-6 bg-white rounded-xl shadow-lg border hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Security Alerts</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">3</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle size={24} className="text-yellow-600" />
                  </div>
                </div>
              </TiltedCard>

              <TiltedCard className="p-6 bg-white rounded-xl shadow-lg border hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Support Tickets</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">12</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Bug size={24} className="text-purple-600" />
                  </div>
                </div>
              </TiltedCard>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {menuItems.slice(5, 8).map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.action}
                      onClick={() => handleSectionClick(item.action)}
                      className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon size={20} className="text-blue-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">{item.label}</div>
                        <div className="text-sm text-gray-600">{item.description}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )

      case "network":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Network Infrastructure</h2>
            {isLoading ? (
              <div className="text-center py-8">Loading network status...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.map((net, i) => (
                  <div key={i} className="bg-white p-6 rounded-xl shadow border">
                    <h3 className="font-semibold mb-4">{net.name}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span>Status:</span> <span className={net.status === "Online" ? "text-green-600" : "text-yellow-600"}>{net.status}</span></div>
                      <div className="flex justify-between"><span>Latency:</span> <span>{net.latency}</span></div>
                      <div className="flex justify-between"><span>Uptime:</span> <span>{net.uptime}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case "servers":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Server Management</h2>
            {isLoading ? (
              <div className="text-center py-8">Loading server data...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">CPU</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Memory</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.map((srv, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-4">{srv.id}</td>
                        <td className="px-6 py-4 font-medium">{srv.name}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${srv.status === "Active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                            {srv.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">{srv.cpu}</td>
                        <td className="px-6 py-4">{srv.memory}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )

      case "database":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Database Administration</h2>
            {isLoading ? (
              <div className="text-center py-8">Loading database info...</div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {data.map((db, i) => (
                  <div key={i} className="bg-white p-6 rounded-xl shadow border">
                    <h3 className="font-bold text-lg mb-2">{db.name}</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div><strong>Size:</strong> {db.size}</div>
                      <div><strong>Status:</strong> <span className={db.status === "Healthy" ? "text-green-600" : "text-yellow-600"}>{db.status}</span></div>
                      <div><strong>Backups:</strong> {db.backups}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      // Add more cases similarly...
      // For brevity, I’ll show one more full example and summarize others.

      case "security":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Cybersecurity Alerts</h2>
            {isLoading ? (
              <div className="text-center py-8">Scanning for threats...</div>
            ) : (
              <div className="space-y-4">
                {data.map((alert) => (
                  <div key={alert.id} className="bg-white p-5 rounded-xl shadow border-l-4 border-red-500">
                    <div className="flex justify-between">
                      <h3 className="font-semibold text-red-700">{alert.type}</h3>
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">{alert.severity}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">From: {alert.source}</p>
                    <p className="text-xs text-gray-500">{alert.time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="text-center py-10 text-gray-500">
            <h3 className="text-xl font-medium">No data available for {activeSection}</h3>
            <p>Select a section from the sidebar.</p>
          </div>
        )
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-72 bg-white shadow-lg border-r flex flex-col"
      >
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <Monitor size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">IT/ICT Portal</h2>
              <p className="text-sm text-gray-600">Technology Management Hub</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.action

            return (
              <button
                key={item.action}
                onClick={() => handleSectionClick(item.action)}
                className={`w-full text-left flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Icon size={20} />
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className={`text-xs ${isActive ? "text-blue-100" : "text-gray-500"}`}>{item.description}</div>
                </div>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{user?.name}</div>
              <div className="text-sm text-gray-600">IT/ICT Manager</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {menuItems.find((item) => item.action === activeSection)?.label || "Dashboard"}
            </h1>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">{renderContent()}</div>
      </main>
    </div>
  )
}

export default ITICTDashboard