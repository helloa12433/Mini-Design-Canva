'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.login(email, password);
      if (res.success) {
        router.push('/');
      } else {
        setError(res.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-[#f6f8fa]">
      <div className="w-full max-w-md bg-white border border-[#d0d7de] rounded-lg p-6 shadow-sm space-y-5">
        <div className="flex flex-col items-center text-center space-y-1">
          <div className="w-8 h-8 rounded bg-[#0969da] flex items-center justify-center font-bold text-white text-sm mb-1 shadow-sm">
            M
          </div>
          <h1 className="text-lg font-bold text-[#1f2328]">Sign In to Mini Design Canvas</h1>
          <p className="text-xs text-[#656d76]">
            Access your cloud-persisted vector design workspaces
          </p>
        </div>

        {error && (
          <div className="p-3 bg-[#ffebe9] border border-[#ff8182]/40 rounded text-xs text-[#cf222e]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#1f2328] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#656d76]" /> Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@example.com"
              className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded px-3 py-2 text-xs text-[#1f2328] outline-none focus:border-[#0969da] focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#1f2328] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#656d76]" /> Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded px-3 py-2 text-xs text-[#1f2328] outline-none focus:border-[#0969da] focus:bg-white transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-[#1f883d] hover:bg-[#1a7f37] disabled:opacity-50 text-white text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
              </>
            ) : (
              <>
                Sign In <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#d0d7de] text-xs text-[#656d76]">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[#0969da] hover:underline font-semibold">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
