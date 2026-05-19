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
  HeartPulse,
  X,
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

  const NavContent = () => (
    <div className={`flex flex-col h-full border-r transition-colors ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
      {/* Logo */}
      <div className={`h-16 flex items-center px-5 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <HeartPulse className={`h-6 w-6 flex-shrink-0 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
        <span className="ml-3 font-semibold text-base tracking-tight truncate">PharmaCare AI</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className={`px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? isDark
                          ? 'bg-indigo-900/50 text-indigo-300'
                          : 'bg-indigo-50 text-indigo-700'
                        : isDark
                        ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? (isDark ? 'text-indigo-400' : 'text-indigo-600') : ''}`} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {isAdmin && (
          <div>
            <p className={`px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-indigo-400`}>Admin</p>
            <Link
              to="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/admin'
                  ? isDark ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-50 text-indigo-700'
                  : isDark ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-100' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <SettingsIcon className="w-4 h-4 flex-shrink-0" />
              Admin Panel
            </Link>
          </div>
        )}
      </nav>

      {/* Logout */}
      <div className={`p-3 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isDark ? 'text-gray-400 hover:bg-gray-800 hover:text-red-400' : 'text-gray-500 hover:bg-red-50 hover:text-red-600'
          }`}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Logout
        </button>
      </div>
    </div>
  );

  const currentPageName = navGroups.flatMap((g) => g.items).find((i) => i.path === location.pathname)?.name || 'PharmaCare AI';

  return (
    <div className={`flex h-screen overflow-hidden transition-colors ${isDark ? 'bg-gray-950 text-gray-50' : 'bg-gray-50 text-gray-900'}`}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-60 flex-shrink-0">
        <NavContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className={`h-16 flex items-center justify-between px-4 sm:px-6 border-b flex-shrink-0 transition-colors ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile menu trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger
                render={
                  <button className={`lg:hidden p-2 rounded-md ${isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}>
                    <Menu className="w-5 h-5" />
                  </button>
                }
              />
              <SheetContent side="left" className="p-0 w-60 border-none">
                <NavContent />
              </SheetContent>
            </Sheet>

            <h1 className="text-sm font-semibold lg:hidden">{currentPageName}</h1>

            {/* Search */}
            <div className={`hidden md:flex items-center gap-2 rounded-md px-3 py-1.5 w-72 border text-sm transition-colors ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-300'}`}>
              <Search className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search medicines..."
                className="bg-transparent border-none outline-none w-full text-sm placeholder:text-gray-400"
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

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`p-2 rounded-md ${isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium leading-none">{user?.displayName || 'User'}</p>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{user?.email}</p>
            </div>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.photoURL || ''} />
              <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold text-sm">
                {user?.displayName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className={`lg:hidden h-16 border-t flex items-center justify-around px-2 flex-shrink-0 transition-colors ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
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
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-md transition-colors ${
                  isActive ? (isDark ? 'text-indigo-400' : 'text-indigo-600') : (isDark ? 'text-gray-500' : 'text-gray-400')
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
