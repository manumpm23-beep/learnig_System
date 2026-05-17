'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import { Star, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';

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
  return `${diffInDays} days ago`;
}

// Generate unique background color per username (8 pleasant colors)
function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    'bg-[#f87171]', 'bg-[#fbbf24]', 'bg-[#34d399]', 'bg-[#60a5fa]',
    'bg-[#a78bfa]', 'bg-[#f472b6]', 'bg-[#fb923c]', 'bg-[#2dd4bf]'
  ];
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string) {
  if (!name) return 'U';
  const parts = name.split(' ');
  if (parts.length > 1) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export default function CourseReviews({ subjectId, currentUser }: { subjectId: string, currentUser?: any }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [myReview, setMyReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const [revRes, myRevRes] = await Promise.all([
        apiClient.get(`/api/subjects/${subjectId}/reviews`).catch(() => null),
        currentUser ? apiClient.get(`/api/subjects/${subjectId}/my-review`).catch(() => null) : null,
      ]);

      if (revRes && revRes.data) {
         setReviews(revRes.data.reviews || []);
         setSummary({
             averageRating: revRes.data.averageRating || 0,
             totalReviews: revRes.data.totalReviews || 0,
             ratingBreakdown: revRes.data.ratingBreakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
         });
      }
      if (myRevRes && myRevRes.data && Object.keys(myRevRes.data).length > 0) {
         setMyReview(myRevRes.data);
         if (!isEditing) {
           setRating(myRevRes.data.rating);
           setReviewText(myRevRes.data.review || '');
         }
      } else {
         clearMyReviewState(); 
      }
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchReviews();
  }, [subjectId, currentUser]);

  const clearMyReviewState = () => {
     setMyReview(null);
     setRating(0);
     setReviewText('');
     setIsEditing(false);
  };

  const handleSubmitReview = async () => {
    if (rating === 0) return alert('Please select a rating');
    setIsSubmitting(true);
    try {
      if (myReview) {
        await apiClient.put(`/api/subjects/${subjectId}/reviews`, { rating, review: reviewText });
      } else {
        await apiClient.post(`/api/subjects/${subjectId}/reviews`, { rating, review: reviewText });
      }
      setIsEditing(false);
      await fetchReviews();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit review');
    }
    setIsSubmitting(false);
  };

  const handleDeleteReview = async () => {
     if (!confirm('Are you sure you want to delete your review?')) return;
     try {
        await apiClient.delete(`/api/subjects/${subjectId}/reviews`);
        clearMyReviewState();
        await fetchReviews();
     } catch(e) {}
  };

  const fontFam = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  const avgRating = summary?.averageRating || 0;
  const totalReviews = summary?.totalReviews || 0;

  const ratingLabels: Record<number, string> = {
    1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent'
  };

  const dispRating = hoverRating || rating;

  if (loading) {
    return <div className="py-10 text-center"><Loader2 className="w-8 h-8 text-[#f69c08] animate-spin mx-auto" /></div>;
  }

  return (
    <div className="animate-in fade-in max-w-4xl mx-auto pb-10" style={{ fontFamily: fontFam }}>
      
      {/* TOP: RATING SUMMARY BOX */}
      {(totalReviews > 0 || (totalReviews === 0 && myReview)) && (
        <div className="flex flex-col md:flex-row gap-8 mb-12 items-center md:items-start p-6 rounded-xl border border-white/[0.08] bg-[#161820]">
          <div className="flex flex-col items-center justify-center text-center">
             <div className="text-6xl font-extrabold text-[#7F77DD] tracking-tight leading-none mb-2">
               {Number(avgRating).toFixed(1)}
             </div>
             <div className="flex text-[#7F77DD] mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-6 h-6 ${i < Math.floor(avgRating) ? 'fill-current' : i === Math.floor(avgRating) && avgRating % 1 > 0 ? 'fill-current opacity-50' : 'opacity-20'}`} />
                ))}
             </div>
             <div className="text-white/50 text-sm font-medium">Based on {totalReviews} reviews</div>
          </div>
          <div className="flex-1 flex flex-col gap-3 w-full pt-1 max-w-[500px]">
             {[5, 4, 3, 2, 1].map(stars => {
               const count = summary?.ratingBreakdown?.[stars] || 0;
               const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
               return (
                 <div key={stars} className="flex items-center gap-4 text-sm font-medium text-white/50">
                    <div className="flex items-center gap-1 w-10 shrink-0 text-[#7F77DD]">
                       <span>{stars}</span><Star className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <div className="flex-1 bg-white/5 h-2.5 rounded-full overflow-hidden">
                       <div className="h-full bg-[#7F77DD] rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                    <div className="w-10 text-right shrink-0">{pct}%</div>
                 </div>
               )
             })}
          </div>
        </div>
      )}

      {/* WRITE A REVIEW */}
      {currentUser && (
         <div className="mb-12 bg-[#161820] rounded-xl border border-white/[0.08] overflow-hidden">
           {myReview && !isEditing ? (
             <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                   <h3 className="font-bold text-lg text-white">Your Review</h3>
                   <div className="flex gap-2">
                      <button onClick={() => setIsEditing(true)} className="text-sm font-bold text-white/50 hover:text-white underline">Edit</button>
                      <button onClick={handleDeleteReview} className="text-sm font-bold text-red-400 hover:text-red-300 underline">Delete</button>
                   </div>
                </div>
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 bg-[#7F77DD]/20 text-[#7F77DD]">
                     {getInitials(currentUser?.name)}
                   </div>
                   <div>
                      <p className="font-bold text-[15px] mb-0.5 text-white">{currentUser?.name}</p>
                      <div className="flex items-center gap-2">
                         <div className="flex text-[#7F77DD]">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < myReview.rating ? 'fill-current' : 'opacity-30'}`} />
                            ))}
                         </div>
                         <span className="text-white/40 text-xs">{timeAgo(myReview.updatedAt || myReview.createdAt)}</span>
                         {myReview.updatedAt && myReview.updatedAt !== myReview.createdAt && (
                             <span className="text-white/40 text-xs italic">(edited)</span>
                         )}
                      </div>
                   </div>
                </div>
                <p className="text-white/80 text-[15px] whitespace-pre-wrap leading-relaxed">{myReview.review}</p>
             </div>
           ) : (
             <div className="p-6">
                <h3 className="font-bold text-xl mb-4 text-white">{myReview ? 'Edit your review' : 'Rate this course'}</h3>
                <div className="flex items-center gap-3 mb-6">
                   <div className="flex text-[#7F77DD] gap-1 cursor-pointer" onMouseLeave={() => setHoverRating(0)}>
                      {[1,2,3,4,5].map(star => (
                        <Star 
                          key={star} 
                          onMouseEnter={() => setHoverRating(star)}
                          onClick={() => setRating(star)} 
                          className={`w-10 h-10 ${star <= dispRating ? 'fill-current scale-110' : 'opacity-30'} transition-all`} 
                        />
                      ))}
                   </div>
                   {dispRating > 0 && (
                      <span className="font-bold text-[#7F77DD]">{ratingLabels[dispRating]}</span>
                   )}
                </div>
                <div className="relative">
                   <textarea 
                     value={reviewText}
                     onChange={e => setReviewText(e.target.value.substring(0, 1000))}
                     placeholder="Share your experience (optional)"
                     className="w-full bg-[#0d0d14] border border-white/10 rounded-lg p-4 text-[15px] text-white focus:outline-none focus:border-[#7F77DD]/50 min-h-[120px] resize-y mb-2 placeholder-white/30"
                   />
                   <div className="text-right text-xs text-white/40 font-medium absolute bottom-6 right-3">
                     {reviewText.length}/1000
                   </div>
                </div>
                <div className="flex gap-4 mt-2">
                   <button 
                     onClick={handleSubmitReview}
                     disabled={rating === 0 || isSubmitting}
                     className="bg-[#7F77DD] hover:bg-[#6c65bd] text-white font-bold py-3.5 w-full rounded-lg transition-colors disabled:opacity-50 text-[15px]"
                   >
                     {isSubmitting ? 'Submitting...' : myReview ? 'Update Review' : 'Submit Review'}
                   </button>
                   {myReview && (
                     <button onClick={() => { setIsEditing(false); setRating(myReview.rating); setReviewText(myReview.review || ''); }} className="font-bold border border-white/10 text-white/70 py-3.5 px-8 rounded-lg hover:bg-white/5 hover:text-white transition min-w-[120px]">
                       Cancel
                     </button>
                   )}
                </div>
             </div>
           )}
         </div>
      )}

      {/* REVIEWS LIST */}
      <div>
         <div className="flex items-center justify-between mx-1 mb-6">
            <h3 className="text-xl font-bold text-white">Reviews <span className="text-white/50 font-medium ml-1">({totalReviews})</span></h3>
         </div>
         
         {totalReviews > 0 && (
           <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <input type="text" placeholder="Search reviews..." className="w-full bg-[#161820] border border-white/10 rounded-lg p-3 pl-4 pr-12 text-[15px] focus:outline-none focus:border-[#7F77DD]/50 text-white placeholder-white/30" />
                <button className="text-white/40 absolute right-3 top-3.5 hover:text-white transition-colors">
                   <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                   </svg>
                </button>
              </div>
              <select className="border border-white/10 rounded-lg p-3 text-[15px] font-bold bg-[#161820] focus:outline-none cursor-pointer text-white md:w-56 shrink-0 focus:border-[#7F77DD]/50">
                <option className="bg-[#161820]">All ratings</option>
                <option className="bg-[#161820]">5 stars</option>
                <option className="bg-[#161820]">4 stars</option>
                <option className="bg-[#161820]">3 stars</option>
                <option className="bg-[#161820]">2 stars</option>
                <option className="bg-[#161820]">1 star</option>
              </select>
           </div>
         )}

         {totalReviews === 0 ? (
            <div className="text-center py-20 bg-[#161820] rounded-xl border border-white/10 border-dashed">
               <div className="w-16 h-16 bg-[#7F77DD]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-[#7F77DD] fill-current" />
               </div>
               <h3 className="text-xl font-bold text-white">No reviews yet</h3>
               <p className="text-white/50 font-medium mt-2">Be the first to share your experience!</p>
            </div>
         ) : (
            <div className="space-y-6">
               {reviews.filter(r => r.id !== myReview?.id).map(r => (
                 <div key={r.id} className="p-6 bg-[#161820] rounded-xl border border-white/10 flex flex-col sm:flex-row gap-5 shadow-sm text-left">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 ${stringToColor(r.user?.name || '')}`}>
                      {getInitials(r.user?.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="font-bold text-[15px] mb-1 text-white">{r.user?.name}</p>
                       <div className="flex items-center gap-2 mb-3">
                          <div className="flex text-[#7F77DD]">
                             {[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-current' : 'opacity-30'}`} />)}
                          </div>
                          <span className="text-white/40 text-[13px] font-medium">{timeAgo(r.createdAt)}</span>
                          {r.updatedAt && r.updatedAt !== r.createdAt && (
                             <span className="text-white/40 text-[13px] italic">(edited)</span>
                          )}
                       </div>
                       <p className="text-[15px] text-white/80 mb-5 whitespace-pre-wrap leading-relaxed">
                         {r.review}
                       </p>
                       <div className="flex items-center gap-3">
                          <span className="text-white/40 text-[13px] font-medium">Was this helpful?</span>
                          <button className="p-1.5 border border-white/10 rounded-full hover:bg-white/5 flex items-center justify-center w-8 h-8 transition-colors">
                            <ThumbsUp className="w-3.5 h-3.5 text-white/40" />
                          </button>
                          <button className="p-1.5 border border-white/10 rounded-full hover:bg-white/5 flex items-center justify-center w-8 h-8 transition-colors">
                            <ThumbsDown className="w-3.5 h-3.5 text-white/40" />
                          </button>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         )}
      </div>
    </div>
  );
}
