'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/apiClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, BookOpen, Award, Lock, Bell, 
  MapPin, Pencil, Shield, Check, Camera,
  LogOut, Share, Github, Linkedin, Laptop, AlertTriangle,
  PlayCircle, CheckCircle, ArrowRight, Home
} from 'lucide-react';
import Navbar from '@/components/Layout/Navbar';
import toast, { Toaster } from 'react-hot-toast';

export default function ProfilePage() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('info');
  const [profileData, setProfileData] = useState<any>(null);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dateOfBirth: '',
    location: '',
    currentStudying: '',
    pastStudy: '',
    bio: '',
    linkedinUrl: '',
    githubUrl: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [userRes, subjectsRes] = await Promise.all([
        apiClient.get('/api/auth/me'),
        apiClient.get('/api/subjects?pageSize=100')
      ]);
      
      const userData = userRes.data.user;
      setProfileData(userData);
      
      // Init form data
      setFormData({
        name: userData.name || '',
        phone: userData.phone || '',
        dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : '',
        location: userData.location || '',
        currentStudying: userData.currentStudying || '',
        pastStudy: userData.pastStudy || '',
        bio: userData.bio || '',
        linkedinUrl: userData.linkedinUrl || '',
        githubUrl: userData.githubUrl || ''
      });

      // Load progress
      const subjects = subjectsRes.data.data;
      const promises = subjects.map((sub: any) =>
        apiClient.get(`/api/progress/subjects/${sub.id}`)
          .then(pRes => ({ subject: sub, progress: pRes.data }))
          .catch(() => ({ subject: sub, progress: null }))
      );
      const results = await Promise.all(promises);
      const activeCourses = results.filter(r => r.progress && r.progress.totalVideos > 0);
      setProgressData(activeCourses);

    } catch (e) {
      console.error(e);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      // Create a payload removing empty strings
      const payload: any = { ...formData };
      if (!payload.dateOfBirth) delete payload.dateOfBirth;

      await apiClient.put('/api/auth/me', payload);
      toast.success('Profile updated successfully!');
      loadData(); // Refresh data
    } catch (e) {
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#7F77DD]/30 border-t-[#7F77DD] rounded-full animate-spin"></div>
      </div>
    );
  }

  const initial = profileData?.name?.charAt(0).toUpperCase() || 'U';
  const joinedDate = new Date(profileData?.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#0d0d14] text-[#e8e8f0] font-sans selection:bg-[#7F77DD]/30">
      <Toaster position="top-right" />
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-10">
        
        {/* Profile Header */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 flex flex-col md:flex-row items-start gap-6 mb-6">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full bg-[#534AB7] border-2 border-[#7F77DD]/40 flex items-center justify-center text-3xl font-medium text-white shadow-[0_0_15px_rgba(127,119,221,0.2)]">
              {initial}
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#7F77DD] rounded-full border-2 border-[#0d0d14] flex items-center justify-center cursor-pointer hover:bg-[#6c65bd] transition-colors">
              <Camera className="w-3 h-3 text-white" />
            </div>
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-medium text-white mb-1">{profileData?.name}</h1>
            <div className="text-[13px] text-white/40 mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#5DCAA5] rounded-full"></div>
              {profileData?.email}
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-[11px] px-3 py-1 rounded-full bg-[#7F77DD]/15 text-[#AFA9EC]">
                {profileData?.role === 'admin' ? 'Admin' : 'Student'}
              </span>
              {profileData?.currentStudying && (
                <span className="text-[11px] px-3 py-1 rounded-full bg-[#378add]/15 text-[#85B7EB]">
                  {profileData.currentStudying}
                </span>
              )}
            </div>
            
            <p className="text-[13px] text-white/45 leading-relaxed max-w-2xl mb-4">
              {profileData?.bio || "No bio added yet. Tell us about yourself!"}
            </p>
            
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setActiveTab('info')} className="bg-[#7F77DD] hover:bg-[#6c65bd] transition-colors text-white text-[13px] font-medium px-4 py-2 rounded-lg flex items-center gap-2">
                <Pencil className="w-3.5 h-3.5" /> Edit profile
              </button>
              <button className="bg-transparent border border-white/10 hover:bg-white/5 transition-colors text-white/50 text-[13px] px-4 py-2 rounded-lg flex items-center gap-2">
                <Share className="w-3.5 h-3.5" /> Share profile
              </button>
            </div>
          </div>

          <div className="text-right shrink-0 hidden md:block">
            <div className="text-[11px] text-white/25 mb-1">Member since</div>
            <div className="text-[13px] text-white/50 mb-4">{joinedDate}</div>
            <div className="text-[11px] text-white/25 mb-1">Last active</div>
            <div className="text-[13px] text-[#5DCAA5]">Today</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#7F77DD]/15 text-[#AFA9EC] flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-medium text-white">{progressData.length}</div>
              <div className="text-[11px] text-white/30 mt-0.5">Courses enrolled</div>
            </div>
          </div>
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#1d9e75]/15 text-[#5DCAA5] flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-medium text-white">
                {progressData.filter(p => p.progress.percentage === 100).length}
              </div>
              <div className="text-[11px] text-white/30 mt-0.5">Completed</div>
            </div>
          </div>
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#ef9f27]/15 text-[#EF9F27] flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-medium text-white">1</div>
              <div className="text-[11px] text-white/30 mt-0.5">Day streak</div>
            </div>
          </div>
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#378add]/15 text-[#85B7EB] flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-medium text-white">0</div>
              <div className="text-[11px] text-white/30 mt-0.5">Certificates</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 bg-white/[0.04] border border-white/[0.08] rounded-xl p-1 mb-6">
          {[
            { id: 'info', icon: <User className="w-4 h-4" />, label: 'Personal info' },
            { id: 'courses', icon: <BookOpen className="w-4 h-4" />, label: 'My courses' },
            { id: 'certs', icon: <Award className="w-4 h-4" />, label: 'Certificates' },
            { id: 'security', icon: <Lock className="w-4 h-4" />, label: 'Security' },
            { id: 'notifs', icon: <Bell className="w-4 h-4" />, label: 'Notifications' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] transition-colors ${
                activeTab === tab.id 
                  ? 'bg-[#7F77DD]/20 text-[#AFA9EC] font-medium' 
                  : 'text-white/45 hover:text-white/80'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'info' && (
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
                <h3 className="text-[13px] font-medium text-white flex items-center gap-2 mb-5">
                  <User className="w-4 h-4 text-[#AFA9EC]" /> Personal information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[12px] text-white/35 mb-1.5">Full name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#7F77DD]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] text-white/35 mb-1.5">Email address</label>
                    <input 
                      type="email" 
                      disabled
                      value={profileData?.email}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[13px] text-white/50 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] text-white/35 mb-1.5">Phone number</label>
                    <input 
                      type="text" 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#7F77DD]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] text-white/35 mb-1.5">Date of birth</label>
                    <input 
                      type="date" 
                      value={formData.dateOfBirth}
                      onChange={e => setFormData({...formData, dateOfBirth: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#7F77DD]/50"
                    />
                  </div>
                  
                  <div className="pt-4 mt-2 border-t border-white/[0.07] flex justify-end">
                    <button type="submit" className="bg-[#7F77DD] hover:bg-[#6c65bd] text-white text-[13px] font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                      <Check className="w-3.5 h-3.5" /> Save changes
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
                  <h3 className="text-[13px] font-medium text-white flex items-center gap-2 mb-5">
                    <MapPin className="w-4 h-4 text-[#AFA9EC]" /> Location & education
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[12px] text-white/35 mb-1.5">City / Location</label>
                      <input 
                        type="text" 
                        value={formData.location}
                        onChange={e => setFormData({...formData, location: e.target.value})}
                        placeholder="e.g. Bangalore"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#7F77DD]/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] text-white/35 mb-1.5">College / University</label>
                      <input 
                        type="text" 
                        value={formData.pastStudy}
                        onChange={e => setFormData({...formData, pastStudy: e.target.value})}
                        placeholder="Your college name"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#7F77DD]/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] text-white/35 mb-1.5">Course / Degree</label>
                      <input 
                        type="text" 
                        value={formData.currentStudying}
                        onChange={e => setFormData({...formData, currentStudying: e.target.value})}
                        placeholder="e.g. B.E. Computer Science"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#7F77DD]/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
                  <h3 className="text-[13px] font-medium text-white flex items-center gap-2 mb-5">
                    <Pencil className="w-4 h-4 text-[#AFA9EC]" /> Bio & links
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[12px] text-white/35 mb-1.5">Bio</label>
                      <textarea 
                        rows={3}
                        value={formData.bio}
                        onChange={e => setFormData({...formData, bio: e.target.value})}
                        placeholder="Tell us about yourself..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#7F77DD]/50 resize-none"
                      />
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#378add]/15 text-[#85B7EB] flex items-center justify-center shrink-0">
                        <Linkedin className="w-4 h-4" />
                      </div>
                      <input 
                        type="text" 
                        value={formData.linkedinUrl}
                        onChange={e => setFormData({...formData, linkedinUrl: e.target.value})}
                        placeholder="linkedin.com/in/yourprofile"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#7F77DD]/50"
                      />
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 text-white/50 flex items-center justify-center shrink-0">
                        <Github className="w-4 h-4" />
                      </div>
                      <input 
                        type="text" 
                        value={formData.githubUrl}
                        onChange={e => setFormData({...formData, githubUrl: e.target.value})}
                        placeholder="github.com/yourusername"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#7F77DD]/50"
                      />
                    </div>
                    
                    <div className="pt-4 mt-2 border-t border-white/[0.07] flex justify-end">
                      <button type="submit" className="bg-[#7F77DD] hover:bg-[#6c65bd] text-white text-[13px] font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                        <Check className="w-3.5 h-3.5" /> Save changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'courses' && (
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
              <h3 className="text-[13px] font-medium text-white flex items-center gap-2 mb-5">
                <BookOpen className="w-4 h-4 text-[#AFA9EC]" /> Enrolled courses
              </h3>
              
              {progressData.length === 0 ? (
                <div className="text-center py-10">
                  <BookOpen className="w-10 h-10 text-white/10 mx-auto mb-3" />
                  <div className="text-[13px] text-white/50 mb-4">You haven't enrolled in any courses yet.</div>
                  <Link href="/courses" className="bg-[#7F77DD] text-white text-[13px] font-medium px-5 py-2.5 rounded-lg inline-block">
                    Browse Courses
                  </Link>
                </div>
              ) : (
                <div className="space-y-0">
                  {progressData.map((item, i) => {
                    const { subject, progress } = item;
                    const isFinished = progress.percentage === 100;
                    return (
                      <div key={subject.id} className={`flex items-center gap-4 py-3 ${i !== progressData.length - 1 ? 'border-b border-white/5' : ''}`}>
                        <div className="w-10 h-10 rounded-xl bg-[#7F77DD]/15 text-[#AFA9EC] flex items-center justify-center shrink-0">
                          {isFinished ? <CheckCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[13px] font-medium text-white mb-1.5 truncate">{subject.title}</h4>
                          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${isFinished ? 'bg-[#5DCAA5]' : 'bg-[#7F77DD]'}`} 
                              style={{ width: `${progress.percentage}%` }}
                            />
                          </div>
                          <div className="text-[11px] text-white/30 mt-1.5">
                            {progress.completedVideos} of {progress.totalVideos} videos · {Math.round(progress.percentage)}%
                          </div>
                        </div>
                        <Link 
                          href={`/subjects/${subject.id}`}
                          className="px-3 py-1.5 border border-white/10 rounded-lg text-[12px] text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          {isFinished ? 'Review' : 'Resume'}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'certs' && (
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 text-center py-16">
              <Award className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <h3 className="text-[15px] font-medium text-white mb-1">No certificates yet</h3>
              <p className="text-[13px] text-white/30">Complete a course to earn your first certificate.</p>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
                <h3 className="text-[13px] font-medium text-white flex items-center gap-2 mb-5">
                  <Lock className="w-4 h-4 text-[#AFA9EC]" /> Change password
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[12px] text-white/35 mb-1.5">Current password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#7F77DD]/50" />
                  </div>
                  <div>
                    <label className="block text-[12px] text-white/35 mb-1.5">New password</label>
                    <input type="password" placeholder="Min 8 characters" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#7F77DD]/50" />
                  </div>
                  <div className="pt-2">
                    <button className="bg-[#7F77DD] hover:bg-[#6c65bd] text-white text-[13px] font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                      <Lock className="w-3.5 h-3.5" /> Update password
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
                  <h3 className="text-[13px] font-medium text-white flex items-center gap-2 mb-5">
                    <Shield className="w-4 h-4 text-[#AFA9EC]" /> Active sessions
                  </h3>
                  <div className="flex items-center gap-3 py-2">
                    <div className="w-9 h-9 rounded-lg bg-[#1d9e75]/15 text-[#5DCAA5] flex items-center justify-center shrink-0">
                      <Laptop className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[13px] text-white">Current Browser</div>
                      <div className="text-[11px] text-[#5DCAA5] mt-0.5">Active now</div>
                    </div>
                  </div>
                  <div className="pt-4 mt-2 border-t border-white/[0.07]">
                    <button className="text-[#E05656] bg-[#E05656]/10 border border-[#E05656]/20 px-4 py-2 rounded-lg text-[12px] font-medium">
                      Sign out all other devices
                    </button>
                  </div>
                </div>

                <div className="bg-[#E05656]/5 border border-[#E05656]/20 rounded-2xl p-5">
                  <h3 className="text-[13px] font-medium text-[#E05656] flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4" /> Danger zone
                  </h3>
                  <p className="text-[12px] text-white/35 leading-relaxed mb-4">
                    Deleting your account is permanent. All your progress, certificates, and data will be lost forever.
                  </p>
                  <button className="text-[#E05656] bg-[#E05656]/10 border border-[#E05656]/20 px-4 py-2 rounded-lg text-[13px] font-medium flex items-center gap-2">
                    Delete account
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifs' && (
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 max-w-2xl">
              <h3 className="text-[13px] font-medium text-white flex items-center gap-2 mb-5">
                <Bell className="w-4 h-4 text-[#AFA9EC]" /> Notification preferences
              </h3>
              <div className="space-y-0">
                {[
                  { title: 'Course progress updates', sub: 'Get notified when you complete a lesson', on: true },
                  { title: 'Achievement unlocked', sub: 'Notify when you earn a badge or certificate', on: true },
                  { title: 'New course announcements', sub: 'When new courses are added to the platform', on: false },
                  { title: 'Offers and discounts', sub: 'Special pricing and limited-time deals', on: true },
                  { title: 'Email notifications', sub: 'Receive summaries via email', on: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div>
                      <div className="text-[13px] text-white mb-0.5">{item.title}</div>
                      <div className="text-[11px] text-white/30">{item.sub}</div>
                    </div>
                    <button className={`w-9 h-5 rounded-full relative transition-colors ${item.on ? 'bg-[#7F77DD]' : 'bg-white/10'}`}>
                      <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] transition-all ${item.on ? 'left-[19px]' : 'left-[3px]'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}