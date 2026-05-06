'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/apiClient';
import { useSidebarStore } from '@/store/sidebarStore';
import { useAuthStore } from '@/store/authStore';
import VideoPlayer from '@/components/Video/VideoPlayer';
import CourseReviews from '@/components/Video/CourseReviews';
import { 
  Trophy, Search, Star, MessageCircle, PlayCircle, 
  ChevronDown, ChevronUp, CheckCircle2, Lock, 
  Loader2, ThumbsUp, Pin, Trash2, Pencil, Users, 
  Clock, BookOpen, ChevronRight, MessageSquarePlus,
  Zap, Menu, X, Award, ChevronLeft, Circle, ArrowLeft
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

function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    'bg-[#f87171]','bg-[#fbbf24]','bg-[#34d399]','bg-[#60a5fa]',
    'bg-[#a78bfa]','bg-[#f472b6]','bg-[#fb923c]','bg-[#2dd4bf]'
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

/** 
 * Q&A Tab mapping strictly preserving bindings
 */
function QATab({ videoId, currentUser }: { videoId: string, currentUser: any }) {
  const [comments, setComments] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [newCommentText, setNewCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    try {
      const res = await apiClient.get(`/api/videos/${videoId}/comments?page=1&pageSize=50`);
      const sorted = res.data.data.sort((a: any, b: any) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return 0;
      });
      setComments(sorted);
      setTotalCount(res.data.totalCount || sorted.length);
    } catch (e) {
      console.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    if (currentUser !== undefined) {
      setLoading(true);
      loadComments();
    }
  }, [videoId, currentUser, loadComments]);

  const handlePostComment = async () => {
    if (!newCommentText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await apiClient.post(`/api/videos/${videoId}/comments`, { content: newCommentText });
      setNewCommentText('');
      loadComments();
    } catch(e) {} finally { setSubmitting(false); }
  };

  const handlePostReply = async (parentId: string) => {
    if (!replyText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await apiClient.post(`/api/videos/${videoId}/comments`, { content: replyText, parentId });
      setReplyText('');
      setActiveReplyId(null);
      loadComments(); 
    } catch(e) {} finally { setSubmitting(false); }
  };

  const handleToggleUpvote = async (commentId: string, isReply = false, parentId?: string) => {
    if (!currentUser) return;
    try {
      const res = await apiClient.post(`/api/comments/${commentId}/upvote`);
      const { upvoted, upvoteCount } = res.data;
      
      setComments(prev => {
        const updated = [...prev];
        for (let i = 0; i < updated.length; i++) {
          if (updated[i].id === commentId && !isReply) {
            updated[i].upvoteCount = upvoteCount;
            updated[i].hasUpvoted = upvoted;
            break;
          }
          if (isReply && updated[i].id === parentId) {
            for (let j = 0; j < (updated[i].replies || []).length; j++) {
               if (updated[i].replies[j].id === commentId) {
                  updated[i].replies[j].upvoteCount = upvoteCount;
                  updated[i].replies[j].hasUpvoted = upvoted;
                  break;
               }
            }
          }
        }
        return updated;
      });
    } catch (e) {}
  };

  const handleTogglePin = async (commentId: string) => {
    try {
      await apiClient.post(`/api/comments/${commentId}/pin`);
      loadComments();
    } catch (e) {}
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete comment?')) return;
    try {
      await apiClient.delete(`/api/comments/${commentId}`);
      loadComments();
    } catch (e) {}
  };

  const renderComment = (c: any, isReply = false, parentId?: string) => {
    const isOwner = currentUser?.id === c.user.id;
    const isAdmin = currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Instructor');

    return (
      <div key={c.id} className={`flex gap-4 py-5 ${isReply ? 'ml-[44px] border-t border-[rgba(255,255,255,0.07)]' : 'border-b border-[rgba(255,255,255,0.07)]'} w-full border-dashed group`}>
         <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${stringToColor(c.user.name)}`}>
            {getInitials(c.user.name)}
         </div>
         <div className="flex-1 min-w-0">
            {c.isPinned && !isReply && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-[#7F77DD] mb-1 uppercase tracking-wider bg-[rgba(127,119,221,0.10)] px-2 py-0.5 rounded w-fit">
                 📌 Pinned
              </div>
            )}
            
            <h4 className="font-bold text-[15px] mb-1 text-[#fff] flex items-center gap-2 max-w-full">
               <span className="truncate">{c.user.name}</span>
               <span className="text-[rgba(255,255,255,0.35)] text-xs font-normal shrink-0">· {timeAgo(c.createdAt)}</span>
            </h4>

            <p className="text-[14px] text-[rgba(255,255,255,0.65)] mb-2 whitespace-pre-wrap leading-relaxed">
               {c.content}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 text-[13px] text-[rgba(255,255,255,0.35)]">
               {isAdmin && !isReply && (
                  <button onClick={() => handleTogglePin(c.id)} className="hover:text-[#7F77DD] transition-colors underline">Pin</button>
               )}
               {isOwner && (
                  <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-300 transition-colors underline">Delete</button>
               )}
            </div>

            {/* Replies */}
            {!isReply && activeReplyId === c.id && (
               <div className="mt-4 flex flex-col gap-3">
                  <textarea 
                     value={replyText} onChange={e => setReplyText(e.target.value)}
                     className="w-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.06)] text-white rounded-lg p-3 text-sm focus:outline-none focus:border-[#7F77DD] resize-y min-h-[80px]" 
                     placeholder="Write a reply..."
                  />
                  <div className="flex gap-3">
                     <button onClick={() => handlePostReply(c.id)} className="bg-[#7F77DD] text-[#0d0d14] px-5 py-2 font-bold text-[13px] rounded-lg hover:bg-[#6c65bd] transition-colors">Post Reply</button>
                     <button onClick={() => setActiveReplyId(null)} className="text-[#fff] text-[13px] font-bold border border-[rgba(255,255,255,0.1)] rounded-lg px-5 py-2 hover:bg-[rgba(255,255,255,0.05)] transition-colors">Cancel</button>
                  </div>
               </div>
            )}

            {!isReply && c.replies && c.replies.map((r: any) => renderComment(r, true, c.id))}
         </div>
         
         <div className="flex flex-col items-end gap-3 shrink-0 ml-2 w-16 pt-1">
            <button 
              onClick={() => handleToggleUpvote(c.id, isReply, parentId)}
              className="flex items-center gap-1.5 font-medium text-[13px] text-[rgba(255,255,255,0.35)] hover:text-[#7F77DD] transition-colors"
            >
               <ThumbsUp className={`w-4 h-4 ${c.hasUpvoted ? 'text-[#7F77DD] fill-current' : ''}`} />
               {c.upvoteCount || 0}
            </button>
            {!isReply && (
               <button 
                 onClick={() => { setActiveReplyId(activeReplyId === c.id ? null : c.id); setReplyText(''); }}
                 className="flex items-center gap-1.5 text-[13px] font-medium text-[rgba(255,255,255,0.35)] hover:text-[#fff] transition-colors"
               >
                 <MessageCircle className="w-4 h-4" />
                 {c.replyCount || c.replies?.length || 0}
               </button>
            )}
         </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full relative fade-in-tab max-w-[760px] pb-16">
       
       <div className="mb-8 p-4 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[12px]">
          <div className="flex items-start gap-4">
             <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 bg-gradient-to-br from-[#7F77DD] to-purple-600">
               {getInitials(currentUser?.name || 'U')}
             </div>
             <div className="flex-1">
               <textarea 
                  value={newCommentText}
                  onChange={e => setNewCommentText(e.target.value)}
                  placeholder="What do you need help with?"
                  className="w-full border border-[rgba(255,255,255,0.1)] rounded-[8px] p-3 focus:outline-none focus:border-[#7F77DD] min-h-[80px] resize-y text-[14px] bg-[rgba(255,255,255,0.06)] text-white placeholder-[rgba(255,255,255,0.35)] mb-3" 
               />
               <div className="flex justify-end">
                  <button 
                     onClick={handlePostComment}
                     disabled={!newCommentText.trim() || submitting}
                     className="bg-[#7F77DD] text-[#0d0d14] font-bold py-2 px-6 rounded-lg hover:bg-[#6c65bd] disabled:opacity-50 text-[13px] transition-colors"
                  >
                     {submitting ? 'Posting...' : 'Post Question'}
                  </button>
               </div>
             </div>
          </div>
       </div>

       <div className="px-2">
         {loading ? (
            <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 text-[#7F77DD] animate-spin" /></div>
         ) : comments.length === 0 ? (
            <div className="py-16 text-center text-[rgba(255,255,255,0.35)] font-medium">No questions yet. Be the first to ask!</div>
         ) : (
            <div className="flex flex-col">
               {comments.map(c => renderComment(c))}
            </div>
         )}
       </div>
    </div>
  );
}

interface VideoData {
  id: string; title: string; description: string; youtubeUrl: string;
  durationSeconds: number | null; sectionId: string; sectionTitle: string;
  subjectId: string; subjectTitle: string; 
  previousVideoId: string | null; nextVideoId: string | null; 
  locked: boolean; unlockReason: string | null;
}

export default function VideoLessonPage({ params }: { params: { subjectId: string, videoId: string } }) {
  const { subjectId, videoId } = params;
  const router = useRouter();
  const { user } = useAuthStore();

  const fetchTree = useSidebarStore(s => s.fetchTree);
  const tree = useSidebarStore(s => s.tree);
  const markVideoCompleted = useSidebarStore(s => s.markVideoCompleted);

  const [video, setVideo] = useState<VideoData | null>(null);
  const [progress, setProgress] = useState<{ lastPositionSeconds: number, isCompleted: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [activeTab, setActiveTab] = useState('Overview');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        if (!tree || tree.id !== subjectId) {
          await fetchTree(subjectId);
        }
        const vidReq = await apiClient.get(`/api/videos/${videoId}`);
        if (!active) return;

        setVideo(vidReq.data);

        if (tree?.sections) {
          tree.sections.forEach(sec => {
            if (sec.videos.some(v => v.id === videoId)) {
              setExpandedSections(prev => ({ ...prev, [sec.id]: true }));
            }
          });
        }

        if (!vidReq.data.locked) {
          const progReq = await apiClient.get(`/api/progress/videos/${videoId}`);
          if (active) setProgress(progReq.data);
        }
      } catch (err) {} finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [videoId, subjectId, fetchTree]);

  const toggleSection = (id: string) => setExpandedSections(p => ({ ...p, [id]: !p[id] }));

  const handleProgress = useCallback(async (time: number) => {
    const now = Date.now();
    if (now - lastUpdateRef.current < 4000) return; 
    lastUpdateRef.current = now;
    try {
      await apiClient.post(`/api/progress/videos/${videoId}`, { lastPositionSeconds: Math.floor(time) });
    } catch (e) {}
  }, [videoId]);

  const handleCompleted = useCallback(async () => {
    try {
      await apiClient.post(`/api/progress/videos/${videoId}`, { isCompleted: true });
      markVideoCompleted(videoId);
      setProgress(p => p ? { ...p, isCompleted: true } : { lastPositionSeconds: 0, isCompleted: true });
      if (video?.nextVideoId) {
         router.push(`/subjects/${subjectId}/video/${video.nextVideoId}`);
      }
    } catch (e) {}
  }, [videoId, video, markVideoCompleted, router, subjectId]);

  let compiled = 0; let tot = 0;
  if (tree) {
    tree.sections.forEach(sec => {
      sec.videos.forEach((v: any) => { tot++; if (v.isCompleted) compiled++; });
    });
  }
  const pct = tot > 0 ? Math.round((compiled / tot) * 100) : 0;

  if (loading || !video) {
    return <div className="flex h-screen items-center justify-center bg-[#0d0d14]"><Loader2 className="w-10 h-10 text-[#7F77DD] animate-spin" /></div>;
  }

  const isCurrentCompleted = progress?.isCompleted || (tree?.sections.some(s => s.videos.find(v => v.id === videoId && v.isCompleted)));

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');
        
        .font-dm-sans { font-family: 'DM Sans', sans-serif; }
        .font-dm-serif { font-family: 'DM Serif Display', serif; }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.12);
          border-radius: 99px;
        }

        @keyframes fadeInTab {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: none; }
        }
        .fade-in-tab {
          animation: fadeInTab 0.3s ease forwards;
        }
      `}} />

      <div className="flex flex-col h-[100dvh] overflow-hidden bg-[#0d0d14] text-[#fff] font-dm-sans">
        
        {/* TOP NAV BAR */}
        <div className="flex items-center justify-between px-4 sm:px-6 shrink-0 bg-[#0d0d14] border-b border-[rgba(255,255,255,0.07)] h-[52px]">
           <div className="flex items-center min-w-0">
              <Link href="/courses" className="flex items-center gap-1.5 text-[12px] font-bold text-[rgba(255,255,255,0.65)] hover:text-white transition-colors uppercase tracking-wider">
                 <ArrowLeft className="w-4 h-4" /> Courses
              </Link>
              <div className="w-px h-5 bg-[rgba(255,255,255,0.1)] mx-4 shrink-0"></div>
              
              <div className="flex items-center gap-2 min-w-0 pr-4">
                 <div className="w-[28px] h-[28px] bg-[#7F77DD] rounded-[8px] flex items-center justify-center shrink-0">
                    <PlayCircle className="w-[18px] h-[18px] text-[#0d0d14] fill-current" />
                 </div>
                 <h1 className="font-medium text-[13px] text-white truncate max-w-[300px] ml-1">{video.subjectTitle}</h1>
              </div>
           </div>
           
           <div className="flex items-center gap-3 shrink-0">
              <div className="hidden sm:flex items-center gap-1.5 border border-[rgba(255,255,255,0.1)] rounded-[6px] p-1">
                 {video.previousVideoId ? (
                   <Link href={`/subjects/${subjectId}/video/${video.previousVideoId}`} className="px-2.5 py-1 text-[12px] text-[rgba(255,255,255,0.65)] hover:text-white transition-colors flex items-center gap-1">
                     <ChevronLeft className="w-3.5 h-3.5" /> Prev
                   </Link>
                 ) : (
                   <span className="px-2.5 py-1 text-[12px] text-[rgba(255,255,255,0.2)] flex items-center gap-1 cursor-not-allowed">
                     <ChevronLeft className="w-3.5 h-3.5" /> Prev
                   </span>
                 )}
                 <div className="w-px h-3 bg-[rgba(255,255,255,0.1)]"></div>
                 {video.nextVideoId ? (
                   <Link href={`/subjects/${subjectId}/video/${video.nextVideoId}`} className="px-2.5 py-1 text-[12px] text-[rgba(255,255,255,0.65)] hover:text-white transition-colors flex items-center gap-1">
                     Next <ChevronRight className="w-3.5 h-3.5" />
                   </Link>
                 ) : (
                   <span className="px-2.5 py-1 text-[12px] text-[rgba(255,255,255,0.2)] flex items-center gap-1 cursor-not-allowed">
                     Next <ChevronRight className="w-3.5 h-3.5" />
                   </span>
                 )}
              </div>

              <div className="hidden md:flex border border-[rgba(255,255,255,0.1)] rounded-[6px] px-2.5 py-1 text-[12px] font-bold text-[#7F77DD] items-center gap-1.5 bg-[rgba(127,119,221,0.05)]">
                 <Trophy className="w-3.5 h-3.5" /> {pct}%
              </div>

              <div className="w-px h-4 bg-[rgba(255,255,255,0.07)] shrink-0 hidden md:block mx-1"></div>

              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-8 h-8 rounded-[6px] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[rgba(255,255,255,0.65)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors"
              >
                 {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
           </div>
        </div>

        {/* MAIN ROW */}
        <div className="flex flex-1 overflow-hidden relative">
           
           {/* LEFT COLUMN (Video + Tabs) */}
           <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar relative bg-[#0d0d14] min-w-0">
              
              {/* VIDEO AREA */}
              <div className="w-full bg-[#000] shrink-0 relative flex flex-col items-center justify-center border-b border-[rgba(255,255,255,0.07)]" style={{ aspectRatio: '16/9', maxHeight: '56vh' }}>
                 {video.locked ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white">
                       <Lock className="w-10 h-10 text-[rgba(255,255,255,0.35)] mb-4" />
                       <h2 className="text-[16px] font-bold mb-1">Lesson Locked</h2>
                       <p className="text-[13px] text-[rgba(255,255,255,0.65)] mb-5 max-w-sm text-center">
                         {video.unlockReason || "You must complete the previous lessons to unlock this video."}
                       </p>
                       {video.previousVideoId && (
                          <Link href={`/subjects/${subjectId}/video/${video.previousVideoId}`} className="bg-[rgba(127,119,221,0.1)] border border-[rgba(127,119,221,0.2)] text-[#7F77DD] px-5 py-2.5 font-bold rounded-lg hover:bg-[rgba(127,119,221,0.2)] transition-colors text-[13px] flex items-center gap-2">
                             <ChevronLeft className="w-4 h-4" /> Go to Previous Lesson
                          </Link>
                       )}
                    </div>
                 ) : (
                    <VideoPlayer
                      videoId={video.id}
                      youtubeUrl={video.youtubeUrl}
                      startPositionSeconds={progress?.lastPositionSeconds || 0}
                      onProgress={handleProgress}
                      onCompleted={handleCompleted}
                      className="w-full h-full"
                    />
                 )}
              </div>

              {/* TAB BAR */}
              <div className="sticky top-0 bg-[#0d0d14] border-b border-[rgba(255,255,255,0.07)] z-20 px-7 w-full flex gap-6 shrink-0">
                 {['Overview', 'Q&A', 'Reviews'].map(tab => (
                   <button 
                     key={tab} 
                     onClick={() => setActiveTab(tab)}
                     className={`py-3.5 text-[13px] font-semibold transition-colors border-b-2 focus:outline-none   
                     ${activeTab === tab ? 'border-[#7F77DD] text-[#7F77DD]' : 'border-transparent text-[rgba(255,255,255,0.4)] hover:text-[#fff]'}`}
                   >
                     {tab}
                   </button>
                 ))}
              </div>

              {/* TAB CONTENTS */}
              <div className="flex-1">
                 {activeTab === 'Overview' && (
                   <div className="max-w-[760px] p-7 fade-in-tab">
                      <h1 className="font-dm-serif text-[28px] font-normal leading-tight text-white mb-5">{video.title}</h1>
                      
                      {/* Meta strip */}
                      <div className="flex flex-wrap items-center gap-5 py-3 border-y border-[rgba(255,255,255,0.07)] mb-6">
                         <div className="flex items-center gap-1.5 text-[13px] text-[rgba(255,255,255,0.55)]">
                           <Star className="w-3.5 h-3.5 text-[#7F77DD] fill-current" /> 4.8
                         </div>
                         <div className="w-1 h-1 rounded-full bg-[rgba(255,255,255,0.15)]"></div>
                         <div className="flex items-center gap-1.5 text-[13px] text-[rgba(255,255,255,0.55)]">
                           <Users className="w-3.5 h-3.5" /> 12,400+
                         </div>
                         <div className="w-1 h-1 rounded-full bg-[rgba(255,255,255,0.15)]"></div>
                         <div className="flex items-center gap-1.5 text-[13px] text-[rgba(255,255,255,0.55)]">
                           <Clock className="w-3.5 h-3.5" /> 16.5 hours
                         </div>
                         <div className="w-1 h-1 rounded-full bg-[rgba(255,255,255,0.15)]"></div>
                         <div className="flex items-center gap-1.5 text-[13px] text-[rgba(255,255,255,0.55)]">
                           <BookOpen className="w-3.5 h-3.5" /> {tot} lessons
                         </div>
                      </div>
                      
                      <div className="inline-flex items-center bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-[6px] px-2.5 py-1 text-[12px] text-white mb-6">
                         {video.sectionTitle}
                      </div>
                      
                      <div className="text-[14px] leading-[1.75] text-[rgba(255,255,255,0.65)] mb-8 whitespace-pre-wrap">
                         {video.description || "In this comprehensive lesson, we break down core architectural capabilities and seamlessly integrate components together to ensure robust scalable structures."}
                      </div>

                      <div className="bg-[rgba(127,119,221,0.06)] border border-[rgba(127,119,221,0.15)] rounded-[12px] p-5 sm:p-6 mb-8">
                         <div className="flex items-center gap-2 mb-4">
                            <Zap className="w-3.5 h-3.5 text-[#7F77DD] fill-current" />
                            <span className="text-[11px] uppercase tracking-widest font-bold text-[#7F77DD]">What you'll learn</span>
                         </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-[13px] text-[rgba(255,255,255,0.8)]">
                            <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#4ade80] shrink-0 mt-0.5" /> Understand core cinema-grade architecture patterns.</div>
                            <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#4ade80] shrink-0 mt-0.5" /> Integrate real-world scalable APIs cleanly.</div>
                            <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#4ade80] shrink-0 mt-0.5" /> Master state synchronization securely.</div>
                            <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#4ade80] shrink-0 mt-0.5" /> Deliver high-performance frontend interfaces.</div>
                         </div>
                      </div>

                      <div>
                         {!isCurrentCompleted ? (
                           <button onClick={handleCompleted} className="bg-[#7F77DD] text-[#0d0d14] rounded-[10px] px-6 py-[13px] font-extrabold text-[14px] hover:bg-[#6c65bd] transition-colors">
                              Complete & Next Lesson
                           </button>
                         ) : (
                           <div className="inline-flex items-center gap-2 bg-[#4ade80]/10 border border-[#4ade80]/20 text-[#4ade80] rounded-[10px] px-6 py-[13px] font-bold text-[14px]">
                              <Award className="w-4 h-4" /> Lesson completed!
                           </div>
                         )}
                      </div>
                   </div>
                 )}

                 {activeTab === 'Q&A' && (
                   <div className="p-7">
                     <QATab videoId={videoId} currentUser={user} />
                   </div>
                 )}

                 {activeTab === 'Reviews' && (
                   <div className="p-7 fade-in-tab max-w-[760px]">
                     <CourseReviews subjectId={subjectId} currentUser={user} />
                   </div>
                 )}
              </div>
           </div>

           {/* RIGHT COLUMN (Sidebar) */}
           {sidebarOpen && (
             <div className="w-[320px] bg-[#0d0d14] border-l border-[rgba(255,255,255,0.07)] shrink-0 flex flex-col overflow-hidden h-full z-10 transition-all">
                <div className="p-5 border-b border-[rgba(255,255,255,0.07)] shrink-0">
                   <div className="text-[10px] uppercase tracking-wider font-bold text-[rgba(255,255,255,0.35)] mb-1">Your Progress</div>
                   <div className="flex items-end gap-2 mb-2">
                      <span className="text-[28px] font-extrabold text-[#7F77DD] leading-none">{pct}%</span>
                      <span className="text-[12px] text-[rgba(255,255,255,0.35)] mb-1">{compiled}/{tot} lessons</span>
                   </div>
                   <div className="w-full h-1 bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-600 ease-out" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #7F77DD, #a098e6)' }}></div>
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar py-3">
                   {tree?.sections.map((sec, idx) => {
                      const secTotal = sec.videos.length;
                      const secDone = sec.videos.filter((v:any) => v.isCompleted).length;
                      const isExpanded = !!expandedSections[sec.id];
                      
                      return (
                         <div key={sec.id} className="mb-1">
                            <button 
                              onClick={() => toggleSection(sec.id)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[rgba(255,255,255,0.03)] transition-colors text-left"
                            >
                               <div className="w-5 h-5 rounded-[6px] bg-[#0d0d14] border border-[rgba(255,255,255,0.07)] flex items-center justify-center text-[10px] font-bold text-[rgba(255,255,255,0.65)] shrink-0">
                                 {idx + 1}
                               </div>
                               <div className="flex-1 min-w-0">
                                  <h4 className="text-[12px] font-bold text-white truncate">{sec.title}</h4>
                                  <p className="text-[10px] text-[rgba(255,255,255,0.35)]">{secDone}/{secTotal} lessons</p>
                               </div>
                               {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-[rgba(255,255,255,0.35)]" /> : <ChevronDown className="w-3.5 h-3.5 text-[rgba(255,255,255,0.35)]" />}
                            </button>

                            {isExpanded && (
                               <div className="py-1">
                                  {sec.videos.map((v: any) => {
                                     const isActive = v.id === videoId;
                                     const isLocked = v.locked;
                                     const isDone = v.isCompleted;

                                     return (
                                        <div key={v.id}>
                                           {isLocked ? (
                                              <div className="flex items-start gap-3 px-4 py-2 pl-[44px] cursor-not-allowed opacity-40">
                                                 <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-white" />
                                                 <span className="text-[12px] font-medium text-white line-clamp-2">{v.title}</span>
                                              </div>
                                           ) : (
                                              <Link 
                                                href={`/subjects/${subjectId}/video/${v.id}`}
                                                className={`flex items-start gap-3 px-4 py-2 pl-[44px] transition-colors border-r-2 ${
                                                  isActive ? 'bg-[rgba(127,119,221,0.1)] border-[#7F77DD] text-[#7F77DD]' : 'border-transparent hover:bg-[rgba(255,255,255,0.03)] text-[rgba(255,255,255,0.65)] hover:text-white'
                                                }`}
                                              >
                                                 {isDone ? (
                                                   <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isActive ? 'text-[#7F77DD]' : 'text-[#4ade80]'}`} />
                                                 ) : isActive ? (
                                                   <Circle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#7F77DD]" />
                                                 ) : (
                                                   <Circle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[rgba(255,255,255,0.35)]" />
                                                 )}
                                                 <span className="text-[12px] font-medium line-clamp-2">{v.title}</span>
                                              </Link>
                                           )}
                                        </div>
                                     );
                                  })}
                               </div>
                            )}
                         </div>
                      );
                   })}
                </div>
             </div>
           )}

        </div>
      </div>
    </>
  );
}