"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import authApi from "@/api/authApi";

// Tambahkan tipe response wrapper sesuai backend
type BaseResponse<T> = {
  status: number;
  message: string;
  timestamp: string;
  data: T;
};


type LoginResponse = {
  accessToken: string;
  email: string;
  name: string;
  role: string;
  expiresIn: number;
};

export default function LoginForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = [];
    if (!form.email) {
      errors.push("Email wajib diisi.");
    } else if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.push("Format email tidak valid.");
    }

    if (!form.password) {
      errors.push("Password wajib diisi.");
    }

    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join(" "));
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const responseWrapper = await authApi.post('auth/login', {
        json: {
          email: form.email,
          password: form.password
        }
      }).json<BaseResponse<LoginResponse>>(); 
      console.log('Full response wrapper:', responseWrapper);
      const response = responseWrapper.data; 
      console.log('Extracted response:', response); 

      if (response?.accessToken) {
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('userRole', response.role);
        if (response.role === 'PACILIAN') {
          router.push('/homepage/pacilian');
        } else if (response.role === 'CAREGIVER') {
          router.push('/homepage/caregiver');
        } else {
          router.push('/homepage');
        }
      } else {
        setError('Invalid login response');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.response?.status === 401) {
        setError('Email atau password salah');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Terjadi kesalahan saat login');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-screen flex items-center justify-center bg-gradient-to-b from-white to-white px-12">
      <div className="w-1/2 max-w-md space-y-2">
        <img src="/LogoPandaCare.png" alt="Logo" className="h-20 object-contain mb-0" />
        <div className='mb-2'>
          <p className="text-xl text-blue-400">Login to your healthcare account</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <p>{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="block w-full rounded-md border border-gray-300 shadow-sm px-4 py-3 text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="block w-full rounded-md border border-gray-300 shadow-sm px-4 py-3 text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            placeholder="••••••••"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            }}
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <a href="/forgot-password" className="text-sm font-medium text-blue-400 hover:text-blue-500">
            Forgot password?
          </a>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-blue-400 hover:bg-blue-500 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-700">
            Don't have an account?{" "}
            <a href="/register" className="font-medium text-blue-400 hover:text-blue-500">
              Create an account
            </a>
          </p>
        </div>
      </div>

      <div className="w-1/2 hidden md:block pl-15">
        <img src="/pandadokter.jpg" alt="Panda Doctor" className="w-full h-auto object-contain" />
      </div>
    </div>
  );
}