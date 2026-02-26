import { useState } from 'react';
import { 
  Building2, Mail, Lock, UserCircle, Eye, EyeOff 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/types';
import { toast } from 'sonner';

const roles: { value: UserRole; label: string }[] = [
  { value: 'documentation_officer', label: 'Documentation Officer' },
  { value: 'declaration_manager', label: 'Declaration Manager' },
  { value: 'declarant', label: 'Declarant' },
  { value: 'operations_manager', label: 'Operations Manager' },
  { value: 'operation_clerk', label: 'Operation Clerk' },
  { value: 'permits_clerk', label: 'Permits Clerk' },
  { value: 'delivery_clerk', label: 'Delivery Clerk' },
  { value: 'transport_manager', label: 'Transport Manager' },
  { value: 'finance_manager', label: 'Finance Manager' },
  { value: 'cashier', label: 'Cashier' },
  { value: 'commercial_manager', label: 'Commercial Manager' },
  { value: 'coo', label: 'Chief Operations Officer' },
  { value: 'managing_director', label: 'Managing Director' },
  { value: 'hr_manager', label: 'HR Manager' },
  { value: 'driver', label: 'Driver' },
  { value: 'contact_person', label: 'Contact Person' },
  { value: 'administrator', label: 'Administrator' },
];

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('documentation_officer');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password, role);
      
      if (success) {
        toast.success('Login successful!');
        onLogin();
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 300);
        toast.error('Invalid credentials. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick login for demo - maps roles to their corresponding mock user emails
  const roleToEmailMap: Record<UserRole, string> = {
    'documentation_officer': 'documentation_officer@company.com',
    'declaration_manager': 'declaration_manager@company.com',
    'declarant': 'declarant@company.com',
    'operations_manager': 'operations_manager@company.com',
    'operation_clerk': 'operation_clerk@company.com',
    'permits_clerk': 'permits_clerk@company.com',
    'shipping_line_clerk': 'shipping_line_clerk@company.com',
    'delivery_clerk': 'delivery_clerk@company.com',
    'transport_manager': 'transport_manager@company.com',
    'finance_manager': 'finance_manager@company.com',
    'cashier': 'cashier@company.com',
    'commercial_manager': 'commercial_manager@company.com',
    'coo': 'coo@company.com',
    'managing_director': 'managing_director@company.com',
    'hr_manager': 'hr_manager@company.com',
    'driver': 'driver@company.com',
    'contact_person': 'contact_person@company.com',
    'administrator': 'administrator@company.com',
  };

  const handleDemoLogin = (demoRole: UserRole) => {
    setEmail(roleToEmailMap[demoRole]);
    setPassword('password');
    setRole(demoRole);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Login Card */}
      <div 
        className={`relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-400 ${
          shake ? 'animate-shake' : 'animate-fade-in-up'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-orange-300 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            DOW ELEF System
          </h1>
          <p className="text-orange-100 text-sm">
            Enterprise Management Solutions
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 border-gray-200 focus:border-orange-300 focus:ring-orange-300 transition-all"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-12 border-gray-200 focus:border-orange-300 focus:ring-orange-300 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role" className="text-gray-700 font-medium">
              Select Role
            </Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger className="h-12 border-gray-200 focus:border-orange-300 focus:ring-orange-300">
                <div className="flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-gray-400" />
                  <SelectValue placeholder="Select your role" />
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {roles.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-slate-800 to-orange-300 hover:from-slate-700 hover:to-orange-400 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-[1.02] disabled:opacity-70"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </Button>

          {/* Demo Login Buttons */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center mb-3">
              Quick Demo Login
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { role: 'documentation_officer' as const, label: 'Doc' },
                { role: 'declaration_manager' as const, label: 'Decl Mgr' },
                { role: 'operations_manager' as const, label: 'Ops Mgr' },
                { role: 'administrator' as const, label: 'Admin' },
              ].map((demo) => (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() => handleDemoLogin(demo.role)}
                  className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
                >
                  {demo.label}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-8 pb-6 text-center">
          <a 
            href="#" 
            className="text-sm text-orange-300 hover:text-orange-400 transition-colors"
          >
            Forgot your password?
          </a>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
