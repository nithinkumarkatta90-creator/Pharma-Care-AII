import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  Pill, 
  Bell, 
  QrCode, 
  Camera,
  History as HistoryIcon, 
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Search,
  Zap,
  Book,
  AlertTriangle,
  Settings as SettingsIcon,
  Moon,
  Sun,
  PlusCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from 'next-themes';

const navGroups = [
  {
    title: 'Core Features',
    items: [
      { name: 'Dashboard', path: '/', icon: LayoutDashboard },
      { name: 'AI Health Chat', path: '/chat', icon: MessageSquare },
    ]
  },
  {
    title: 'Intelligence',
    items: [
      { name: 'Drug Intelligence', path: '/medicine-info', icon: Pill },
      { name: 'Interaction Check', path: '/interaction', icon: AlertTriangle },
      { name: 'Lab AI Analysis', path: '/lab-reports', icon: FileText },
    ]
  },
  {
    title: 'Safety & Tools',
    items: [
      { name: 'QR Verification', path: '/qr-verification', icon: QrCode },
      { name: 'Side Effects AI', path: '/side-effects', icon: Zap },
      { name: 'IP Database', path: '/ip-database', icon: Book },
    ]
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
    ]
  }
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      if (user.email === 'nithinkumarkatta90@gmail.com') {
        setIsAdmin(true);
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists() && snap.data().role === 'admin') {
          setIsAdmin(true);
        }
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
    <div className="flex flex-col h-full bg-card border-r border-border">
      <div className="p-8 pb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center flex-shrink-0">
          <Camera className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-black text-foreground tracking-tight">PHARMA CARE AI</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-8 overflow-y-auto scrollbar-hide py-4">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-2">
            <h3 className="px-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`group flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 relative ${
                      isActive 
                        ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20' 
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary'}`} />
                    {item.name}
                    {isActive && (
                      <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary-foreground/40 shadow-sm" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {isAdmin && (
          <div className="space-y-2">
            <h3 className="px-4 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-3">
              Administration
            </h3>
            <Link
              to="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`group flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 relative ${
                location.pathname === '/admin' 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' 
                  : 'text-muted-foreground hover:bg-indigo-50 hover:text-indigo-900 dark:hover:bg-indigo-900/20'
              }`}
            >
              <SettingsIcon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${location.pathname === '/admin' ? 'text-white' : 'text-muted-foreground group-hover:text-indigo-600'}`} />
              Admin Panel
            </Link>
          </div>
        )}
      </nav>

      <div className="p-6 border-t border-border bg-muted/30">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-2xl h-14 font-black text-sm transition-all duration-300"
          onClick={handleLogout}
        >
          <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center mr-3 shadow-sm group-hover:bg-destructive/10">
            <LogOut className="w-5 h-5" />
          </div>
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 flex-shrink-0">
        <NavContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <header className="h-20 bg-card/70 backdrop-blur-md border-b border-border flex items-center justify-between px-6 lg:px-10 flex-shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon" className="lg:hidden rounded-xl">
                    <Menu className="w-6 h-6" />
                  </Button>
                }
              />
              <SheetContent side="left" className="p-0 w-72 border-none">
                <NavContent />
              </SheetContent>
            </Sheet>
            <h1 className="text-xl font-bold text-foreground lg:hidden">
              {navGroups.flatMap(g => g.items).find(i => i.path === location.pathname)?.name || 'PHARMA CARE AI'}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center bg-muted/50 rounded-2xl px-4 py-2 w-80 border border-border focus-within:bg-card focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <Search className="w-4 h-4 text-muted-foreground mr-2" />
              <input 
                type="text" 
                placeholder="Search medicines..." 
                className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-muted-foreground font-medium"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const query = (e.target as HTMLInputElement).value;
                    if (query.trim()) {
                      navigate(`/medicine-info?q=${encodeURIComponent(query)}`);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-foreground">{user?.displayName || 'User'}</p>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{user?.email}</p>
              </div>
              <Avatar className="h-10 w-10 border-2 border-card shadow-sm">
                <AvatarImage src={user?.photoURL || ''} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
                  {user?.displayName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Floating AI Button (Desktop) */}
        <div className="hidden lg:block fixed bottom-8 right-8 z-50">
          <Link
            to="/chat"
            className="flex items-center gap-3 bg-primary text-primary-foreground px-6 py-4 rounded-[2rem] shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-300 group"
          >
            <div className="relative">
              <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-primary animate-pulse"></div>
            </div>
            <span className="font-black text-sm uppercase tracking-widest">AI Assistant</span>
          </Link>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden h-20 bg-card/80 backdrop-blur-lg border-t border-border flex items-center justify-around px-2 flex-shrink-0 pb-4">
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
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'fill-primary/10' : ''}`} />
                <span className="text-[10px] font-bold">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
