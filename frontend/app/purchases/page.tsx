'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/apiClient';
import Navbar from '@/components/Layout/Navbar';
import { CreditCard, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PurchasesPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    apiClient.get('/api/payments/my-purchases')
      .then((res) => {
        setPurchases(res.data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#7F77DD]/30 border-t-[#7F77DD] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d14] font-sans selection:bg-[#7F77DD]/30 flex flex-col h-screen overflow-hidden">
      <Navbar />

      <main className="flex-1 overflow-y-auto bg-[#0d0d14] relative p-6 md:p-10">
        <div className="absolute top-0 right-10 w-96 h-96 bg-[#7F77DD]/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-[#7F77DD]" /> Purchase History
            </h1>
            <p className="text-white/50 text-sm md:text-base">
              View your completed transactions and unlocked courses.
            </p>
          </div>

          {purchases.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.02] border border-white/[0.05] rounded-xl relative z-10">
              <CreditCard className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No purchases yet</h3>
              <p className="text-white/50 mb-6">Explore our premium courses to start learning.</p>
              <Link href="/courses" className="px-6 py-2.5 bg-[#7F77DD] text-white text-sm font-bold rounded-lg hover:bg-[#6c65bd] transition-colors inline-block">
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="bg-[#161820] border border-white/[0.08] rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                    <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Course</th>
                    <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Amount Paid</th>
                    <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Date</th>
                    <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((p) => (
                    <tr key={p.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                      <td className="p-4 text-sm font-medium text-white">{p.course_name}</td>
                      <td className="p-4 text-sm text-green-400 font-bold">₹{p.amount_paid}</td>
                      <td className="p-4 text-sm text-white/70">{new Date(p.purchase_date).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        <Link 
                          href={`/subjects/${p.course_id}`} 
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#7F77DD]/10 text-[#7F77DD] rounded hover:bg-[#7F77DD]/20 transition-colors text-xs font-bold"
                        >
                          Go to course <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
