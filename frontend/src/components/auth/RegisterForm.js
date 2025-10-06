import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const RegisterForm = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    referralCode: searchParams.get('ref') || ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await register(formData);
      if (result.success) {
        toast.success('Registration successful!');
        navigate('/dashboard');
      } else {
        // This updated logic shows the specific error if available, otherwise the general one
        const specificError = result.errors && result.errors[0] ? result.errors[0].msg : result.message;
        toast.error(specificError);
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Create an Account</h2>
        <p className="text-gray-600 mt-2">Join now and start earning rewards!</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input type="text" name="name" onChange={handleChange} value={formData.name} className="input-field pl-10" placeholder="Enter your full name" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input type="email" name="email" onChange={handleChange} value={formData.email} className="input-field pl-10" placeholder="Enter your email" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input type={showPassword ? 'text' : 'password'} name="password" onChange={handleChange} value={formData.password} className="input-field pl-10 pr-10" placeholder="Enter your password" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
         <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Referral Code (Optional)</label>
          <div className="relative">
             <input type="text" name="referralCode" onChange={handleChange} value={formData.referralCode} className="input-field" placeholder="Enter referral code" />
          </div>
        </div>
        <button type="submit" className="w-full btn-primary flex items-center justify-center py-3" disabled={loading}>
          {loading ? <LoadingSpinner size="sm" /> : 'Register'}
        </button>
      </form>
       <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
          Sign In
        </Link>
      </p>
    </div>
  );
};
export default RegisterForm;