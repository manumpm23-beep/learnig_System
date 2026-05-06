'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { useAuthStore } from '@/store/authStore';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.login);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/api/auth/register', {
        name,
        email,
        password,
      });

      const data = response.data;
      
      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);
        
        if (data.user) {
          setAuth(data.user, data.accessToken);
        }
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        err.response?.data?.error ||
        err.message || 
        'An error occurred during registration. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-[400px] bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        
        {/* Header/Logo area */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-[#534AB7] rounded-md flex items-center justify-center">
            <GraduationCap className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-[17px] text-gray-900 tracking-tight">LearnSpace</span>
        </div>

        {/* Title section */}
        <div className="mb-6">
          <h1 className="text-[22px] font-medium text-gray-900 mb-1">Create an Account</h1>
          <p className="text-[14px] text-gray-500">Start your learning journey today</p>
        </div>

        <form onSubmit={handleRegister}>
          {/* Name input field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="name">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full pl-10 pr-3 h-[36px] bg-white border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#534AB7] focus:border-[#534AB7] transition-colors"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          {/* Email input field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 h-[36px] bg-white border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#534AB7] focus:border-[#534AB7] transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {/* Password input field */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-10 h-[36px] bg-white border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#534AB7] focus:border-[#534AB7] transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                )}
              </button>
            </div>
          </div>

          {/* Register button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[36px] flex justify-center items-center px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#534AB7] hover:bg-[#433b97] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#534AB7] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating account...' : 'Register'}
          </button>
          
          {error && (
            <div className="mt-3 text-sm text-red-500 text-center animate-pulse">
              {error}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-[#534AB7] hover:underline transition-all">
            Log in here
          </Link>
        </div>
        
      </div>
    </div>
  );
}