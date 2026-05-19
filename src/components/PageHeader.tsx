import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from 'next-themes';

type AccentColor = 'teal' | 'blue' | 'amber' | 'cyan' | 'indigo' | 'purple' | 'emerald' | 'rose' | 'sky' | 'slate';

interface PageHeaderProps {
  icon: React.ElementType;
  title: string;
  description: string;
  color: AccentColor;
  badge?: string;
  backTo?: string;
  actions?: ReactNode;
}

const colorTokens: Record<AccentColor, {
  iconText: string;
  iconBg: string;
  iconBorder: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  strip: string;
  titleAccent: string;
  glow: string;
}> = {
  teal: {
    iconText: 'text-teal-400',
    iconBg: 'bg-teal-500/15',
    iconBorder: 'border-teal-500/25',
    badgeBg: 'bg-teal-500/10',
    badgeText: 'text-teal-400',
    badgeBorder: 'border-teal-500/20',
    strip: 'from-teal-500/50 via-teal-400/30 to-transparent',
    titleAccent: 'text-teal-400',
    glow: 'shadow-teal-500/20',
  },
  blue: {
    iconText: 'text-blue-400',
    iconBg: 'bg-blue-500/15',
    iconBorder: 'border-blue-500/25',
    badgeBg: 'bg-blue-500/10',
    badgeText: 'text-blue-400',
    badgeBorder: 'border-blue-500/20',
    strip: 'from-blue-500/50 via-blue-400/30 to-transparent',
    titleAccent: 'text-blue-400',
    glow: 'shadow-blue-500/20',
  },
  amber: {
    iconText: 'text-amber-400',
    iconBg: 'bg-amber-500/15',
    iconBorder: 'border-amber-500/25',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-400',
    badgeBorder: 'border-amber-500/20',
    strip: 'from-amber-500/50 via-amber-400/30 to-transparent',
    titleAccent: 'text-amber-400',
    glow: 'shadow-amber-500/20',
  },
  cyan: {
    iconText: 'text-cyan-400',
    iconBg: 'bg-cyan-500/15',
    iconBorder: 'border-cyan-500/25',
    badgeBg: 'bg-cyan-500/10',
    badgeText: 'text-cyan-400',
    badgeBorder: 'border-cyan-500/20',
    strip: 'from-cyan-500/50 via-cyan-400/30 to-transparent',
    titleAccent: 'text-cyan-400',
    glow: 'shadow-cyan-500/20',
  },
  indigo: {
    iconText: 'text-indigo-400',
    iconBg: 'bg-indigo-500/15',
    iconBorder: 'border-indigo-500/25',
    badgeBg: 'bg-indigo-500/10',
    badgeText: 'text-indigo-400',
    badgeBorder: 'border-indigo-500/20',
    strip: 'from-indigo-500/50 via-indigo-400/30 to-transparent',
    titleAccent: 'text-indigo-400',
    glow: 'shadow-indigo-500/20',
  },
  purple: {
    iconText: 'text-purple-400',
    iconBg: 'bg-purple-500/15',
    iconBorder: 'border-purple-500/25',
    badgeBg: 'bg-purple-500/10',
    badgeText: 'text-purple-400',
    badgeBorder: 'border-purple-500/20',
    strip: 'from-purple-500/50 via-purple-400/30 to-transparent',
    titleAccent: 'text-purple-400',
    glow: 'shadow-purple-500/20',
  },
  emerald: {
    iconText: 'text-emerald-400',
    iconBg: 'bg-emerald-500/15',
    iconBorder: 'border-emerald-500/25',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-500/20',
    strip: 'from-emerald-500/50 via-emerald-400/30 to-transparent',
    titleAccent: 'text-emerald-400',
    glow: 'shadow-emerald-500/20',
  },
  rose: {
    iconText: 'text-rose-400',
    iconBg: 'bg-rose-500/15',
    iconBorder: 'border-rose-500/25',
    badgeBg: 'bg-rose-500/10',
    badgeText: 'text-rose-400',
    badgeBorder: 'border-rose-500/20',
    strip: 'from-rose-500/50 via-rose-400/30 to-transparent',
    titleAccent: 'text-rose-400',
    glow: 'shadow-rose-500/20',
  },
  sky: {
    iconText: 'text-sky-400',
    iconBg: 'bg-sky-500/15',
    iconBorder: 'border-sky-500/25',
    badgeBg: 'bg-sky-500/10',
    badgeText: 'text-sky-400',
    badgeBorder: 'border-sky-500/20',
    strip: 'from-sky-500/50 via-sky-400/30 to-transparent',
    titleAccent: 'text-sky-400',
    glow: 'shadow-sky-500/20',
  },
  slate: {
    iconText: 'text-slate-300',
    iconBg: 'bg-slate-500/15',
    iconBorder: 'border-slate-500/25',
    badgeBg: 'bg-slate-500/10',
    badgeText: 'text-slate-300',
    badgeBorder: 'border-slate-500/20',
    strip: 'from-slate-500/40 via-slate-400/20 to-transparent',
    titleAccent: 'text-slate-300',
    glow: 'shadow-slate-500/20',
  },
};

export function PageHeader({
  icon: Icon,
  title,
  description,
  color,
  badge,
  backTo = '/',
  actions,
}: PageHeaderProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const t = colorTokens[color];

  if (!isDark) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link
            to={backTo}
            className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className={`p-3 rounded-2xl border shadow-sm ${t.iconBg} ${t.iconBorder}`}>
            <Icon className={`w-6 h-6 ${t.iconText}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
              {badge && (
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${t.badgeBg} ${t.badgeText} ${t.badgeBorder}`}>
                  {badge}
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm mt-0.5">{description}</p>
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
    );
  }

  return (
    <div className="relative mb-8">
      {/* Gradient strip */}
      <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${t.strip} rounded-full`} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-4">
          <Link
            to={backTo}
            className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 hover:bg-slate-700/60 hover:border-slate-600 transition-all flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </Link>
          <div className={`p-3 rounded-2xl border shadow-lg ${t.glow} ${t.iconBg} ${t.iconBorder}`}>
            <Icon className={`w-6 h-6 ${t.iconText}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
              {badge && (
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${t.badgeBg} ${t.badgeText} ${t.badgeBorder}`}>
                  {badge}
                </span>
              )}
            </div>
            <p className="text-slate-400 text-sm mt-0.5">{description}</p>
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
