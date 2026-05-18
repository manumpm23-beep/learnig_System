'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/apiClient';
import Navbar from '@/components/Layout/Navbar';
import { Award, Lock, Download, Linkedin, Link2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function CertificatesPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [certificates, setCertificates] = useState<any[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    Promise.all([
      apiClient.get('/api/certificates'),
      apiClient.get('/api/dashboard'),
      apiClient.get('/api/subjects?limit=100')
    ]).then(([certRes, dashRes, coursesRes]) => {
      setCertificates(certRes.data);
      setEnrolledCourses(dashRes.data.enrolledCourses || []);
      setAllCourses(coursesRes.data.data || []);
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));

  }, [isAuthenticated, router]);

  const handleDownload = async (courseId: string) => {
    try {
      const res = await apiClient.get(`/api/certificates/${courseId}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificate_${courseId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success("Certificate downloaded successfully!");
    } catch (e) {
      toast.error("Failed to download certificate. Ensure reportlab is installed.");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handleLinkedInShare = (certCode: string) => {
    const url = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=Certificate+of+Completion&organizationName=Learning+Platform&issueYear=${new Date().getFullYear()}&issueMonth=${new Date().getMonth()+1}&certId=${certCode}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#7F77DD]/30 border-t-[#7F77DD] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d14] font-sans selection:bg-[#7F77DD]/30 flex flex-col">
      <Toaster position="top-right" />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative">
        <div className="absolute top-0 right-10 w-96 h-96 bg-[#7F77DD]/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="mb-10 relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
            <Award className="w-8 h-8 text-[#7F77DD]" /> Course Certificates
          </h1>
          <p className="text-white/50 text-sm md:text-base">
            View all available certificates. Complete a course to unlock and download its certificate.
          </p>
        </div>

        {allCourses.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] border border-white/[0.05] rounded-xl relative z-10">
            <Award className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No courses available</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
            {allCourses.map((course: any) => {
              const cert = certificates.find(c => c.course_id === course.id);
              const isUnlocked = !!cert;
              const enrolledData = enrolledCourses.find(c => c.subjectId === course.id);
              const progress = enrolledData ? Math.round(enrolledData.percentComplete || 0) : 0;

              return (
                <div key={course.id} className="flex flex-col gap-4">
                  {/* Certificate Card */}
                  <div className="relative bg-[#161820] border border-white/[0.08] rounded-xl overflow-hidden aspect-[1.414/1] flex flex-col items-center justify-center text-center p-8">
                    
                    {/* Content (Blurred if locked) */}
                    <div className={`absolute inset-0 flex flex-col items-center justify-center p-10 ${!isUnlocked ? 'blur-[8px] opacity-30 select-none pointer-events-none' : ''}`}>
                      <div className="w-16 h-16 bg-[#7F77DD] rounded-xl flex items-center justify-center shadow-lg mb-6">
                        <Award className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-[#7F77DD] font-bold text-xl tracking-widest uppercase mb-2">Certificate of Completion</h2>
                      <h3 className="text-white font-bold text-3xl mb-6">{course.title}</h3>
                      <p className="text-white/50 text-sm mb-2">Awarded to</p>
                      <p className="text-white font-bold text-2xl mb-8 border-b border-white/20 pb-2 px-8 inline-block">{user?.name || 'Student Name'}</p>
                      
                      <div className="flex w-full justify-between items-end mt-auto pt-8 border-t border-white/10 text-left">
                        <div>
                          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Issue Date</p>
                          <p className="text-white font-medium text-sm">
                            {cert ? new Date(cert.issued_at).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Certificate Code</p>
                          <p className="text-white font-mono text-sm">
                            {cert ? cert.certificate_code : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Locked Overlay */}
                    {!isUnlocked && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] z-10 p-8">
                        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                          <Lock className="w-8 h-8 text-white/50" />
                        </div>
                        <h3 className="text-white font-bold text-2xl mb-2">Certificate Locked</h3>
                        <p className="text-white/60 mb-8 max-w-sm text-center">Complete the course to unlock your certificate and showcase your achievement.</p>
                        
                        <div className="w-full max-w-md">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-white/60">Progress</span>
                            <span className="text-sm font-bold text-[#7F77DD]">{progress}% complete</span>
                          </div>
                          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[#7F77DD] rounded-full" style={{ width: `${progress}%` }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {isUnlocked && (
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleDownload(course.id)}
                        className="flex-1 py-3 bg-[#7F77DD] text-white text-sm font-bold rounded-lg hover:bg-[#6c65bd] transition-colors flex items-center justify-center gap-2 shadow-lg"
                      >
                        <Download className="w-4 h-4" /> Download PDF
                      </button>
                      <button 
                        onClick={() => handleLinkedInShare(cert?.certificate_code || '')}
                        className="flex-1 py-3 bg-[#0077b5] text-white text-sm font-bold rounded-lg hover:bg-[#006097] transition-colors flex items-center justify-center gap-2 shadow-lg"
                      >
                        <Linkedin className="w-4 h-4" /> Add to Profile
                      </button>
                      <button 
                        onClick={handleCopyLink}
                        className="py-3 px-4 bg-white/[0.04] border border-white/[0.08] text-white hover:bg-white/[0.08] transition-colors rounded-lg flex items-center justify-center shrink-0"
                        title="Copy link"
                      >
                        <Link2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
