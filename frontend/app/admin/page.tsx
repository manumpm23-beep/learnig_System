'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/apiClient';
import Navbar from '@/components/Layout/Navbar';
import { 
  LayoutDashboard, BookOpen, UploadCloud, Users, 
  CreditCard, Award, Tag, Settings, Trash, Edit, Check, X
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);

  // Upload Form
  const [formData, setFormData] = useState({
    title: '',
    subject: 'Frontend',
    difficulty: 'Beginner',
    price: 0,
    description: '',
    youtube_url: '',
    thumbnail_url: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    if (user?.role === 'admin') {
      loadData();
    }
  }, [isAuthenticated, user, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, coursesRes, studentsRes, paymentsRes] = await Promise.all([
        apiClient.get('/api/admin/stats'),
        apiClient.get('/api/admin/courses'),
        apiClient.get('/api/admin/students'),
        apiClient.get('/api/admin/payments')
      ]);
      setStats(statsRes.data);
      setCourses(coursesRes.data);
      setStudents(studentsRes.data);
      setPayments(paymentsRes.data);
    } catch (e) {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/api/admin/courses', formData);
      toast.success("Course published successfully!");
      setFormData({
        title: '', subject: 'Frontend', difficulty: 'Beginner', 
        price: 0, description: '', youtube_url: '', thumbnail_url: ''
      });
      loadData();
      setActiveTab('Courses');
    } catch (e) {
      toast.error("Failed to publish course");
    }
  };

  const deleteCourse = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      await apiClient.delete(`/api/admin/courses/${id}`);
      toast.success("Course deleted");
      loadData();
    } catch (e) {
      toast.error("Failed to delete course");
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    try {
      await apiClient.patch(`/api/admin/courses/${id}/status`, { status: newStatus });
      toast.success(`Course ${newStatus}`);
      loadData();
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#7F77DD]/30 border-t-[#7F77DD] rounded-full animate-spin"></div>
      </div>
    );
  }

  const tabs = [
    { name: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Courses', icon: <BookOpen className="w-4 h-4" /> },
    { name: 'Upload course', icon: <UploadCloud className="w-4 h-4" /> },
    { name: 'Students', icon: <Users className="w-4 h-4" /> },
    { name: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
    { name: 'Certificates', icon: <Award className="w-4 h-4" /> },
    { name: 'Coupons', icon: <Tag className="w-4 h-4" /> },
    { name: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#0d0d14] font-sans selection:bg-[#7F77DD]/30 flex flex-col h-screen overflow-hidden">
      <Toaster position="top-right" />
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 border-r border-white/[0.08] bg-[#161820] flex flex-col py-6 px-4 shrink-0 overflow-y-auto">
          <h2 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4 px-2">Admin Panel</h2>
          <ul className="space-y-1">
            {tabs.map((tab) => (
              <li key={tab.name}>
                <button
                  onClick={() => setActiveTab(tab.name)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === tab.name 
                      ? 'bg-[#7F77DD] text-white shadow-[0_0_15px_rgba(127,119,221,0.3)]' 
                      : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {tab.icon} {tab.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-[#0d0d14] overflow-y-auto p-8 relative">
          <div className="absolute top-0 right-10 w-96 h-96 bg-[#7F77DD]/5 blur-[120px] rounded-full pointer-events-none" />

          {activeTab === 'Overview' && (
            <div className="relative z-10 max-w-6xl mx-auto">
              <h1 className="text-3xl font-bold text-white mb-8">Dashboard Overview</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-[#161820] border border-white/[0.08] p-6 rounded-2xl">
                  <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">Total Courses</p>
                  <p className="text-3xl font-bold text-white">{stats?.total_courses}</p>
                </div>
                <div className="bg-[#161820] border border-white/[0.08] p-6 rounded-2xl">
                  <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">Total Students</p>
                  <p className="text-3xl font-bold text-white">{stats?.total_students}</p>
                </div>
                <div className="bg-[#161820] border border-white/[0.08] p-6 rounded-2xl">
                  <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">Revenue (Month)</p>
                  <p className="text-3xl font-bold text-green-400">₹{stats?.revenue_this_month}</p>
                </div>
                <div className="bg-[#161820] border border-white/[0.08] p-6 rounded-2xl">
                  <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">Completion Rate</p>
                  <p className="text-3xl font-bold text-[#7F77DD]">{stats?.completion_rate}%</p>
                </div>
              </div>

              <h2 className="text-xl font-bold text-white mb-4">Recent Courses</h2>
              <div className="bg-[#161820] border border-white/[0.08] rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                      <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Title</th>
                      <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Students</th>
                      <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Price</th>
                      <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.slice(0, 5).map((course: any) => (
                      <tr key={course.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                        <td className="p-4 text-sm font-medium text-white">{course.title}</td>
                        <td className="p-4 text-sm text-white/70">{course.students}</td>
                        <td className="p-4 text-sm text-white/70">₹{course.price}</td>
                        <td className="p-4 text-sm text-white/70">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${course.status === 'published' ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-white/50'}`}>
                            {course.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'Courses' && (
            <div className="relative z-10 max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Manage Courses</h1>
                <button onClick={() => setActiveTab('Upload course')} className="px-4 py-2 bg-[#7F77DD] text-white text-sm font-bold rounded-lg hover:bg-[#6c65bd] transition-colors flex items-center gap-2">
                  <UploadCloud className="w-4 h-4" /> Create new
                </button>
              </div>

              <div className="bg-[#161820] border border-white/[0.08] rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                      <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Title</th>
                      <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Students</th>
                      <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Price</th>
                      <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Status</th>
                      <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course: any) => (
                      <tr key={course.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                        <td className="p-4 text-sm font-medium text-white">{course.title}</td>
                        <td className="p-4 text-sm text-white/70">{course.students}</td>
                        <td className="p-4 text-sm text-white/70">{course.price === 0 ? 'Free' : `₹${course.price}`}</td>
                        <td className="p-4 text-sm text-white/70">
                          <button 
                            onClick={() => toggleStatus(course.id, course.status)}
                            className={`px-3 py-1 rounded text-xs font-bold border transition-colors ${course.status === 'published' ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20' : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'}`}
                          >
                            {course.status}
                          </button>
                        </td>
                        <td className="p-4 text-sm text-white/70 flex gap-2">
                          <button className="p-2 bg-white/5 rounded text-white/50 hover:text-white transition-colors" title="Edit (Coming soon)">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteCourse(course.id)} className="p-2 bg-red-500/10 rounded text-red-400 hover:bg-red-500/20 transition-colors" title="Delete">
                            <Trash className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'Upload course' && (
            <div className="relative z-10 max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold text-white mb-8">Upload New Course</h1>
              
              <form onSubmit={handleUploadSubmit} className="space-y-6">
                <div className="bg-[#161820] border border-white/[0.08] p-8 rounded-2xl flex flex-col gap-5">
                  
                  <div>
                    <label className="block text-sm font-bold text-white/70 mb-2">Course Title <span className="text-red-400">*</span></label>
                    <input 
                      required 
                      type="text" 
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#7F77DD]/50" 
                      placeholder="e.g. Next.js Masterclass"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-white/70 mb-2">Subject</label>
                      <select 
                        value={formData.subject}
                        onChange={e => setFormData({...formData, subject: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#7F77DD]/50"
                      >
                        <option value="Frontend" className="bg-[#161820]">Frontend</option>
                        <option value="Backend" className="bg-[#161820]">Backend</option>
                        <option value="Database" className="bg-[#161820]">Database</option>
                        <option value="Fullstack" className="bg-[#161820]">Fullstack</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-white/70 mb-2">Difficulty</label>
                      <select 
                        value={formData.difficulty}
                        onChange={e => setFormData({...formData, difficulty: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#7F77DD]/50"
                      >
                        <option value="Beginner" className="bg-[#161820]">Beginner</option>
                        <option value="Intermediate" className="bg-[#161820]">Intermediate</option>
                        <option value="Advanced" className="bg-[#161820]">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white/70 mb-2">Price (₹) <span className="text-white/40 font-normal ml-2">0 for Free</span></label>
                    <input 
                      type="number" 
                      min="0" max="999"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#7F77DD]/50" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white/70 mb-2">Description</label>
                    <textarea 
                      rows={4}
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#7F77DD]/50" 
                      placeholder="Course overview..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white/70 mb-2">YouTube Embed URL</label>
                    <input 
                      type="url" 
                      value={formData.youtube_url}
                      onChange={e => setFormData({...formData, youtube_url: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#7F77DD]/50" 
                      placeholder="https://www.youtube.com/embed/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white/70 mb-2">Thumbnail URL</label>
                    <input 
                      type="url" 
                      value={formData.thumbnail_url}
                      onChange={e => setFormData({...formData, thumbnail_url: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#7F77DD]/50" 
                      placeholder="https://..."
                    />
                  </div>

                  <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                    <button type="button" onClick={() => setActiveTab('Courses')} className="px-6 py-3 bg-white/5 text-white font-bold rounded-lg hover:bg-white/10 transition-colors">
                      Cancel
                    </button>
                    <button type="submit" className="px-6 py-3 bg-[#7F77DD] text-white font-bold rounded-lg hover:bg-[#6c65bd] transition-colors shadow-lg">
                      Publish Course
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'Students' && (
            <div className="relative z-10 max-w-6xl mx-auto">
              <h1 className="text-3xl font-bold text-white mb-8">Registered Students</h1>
              <div className="bg-[#161820] border border-white/[0.08] rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                      <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Name</th>
                      <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Email</th>
                      <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Enrolled</th>
                      <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student: any) => (
                      <tr key={student.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                        <td className="p-4 text-sm font-medium text-white flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                            {student.name[0].toUpperCase()}
                          </div>
                          {student.name}
                        </td>
                        <td className="p-4 text-sm text-white/70">{student.email}</td>
                        <td className="p-4 text-sm text-white/70"><span className="px-2 py-1 bg-[#7F77DD]/10 text-[#7F77DD] rounded-full font-bold">{student.enrolled_count} courses</span></td>
                        <td className="p-4 text-sm text-white/70">{new Date(student.joined_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'Payments' && (
            <div className="relative z-10 max-w-6xl mx-auto">
              <h1 className="text-3xl font-bold text-white mb-8">Payment History</h1>
              <div className="bg-[#161820] border border-white/[0.08] rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                      <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Student</th>
                      <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Course</th>
                      <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Amount</th>
                      <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Date</th>
                      <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-white/50">No payments found.</td>
                      </tr>
                    )}
                    {payments.map((p: any) => (
                      <tr key={p.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                        <td className="p-4 text-sm font-medium text-white">{p.student_name}</td>
                        <td className="p-4 text-sm text-white/70">{p.course_title}</td>
                        <td className="p-4 text-sm text-green-400 font-bold">₹{p.amount}</td>
                        <td className="p-4 text-sm text-white/70">{new Date(p.purchased_at).toLocaleString()}</td>
                        <td className="p-4 text-sm text-white/70">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${p.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {['Certificates', 'Coupons', 'Settings'].includes(activeTab) && (
            <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-center justify-center py-20 text-center">
              <Settings className="w-16 h-16 text-white/10 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">{activeTab} Modules</h2>
              <p className="text-white/50">This section is currently under development.</p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
