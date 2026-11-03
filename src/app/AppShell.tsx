import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  Calculator,
  BookOpen,
  Layers,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  CloudOff,
  Moon,
  Sun,
  ShieldCheck,
  Building2,
  Menu,
  X,
} from 'lucide-react';

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/proposals', label: 'Proposals', icon: FileText },
    { to: '/clients', label: 'Clients', icon: Users },
    { to: '/calculators', label: 'Calculators', icon: Calculator },
    { to: '/library', label: 'Library', icon: BookOpen },
    { to: '/templates', label: 'Templates', icon: Layers },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const devItems = [
    { to: '/dev/self-test', label: 'Self-Test Runner', icon: ShieldCheck },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F7F9FC] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#E2E8F0]">
      {/* Desktop / Tablet Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-[#D8DFE8] dark:border-[#334155] bg-white dark:bg-[#1E293B] transition-all duration-200 z-30 shrink-0 ${
          collapsed ? 'w-18' : 'w-60'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#D8DFE8] dark:border-[#334155]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-[#1F3A5F] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              PS
            </div>
            {!collapsed && (
              <div className="truncate">
                <span className="font-bold text-sm tracking-tight text-[#1F3A5F] dark:text-[#9DC3E6] block">
                  PAKSAFE
                </span>
                <span className="text-[10px] text-[#5B6B7F] dark:text-[#94A3B8] font-medium tracking-wider uppercase block">
                  Proposal Studio
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded text-[#5B6B7F] hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#DEEBF7] dark:bg-[#1B2A3D] text-[#1F3A5F] dark:text-[#9DC3E6] font-semibold'
                      : 'text-[#5B6B7F] dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0F172A] dark:hover:text-white'
                  }`
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0 text-[#2E75B6] dark:text-[#5B9BD5]" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}

          <div className="pt-4 mt-4 border-t border-[#D8DFE8] dark:border-[#334155]">
            {!collapsed && (
              <span className="px-3 text-[10px] font-semibold tracking-wider text-[#94A3B8] uppercase block mb-1">
                Engineering Tools
              </span>
            )}
            {devItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 font-semibold'
                        : 'text-[#5B6B7F] dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0F172A] dark:hover:text-white'
                    }`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0 text-emerald-600" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Footer brand indicator */}
        <div className="p-3 border-t border-[#D8DFE8] dark:border-[#334155] text-xs">
          {!collapsed ? (
            <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-slate-50 dark:bg-slate-800/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-[#5B6B7F] dark:text-[#94A3B8] font-mono">Dexie IndexedDB v4</span>
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="IndexedDB Connected" />
            </div>
          )}
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (Always visible) */}
        <header className="h-16 border-b border-[#D8DFE8] dark:border-[#334155] bg-white dark:bg-[#1E293B] px-4 lg:px-8 flex items-center justify-between gap-4 shrink-0 z-20">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded text-[#5B6B7F] hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Global Search placeholder */}
            <div className="relative w-full max-w-xs hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search proposals, clients... (Ctrl+K)"
                readOnly
                className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded-md pl-9 pr-3 py-1.5 text-xs text-[#0F172A] dark:text-[#E2E8F0] placeholder:text-[#94A3B8] cursor-pointer focus:outline-none"
              />
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {/* Company switcher placeholder */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-[#D8DFE8] dark:border-[#334155] bg-[#F7F9FC] dark:bg-[#0F172A] text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1F3A5F]" />
              <span className="font-semibold text-[#1F3A5F] dark:text-[#9DC3E6]">PAKSAFE</span>
            </div>

            {/* Sync / Offline indicator (DESIGN Section 3.4) */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[#5B6B7F] dark:text-[#94A3B8] text-xs">
              <CloudOff className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Offline — saved on this device</span>
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-[#5B6B7F] hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Mobile slide-out drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/40 flex" onClick={() => setMobileMenuOpen(false)}>
            <div
              className="w-64 bg-white dark:bg-[#1E293B] h-full p-4 flex flex-col space-y-2 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#D8DFE8] dark:border-[#334155]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-[#1F3A5F] text-white flex items-center justify-center font-bold text-xs">
                    PS
                  </div>
                  <span className="font-bold text-sm text-[#1F3A5F] dark:text-[#9DC3E6]">PAKSAFE Studio</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-[#5B6B7F]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1 pt-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium ${
                          isActive
                            ? 'bg-[#DEEBF7] dark:bg-[#1B2A3D] text-[#1F3A5F] dark:text-[#9DC3E6] font-semibold'
                            : 'text-[#5B6B7F] dark:text-[#94A3B8]'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 text-[#2E75B6]" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
                <div className="pt-2 border-t border-[#D8DFE8] dark:border-[#334155]">
                  {devItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-800 font-semibold'
                              : 'text-[#5B6B7F]'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4 text-emerald-600" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Navigation (DESIGN Section 3.1) */}
        <nav className="sm:hidden h-14 border-t border-[#D8DFE8] dark:border-[#334155] bg-white dark:bg-[#1E293B] flex items-center justify-around px-2 shrink-0 z-20">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-col items-center justify-center text-[10px] ${
                isActive ? 'text-[#2E75B6] font-semibold' : 'text-[#5B6B7F]'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Home</span>
          </NavLink>
          <NavLink
            to="/proposals"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center text-[10px] ${
                isActive ? 'text-[#2E75B6] font-semibold' : 'text-[#5B6B7F]'
              }`
            }
          >
            <FileText className="w-4 h-4" />
            <span>Proposals</span>
          </NavLink>
          <NavLink
            to="/clients"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center text-[10px] ${
                isActive ? 'text-[#2E75B6] font-semibold' : 'text-[#5B6B7F]'
              }`
            }
          >
            <Users className="w-4 h-4" />
            <span>Clients</span>
          </NavLink>
          <NavLink
            to="/calculators"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center text-[10px] ${
                isActive ? 'text-[#2E75B6] font-semibold' : 'text-[#5B6B7F]'
              }`
            }
          >
            <Calculator className="w-4 h-4" />
            <span>Calculators</span>
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center text-[10px] ${
                isActive ? 'text-[#2E75B6] font-semibold' : 'text-[#5B6B7F]'
              }`
            }
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </NavLink>
        </nav>
      </div>
    </div>
  );
}
