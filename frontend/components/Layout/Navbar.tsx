'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/apiClient';
import { 
  Rocket, Bell, Check, User, BookOpen, Award, 
  CreditCard, Settings, Shield, LogOut, ChevronDown
} from 'lucide-react';

function timeAgo(dateInput: string | Date | any) {
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 365) return `${diffInDays} days ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await apiClient.get('/api/notifications');
      setNotifications(res.data);
    } catch (e) {
      console.error("Failed to load notifications", e);
    }
  };

  const markAllRead = async () => {
    try {
      await apiClient.patch('/api/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (e) {
      console.error("Failed to mark read", e);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const initial = user?.name?.[0]?.toUpperCase() || 'U';

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'lesson_completed': return <Check className="w-4 h-4 text-emerald-400" />;
      case 'achievement_unlocked': return <Award className="w-4 h-4 text-amber-400" />;
      case 'new_offer': return <Rocket className="w-4 h-4 text-purple-400" />;
      case 'welcome': return <User className="w-4 h-4 text-blue-400" />;
      default: return <Bell className="w-4 h-4 text-white/50" />;
    }
  };

  return (
    <nav className="h-[72px] border-b border-white/[0.08] flex items-center justify-between px-6 bg-[#0d0d14] sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[#7F77DD] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(127,119,221,0.5)]">
          <Rocket className="w-5 h-5 text-white" />
        </div>
        <span className="text-white font-bold text-lg tracking-tight hidden sm:block">Learning Platform</span>
      </div>
      
      <div className="flex items-center gap-8 text-sm font-medium">
        <Link href="/dashboard" className="text-white">Dashboard</Link>
        <Link href="/courses" className="text-white/50 hover:text-white transition-colors">Courses</Link>
        <Link href="#" className="text-white/50 hover:text-white transition-colors hidden sm:block">Community</Link>
      </div>

      <div className="flex items-center gap-5">
        
        {/* NOTIFICATIONS */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#7F77DD] rounded-full"></span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#1a1a24] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#1a1a24]">
                <h3 className="font-bold text-white text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-[#7F77DD] hover:underline font-medium">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-[350px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-white/40 text-sm">No notifications yet</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`p-4 border-b border-white/5 flex gap-3 ${!n.is_read ? 'bg-[#7F77DD]/5' : ''}`}>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                        {getNotifIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium mb-1">{n.message}</p>
                        <p className="text-xs text-white/40">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!n.is_read && <div className="w-2 h-2 rounded-full bg-[#7F77DD] shrink-0 mt-1.5"></div>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* PROFILE DROPDOWN */}
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7F77DD] to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {initial}
            </div>
            <ChevronDown className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
          </div>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-64 bg-[#1a1a24] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col py-2">
              <div className="px-4 py-3 border-b border-white/10 mb-2">
                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                <p className="text-xs text-white/50 truncate">{user?.email}</p>
              </div>

              <Link href="/profile" className="px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 flex items-center gap-3">
                <User className="w-4 h-4" /> My profile
              </Link>
              <Link href="/dashboard" className="px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 flex items-center gap-3">
                <Rocket className="w-4 h-4" /> Dashboard
              </Link>
              <Link href="/courses" className="px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 flex items-center gap-3">
                <BookOpen className="w-4 h-4" /> My courses
              </Link>
              <Link href="/certificates" className="px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 flex items-center gap-3">
                <Award className="w-4 h-4" /> My certificates
              </Link>
              <Link href="/purchases" className="px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 flex items-center gap-3">
                <CreditCard className="w-4 h-4" /> Purchase history
              </Link>
              <Link href="/settings" className="px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 flex items-center gap-3">
                <Settings className="w-4 h-4" /> Account settings
              </Link>

              {user?.role === 'admin' && (
                <Link href="/admin" className="px-4 py-2 text-sm text-[#7F77DD] hover:bg-[#7F77DD]/10 flex items-center gap-3 border-t border-white/10 mt-1 pt-3">
                  <Shield className="w-4 h-4" /> Admin panel
                </Link>
              )}

              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 mt-1 text-sm text-red-400 hover:bg-red-400/10 flex items-center gap-3 border-t border-white/10"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}
