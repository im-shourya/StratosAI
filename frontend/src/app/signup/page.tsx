'use client';

import { useState } from 'react';
import { fetchApi } from '@/lib/api';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    company_name: '',
    industry: '',
    valuation: '',
    country: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetchApi('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      localStorage.setItem('token', response.access_token);
      setMessage('Signup successful! Token saved.');
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-white dark:bg-zinc-950 shadow-sm text-zinc-900 dark:text-zinc-100">
        <h1 className="text-2xl font-bold mb-6">StratosAI Signup</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input className="border border-zinc-300 dark:border-zinc-700 bg-transparent p-2 rounded" name="email" type="email" placeholder="Email" required onChange={handleChange} />
          <input className="border border-zinc-300 dark:border-zinc-700 bg-transparent p-2 rounded" name="password" type="password" placeholder="Password" required onChange={handleChange} />
          <input className="border border-zinc-300 dark:border-zinc-700 bg-transparent p-2 rounded" name="company_name" type="text" placeholder="Company Name" onChange={handleChange} />
          <input className="border border-zinc-300 dark:border-zinc-700 bg-transparent p-2 rounded" name="industry" type="text" placeholder="Industry" onChange={handleChange} />
          <input className="border border-zinc-300 dark:border-zinc-700 bg-transparent p-2 rounded" name="valuation" type="text" placeholder="Valuation" onChange={handleChange} />
          <input className="border border-zinc-300 dark:border-zinc-700 bg-transparent p-2 rounded" name="country" type="text" placeholder="Country" onChange={handleChange} />
          
          <button disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded font-medium mt-2 disabled:opacity-50 transition-colors">
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        {message && <div className="mt-4 p-3 rounded bg-zinc-100 dark:bg-zinc-900 text-sm font-medium">{message}</div>}
      </div>
    </div>
  );
}
