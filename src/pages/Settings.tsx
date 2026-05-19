import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { 
  Moon, 
  Sun, 
  Languages, 
  ShieldCheck, 
  LogOut, 
  ChevronRight, 
  Bell, 
  User, 
  HelpCircle,
  Smartphone,
  Database,
  Lock,
  Settings as SettingsIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { toast } from 'sonner';
import { PageHeader } from '../components/PageHeader';

export default function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('en');

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const settingsGroups = [
    {
      title: 'Appearance',
      items: [
        {
          id: 'dark-mode',
          name: 'Dark Mode',
          description: 'Adjust the app appearance',
          icon: theme === 'dark' ? Moon : Sun,
          action: (
            <Switch 
              checked={theme === 'dark'} 
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} 
            />
          )
        },
        {
          id: 'language',
          name: 'Language',
          description: 'Select your preferred language',
          icon: Languages,
          action: (
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
                <SelectItem value="te">Telugu</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
              </SelectContent>
            </Select>
          )
        }
      ]
    },
    {
      title: 'Notifications',
      items: [
        {
          id: 'push-notifications',
          name: 'Push Notifications',
          description: 'Receive alerts for medications',
          icon: Bell,
          action: (
            <Switch 
              checked={notifications} 
              onCheckedChange={setNotifications} 
            />
          )
        }
      ]
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          id: 'privacy-policy',
          name: 'Privacy Policy',
          description: 'How we handle your data',
          icon: ShieldCheck,
          action: <ChevronRight className="w-5 h-5 text-muted-foreground" />,
          onClick: () => window.open('https://example.com/privacy', '_blank')
        },
        {
          id: 'data-management',
          name: 'Data & Privacy',
          description: 'Manage your stored health data',
          icon: Database,
          action: <ChevronRight className="w-5 h-5 text-muted-foreground" />
        },
        {
          id: 'security',
          name: 'Security Settings',
          description: 'Password and authentication',
          icon: Lock,
          action: <ChevronRight className="w-5 h-5 text-muted-foreground" />
        }
      ]
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          name: 'Help Center',
          description: 'FAQs and support',
          icon: HelpCircle,
          action: <ChevronRight className="w-5 h-5 text-muted-foreground" />
        },
        {
          id: 'about',
          name: 'About App',
          description: 'Version 2.4.0 (Production)',
          icon: Smartphone,
          action: <ChevronRight className="w-5 h-5 text-muted-foreground" />
        }
      ]
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-24">
      <PageHeader
        icon={SettingsIcon}
        title="Settings"
        description="Manage your preferences and account security."
        color="slate"
        backTo="/"
      />

      <div className="space-y-6">
        {settingsGroups.map((group) => (
          <div key={group.title} className="space-y-3">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">
              {group.title}
            </h3>
            <Card className="border-none shadow-sm overflow-hidden">
              <CardContent className="p-0 divide-y divide-border">
                {group.items.map((item) => (
                  <div 
                    key={item.id}
                    className={`flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer ${item.onClick ? '' : 'cursor-default'}`}
                    onClick={item.onClick}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-primary">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground font-medium">{item.description}</p>
                      </div>
                    </div>
                    <div>{item.action}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ))}

        <Button 
          variant="destructive" 
          className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout Account
        </Button>
      </div>
    </div>
  );
}
