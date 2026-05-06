'use client';

import AuthGuard from '@/components/Auth/AuthGuard';

export default function SubjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="bg-[#0d0d14] min-h-[100dvh] flex flex-col">
        {children}
      </div>
    </AuthGuard>
  );
}