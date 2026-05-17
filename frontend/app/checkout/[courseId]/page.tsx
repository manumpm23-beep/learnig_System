'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import { useAuthStore } from '@/store/authStore';
import toast, { Toaster } from 'react-hot-toast';
import { ShieldCheck, ArrowLeft, CreditCard, CheckCircle } from 'lucide-react';

export default function CheckoutPage({ params }: { params: { courseId: string } }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    const fetchCourse = async () => {
      try {
        const { data } = await apiClient.get(`/api/subjects/${params.courseId}`);
        setCourse(data);
      } catch (err) {
        toast.error("Failed to load course details");
        router.push('/courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [params.courseId, isAuthenticated, router]);

  const handlePayment = async () => {
    setIsProcessing(true);
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
        toast.error("Failed to load payment gateway. Check your connection.");
        setIsProcessing(false);
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
            setIsSuccess(true);
            setTimeout(() => {
              router.push(`/subjects/${course.id}`);
            }, 2000);
          } catch (e) {
            toast.error("Payment verification failed.");
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email
        },
        theme: {
          color: "#7F77DD"
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };
      
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        toast.error("Payment failed. Please try again.");
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err) {
      console.error("Failed to create order", err);
      toast.error("Failed to initiate payment");
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#7F77DD]/30 border-t-[#7F77DD] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="min-h-screen bg-[#0d0d14] font-sans selection:bg-[#7F77DD]/30 flex flex-col pt-10 px-4 md:px-0">
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto w-full mb-8">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to courses
        </button>
      </div>

      <div className="max-w-4xl mx-auto w-full flex flex-col md:flex-row gap-8 pb-20">
        
        {/* Left: Order Details */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-6">Secure Checkout</h1>
          
          <div className="bg-[#161820] border border-white/[0.08] rounded-2xl p-6 md:p-8 mb-6">
            <h2 className="text-lg font-bold text-white mb-4">Order Summary</h2>
            
            <div className="flex gap-4 mb-6 pb-6 border-b border-white/10">
              <div className="w-32 h-20 bg-slate-900 rounded-lg bg-cover bg-center shrink-0 border border-white/10" style={{ backgroundImage: course.thumbnailUrl ? \`url(\${course.thumbnailUrl})\` : '' }}></div>
              <div>
                <h3 className="font-bold text-white text-lg leading-tight mb-1">{course.title}</h3>
                <p className="text-white/50 text-sm">{course.category || 'Course'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-white/70 font-medium">
                <span>Original Price</span>
                <span>₹{course.price}</span>
              </div>
              <div className="flex justify-between text-green-400 font-medium">
                <span>Discount</span>
                <span>- ₹0</span>
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-white font-bold text-lg">Total Payable</span>
                <span className="text-3xl font-extrabold text-[#7F77DD]">₹{course.price}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-white/40 text-sm bg-white/[0.02] border border-white/[0.08] p-4 rounded-xl">
            <ShieldCheck className="w-6 h-6 text-[#7F77DD]" />
            <p>Your payment is secure and encrypted. We do not store your card details.</p>
          </div>
        </div>

        {/* Right: Payment Method */}
        <div className="w-full md:w-[380px] shrink-0">
          <div className="bg-[#161820] border border-white/[0.08] rounded-2xl p-6 sticky top-10">
            <h2 className="text-lg font-bold text-white mb-6">Payment Method</h2>
            
            <div className="bg-white/[0.04] border border-[#7F77DD]/30 rounded-xl p-4 mb-6 flex items-start gap-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#7F77DD]/10 rounded-bl-full pointer-events-none"></div>
              <CreditCard className="w-5 h-5 text-[#7F77DD] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white text-[15px] mb-1">Razorpay Secure</p>
                <p className="text-white/50 text-xs leading-relaxed">Pay via UPI, Credit/Debit Card, Netbanking, or Wallets seamlessly.</p>
              </div>
            </div>

            {isSuccess ? (
              <div className="w-full py-4 bg-green-500/10 text-green-400 font-bold rounded-xl flex items-center justify-center gap-2 border border-green-500/20">
                <CheckCircle className="w-5 h-5" /> Payment Successful!
              </div>
            ) : (
              <button 
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full py-4 bg-[#7F77DD] hover:bg-[#6c65bd] text-white font-bold rounded-xl shadow-[0_0_20px_rgba(127,119,221,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>Pay ₹{course.price} Securely</>
                )}
              </button>
            )}
            
            <p className="text-center text-white/30 text-[11px] mt-4 font-medium">
              By proceeding to pay, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
