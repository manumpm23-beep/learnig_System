'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/apiClient';
import { useAuthStore } from '@/store/authStore';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Search, LayoutGrid, List, Star, 
  Database, Layers, Monitor, PenTool, LayoutTemplate,
  CheckCircle, Clock, Bookmark, Play, ArrowRight
} from 'lucide-react';
import Navbar from '@/components/Layout/Navbar';

export default function CoursesCatalogPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  
  const [courses, setCourses] = useState<any[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedSidebarFilter, setSelectedSidebarFilter] = useState('All courses');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [coursesRes, dashboardRes] = await Promise.all([
          apiClient.get('/api/subjects?pageSize=100&page=1'),
          apiClient.get('/api/dashboard')
        ]);
        
        setCourses(coursesRes.data.data || []);
        setEnrolledCourses(dashboardRes.data.enrolledCourses || []);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, router]);

  const handleEnroll = async (course: any) => {
    if (course.price > 0) {
      handlePayment(course);
      return;
    }
    
    try {
      await apiClient.post(`/api/subjects/${course.id}/enroll`);
      // Re-fetch dashboard to update enrolled status
      const dashboardRes = await apiClient.get('/api/dashboard');
      setEnrolledCourses(dashboardRes.data.enrolledCourses || []);
      toast.success("Enrolled successfully!");
    } catch (err) {
      console.error('Failed to enroll:', err);
      toast.error("Failed to enroll");
    }
  };

  const handlePayment = async (course: any) => {
    try {
      const isLoaded = await new Promise((resolve) => {
        if ((window as any).Razorpay) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
      
      if (!isLoaded) {
        toast.error("Failed to load Razorpay SDK. Check your connection.");
        return;
      }

      const { data } = await apiClient.post('/api/payments/create-order', { course_id: course.id });
      
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "Learning Platform",
        description: data.course_title,
        order_id: data.order_id,
        handler: async function (response: any) {
          try {
            await apiClient.post("/api/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              course_id: course.id
            });
            toast.success("Payment successful! Course unlocked.");
            const dashboardRes = await apiClient.get('/api/dashboard');
            setEnrolledCourses(dashboardRes.data.enrolledCourses || []);
          } catch (e) {
            toast.error("Payment verification failed.");
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email
        },
        theme: {
          color: "#7F77DD"
        }
      };
      
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        toast.error("Payment failed. Please try again.");
      });
      rzp.open();
    } catch (err) {
      console.error("Failed to create order", err);
      toast.error("Failed to initiate payment");
    }
  };

  // derived state for filtered courses
  let filteredCourses = courses;
  
  if (searchQuery.trim()) {
    filteredCourses = filteredCourses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }
  
  if (selectedSubject !== 'All') {
    filteredCourses = filteredCourses.filter(c => c.category === selectedSubject);
  }
  
  const enrolledCourseIds = new Set(enrolledCourses.map(c => c.subjectId));
  const completedCourseIds = new Set(enrolledCourses.filter(c => c.isCompleted).map(c => c.subjectId));
  
  if (selectedSidebarFilter === 'In progress') {
    filteredCourses = filteredCourses.filter(c => enrolledCourseIds.has(c.id) && !completedCourseIds.has(c.id));
  } else if (selectedSidebarFilter === 'Completed') {
    filteredCourses = filteredCourses.filter(c => completedCourseIds.has(c.id));
  } else if (selectedSidebarFilter === 'Saved') {
    filteredCourses = []; 
  }

  // Sort
  if (sortBy === 'newest') {
    filteredCourses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sortBy === 'popular') {
    filteredCourses.sort((a, b) => (b.totalReviews || 0) - (a.totalReviews || 0));
  } else if (sortBy === 'rating') {
    filteredCourses.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
  } else if (sortBy === 'a-z') {
    filteredCourses.sort((a, b) => a.title.localeCompare(b.title));
  }

  const subjectsList = [
    { name: 'All', icon: <Layers className="w-4 h-4" /> },
    { name: 'Frontend', icon: <LayoutTemplate className="w-4 h-4" /> },
    { name: 'Backend', icon: <Database className="w-4 h-4" /> },
    { name: 'Database', icon: <Database className="w-4 h-4" /> },
    { name: 'Fullstack', icon: <Layers className="w-4 h-4" /> },
    { name: 'Computer Science', icon: <Monitor className="w-4 h-4" /> },
    { name: 'Tools', icon: <PenTool className="w-4 h-4" /> },
    { name: 'Design', icon: <PenTool className="w-4 h-4" /> },
  ];

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#0d0d14] font-sans selection:bg-[#7F77DD]/30 flex flex-col overflow-hidden h-screen">
      <Toaster position="top-right" />
      {/* Navbar */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar */}
        <aside className="w-[200px] border-r border-white/[0.08] hidden lg:flex flex-col py-6 px-4 shrink-0 bg-[#0d0d14] overflow-y-auto">
          <div className="mb-8">
            <h4 className="text-xs font-bold text-white/30 uppercase tracking-wider mb-3 px-2">Browse</h4>
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => setSelectedSidebarFilter('All courses')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${selectedSidebarFilter === 'All courses' ? 'bg-[#7F77DD]/15 text-[#7F77DD]' : 'text-white/50 hover:text-white hover:bg-white/[0.04]'}`}
                >
                  <div className="flex items-center gap-3">
                    <Layers className="w-4 h-4" /> All courses
                  </div>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setSelectedSidebarFilter('Saved')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${selectedSidebarFilter === 'Saved' ? 'bg-[#7F77DD]/15 text-[#7F77DD]' : 'text-white/50 hover:text-white hover:bg-white/[0.04]'}`}
                >
                  <div className="flex items-center gap-3">
                    <Bookmark className="w-4 h-4" /> Saved
                  </div>
                  <span className="bg-white/5 text-white/50 text-[10px] py-0.5 px-2 rounded-full font-bold">0</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setSelectedSidebarFilter('In progress')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${selectedSidebarFilter === 'In progress' ? 'bg-[#7F77DD]/15 text-[#7F77DD]' : 'text-white/50 hover:text-white hover:bg-white/[0.04]'}`}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4" /> In progress
                  </div>
                  <span className="bg-white/5 text-white/50 text-[10px] py-0.5 px-2 rounded-full font-bold">
                    {enrolledCourses.filter(c => !c.isCompleted).length}
                  </span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setSelectedSidebarFilter('Completed')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${selectedSidebarFilter === 'Completed' ? 'bg-[#7F77DD]/15 text-[#7F77DD]' : 'text-white/50 hover:text-white hover:bg-white/[0.04]'}`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4" /> Completed
                  </div>
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white/30 uppercase tracking-wider mb-3 px-2">Subjects</h4>
            <ul className="space-y-1">
              {subjectsList.slice(1).map(subject => (
                <li key={subject.name}>
                  <button 
                    onClick={() => { setSelectedSubject(subject.name); setSelectedSidebarFilter('All courses'); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${selectedSubject === subject.name ? 'bg-[#7F77DD]/15 text-[#7F77DD]' : 'text-white/50 hover:text-white hover:bg-white/[0.04]'}`}
                  >
                    {subject.icon} {subject.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#0d0d14] relative p-6 md:p-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#7F77DD]/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 relative z-10">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Course catalog</h1>
                <p className="text-white/50 text-sm md:text-base">Explore and seamlessly enroll in our available subjects.</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <label className="text-white/40 font-medium text-sm">Sort by:</label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white/[0.04] border border-white/[0.08] text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#7F77DD]/50 transition-colors cursor-pointer appearance-none pr-8 relative"
                  style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23999999%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7rem top 50%', backgroundSize: '.65rem auto' }}
                >
                  <option value="newest" className="bg-[#0d0d14]">Newest</option>
                  <option value="popular" className="bg-[#0d0d14]">Popular</option>
                  <option value="rating" className="bg-[#0d0d14]">Rating</option>
                  <option value="a-z" className="bg-[#0d0d14]">A–Z</option>
                </select>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-6 z-10">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-white/40" />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-[#7F77DD]/50 focus:bg-white/[0.06] transition-all placeholder-white/30"
                placeholder="Search courses..."
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 z-10 relative">
              <div className="flex flex-wrap gap-2">
                {subjectsList.map(subject => (
                  <button
                    key={subject.name}
                    onClick={() => { setSelectedSubject(subject.name); setSelectedSidebarFilter('All courses'); }}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedSubject === subject.name 
                        ? 'bg-[#7F77DD]/20 text-[#7F77DD] border border-[#7F77DD]/30' 
                        : 'bg-white/[0.04] text-white/60 hover:text-white border border-white/[0.08] hover:bg-white/[0.08]'
                    }`}
                  >
                    {subject.name}
                  </button>
                ))}
              </div>
              <div className="flex gap-1 shrink-0 bg-white/[0.04] p-1 rounded-lg border border-white/[0.08]">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-[#7F77DD] text-white shadow-sm' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-[#7F77DD] text-white shadow-sm' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-white/50 text-sm font-medium mb-6">
              Showing {filteredCourses.length} courses
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="bg-white/[0.02] border border-white/[0.05] rounded-[12px] h-[360px] animate-pulse" />
                ))}
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="py-24 text-center border border-white/[0.08] rounded-[12px] bg-white/[0.02]">
                <Search className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No courses found</h3>
                <p className="text-white/50 text-sm">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {filteredCourses.map(course => {
                  const enrolledData = enrolledCourses.find(c => c.subjectId === course.id);
                  const isEnrolled = !!enrolledData;
                  const percentComplete = enrolledData?.percentComplete || 0;
                  const lastVideo = enrolledData?.lastWatchedVideoId || 'enrolled_but_no_video_yet';

                  return (
                    <div 
                      key={course.id} 
                      className={`group bg-white/[0.04] border border-white/[0.08] hover:border-[#7F77DD]/35 hover:bg-white/[0.06] rounded-[12px] overflow-hidden transition-all duration-300 flex ${viewMode === 'list' ? 'flex-col sm:flex-row' : 'flex-col'}`}
                    >
                      <div className={`${viewMode === 'list' ? 'sm:w-64 h-48 sm:h-auto' : 'h-48'} bg-slate-900 bg-cover bg-center relative shrink-0 overflow-hidden`} style={{ backgroundImage: course.thumbnailUrl ? `url(${course.thumbnailUrl})` : '' }}>
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-0" />
                        <div className="absolute top-3 left-3 flex gap-2 z-10">
                          {course.category && (
                            <span className="bg-black/60 backdrop-blur-md text-white border border-white/10 text-[10px] font-semibold px-2 py-1 rounded">
                              {course.category}
                            </span>
                          )}
                          <span className="bg-black/60 backdrop-blur-md text-white border border-white/10 text-[10px] font-semibold px-2 py-1 rounded">
                            Beginner
                          </span>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-90 group-hover:scale-100">
                          <div className="w-12 h-12 bg-black/40 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white">
                            <Play className="w-5 h-5 ml-1" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-white mb-2 group-hover:text-[#7F77DD] transition-colors line-clamp-1">{course.title}</h4>
                          <p className="text-white/50 text-sm line-clamp-2 mb-4 leading-relaxed">
                            {course.description || 'A comprehensive overview designed to build your core skills step by step through interactive video learning.'}
                          </p>
                          <div className="flex items-center gap-3 mb-5">
                            <div className="flex items-center gap-1.5">
                              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                              <span className="text-white text-xs font-bold">{course.averageRating ? Number(course.averageRating).toFixed(1) : '0.0'}</span>
                              <span className="text-white/40 text-xs">({course.totalReviews || 0})</span>
                            </div>
                            <span className="text-white/20 text-xs">•</span>
                            <span className="text-white/50 text-xs font-medium">24 lessons (12h)</span>
                          </div>
                        </div>

                        {isEnrolled ? (
                          <div className="mt-auto pt-4 border-t border-white/[0.08]">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs text-white/50 font-medium">Progress</span>
                              <span className="text-xs text-[#7F77DD] font-bold">{percentComplete}%</span>
                            </div>
                            <div className="w-full h-[3px] bg-white/[0.08] rounded-full mb-4 overflow-hidden">
                              <div className="h-full bg-[#7F77DD] rounded-full" style={{ width: `${percentComplete}%` }} />
                            </div>
                            <Link 
                              href={lastVideo === 'enrolled_but_no_video_yet' ? `/subjects/${course.id}` : `/subjects/${course.id}/video/${lastVideo}`}
                              className="w-full py-2.5 bg-[#7F77DD]/10 text-[#7F77DD] text-sm font-bold rounded-lg border border-[#7F77DD]/20 hover:bg-[#7F77DD]/20 transition-colors flex items-center justify-center gap-2"
                            >
                              Continue learning <ArrowRight className="w-4 h-4" />
                            </Link>
                          </div>
                        ) : (
                          <div className="mt-auto pt-4 border-t border-white/[0.08] flex items-center justify-between">
                            {course.price === 0 ? (
                              <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded">Free</span>
                            ) : (
                              <span className="text-white font-bold text-lg">₹{course.price}</span>
                            )}
                            <button 
                              onClick={() => handleEnroll(course)}
                              className="px-6 py-2.5 bg-white/[0.04] text-white hover:text-white text-sm font-bold rounded-lg border border-white/[0.08] hover:bg-white/[0.1] hover:border-white/[0.15] transition-all"
                            >
                              {course.price > 0 ? "Buy now" : "Enroll now"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
