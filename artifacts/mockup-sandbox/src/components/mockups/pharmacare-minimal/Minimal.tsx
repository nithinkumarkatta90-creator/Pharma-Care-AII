import React from "react";
import {
  Activity,
  MessageSquare,
  BookOpen,
  AlertTriangle,
  FileText,
  QrCode,
  ShieldAlert,
  Database,
  Bell,
  History,
  User,
  Settings,
  Search,
  Moon,
  Sun,
  Menu,
  ChevronRight,
  HeartPulse,
  Pill,
  Stethoscope,
  TrendingUp,
} from "lucide-react";

export function Minimal() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const navigation = [
    { name: "Dashboard", icon: Activity, current: true },
    { name: "AI Health Chat", icon: MessageSquare, current: false },
    { name: "Drug Intelligence", icon: BookOpen, current: false },
    { name: "Interaction Check", icon: AlertTriangle, current: false },
    { name: "Lab AI Analysis", icon: FileText, current: false },
    { name: "QR Verification", icon: QrCode, current: false },
    { name: "Side Effects AI", icon: ShieldAlert, current: false },
    { name: "IP Database", icon: Database, current: false },
    { name: "Med Reminders", icon: Bell, current: false },
    { name: "Health History", icon: History, current: false },
    { name: "Profile", icon: User, current: false },
    { name: "Settings", icon: Settings, current: false },
  ];

  const quickActions = [
    { name: "AI Health Chat", icon: MessageSquare, desc: "Consult with AI" },
    { name: "Drug Intelligence", icon: BookOpen, desc: "Search medications" },
    { name: "Lab AI Analysis", icon: FileText, desc: "Upload reports" },
    { name: "QR Verification", icon: QrCode, desc: "Verify authenticity" },
  ];

  const recentActivity = [
    { title: "Logged Aspirin 81mg", time: "2 hours ago", type: "medication" },
    { title: "Checked interactions for Lisinopril", time: "Yesterday", type: "check" },
    { title: "Uploaded Complete Blood Count report", time: "3 days ago", type: "lab" },
  ];

  return (
    <div
      className={`min-h-screen flex w-full font-sans antialiased ${
        isDarkMode ? "bg-gray-950 text-gray-50" : "bg-gray-50 text-gray-900"
      }`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } hidden md:flex flex-col border-r transition-all duration-300 ${
          isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
        }`}
      >
        <div className="h-16 flex items-center px-4 border-b border-inherit">
          <HeartPulse className={`h-6 w-6 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`} />
          {isSidebarOpen && (
            <span className="ml-3 font-semibold text-lg tracking-tight">PharmaCare AI</span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {navigation.map((item) => (
              <a
                key={item.name}
                href="#"
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  item.current
                    ? isDarkMode
                      ? "bg-indigo-900/50 text-indigo-300"
                      : "bg-indigo-50 text-indigo-700"
                    : isDarkMode
                    ? "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <item.icon
                  className={`flex-shrink-0 h-5 w-5 ${
                    item.current
                      ? isDarkMode
                        ? "text-indigo-400"
                        : "text-indigo-600"
                      : isDarkMode
                      ? "text-gray-500 group-hover:text-gray-300"
                      : "text-gray-400 group-hover:text-gray-500"
                  } ${isSidebarOpen ? "mr-3" : "mx-auto"}`}
                />
                {isSidebarOpen && <span>{item.name}</span>}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header
          className={`h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b ${
            isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center flex-1">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-md hidden md:block ${
                isDarkMode ? "text-gray-400 hover:bg-gray-800" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="max-w-md w-full ml-4 hidden sm:block">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className={`h-4 w-4 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
                </div>
                <input
                  type="text"
                  placeholder="Search medications, labs..."
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md leading-5 bg-transparent placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors ${
                    isDarkMode
                      ? "border-gray-700 text-gray-300 focus:bg-gray-800"
                      : "border-gray-300 text-gray-900 focus:bg-white"
                  }`}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full ${
                isDarkMode ? "text-gray-400 hover:bg-gray-800" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <div className="relative">
              <button className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300 transition">
                <img
                  className="h-8 w-8 rounded-full object-cover"
                  src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e2e8f0"
                  alt="User avatar"
                />
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Hello, User</h1>
              <p className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                Your health dashboard is ready for today.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Health Score", value: "87", icon: HeartPulse, color: "text-emerald-500" },
                { label: "Active Reminders", value: "3", icon: Bell, color: "text-amber-500" },
                { label: "Medicines Logged", value: "12", icon: Pill, color: "text-indigo-500" },
                { label: "Consultations", value: "5", icon: Stethoscope, color: "text-blue-500" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`p-5 rounded-xl border flex items-center justify-between ${
                    isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
                  }`}
                >
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {stat.label}
                    </p>
                    <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column (Main Content) */}
              <div className="lg:col-span-2 space-y-8">
                {/* AI Insights */}
                <section>
                  <h2 className="text-lg font-medium mb-4">AI Health Insights</h2>
                  <div
                    className={`rounded-xl border p-6 ${
                      isDarkMode ? "bg-indigo-950/20 border-indigo-900/50" : "bg-indigo-50/50 border-indigo-100"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${isDarkMode ? "bg-indigo-900/50" : "bg-indigo-100"}`}>
                        <TrendingUp className={`h-5 w-5 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`} />
                      </div>
                      <div>
                        <h3 className={`font-medium ${isDarkMode ? "text-indigo-300" : "text-indigo-900"}`}>
                          Your sleep pattern has improved
                        </h3>
                        <p className={`mt-1 text-sm leading-relaxed ${isDarkMode ? "text-indigo-200/70" : "text-indigo-800/70"}`}>
                          Based on your last 7 days of logs, your average sleep duration has increased by 45 minutes. Continue your current wind-down routine to maintain this positive trend.
                        </p>
                        <button className={`mt-3 text-sm font-medium flex items-center ${isDarkMode ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-700"}`}>
                          View detailed analysis <ChevronRight className="h-4 w-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Quick Actions */}
                <section>
                  <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {quickActions.map((action) => (
                      <button
                        key={action.name}
                        className={`flex items-start p-4 rounded-xl border text-left transition-all ${
                          isDarkMode
                            ? "bg-gray-900 border-gray-800 hover:border-gray-700 hover:bg-gray-800"
                            : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 ${isDarkMode ? "bg-gray-800 text-gray-400" : "bg-gray-50 text-gray-600"}`}>
                          <action.icon className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <h3 className="font-medium text-sm">{action.name}</h3>
                          <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                            {action.desc}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              {/* Right Column (Sidebar) */}
              <div className="space-y-8">
                {/* Recent Activity */}
                <section>
                  <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
                  <div className={`rounded-xl border overflow-hidden ${isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
                    <ul className="divide-y divide-inherit">
                      {recentActivity.map((activity, idx) => (
                        <li key={idx} className="p-4 flex items-center gap-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
                          <div className={`h-2 w-2 rounded-full ${
                            activity.type === 'medication' ? 'bg-indigo-500' :
                            activity.type === 'check' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{activity.title}</p>
                            <p className={`text-xs mt-0.5 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                              {activity.time}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className={`p-3 border-t border-inherit text-center ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
                      <button className={`text-xs font-medium ${isDarkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-600 hover:text-gray-900"}`}>
                        View all activity
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
