"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  DollarSign,
  TrendingUp,
  PieChart,
  Calculator,
  FileText,
  CreditCard,
  Wallet,
  LayoutDashboard,
  Settings,
  LogOut,
  User,
  Receipt,
  Banknote,
  Target,
  CheckCircle,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
} from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

// Tilted Card Component (Unchanged)
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

// Sidebar Menu
const menuItems = [
  { label: "Dashboard Home", icon: LayoutDashboard, action: "home", description: "Financial overview and metrics" },
  { label: "Budget Management", icon: Calculator, action: "budget", description: "Manage departmental budgets" },
  { label: "Expense Tracking", icon: Receipt, action: "expenses", description: "Track and approve expenses" },
  { label: "Revenue Analysis", icon: TrendingUp, action: "revenue", description: "Revenue reports and analysis" },
  { label: "Financial Reports", icon: FileText, action: "reports", description: "Generate financial reports" },
 // { label: "Procurement", icon: CreditCard, action: "procurement", description: "Purchase orders and contracts" },
  { label: "Payroll Management", icon: Banknote, action: "payroll", description: "Employee salary management" },
  /*{ label: "Audit & Compliance", icon: CheckCircle, action: "audit", description: "Financial audits and compliance" },
  { label: "Treasury Operations", icon: Wallet, action: "treasury", description: "Cash flow and investments" },
  { label: "Cost Analysis", icon: PieChart, action: "analysis", description: "Cost breakdown and analysis" },
  { label: "Financial Planning", icon: Target, action: "planning", description: "Strategic financial planning" },
  { label: "Settings", icon: Settings, action: "settings", description: "Financial system settings" },*/
]

// Mock API Functions
const fetchBudgets = async () => {
  await new Promise(r => setTimeout(r, 700))
  return [
    { dept: "HR", allocated: 2500000, spent: 1800000, utilization: "72%" },
    { dept: "IT", allocated: 3200000, spent: 2700000, utilization: "84%" },
    { dept: "Operations", allocated: 4100000, spent: 3100000, utilization: "76%" },
    { dept: "Marketing", allocated: 3000000, spent: 1200000, utilization: "40%" },
  ]
}

const fetchExpenses = async () => {
  await new Promise(r => setTimeout(r, 600))
  return [
    { id: "EXP-1001", dept: "IT", amount: "$4,200", status: "Pending", date: "2024-04-05" },
    { id: "EXP-1002", dept: "HR", amount: "$1,800", status: "Approved", date: "2024-04-04" },
    { id: "EXP-1003", dept: "Ops", amount: "$3,500", status: "Pending", date: "2024-04-03" },
  ]
}

const fetchRevenue = async () => {
  await new Promise(r => setTimeout(r, 500))
  return {
    total: "$8.7M",
    growth: "+12.4%",
    quarterly: [
      { quarter: "Q1", revenue: "$2.0M" },
      { quarter: "Q2", revenue: "$2.2M" },
      { quarter: "Q3", revenue: "$2.1M" },
      { quarter: "Q4", revenue: "$2.4M" },
    ],
    sources: [
      { source: "Grants", amount: "$3.2M", color: "bg-blue-500" },
      { source: "Fees", amount: "$2.8M", color: "bg-green-500" },
      { source: "Taxes", amount: "$2.7M", color: "bg-purple-500" },
    ],
  }
}

const fetchReports = async () => {
  await new Promise(r => setTimeout(r, 400))
  return [
    { name: "Annual Financial Report 2023", type: "PDF", size: "4.2 MB", generated: "Jan 15, 2024" },
    { name: "Monthly Budget Summary", type: "XLSX", size: "1.1 MB", generated: "Apr 1, 2024" },
    { name: "Audit Compliance Report", type: "PDF", size: "3.8 MB", generated: "Mar 20, 2024" },
  ]
}

const fetchProcurement = async () => {
  await new Promise(r => setTimeout(r, 600))
  return [
    { po: "PO-2001", vendor: "Tech Solutions Inc.", amount: "$120,000", status: "Approved" },
    { po: "PO-2002", vendor: "Office Supplies Ltd", amount: "$15,000", status: "Pending" },
    { po: "PO-2003", vendor: "Cloud Services Co", amount: "$89,000", status: "Shipped" },
  ]
}

const fetchPayroll = async () => {
  await new Promise(r => setTimeout(r, 500))
  return {
    nextRun: "2024-04-10",
    employeesPaid: 247,
    totalAmount: "$684,200",
    pendingAdjustments: 3,
    history: [
      { month: "Mar 2024", amount: "$672,100", status: "Completed" },
      { month: "Feb 2024", amount: "$668,900", status: "Completed" },
    ],
  }
}

const fetchAudit = async () => {
  await new Promise(r => setTimeout(r, 700))
  return {
    status: "In Progress",
    lastAudit: "Jan 15, 2024",
    findings: [
      { issue: "Missing Receipts", severity: "Medium", dept: "Travel", resolved: false },
      { issue: "Budget Overrun", severity: "High", dept: "IT", resolved: false },
      { issue: "Vendor Compliance", severity: "Low", dept: "Procurement", resolved: true },
    ],
    nextAudit: "Jul 2024",
  }
}

const fetchTreasury = async () => {
  await new Promise(r => setTimeout(r, 600))
  return {
    cashBalance: "$4.2M",
    investments: "$12.8M",
    liquidityRatio: "1.8x",
    recentTransactions: [
      { date: "2024-04-01", type: "Deposit", amount: "+$1.2M", account: "Main Operating" },
      { date: "2024-04-03", type: "Withdrawal", amount: "-$850K", account: "Capital Projects" },
    ],
  }
}

const fetchCostAnalysis = async () => {
  await new Promise(r => setTimeout(r, 500))
  return [
    { category: "Personnel", percentage: 58, amount: "$7.4M", color: "bg-red-500" },
    { category: "Operations", percentage: 22, amount: "$2.8M", color: "bg-yellow-500" },
    { category: "Technology", percentage: 12, amount: "$1.5M", color: "bg-blue-500" },
    { category: "Admin & Overhead", percentage: 8, amount: "$1.0M", color: "bg-gray-500" },
  ]
}

const fetchFinancialPlanning = async () => {
  await new Promise(r => setTimeout(r, 600))
  return [
    { goal: "Reduce Costs by 10%", target: "Dec 2024", progress: 65, status: "On Track" },
    { goal: "Increase Grants by 15%", target: "Q3 2024", progress: 40, status: "Delayed" },
    { goal: "Digital Transformation Fund", target: "Jun 2024", progress: 80, status: "On Track" },
  ]
}

// Main Component
const FinanceDashboard = () => {
  const [activeSection, setActiveSection] = useState("home")
  const router = useRouter()
  const [user, setUser] = useState<{
    name: string
    employeeId: string
    email: string
    role: string
    department: string
  } | null>(null)

  // Data States
  const [budgetData, setBudgetData] = useState<any[]>([])
  const [expenseData, setExpenseData] = useState<any[]>([])
  const [revenueData, setRevenueData] = useState<any>(null)
  const [reportData, setReportData] = useState<any[]>([])
  const [procurementData, setProcurementData] = useState<any[]>([])
  const [payrollData, setPayrollData] = useState<any>(null)
  const [auditData, setAuditData] = useState<any>(null)
  const [treasuryData, setTreasuryData] = useState<any>(null)
  const [costData, setCostData] = useState<any[]>([])
  const [planningData, setPlanningData] = useState<any[]>([])

  // Loading State
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
     // router.push("/login")
      return
    }

    try {
      const parsed = JSON.parse(storedUser)
      setUser({
        name: parsed.name || "Finance Manager",
        email: parsed.email || "finance.manager@gov.ministry.com",
        role: "Finance Manager",
        employeeId: parsed.employeeId || "FIN001",
        department: "Finance & Budget",
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

  // Load Data Function
  const loadData = async (section: string) => {
    if (loading[section]) return
    setLoading(prev => ({ ...prev, [section]: true }))

    try {
      switch (section) {
        case "budget":
          setBudgetData(await fetchBudgets()); break
        case "expenses":
          setExpenseData(await fetchExpenses()); break
        case "revenue":
          setRevenueData(await fetchRevenue()); break
        case "reports":
          setReportData(await fetchReports()); break
        case "procurement":
          setProcurementData(await fetchProcurement()); break
        case "payroll":
          setPayrollData(await fetchPayroll()); break
        case "audit":
          setAuditData(await fetchAudit()); break
        case "treasury":
          setTreasuryData(await fetchTreasury()); break
        case "analysis":
          setCostData(await fetchCostAnalysis()); break
        case "planning":
          setPlanningData(await fetchFinancialPlanning()); break
        default:
          break
      }
    } catch (err) {
      console.error(`Failed to load ${section}`, err)
    } finally {
      setLoading(prev => ({ ...prev, [section]: false }))
    }
  }

  const handleSectionClick = (section: string) => {
    setActiveSection(section)
    const dataMap: Record<string, any[]> = {
      budget: budgetData,
      expenses: expenseData,
      revenue: revenueData ? [revenueData] : [],
      reports: reportData,
      procurement: procurementData,
      payroll: payrollData ? [payrollData] : [],
      audit: auditData ? [auditData] : [],
      treasury: treasuryData ? [treasuryData] : [],
      analysis: costData,
      planning: planningData,
    }
    if (!dataMap[section]?.length && !loading[section]) {
      loadData(section)
    }
  }

  const getData = (section: string) => {
    switch (section) {
      case "budget": return budgetData
      case "expenses": return expenseData
      case "revenue": return revenueData
      case "reports": return reportData
      case "procurement": return procurementData
      case "payroll": return payrollData
      case "audit": return auditData
      case "treasury": return treasuryData
      case "analysis": return costData
      case "planning": return planningData
      default: return []
    }
  }

  const renderContent = () => {
    const data = getData(activeSection)
    const isLoading = loading[activeSection]

    switch (activeSection) {
      case "home":
        return (
          <div className="space-y-8">
            {/* Welcome */}
            <div className="bg-gradient-to-r from-[#059669] to-[#047857] rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}! 💰</h1>
                  <p className="text-green-100 text-lg mb-4">
                    Finance Management Dashboard - Monitor budgets and financial operations
                  </p>
                  <div className="flex items-center gap-6 text-green-100">
                    <div className="flex items-center gap-2">
                      <DollarSign size={20} />
                      <span>Finance Department</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calculator size={20} />
                      <span>Budget Control</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp size={20} />
                      <span>Financial Analysis</span>
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
                    <p className="text-sm font-medium text-gray-600">Total Budget</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">$12.8M</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <DollarSign size={24} className="text-green-600" />
                  </div>
                </div>
              </TiltedCard>

              <TiltedCard className="p-6 bg-white rounded-xl shadow-lg border hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Spent This Month</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">$1.2M</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <ArrowDownRight size={24} className="text-red-600" />
                  </div>
                </div>
              </TiltedCard>

              <TiltedCard className="p-6 bg-white rounded-xl shadow-lg border hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">18</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Clock size={24} className="text-yellow-600" />
                  </div>
                </div>
              </TiltedCard>

              <TiltedCard className="p-6 bg-white rounded-xl shadow-lg border hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Budget Utilization</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">73%</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <PieChart size={24} className="text-blue-600" />
                  </div>
                </div>
              </TiltedCard>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["budget", "expenses", "reports"].map((action) => {
                  const item = menuItems.find(i => i.action === action)!
                  const Icon = item.icon
                  return (
                    <button
                      key={action}
                      onClick={() => handleSectionClick(action)}
                      className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className={`w-10 h-10 bg-${getColorFromAction(action)}-100 rounded-lg flex items-center justify-center`}>
                        <Icon size={20} className={`text-${getColorFromAction(action)}-600`} />
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

      case "budget":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Budget Management</h2>
            {isLoading ? (
              <div className="text-center py-8">Loading budgets...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Department</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Allocated</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Spent</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Utilization</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.map((b: { dept: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; allocated: { toLocaleString: () => string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined }; spent: { toLocaleString: () => string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined }; utilization: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined }, i: React.Key | null | undefined) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{b.dept}</td>
                        <td className="px-6 py-4">${b.allocated.toLocaleString()}</td>
                        <td className="px-6 py-4">${b.spent.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{b.utilization}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )

      case "expenses":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Expense Tracking</h2>
            {isLoading ? (
              <div className="text-center py-8">Loading expenses...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Department</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.map((exp: { id: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; dept: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; amount: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; status: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; date: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined }, i: React.Key | null | undefined) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-mono text-sm">{exp.id}</td>
                        <td className="px-6 py-4">{exp.dept}</td>
                        <td className="px-6 py-4 font-semibold">{exp.amount}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            exp.status === "Pending" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                          }`}>
                            {exp.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{exp.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )

      case "revenue":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Revenue Analysis</h2>
            {isLoading ? (
              <div className="text-center py-8">Analyzing revenue...</div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-white p-6 rounded-xl shadow border">
                  <h3 className="font-bold text-lg mb-4">Quarterly Revenue</h3>
                  <div className="space-y-3">
                    {data.quarterly.map((q: any, i: number) => (
                      <div key={i} className="flex justify-between">
                        <span>{q.quarter}</span>
                        <span className="font-semibold">{q.revenue}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow border">
                  <h3 className="font-bold text-lg mb-4">Revenue Sources</h3>
                  {data.sources.map((src: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${src.color}`}></div>
                        <span>{src.source}</span>
                      </div>
                      <span className="font-semibold">{src.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case "reports":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Financial Reports</h2>
            {isLoading ? (
              <div className="text-center py-8">Generating reports...</div>
            ) : (
              <div className="grid gap-6">
                {data.map((r: { name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; type: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; size: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; generated: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined }, i: React.Key | null | undefined) => (
                  <div key={i} className="bg-white p-5 rounded-xl shadow border flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{r.name}</h3>
                      <p className="text-sm text-gray-600">{r.type} • {r.size} • Generated: {r.generated}</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                      Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      // Add more cases here similarly...
      // For brevity, here's one more full example.

      case "payroll":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Payroll Management</h2>
            {isLoading ? (
              <div className="text-center py-8">Processing payroll...</div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-white p-6 rounded-xl shadow border">
                  <h3 className="font-semibold mb-4">Next Payroll Run</h3>
                  <p className="text-2xl font-bold">{data.nextRun}</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between"><span>Employees Paid:</span> <span>{data.employeesPaid}</span></div>
                    <div className="flex justify-between"><span>Total Amount:</span> <span className="font-bold">{data.totalAmount}</span></div>
                    <div className="flex justify-between text-yellow-600"><span>Pending Adjustments:</span> <span>{data.pendingAdjustments}</span></div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow border">
                  <h3 className="font-semibold mb-4">Recent History</h3>
                  {data.history.map((h: any, i: number) => (
                    <div key={i} className="flex justify-between py-2 border-b last:border-b-0">
                      <span>{h.month}</span>
                      <span className="font-semibold">{h.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="text-center py-10 text-gray-500">
            <h3 className="text-xl font-medium">No data available for {activeSection}</h3>
            <p>Select a section from the sidebar to view details.</p>
          </div>
        )
    }
  }

  // Helper to get color class
  const getColorFromAction = (action: string) => {
    const colors: Record<string, string> = {
      budget: "green",
      expenses: "blue",
      reports: "green",
      revenue: "green",
      procurement: "gray",
      payroll: "blue",
      audit: "teal",
      treasury: "teal",
      analysis: "purple",
      planning: "green",
    }
    return colors[action] || "gray"
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
            <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center">
              <DollarSign size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Finance Portal</h2>
              <p className="text-sm text-gray-600">Financial Management Hub</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.action
            const colorClass = getColorFromAction(item.action)

            return (
              <button
                key={item.action}
                onClick={() => handleSectionClick(item.action)}
                className={`w-full text-left flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? `bg-gradient-to-r from-${colorClass}-600 to-${colorClass}-700 text-white shadow-lg`
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Icon size={20} />
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className={`text-xs ${isActive ? `${colorClass}-100` : "text-gray-500"}`}>{item.description}</div>
                </div>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-lg flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{user?.name}</div>
              <div className="text-sm text-gray-600">Finance Manager</div>
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

export default FinanceDashboard