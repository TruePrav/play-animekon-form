'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { emailSchema, passwordSchema, sanitizeInput, generateCSRFToken, logSecurityEvent } from '@/lib/security';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    // Generate CSRF token on component mount
    setCsrfToken(generateCSRFToken());
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Input validation
      const validatedEmail = emailSchema.parse(email);
      const validatedPassword = passwordSchema.parse(password);

      // Sanitize inputs
      const sanitizedEmail = sanitizeInput(validatedEmail);
      const sanitizedPassword = sanitizeInput(validatedPassword);

      // Log login attempt
      logSecurityEvent('admin_login_attempt', { email: sanitizedEmail }, 'client-side');

      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: sanitizedPassword
      });

      if (error) {
        logSecurityEvent('admin_login_failed', { error: error.message, email: sanitizedEmail }, 'client-side');
        throw error;
      }

      if (data.user) {
        // Check if user has admin role
        const { data: profile, error: profileError } = await supabase
          .from('admin_users')
          .select('role')
          .eq('user_id', data.user.id)
          .single();

        if (profileError) {
          logSecurityEvent('admin_profile_error', { error: profileError.message, userId: data.user.id }, 'client-side');
          throw profileError;
        }

        if (profile && profile.role === 'admin') {
          logSecurityEvent('admin_login_success', { userId: data.user.id, email: sanitizedEmail }, 'client-side');
          onLoginSuccess();
        } else {
          logSecurityEvent('admin_access_denied', { userId: data.user.id, email: sanitizedEmail }, 'client-side');
          setError('Access denied. Admin privileges required.');
          await supabase.auth.signOut();
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error && 'name' in error && error.name === 'ZodError') {
        setError('Please check your input and try again.');
      } else if (error instanceof Error) {
        setError(error.message || 'An error occurred during login.');
      } else {
        setError('An error occurred during login.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    // Clear error when user starts typing
    if (error) setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <Card className="bg-slate-800/50 border-slate-600 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-emerald-400">Admin Access</CardTitle>
            <CardDescription className="text-slate-300">
              Sign in to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Hidden CSRF token */}
              <input type="hidden" name="csrf_token" value={csrfToken} />
              
              <div>
                <label htmlFor="email" className="text-sm font-medium text-slate-200">Email</label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className="mt-1 bg-slate-700 border-slate-600 text-white"
                  required
                  autoComplete="email"
                  maxLength={254}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="text-sm font-medium text-slate-200">Password</label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  className="mt-1 bg-slate-700 border-slate-600 text-white"
                  required
                  autoComplete="current-password"
                  maxLength={128}
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm text-center p-3 bg-red-900/20 rounded-lg border border-red-800">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
                disabled={loading || !email || !password}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className="text-xs text-slate-400 text-center">
                <p>Password must be at least 8 characters with uppercase, lowercase, and numbers</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
