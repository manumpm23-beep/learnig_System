'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/apiClient';
import { 
  ArrowRight, BookOpen, Rocket, Sparkles, PlayCircle, Search, X, 
  Video, BarChart3, MessageSquare, Star, Filter, Award 
} from 'lucide-react';
import Header from '@/components/Layout/Header';
import { StarRating } from '@/components/common/StarRating';

function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0d0d14] font-sans selection:bg-[#7F77DD]/30 overflow-x-hidden">
      
      {/* 1. Navbar */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#7F77DD] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(127,119,221,0.5)]">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Learning Platform</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/50">
          <Link href="#" className="hover:text-white transition-colors">Courses</Link>
          <Link href="#" className="hover:text-white transition-colors">Subjects</Link>
          <Link href="#" className="hover:text-white transition-colors">Community</Link>
          <Link href="#" className="hover:text-white transition-colors">Pricing</Link>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/auth/login" className="text-sm font-medium text-white/80 hover:text-white transition-colors hidden sm:block">
            Sign in
          </Link>
          <Link href="/auth/register" className="text-sm font-medium bg-[#7F77DD] text-white px-5 py-2.5 rounded-lg hover:bg-[#6c65bd] transition-colors shadow-lg shadow-[#7F77DD]/20">
            Get started
          </Link>
        </div>
      </nav>

      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[500px] bg-[#7F77DD]/10 blur-[120px] rounded-full pointer-events-none" />
      
      {/* 2. Hero section */}
      <section className="pt-24 pb-20 px-4 max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7F77DD]/10 border border-[#7F77DD]/20 mb-8 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-[#7F77DD]" />
          <span className="text-sm font-medium text-[#7F77DD]">The next generation of learning</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 max-w-4xl leading-[1.15]">
          Master your future with <br className="hidden md:block"/>
          <span className="text-[#7F77DD]">premium learning</span>
        </h1>
        
        <p className="text-lg md:text-xl text-white/50 max-w-2xl mb-12 leading-relaxed font-medium">
          Unlock exclusive courses, interactive video tracking, and completely master your progress through our tightly engineered global syllabus.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-24">
          <Link href="/auth/register" className="w-full sm:w-auto px-8 py-4 bg-[#7F77DD] text-white font-semibold rounded-xl hover:bg-[#6c65bd] transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(127,119,221,0.3)]">
            Get started for free <ArrowRight className="w-4 h-4" />
          </Link>
          <button className="w-full sm:w-auto px-8 py-4 bg-transparent border border-white/10 text-white font-semibold rounded-xl hover:bg-white/5 transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
            <PlayCircle className="w-5 h-5" /> Watch demo
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-x-16 gap-y-8 border-y border-white/[0.08] py-10 w-full bg-white/[0.01]">
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-white mb-1">12,400+</span>
            <span className="text-sm text-white/50 font-medium">Active students</span>
          </div>
          <div className="hidden md:block w-px h-12 bg-white/[0.08]"></div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-white mb-1">340+</span>
            <span className="text-sm text-white/50 font-medium">Courses</span>
          </div>
          <div className="hidden md:block w-px h-12 bg-white/[0.08]"></div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-white mb-1">98%</span>
            <span className="text-sm text-white/50 font-medium">Completion rate</span>
          </div>
          <div className="hidden md:block w-px h-12 bg-white/[0.08]"></div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-white mb-1">4.9 star</span>
            <span className="text-sm text-white/50 font-medium">Avg. rating</span>
          </div>
        </div>
      </section>

      {/* 3. Features section */}
      <section className="py-24 px-4 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-[#7F77DD] font-bold text-sm tracking-widest uppercase mb-3">Platform features</h2>
          <h3 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Everything you need to learn better</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-[12px] p-8 hover:bg-white/[0.06] transition-colors">
            <div className="w-12 h-12 rounded-lg bg-[#7F77DD]/10 flex items-center justify-center mb-6 border border-[#7F77DD]/20">
              <Video className="w-6 h-6 text-[#7F77DD]" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Video lessons</h4>
            <p className="text-white/50 text-sm leading-relaxed">
              YouTube-embedded HD videos with playback speed, bookmarks and resume from where you left off.
            </p>
          </div>
          {/* Card 2 */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-[12px] p-8 hover:bg-white/[0.06] transition-colors">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-6 border border-green-500/20">
              <BarChart3 className="w-6 h-6 text-green-400" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Progress tracking</h4>
            <p className="text-white/50 text-sm leading-relaxed">
              Per-lesson completion bars, streak counters, and a student dashboard showing your overall growth.
            </p>
          </div>
          {/* Card 3 */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-[12px] p-8 hover:bg-white/[0.06] transition-colors">
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-6 border border-amber-500/20">
              <MessageSquare className="w-6 h-6 text-amber-400" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Q&A and comments</h4>
            <p className="text-white/50 text-sm leading-relaxed">
              Ask questions under any lesson. Instructors and peers respond within hours.
            </p>
          </div>
          {/* Card 4 */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-[12px] p-8 hover:bg-white/[0.06] transition-colors">
            <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center mb-6 border border-pink-500/20">
              <Star className="w-6 h-6 text-pink-400" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Ratings and reviews</h4>
            <p className="text-white/50 text-sm leading-relaxed">
              Read verified student reviews and ratings before enrolling in any course.
            </p>
          </div>
          {/* Card 5 */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-[12px] p-8 hover:bg-white/[0.06] transition-colors">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20">
              <Filter className="w-6 h-6 text-blue-400" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Smart filters</h4>
            <p className="text-white/50 text-sm leading-relaxed">
              Filter by subject, difficulty, duration, and rating. Find the exact course you need instantly.
            </p>
          </div>
          {/* Card 6 */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-[12px] p-8 hover:bg-white/[0.06] transition-colors">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20">
              <Award className="w-6 h-6 text-emerald-400" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Certificates</h4>
            <p className="text-white/50 text-sm leading-relaxed">
              Earn shareable certificates on completion. Add directly to your LinkedIn profile.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Popular courses section */}
      <section className="py-24 px-4 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="text-[#7F77DD] font-bold text-sm tracking-widest uppercase mb-3">Popular courses</h2>
            <h3 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Start with the best</h3>
          </div>
          <Link href="/auth/register" className="text-[#7F77DD] hover:text-[#6c65bd] font-medium mt-6 md:mt-0 flex items-center gap-1 transition-colors">
            View all courses <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Course 1 */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-[12px] overflow-hidden group cursor-pointer hover:bg-white/[0.06] transition-colors hover:-translate-y-1 duration-300">
            <div className="h-48 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 flex items-center justify-center relative">
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-black/40 backdrop-blur-md text-white border border-white/10 text-xs font-semibold px-3 py-1 rounded-md">Programming</span>
                <span className="bg-black/40 backdrop-blur-md text-white border border-white/10 text-xs font-semibold px-3 py-1 rounded-md">Beginner</span>
              </div>
              <BookOpen className="w-12 h-12 text-blue-400 opacity-80 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="p-6">
              <h4 className="text-xl font-bold text-white mb-3 group-hover:text-[#7F77DD] transition-colors">Python for beginners</h4>
              <div className="flex items-center gap-2 mb-5">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-white text-sm font-bold">4.9</span>
                <span className="text-white/30 text-xs">•</span>
                <span className="text-white/50 text-sm">1.2k enrolled</span>
              </div>
              <div className="flex items-center justify-between text-sm text-white/50 border-t border-white/[0.08] pt-5 font-medium">
                <span>24 lessons</span>
                <span>12 hours</span>
              </div>
            </div>
          </div>
          
          {/* Course 2 */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-[12px] overflow-hidden group cursor-pointer hover:bg-white/[0.06] transition-colors hover:-translate-y-1 duration-300">
            <div className="h-48 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center relative">
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-black/40 backdrop-blur-md text-white border border-white/10 text-xs font-semibold px-3 py-1 rounded-md">Web Dev</span>
                <span className="bg-black/40 backdrop-blur-md text-white border border-white/10 text-xs font-semibold px-3 py-1 rounded-md">Advanced</span>
              </div>
              <Rocket className="w-12 h-12 text-cyan-400 opacity-80 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="p-6">
              <h4 className="text-xl font-bold text-white mb-3 group-hover:text-[#7F77DD] transition-colors">React + Next.js mastery</h4>
              <div className="flex items-center gap-2 mb-5">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-white text-sm font-bold">4.8</span>
                <span className="text-white/30 text-xs">•</span>
                <span className="text-white/50 text-sm">980 enrolled</span>
              </div>
              <div className="flex items-center justify-between text-sm text-white/50 border-t border-white/[0.08] pt-5 font-medium">
                <span>42 lessons</span>
                <span>28 hours</span>
              </div>
            </div>
          </div>

          {/* Course 3 */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-[12px] overflow-hidden group cursor-pointer hover:bg-white/[0.06] transition-colors hover:-translate-y-1 duration-300">
            <div className="h-48 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 flex items-center justify-center relative">
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-black/40 backdrop-blur-md text-white border border-white/10 text-xs font-semibold px-3 py-1 rounded-md">Data</span>
                <span className="bg-black/40 backdrop-blur-md text-white border border-white/10 text-xs font-semibold px-3 py-1 rounded-md">Intermediate</span>
              </div>
              <BarChart3 className="w-12 h-12 text-emerald-400 opacity-80 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="p-6">
              <h4 className="text-xl font-bold text-white mb-3 group-hover:text-[#7F77DD] transition-colors">SQL and databases</h4>
              <div className="flex items-center gap-2 mb-5">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-white text-sm font-bold">4.7</span>
                <span className="text-white/30 text-xs">•</span>
                <span className="text-white/50 text-sm">760 enrolled</span>
              </div>
              <div className="flex items-center justify-between text-sm text-white/50 border-t border-white/[0.08] pt-5 font-medium">
                <span>18 lessons</span>
                <span>8 hours</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How it works section */}
      <section className="py-24 px-4 max-w-7xl mx-auto border-y border-white/[0.08] relative z-10 bg-white/[0.01]">
        <div className="text-center mb-20">
          <h3 className="text-3xl md:text-5xl font-bold text-white tracking-tight">How it works</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative max-w-5xl mx-auto">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-px bg-white/[0.08] -z-10"></div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#7F77DD] flex items-center justify-center text-white font-bold text-2xl mb-8 shadow-[0_0_30px_rgba(127,119,221,0.4)] border-4 border-[#0d0d14]">1</div>
            <h4 className="text-xl font-bold text-white mb-3">Create your free account</h4>
            <p className="text-white/50 leading-relaxed">Sign up in 30 seconds with Google or GitHub.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#7F77DD] flex items-center justify-center text-white font-bold text-2xl mb-8 shadow-[0_0_30px_rgba(127,119,221,0.4)] border-4 border-[#0d0d14]">2</div>
            <h4 className="text-xl font-bold text-white mb-3">Pick a course and enroll</h4>
            <p className="text-white/50 leading-relaxed">Browse by subject, filter by skill level, enroll instantly.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#7F77DD] flex items-center justify-center text-white font-bold text-2xl mb-8 shadow-[0_0_30px_rgba(127,119,221,0.4)] border-4 border-[#0d0d14]">3</div>
            <h4 className="text-xl font-bold text-white mb-3">Learn, track, and earn</h4>
            <p className="text-white/50 leading-relaxed">Watch lessons, track progress, ask questions, earn certificate.</p>
          </div>
        </div>
      </section>

      {/* 6. CTA banner */}
      <section className="py-24 px-4 max-w-5xl mx-auto text-center relative z-10">
        <div className="bg-gradient-to-b from-white/[0.05] to-transparent border border-white/[0.08] rounded-[24px] p-12 md:p-20 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[#7F77DD]/10 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-5 tracking-tight">Ready to start learning?</h3>
            <p className="text-xl text-white/50 mb-10 font-medium">Join 12,000+ students already on the platform</p>
            <Link href="/auth/register" className="inline-flex items-center gap-2 px-10 py-5 bg-[#7F77DD] text-white font-bold rounded-xl hover:bg-[#6c65bd] transition-all hover:scale-105 shadow-[0_0_40px_rgba(127,119,221,0.4)]">
              Get started for free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-white/[0.08] py-10 px-6 relative z-10 bg-[#0d0d14]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#7F77DD] rounded flex items-center justify-center">
              <Rocket className="w-3 h-3 text-white" />
            </div>
            <span className="text-white font-bold tracking-tight">Learning Platform</span>
          </div>
          <div className="text-white/40 text-sm font-medium">
            &copy; {new Date().getFullYear()} Learning Platform. All rights reserved.
          </div>
          <div className="flex gap-8 text-sm font-medium text-white/40">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
      
    </div>
  );
}

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [enrolledCourseMaps, setEnrolledCourseMaps] = useState<Record<string, string | null>>({});

  const initialQ = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'All';
  const initialSort = searchParams.get('sort') || 'newest';

  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState(initialSort);

  const categories = ['All', 'Frontend', 'Backend', 'Database', 'Fullstack', 'Computer Science', 'Tools', 'Design'];

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery);
    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    if (sortBy !== 'newest') params.set('sort', sortBy);
    router.push(`/?${params.toString()}`, { scroll: false });
  }, [searchQuery, selectedCategory, sortBy, router]);

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      const delayDebounceFn = setTimeout(() => {
        let url = '/api/subjects?pageSize=12&page=1';
        if (searchQuery.trim() !== '') url += `&q=${encodeURIComponent(searchQuery)}`;
        if (selectedCategory !== 'All') url += `&category=${encodeURIComponent(selectedCategory)}`;
        if (sortBy) url += `&sort=${encodeURIComponent(sortBy)}`;

        apiClient.get(url)
          .then(res => {
            setSubjects(res.data.data || []);
            setTotalCount(res.data.totalCount || 0);
          })
          .catch(console.error)
          .finally(() => setLoading(false));
      }, 500);

      apiClient.get('/api/dashboard')
          .then(res => {
              const map: Record<string, string | null> = {};
              res.data.enrolledCourses.forEach((c: any) => {
                  map[c.subjectId] = c.lastWatchedVideoId || 'enrolled_but_no_video_yet';
              });
              setEnrolledCourseMaps(map);
          })
          .catch(console.error);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setLoading(true);
      const delayDebounceFn = setTimeout(() => {
        let url = '/api/subjects?pageSize=12&page=1';
        if (searchQuery.trim() !== '') url += `&q=${encodeURIComponent(searchQuery)}`;
        if (selectedCategory !== 'All') url += `&category=${encodeURIComponent(selectedCategory)}`;
        if (sortBy) url += `&sort=${encodeURIComponent(sortBy)}`;

        apiClient.get(url)
          .then(res => {
            setSubjects(res.data.data || []);
            setTotalCount(res.data.totalCount || 0);
          })
          .catch(console.error)
          .finally(() => setLoading(false));
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [isAuthenticated, searchQuery, selectedCategory, sortBy]);

  const handleEnrollOrStart = async (courseId: string, slug: string) => {
      if (!isAuthenticated) return router.push('/auth/login');
      
      const enrolledValue = enrolledCourseMaps[courseId];
      if (enrolledValue) {
          if (enrolledValue === 'enrolled_but_no_video_yet') {
              router.push(`/subjects/${slug}`);
          } else {
              router.push(`/subjects/${slug}/video/${enrolledValue}`);
          }
      } else {
          try {
              await apiClient.post(`/api/subjects/${courseId}/enroll`);
              setEnrolledCourseMaps(prev => ({...prev, [courseId]: 'enrolled_but_no_video_yet'}));
          } catch(e) {
              console.error('Failed to enroll:', e);
          }
      }
  };

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24 font-sans selection:bg-purple-500/30">
      <Header theme="dark" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 relative">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 space-y-8 mb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tighter">Course Catalog</h1>
                  <p className="text-slate-400 mt-3 text-lg font-medium">Explore and seamlessly enroll in our available subjects.</p>
                </div>
                
                <div className="flex items-center gap-3 flex-shrink-0">
                  <label className="text-slate-400 font-medium text-sm">Sort by:</label>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white/5 border border-white/10 text-white rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500 transition-colors font-medium cursor-pointer"
                  >
                    <option value="newest" className="bg-gray-900">Newest</option>
                    <option value="popular" className="bg-gray-900">Most Popular</option>
                  </select>
                </div>
            </div>

            <div className="relative w-full shadow-lg">
               <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                 <Search className="h-5 w-5 text-gray-400" />
               </div>
               <input 
                 type="text" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-white/5 border border-white/10 text-white rounded-[2rem] py-4 pl-14 pr-14 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all font-medium placeholder-gray-500 backdrop-blur-md"
                 placeholder="Search courses..."
               />
               {searchQuery && (
                 <button 
                   onClick={() => setSearchQuery('')}
                   className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-white transition-colors"
                 >
                   <X className="h-5 w-5" />
                 </button>
               )}
            </div>

            <div className="flex flex-wrap gap-2.5">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                    selectedCategory === cat 
                      ? 'bg-gray-900 text-white shadow-xl shadow-black/50 border border-gray-700/50' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            <div className="text-slate-400 font-medium text-sm pt-4 border-t border-white/5">
              {loading ? 'Searching courses...' : `Showing ${totalCount} courses`}
            </div>
        </div>

        <div className="relative z-10">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-[420px] bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-xl animate-pulse" />
              ))}
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-24 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-xl shadow-2xl">
              <Search className="w-24 h-24 text-slate-700 mx-auto mb-6" />
              <h3 className="text-3xl font-extrabold text-white tracking-tight">No courses found</h3>
              <p className="text-slate-400 mt-4 font-medium text-lg max-w-md mx-auto">Try a different search term or category to discover your next learning adventure.</p>
              <button 
                onClick={() => { 
                  setSearchQuery(''); 
                  setSelectedCategory('All'); 
                  setSortBy('newest'); 
                  router.push('/', { scroll: false });
                }}
                className="mt-8 px-8 py-3.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-bold rounded-full border border-indigo-500/20 transition-all duration-300"
               >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {subjects.map(sub => (
                <Link
                  key={sub.id}
                  href={`/subjects/${sub.id}`}
                  className="group flex flex-col bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-xl hover:bg-white/10 hover:border-white/20 hover:-translate-y-2 transition-all duration-500 overflow-hidden cursor-pointer shadow-lg hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] h-full"
                >
                  <div  
                    className="h-56 shrink-0 bg-slate-900 bg-cover bg-center flex flex-col justify-end p-8 border-b border-white/5 relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500"
                    style={{ backgroundImage: sub.thumbnailUrl ? `url(${sub.thumbnailUrl})` : '' }}
                  >
                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/20 transition-colors duration-500 z-0" />
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px] z-0" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/20 to-transparent blur-2xl z-0" />

                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-500/50 transition-all duration-500 relative z-10 shadow-xl">
                      <PlayCircle className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-1 relative z-10">
                    <div className="flex flex-col items-start mb-3">
                       <h2 className="text-2xl font-extrabold text-white group-hover:text-indigo-400 transition-colors line-clamp-1 mb-1">{sub.title}</h2>
                       <div className="flex items-center gap-2">
                         {sub.totalReviews > 0 ? (
                           <>
                             <span className="text-white font-bold">{Number(sub.averageRating || 0).toFixed(1)}</span>
                             <StarRating rating={sub.averageRating || 0} size="sm" interactive={false} />
                             <span className="text-gray-400 text-sm font-medium">({sub.totalReviews} reviews)</span>
                           </>
                         ) : (
                           <span className="text-gray-400 text-sm font-medium">No reviews yet</span>
                         )}
                       </div>
                    </div>
                    {sub.category && (
                      <span className="inline-block px-3 py-1 bg-white/10 text-slate-300 text-xs font-bold rounded-lg mb-4 w-fit border border-white/5">
                        {sub.category}
                      </span>
                    )}
                    <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed flex-1 font-medium">
                      {sub.description || 'A comprehensive structural overview natively diving strictly into the core architectural layouts of the syllabus.'}
                    </p>
                    <div className="mt-8 flex justify-between items-center text-sm font-bold uppercase transition-all duration-300">
                      <button 
                        onClick={(e) => { e.preventDefault(); handleEnrollOrStart(sub.id, sub.slug); }}
                        className={`flex items-center group-hover:gap-3 transition-all ${enrolledCourseMaps[sub.id] ? 'text-emerald-400 group-hover:text-emerald-300' : 'text-indigo-400 group-hover:text-pink-400'}`}
                      >
                         {enrolledCourseMaps[sub.id] ? 'Continue Learning' : 'Enroll Now'}
                         <ArrowRight className="w-5 h-5 ml-1" />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <HomePageContent />
    </Suspense>
  );
}