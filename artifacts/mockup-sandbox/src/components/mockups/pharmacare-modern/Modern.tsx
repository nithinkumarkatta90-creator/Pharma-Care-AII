import React, { useState } from "react";
import { 
  Activity, 
  Bell, 
  Search, 
  Shield, 
  MessageSquare, 
  Pill, 
  AlertTriangle, 
  FileText, 
  QrCode, 
  Database, 
  Clock, 
  History, 
  User, 
  Settings,
  ChevronRight,
  Stethoscope,
  HeartPulse,
  Brain,
  Zap,
  CheckCircle2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Modern() {
  const [activeTab, setActiveTab] = useState("Dashboard");

  const navigation = [
    { name: "Dashboard", icon: Activity },
    { name: "AI Health Chat", icon: MessageSquare },
    { name: "Drug Intelligence", icon: Pill },
    { name: "Interaction Check", icon: AlertTriangle },
    { name: "Lab AI Analysis", icon: FileText },
    { name: "QR Verification", icon: QrCode },
    { name: "Side Effects AI", icon: Brain },
    { name: "IP Database", icon: Database },
    { name: "Med Reminders", icon: Clock },
    { name: "Health History", icon: History },
    { name: "Profile", icon: User },
    { name: "Settings", icon: Settings },
  ];

  const quickActions = [
    { name: "AI Health Chat", icon: MessageSquare, color: "bg-teal-500/10 text-teal-400 border-teal-500/20" },
    { name: "Drug Intelligence", icon: Pill, color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    { name: "Lab AI Analysis", icon: FileText, color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
    { name: "QR Verification", icon: QrCode, color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  ];

  const activities = [
    { title: "Vitamin D3 Supplement logged", time: "2 hours ago", icon: Pill, color: "text-blue-400" },
    { title: "Blood Test Analysis complete", time: "Yesterday", icon: FileText, color: "text-indigo-400" },
    { title: "Interaction Check: Safe", time: "2 days ago", icon: Shield, color: "text-teal-400" },
  ];

  return (
    <div className="flex h-screen bg-[#0B1120] text-slate-300 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800/60 bg-[#0F172A] flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-800/60">
          <div className="flex items-center gap-2 text-teal-400">
            <Shield className="h-6 w-6" />
            <span className="font-bold text-lg text-white tracking-wide">PharmaCare<span className="text-teal-400">AI</span></span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === item.name
                  ? "bg-teal-500/10 text-teal-400"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <item.icon className={`h-4 w-4 ${activeTab === item.name ? "text-teal-400" : "text-slate-500"}`} />
              {item.name}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800/60 bg-[#0F172A]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input 
                placeholder="Search medications, labs, or ask AI..." 
                className="pl-10 bg-slate-900/50 border-slate-800 text-slate-200 placeholder:text-slate-500 focus-visible:ring-teal-500/50 h-9 rounded-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white rounded-full">
              <Bell className="h-5 w-5" />
            </Button>
            <Avatar className="h-8 w-8 ring-2 ring-slate-800 cursor-pointer hover:ring-teal-500/50 transition-all">
              <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User" />
              <AvatarFallback className="bg-teal-900 text-teal-400">U</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 pb-20">
          {/* Welcome Header */}
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Hello, User</h1>
            <p className="text-slate-400 mt-1">Your health dashboard is ready for today.</p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Health Score", value: "87", icon: HeartPulse, color: "from-teal-500/20 to-teal-500/0 text-teal-400 border-teal-500/20" },
              { label: "Active Reminders", value: "3", icon: Clock, color: "from-blue-500/20 to-blue-500/0 text-blue-400 border-blue-500/20" },
              { label: "Medicines Logged", value: "12", icon: Pill, color: "from-indigo-500/20 to-indigo-500/0 text-indigo-400 border-indigo-500/20" },
              { label: "Consultations", value: "5", icon: Stethoscope, color: "from-cyan-500/20 to-cyan-500/0 text-cyan-400 border-cyan-500/20" },
            ].map((stat, i) => (
              <div key={i} className={`relative overflow-hidden rounded-2xl border bg-slate-900/50 p-6 ${stat.color.split(' ')[3]}`}>
                <div className={`absolute top-0 right-0 p-4 bg-gradient-to-bl ${stat.color.split(' ')[0]} ${stat.color.split(' ')[1]} w-24 h-24 rounded-bl-full opacity-50`}></div>
                <div className="relative z-10 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-400">{stat.label}</span>
                    <stat.icon className={`h-5 w-5 ${stat.color.split(' ')[2]}`} />
                  </div>
                  <span className="text-3xl font-bold text-white">{stat.value}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* AI Health Insights */}
              <div className="rounded-2xl border border-teal-500/30 bg-gradient-to-br from-teal-900/40 via-slate-900 to-slate-900 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-blue-500"></div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-teal-500/20 rounded-xl">
                    <Zap className="h-6 w-6 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">AI Health Insights</h3>
                    <p className="text-slate-400 text-sm mt-1 mb-4 leading-relaxed">
                      Your recent blood pressure readings show a 5% improvement. Keep up with the current medication schedule. No adverse interactions detected in your current stack.
                    </p>
                    <Button className="bg-teal-500 hover:bg-teal-600 text-white border-0 shadow-lg shadow-teal-500/20 rounded-full px-6">
                      View Full Analysis
                    </Button>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {quickActions.map((action, i) => (
                    <button key={i} className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border bg-slate-900/50 hover:bg-slate-800 transition-colors ${action.color}`}>
                      <action.icon className="h-6 w-6" />
                      <span className="text-xs font-medium text-slate-300 text-center">{action.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-8">
              {/* Recent Activity */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                  <Button variant="ghost" size="sm" className="text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 -mr-2">View All</Button>
                </div>
                <div className="space-y-6">
                  {activities.map((activity, i) => (
                    <div key={i} className="flex gap-4">
                      <div className={`mt-0.5 rounded-full p-2 bg-slate-800 border border-slate-700`}>
                        <activity.icon className={`h-4 w-4 ${activity.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{activity.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
