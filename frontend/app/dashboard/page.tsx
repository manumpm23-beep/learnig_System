'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/apiClient';
import { 
  Rocket, Bell, BookOpen, CheckCircle, Clock, Flame, 
  BarChart2, Play, Activity, Sparkles, Trophy, UserPlus, 
  Award, ArrowRight, PlayCircle, Star
} from 'lucide-react';
import Navbar from '@/components/Layout/Navbar';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      Promise.all([
        apiClient.get('/api/dashboard'),
        apiClient.get('/api/subjects?pageSize=50&page=1')
      ])
        .then(([dashRes, subRes]) => {
          setData(dashRes.data);
          setSubjects(subRes.data.data || []);
        })
        .catch(err => {
          console.error(err);
        })
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated]);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#7F77DD]/30 border-t-[#7F77DD] rounded-full animate-spin"></div>
      </div>
    );
  }

  const { stats, enrolledCourses } = data;
  const currentStreak = stats.currentStreak || 0;
  const completedDatesSet = new Set(stats.completedDates || []);
  
  // Build Streak Calendar Array (last 28 days for 4x7 grid)
  const calendarDays = [];
  const today = new Date();
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    calendarDays.push({
      dateStr,
      active: completedDatesSet.has(dateStr)
    });
  }

  // Recommended courses (not enrolled, top rated)
  const enrolledIds = new Set(enrolledCourses.map((c: any) => c.subjectId));
  const recommendedCourses = subjects
    .filter(c => !enrolledIds.has(c.id))
    .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
    .slice(0, 3);

  // Activity Feed (Fallback to enrollment history)
  const activityFeed = enrolledCourses.map((c: any) => ({
    id: `enr-${c.subjectId}`,
    type: 'enrolled',
    icon: <BookOpen className="w-4 h-4 text-[#7F77DD]" />,
    text: `Enrolled in ${c.title}`,
    time: new Date(c.enrolledAt).toLocaleDateString()
  }));

  // Achievements
  const achievements = [
    {
      id: 'first-enroll',
      title: 'First enroll',
      icon: <UserPlus className="w-5 h-5" />,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      isUnlocked: enrolledCourses.length >= 1
    },
    {
      id: '7-day-streak',
      title: '7-day streak',
      icon: <Flame className="w-5 h-5" />,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20',
      isUnlocked: currentStreak >= 7
    },
    {
      id: 'first-completion',
      title: 'First completion',
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20',
      isUnlocked: stats.totalCompletedCourses >= 1
    },
    {
      id: 'certified',
      title: 'Certified',
      icon: <Award className="w-5 h-5" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      isUnlocked: false // Mocked for now
    }
  ];

  const handleEnroll = async (courseId: string) => {
    try {
      await apiClient.post(`/api/subjects/${courseId}/enroll`);
      const dashRes = await apiClient.get('/api/dashboard');
      setData(dashRes.data);
    } catch (err) {
      console.error('Failed to enroll:', err);
    }
  };

  const initial = user?.name?.[0]?.toUpperCase() || 'U';

  // Last active course for resume learning
  const lastActiveCourse = enrolledCourses.length > 0 ? enrolledCourses[0] : null;

  return (
    <div className="min-h-screen bg-[#0d0d14] font-sans selection:bg-[#7F77DD]/30 flex flex-col">
      
      {/* 1. Navbar */}
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative">
        <div className="absolute top-0 right-10 w-96 h-96 bg-[#7F77DD]/5 blur-[120px] rounded-full pointer-events-none" />

        {/* 2. Welcome row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-[#534AB7] border-2 border-[#7F77DD]/40 flex items-center justify-center text-white font-bold text-2xl shadow-[0_0_20px_rgba(127,119,221,0.3)] shrink-0">
              {initial}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-1">
                Welcome back, {user?.name?.split(' ')[0] || 'Learner'}!
              </h1>
              <p className="text-white/50 text-sm md:text-base">
                Here's your learning progress — keep the streak going.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/courses" className="px-5 py-2.5 bg-white/[0.04] border border-white/[0.08] text-white text-sm font-bold rounded-lg hover:bg-white/[0.08] transition-colors">
              Browse courses
            </Link>
            {lastActiveCourse && (
              <Link 
                href={lastActiveCourse.lastWatchedVideoId ? `/subjects/${lastActiveCourse.subjectId}/video/${lastActiveCourse.lastWatchedVideoId}` : `/subjects/${lastActiveCourse.subjectId}`}
                className="px-5 py-2.5 bg-[#7F77DD] text-white text-sm font-bold rounded-lg hover:bg-[#6c65bd] transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(127,119,221,0.3)]"
              >
                Resume learning <PlayCircle className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* 3. Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 relative z-10">
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-[12px] p-5 flex flex-col hover:border-[#7F77DD]/35 transition-colors">
            <div className="w-9 h-9 rounded-[9px] bg-purple-500/10 flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-3xl font-bold text-white mb-1">{stats.totalEnrolledCourses}</span>
            <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-2">Courses enrolled</span>
            <span className="text-emerald-400 text-xs font-medium">+1 this week</span>
          </div>

          <div className="bg-white/[0.04] border border-white/[0.08] rounded-[12px] p-5 flex flex-col hover:border-[#7F77DD]/35 transition-colors">
            <div className="w-9 h-9 rounded-[9px] bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-3xl font-bold text-white mb-1">{stats.totalCompletedCourses}</span>
            <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-2">Courses completed</span>
            <span className="text-white/30 text-xs font-medium">In progress</span>
          </div>

          <div className="bg-white/[0.04] border border-white/[0.08] rounded-[12px] p-5 flex flex-col hover:border-[#7F77DD]/35 transition-colors">
            <div className="w-9 h-9 rounded-[9px] bg-blue-500/10 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-3xl font-bold text-white mb-1">{stats.totalHoursWatched}</span>
            <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-2">Hours watched</span>
            <span className="text-white/30 text-xs font-medium">Start learning!</span>
          </div>

          <div className="bg-white/[0.04] border border-white/[0.08] rounded-[12px] p-5 flex flex-col hover:border-[#7F77DD]/35 transition-colors">
            <div className="w-9 h-9 rounded-[9px] bg-amber-500/10 flex items-center justify-center mb-4">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-3xl font-bold text-white mb-1">{currentStreak}</span>
            <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-2">Day streak</span>
            <span className="text-white/30 text-xs font-medium">Start today!</span>
          </div>
        </div>

        {/* 4. Two-column layout below stats */}
        <div className="flex flex-col lg:flex-row gap-6 relative z-10">
          
          {/* LEFT COLUMN (2/3) */}
          <div className="lg:w-2/3 flex flex-col gap-6">
            
            {/* Card A — Learning streak */}
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-[12px] p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" /> Learning streak
                </h3>
                <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold rounded-full">
                  {currentStreak} day streak
                </span>
              </div>
              <div className="grid grid-cols-7 gap-2 mb-4 max-w-sm">
                {calendarDays.map((day, i) => (
                  <div 
                    key={i} 
                    title={day.dateStr}
                    className={`aspect-square rounded-[4px] ${day.active ? 'bg-[#7F77DD] shadow-[0_0_10px_rgba(127,119,221,0.5)]' : 'bg-white/[0.07]'}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-4 text-xs text-white/40 font-medium">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#7F77DD]"></div> Active day
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-white/[0.15]"></div> Inactive day
                </div>
              </div>
            </div>

            {/* Card B — Course progress */}
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-[12px] p-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                <BarChart2 className="w-5 h-5 text-[#7F77DD]" /> Course progress
              </h3>
              
              {enrolledCourses.length === 0 ? (
                <div className="text-white/30 text-sm py-4">No courses enrolled yet.</div>
              ) : (
                <div className="space-y-6">
                  {enrolledCourses.map((course: any) => (
                    <div key={course.subjectId} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white truncate mb-2">{course.title}</h4>
                        <div className="w-full h-[4px] bg-white/[0.08] rounded-full overflow-hidden mb-1.5">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${course.percentComplete || 0}%` }}></div>
                        </div>
                        <div className="text-[11px] text-white/40 font-medium">
                          {course.completedVideos || 0} of {course.totalVideos || 0} lessons · {Math.round(course.percentComplete || 0)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Card C — My courses grid */}
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-[12px] p-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                <BookOpen className="w-5 h-5 text-[#7F77DD]" /> My courses
              </h3>

              {enrolledCourses.length === 0 ? (
                <div className="text-white/30 text-sm py-4">You have not enrolled in any courses yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {enrolledCourses.map((course: any) => (
                    <div key={course.subjectId} className="bg-white/[0.02] border border-white/[0.05] rounded-xl overflow-hidden group hover:border-[#7F77DD]/30 transition-colors">
                      <div className="h-32 bg-slate-900 relative overflow-hidden shrink-0">
                        {course.thumbnailUrl && <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />}
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white border border-white/10 text-[10px] font-semibold px-2 py-1 rounded">
                          {course.category || 'Course'}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-10 h-10 bg-black/40 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white">
                            <Play className="w-4 h-4 ml-0.5" />
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="text-sm font-bold text-white line-clamp-1 mb-1">{course.title}</h4>
                        <p className="text-xs text-white/40 mb-3">{course.completedVideos || 0} of {course.totalVideos || 0} lessons</p>
                        
                        <div className="w-full h-[3px] bg-white/[0.08] rounded-full mb-3 overflow-hidden">
                          <div className="h-full bg-[#7F77DD] rounded-full" style={{ width: `${course.percentComplete || 0}%` }}></div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#7F77DD]">{Math.round(course.percentComplete || 0)}%</span>
                          <Link 
                            href={course.lastWatchedVideoId ? `/subjects/${course.subjectId}/video/${course.lastWatchedVideoId}` : `/subjects/${course.subjectId}`}
                            className="px-3 py-1.5 bg-[#7F77DD]/10 text-[#7F77DD] text-xs font-bold rounded hover:bg-[#7F77DD]/20 transition-colors"
                          >
                            {course.lastWatchedVideoId ? 'Continue' : 'Start'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN (1/3) */}
          <div className="lg:w-1/3 flex flex-col gap-6">
            
            {/* Card D — Recent activity feed */}
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-[12px] p-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-[#7F77DD]" /> Recent activity
              </h3>
              
              {activityFeed.length === 0 ? (
                <div className="text-white/30 text-sm py-4">No watch history yet — start a lesson!</div>
              ) : (
                <div className="space-y-5">
                  {activityFeed.map((item: any, i: number) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-sm text-white/80 font-medium">{item.text}</p>
                        <p className="text-[11px] text-white/40 mt-0.5">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Card E — Recommended for you */}
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-[12px] p-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-amber-400" /> Recommended
              </h3>

              {recommendedCourses.length === 0 ? (
                <div className="text-white/30 text-sm py-4">No new recommendations available.</div>
              ) : (
                <div className="space-y-4">
                  {recommendedCourses.map(course => (
                    <div key={course.id} className="flex items-start justify-between gap-3 group">
                      <div className="w-10 h-10 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-[#7F77DD] transition-colors">{course.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-white/40">24 lessons</span>
                          <span className="text-white/20 text-[10px]">•</span>
                          <div className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-[11px] font-bold text-white">{Number(course.averageRating || 0).toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleEnroll(course.id)}
                        className="px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-white text-xs font-bold rounded transition-colors shrink-0"
                      >
                        Enroll
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Card F — Achievements grid */}
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-[12px] p-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                <Trophy className="w-5 h-5 text-yellow-500" /> Achievements
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {achievements.map(ach => (
                  <div 
                    key={ach.id} 
                    className={`p-3 rounded-lg border flex flex-col items-center text-center transition-colors ${
                      ach.isUnlocked 
                        ? `${ach.bgColor} border-white/10` 
                        : 'bg-white/[0.02] border-white/[0.05]'
                    }`}
                  >
                    <div className={`mb-2 ${ach.isUnlocked ? ach.color : 'text-white/20'}`}>
                      {ach.icon}
                    </div>
                    <span className={`text-[11px] font-bold ${ach.isUnlocked ? 'text-white' : 'text-white/30'}`}>
                      {ach.isUnlocked ? ach.title : 'Locked'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
