'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import LoadingScreen from '@/components/LoadingScreen';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth/login');
        } else {
            setIsChecking(false);
        }
    }, [isAuthenticated, router]);

    if (isChecking) {
        return <LoadingScreen />;
    }

    return <>{children}</>;
}
