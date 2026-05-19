import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Pill,
  Bell,
  QrCode,
  History as HistoryIcon,
  User as UserIcon,
  LogOut,
  Menu,
  Search,
  Zap,
  Book,
  AlertTriangle,
  Settings as SettingsIcon,
  Moon,
  Sun,
  PlusCircle,
  Shield,
  X,
  ChevronRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../App';
import { AnimatePresence, motion } from 'motion/react';
import { useTheme } from 'next-themes';

const navGroups = [
  {
    title: 'Core',
    items: [
      { name: 'Dashboard', path: '/', icon: LayoutDashboard },
      { name: 'AI Health Chat', path: '/chat', icon: MessageSquare },
    ],
  },
  {
    title: 'Intelligence',
    items: [
      { name: 'Drug Intelligence', path: '/medicine-info', icon: Pill },
      { name: 'Interaction Check', path: '/interaction', icon: AlertTriangle },
      { name: 'Lab AI Analysis', path: '/lab-reports', icon: FileText },
    ],
  },
  {
    title: 'Safety & Tools',
    items: [
      { name: 'QR Verification', path: '/qr-verification', icon: QrCode },
      { name: 'Side Effects AI', path: '/side-effects', icon: Zap },
      { name: 'IP Database', path: '/ip-database', icon: Book },
    ],
  },
  {
    title: 'Management',
    items: [
      { name: 'Med Reminders', path: '/reminders', icon: Bell },
      { name: 'Add Medication', path: '/medication-entry', icon: PlusCircle },
      { name: 'Health History', path: '/history', icon: HistoryIcon },
      { name: 'Patient Profile', path: '/patient-profile', icon: UserIcon },
      { name: 'Profile', path: '/profile', icon: UserIcon },
      { name: 'Settings', path: '/settings', icon: SettingsIcon },
    ],
  },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const isDark = theme === 'dark';

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      if (user.email === 'nithinkumarkatta90@gmail.com') {
        setIsAdmin(true);
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists() && snap.data().role === 'admin') setIsAdmin(true);
      } catch (error) {
        console.error(error);
      }
    };
    checkAdmin();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  const NavItem = ({ item, onClick }: { item: { name: string; path: string; icon: React.ElementType }; onClick?: () => void }) => {
    const isActive = location.pathname === item.path;
    return (
      <Link
        to={item.path}
        onClick={onClick}
        className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
          isActive
            ? isDark
              ? 'bg-teal-500/10 text-teal-400'
              : 'bg-teal-50 text-teal-700'
            : isDark
            ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
        }`}
      >
        {isActive && (
          <motion.span
            layoutId="nav-indicator"
            className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full ${isDark ? 'bg-teal-400' : 'bg-teal-600'}`}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <item.icon
          className={`w-4 h-4 flex-shrink-0 transition-colors ${
            isActive
              ? isDark ? 'text-teal-400' : 'text-teal-600'
              : isDark ? 'text-slate-500 group-hover:text-slate-300' : 'text-gray-400 group-hover:text-gray-600'
          }`}
        />
        <span className="truncate">{item.name}</span>
        {isActive && (
          <ChevronRight className={`ml-auto w-3.5 h-3.5 flex-shrink-0 ${isDark ? 'text-teal-500/60' : 'text-teal-400'}`} />
        )}
      </Link>
    );
  };

  const NavContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div
      className={`flex flex-col h-full transition-colors ${
        isDark ? 'bg-[#0F172A] border-r border-slate-800/60' : 'bg-white border-r border-gray-200'
      }`}
    >
      {/* Logo */}
      <div className={`h-16 flex items-center px-5 border-b ${isDark ? 'border-slate-800/60' : 'border-gray-200'}`}>
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg ${isDark ? 'bg-teal-500/15' : 'bg-teal-50'}`}>
            <Shield className={`h-5 w-5 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
          </div>
          <div>
            <span className={`font-bold text-base tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Pharma<span className={isDark ? 'text-teal-400' : 'text-teal-600'}>Care</span>
            </span>
            <span className={`ml-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md align-middle ${isDark ? 'bg-teal-500/15 text-teal-400' : 'bg-teal-50 text-teal-600'}`}>
              AI
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className={`px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-600' : 'text-gray-400'}`}>
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem key={item.path} item={item} onClick={onNavigate} />
              ))}
            </div>
          </div>
        ))}

        {isAdmin && (
          <div>
            <p className={`px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-teal-600' : 'text-teal-500'}`}>
              Admin
            </p>
            <NavItem item={{ name: 'Admin Panel', path: '/admin', icon: SettingsIcon }} onClick={onNavigate} />
          </div>
        )}
      </nav>

      {/* User Footer */}
      <div className={`p-3 border-t ${isDark ? 'border-slate-800/60' : 'border-gray-200'}`}>
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 ${isDark ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
          <Avatar className={`h-7 w-7 ring-2 ${isDark ? 'ring-teal-500/30' : 'ring-teal-200'}`}>
            <AvatarImage src={user?.photoURL || ''} />
            <AvatarFallback className={`text-xs font-bold ${isDark ? 'bg-teal-900 text-teal-300' : 'bg-teal-100 text-teal-700'}`}>
              {user?.displayName?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-semibold truncate ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>
              {user?.displayName || 'User'}
            </p>
            <p className={`text-[10px] truncate ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
            isDark
              ? 'text-slate-500 hover:text-rose-400 hover:bg-rose-500/10'
              : 'text-gray-400 hover:text-rose-600 hover:bg-rose-50'
          }`}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );

  const currentPageName =
    navGroups.flatMap((g) => g.items).find((i) => i.path === location.pathname)?.name || 'PharmaCare AI';

  return (
    <div
      className={`flex h-screen overflow-hidden transition-colors ${
        isDark ? 'bg-[#0B1120] text-slate-100' : 'bg-gray-50 text-gray-900'
      }`}
    >
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-60 flex-shrink-0">
        <NavContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header
          className={`h-16 flex items-center justify-between px-4 sm:px-6 border-b flex-shrink-0 backdrop-blur-md transition-colors ${
            isDark
              ? 'bg-[#0F172A]/80 border-slate-800/60'
              : 'bg-white/80 border-gray-200'
          }`}
          style={{ position: 'sticky', top: 0, zIndex: 30 }}
        >
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile menu trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger
                render={
                  <button
                    className={`lg:hidden p-2 rounded-xl transition-colors ${
                      isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>
                }
              />
              <SheetContent side="left" className="p-0 w-60 border-none">
                <NavContent onNavigate={() => setIsMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>

            <span className={`text-sm font-semibold lg:hidden ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {currentPageName}
            </span>

            {/* Search */}
            <div
              className={`hidden md:flex items-center gap-2 rounded-xl px-3 py-2 w-72 border text-sm transition-colors ${
                isDark
                  ? 'bg-slate-800/60 border-slate-700/50 focus-within:border-teal-500/50 focus-within:bg-slate-800'
                  : 'bg-gray-50 border-gray-200 focus-within:border-teal-400'
              }`}
            >
              <Search className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search medications, ask AI..."
                className="bg-transparent border-none outline-none w-full text-sm placeholder:text-slate-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const q = (e.target as HTMLInputElement).value;
                    if (q.trim()) {
                      navigate(`/medicine-info?q=${encodeURIComponent(q)}`);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`p-2 rounded-xl transition-all ${
                isDark
                  ? 'text-slate-400 hover:bg-slate-800 hover:text-yellow-400'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-yellow-500'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              to="/reminders"
              className={`relative p-2 rounded-xl transition-all ${
                isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-teal-400' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Bell className="w-4 h-4" />
            </Link>

            <Link to="/profile">
              <Avatar
                className={`h-8 w-8 ring-2 transition-all cursor-pointer ${
                  isDark ? 'ring-slate-700 hover:ring-teal-500/60' : 'ring-gray-200 hover:ring-teal-400'
                }`}
              >
                <AvatarImage src={user?.photoURL || ''} />
                <AvatarFallback
                  className={`text-xs font-bold ${isDark ? 'bg-teal-900 text-teal-300' : 'bg-teal-100 text-teal-700'}`}
                >
                  {user?.displayName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav
          className={`lg:hidden h-16 border-t flex items-center justify-around px-2 flex-shrink-0 backdrop-blur-md transition-colors ${
            isDark ? 'bg-[#0F172A]/90 border-slate-800/60' : 'bg-white/90 border-gray-200'
          }`}
        >
          {[
            { name: 'Home', path: '/', icon: LayoutDashboard },
            { name: 'Chat', path: '/chat', icon: MessageSquare },
            { name: 'Meds', path: '/medicine-info', icon: Pill },
            { name: 'Settings', path: '/settings', icon: SettingsIcon },
          ].map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all relative ${
                  isActive
                    ? isDark ? 'text-teal-400' : 'text-teal-600'
                    : isDark ? 'text-slate-500' : 'text-gray-400'
                }`}
              >
                {isActive && (
                  <span
                    className={`absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full ${
                      isDark ? 'bg-teal-400' : 'bg-teal-600'
                    }`}
                  />
                )}
                <item.icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className="text-[10px] font-semibold">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
