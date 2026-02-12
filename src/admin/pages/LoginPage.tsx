import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lock, Mail, Terminal } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import adminApi from '../services/adminApi';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const login = useAdminAuthStore((state) => state.login);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check if we are in development mode
  const isDev = import.meta.env.DEV;

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await adminApi.post('/auth/login', data);
      
      const { user, token } = response.data;

      login({
        id: String(user.id),
        name: user.name || 'Admin',
        email: user.email,
        avatar: 'https://github.com/shadcn.png'
      }, token);
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.name || 'Admin'}!`,
      });
      navigate('/admin/dashboard');

    } catch (error: any) {
      console.error("Login error:", error);
      const msg = error.response?.data?.error || error.response?.data?.message || "Invalid email or password";
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevLogin = () => {
    form.setValue('email', 'admin@example.com');
    form.setValue('password', 'admin');
    // Auto submit for convenience
    form.handleSubmit(onSubmit)();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {isDev && (
              <Button 
                type="button" 
                variant="outline" 
                className="w-full mb-4 border-dashed"
                onClick={handleDevLogin}
              >
                <Terminal className="mr-2 h-4 w-4" />
                Dev Quick Fill (Admin)
              </Button>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  placeholder="name@example.com" 
                  className="pl-9" 
                  {...form.register('email')} 
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password"
                  className="pl-9" 
                  {...form.register('password')} 
                />
              </div>
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>
            
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            {isDev && (
               <Button 
                variant="outline" 
                className="w-full mt-2 border-dashed border-yellow-500 text-yellow-600 hover:bg-yellow-50" 
                type="button" 
                onClick={handleDevLogin}
                disabled={isLoading}
              >
                <Terminal className="mr-2 h-4 w-4" />
                Dev Quick Fill
              </Button>
            )}

          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
           <p>
            Don't have an account?{' '}
            <a href="#" className="text-primary hover:underline">Contact Administrator</a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
