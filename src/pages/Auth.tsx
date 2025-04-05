import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, UserPlus, LogIn, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserData } from '@/lib/types';

// Mock user database (replace with localStorage)
const MOCK_USERS = [
  {
    name: "Demo User",
    username: "demo@example.com",
    password: "password123",
    bio: "Demo account",
    avatar: "",
    level: "Beginner"
  }
];

const loginSchema = z.object({
  username: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  rememberMe: z.boolean().optional(),
});

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  username: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  confirmPassword: z.string(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

// Function to generate a simple JWT
const generateJWT = (user) => {
  // Create a JWT header
  const header = {
    alg: "HS256",
    typ: "JWT"
  };

  // Create a JWT payload with user data and expiration
  const payload = {
    sub: user.username,
    name: user.name,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours from now
    iat: Math.floor(Date.now() / 1000)
  };

  // In a real app, you'd use a proper JWT library
  // For this static example, we'll base64 encode the parts
  const base64Header = btoa(JSON.stringify(header));
  const base64Payload = btoa(JSON.stringify(payload));
  
  // In a real app, this would be signed with a secret key
  // Here we're just concatenating with a dummy signature
  const signature = btoa("static_signature_for_demo");
  
  // Combine all parts to form the JWT
  return `${base64Header}.${base64Payload}.${signature}`;
};

const Auth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  });
  
  // Get stored users or initialize with mock data
  const getUsers = () => {
    const storedUsers = localStorage.getItem('users');
    return storedUsers ? JSON.parse(storedUsers) : MOCK_USERS;
  };

  const onLoginSubmit = async (values: LoginFormValues) => {
    try {
      const res = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) throw new Error(data.detail);
  
      alert("Login successful!");
      console.log(data)
      localStorage.setItem("currentUser", JSON.stringify(data.user));
  
      if (!values.rememberMe) {
        localStorage.setItem('tokenExpiry', (Date.now() + 24 * 60 * 60 * 1000).toString());
      }
  
      navigate("/profile");
    } catch (err: any) {
      toast.error("Login failed: " + err.message);
    }
  };
  
  
  const onSignupSubmit = async (values: SignupFormValues) => {
    console.log(values)
    try {
      const res = await fetch('http://localhost:8000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
  
      localStorage.setItem("authToken", generateJWT(data.user));
      localStorage.setItem("currentUser", JSON.stringify(data.user));
  
      toast.success("Account created successfully");
    } catch (err: any) {
      toast.error(err.message);
    }
  };
  
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-background/90 px-4 py-10">
      <Link to="/" className="absolute top-6 left-6 flex items-center text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="mr-2 h-5 w-5" />
        Back to Home
      </Link>
      
      <div className="w-full max-w-6xl mb-8 text-center">
        <h1 className="text-3xl font-bold text-gradient mb-2">Welcome to MakeIt</h1>
        <p className="text-gray-400 max-w-lg mx-auto">
          Join our community or sign in to continue your creative journey
        </p>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
        {/* Login Card */}
        <Card className="bg-black/30 backdrop-blur-xl border border-white/5 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
            <CardDescription>
              Access your account and continue your creative journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input placeholder="yourname@example.com" {...field} className="pl-10" />
                          <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="••••••••" 
                            {...field} 
                            className="pl-10"
                          />
                          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <button 
                            type="button"
                            className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center justify-between">
                  <FormField
                    control={loginForm.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="remember-me"
                          />
                        </FormControl>
                        <label
                          htmlFor="remember-me"
                          className="text-sm text-gray-400 cursor-pointer"
                        >
                          Remember me
                        </label>
                      </FormItem>
                    )}
                  />
                  <Link to="/forgot-password" className="text-sm text-electric-400 hover:text-electric-300 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <AnimatedButton
                  type="submit"
                  variant="electric"
                  withGlow
                  className="w-full mt-6"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </AnimatedButton>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-white/5 pt-6">
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.0003 2.00001C6.47813 2.00001 2.00006 6.47732 2.00006 12C2.00006 16.9913 5.65783 21.1283 10.4381 21.8785V14.8906H7.89844V12H10.4381V9.79688C10.4381 7.29063 11.9306 5.90626 14.2147 5.90626C15.3097 5.90626 16.4541 6.10157 16.4541 6.10157V8.5625H15.1921C13.9503 8.5625 13.5628 9.33335 13.5628 10.1242V12H16.3369L15.8934 14.8906H13.5628V21.8785C18.3428 21.1283 22.0006 16.9913 22.0006 12C22.0006 6.47732 17.5225 2.00001 12.0003 2.00001Z" />
                </svg>
              </button>
              <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.0003 6.41178C21.2642 6.7303 20.4731 6.95026 19.6438 7.04607C20.4908 6.56155 21.1413 5.7787 21.4475 4.83905C20.6547 5.30122 19.7768 5.62574 18.8422 5.80349C18.0935 4.9466 17.0269 4.41211 15.8472 4.41211C13.5818 4.41211 11.7435 6.28046 11.7435 8.54026C11.7435 8.85118 11.7793 9.15366 11.8476 9.44326C8.43969 9.27489 5.41633 7.6144 3.39156 5.11286C3.04881 5.70093 2.85318 6.37701 2.85318 7.09468C2.85318 8.44919 3.5917 9.63015 4.6626 10.3106C3.98988 10.2894 3.35681 10.1053 2.8035 9.81087C2.80318 9.82808 2.80318 9.84481 2.80318 9.86203C2.80318 11.8408 4.21768 13.4982 6.09506 13.8665C5.75968 13.9576 5.40787 14.0071 5.04443 14.0071C4.78325 14.0071 4.53043 13.9811 4.28468 13.934C4.79756 15.5636 6.31581 16.7608 8.11062 16.7929C6.69975 17.9013 4.93044 18.5596 3.00787 18.5596C2.68931 18.5596 2.37393 18.5402 2.06299 18.5017C3.87662 19.6733 6.06006 20.3545 8.41006 20.3545C15.8375 20.3545 19.9643 14.0696 19.9643 8.6455C19.9643 8.47241 19.9606 8.29959 19.953 8.12779C20.7546 7.5775 21.45 6.89032 22.0003 6.10899V6.41178Z" />
                </svg>
              </button>
              <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.94 3.24-2.04 4.2-1.14 1-2.64 1.56-4.44 1.56-3.52 0-6.44-2.92-6.44-6.44s2.92-6.44 6.44-6.44c1.76 0 3.24.66 4.36 1.76l2.44-2.44C18.84 4.6 16.5 3.44 13.84 3.44 8.24 3.44 3.84 7.84 3.84 13.44s4.4 10 9.6 10c2.8 0 5.12-.92 6.84-2.56 1.84-1.84 2.88-4.52 2.88-7.68 0-.76-.08-1.48-.2-2.2h-10.4z" />
                </svg>
              </button>
            </div>
          </CardFooter>
        </Card>

        {/* Register Card */}
        <Card className="bg-black/30 backdrop-blur-xl border border-white/5 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>
              Join our community and start creating amazing projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-5">
                <FormField
                  control={signupForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input placeholder="John Doe" {...field} className="pl-10" />
                          <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input placeholder="yourname@example.com" {...field} className="pl-10" />
                          <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="••••••••" 
                            {...field} 
                            className="pl-10"
                          />
                          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <button 
                            type="button"
                            className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showConfirmPassword ? "text" : "password"} 
                            placeholder="••••••••" 
                            {...field} 
                            className="pl-10"
                          />
                          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <button 
                            type="button"
                            className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="termsAccepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="terms"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <label
                          htmlFor="terms"
                          className="text-sm text-gray-400 cursor-pointer"
                        >
                          I agree to the{" "}
                          <Link to="/terms" className="text-electric-400 hover:text-electric-300">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link to="/privacy" className="text-electric-400 hover:text-electric-300">
                            Privacy Policy
                          </Link>
                        </label>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <AnimatedButton
                  type="submit"
                  variant="electric"
                  withGlow
                  className="w-full mt-6"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Account
                </AnimatedButton>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-white/5 pt-6">
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.0003 2.00001C6.47813 2.00001 2.00006 6.47732 2.00006 12C2.00006 16.9913 5.65783 21.1283 10.4381 21.8785V14.8906H7.89844V12H10.4381V9.79688C10.4381 7.29063 11.9306 5.90626 14.2147 5.90626C15.3097 5.90626 16.4541 6.10157 16.4541 6.10157V8.5625H15.1921C13.9503 8.5625 13.5628 9.33335 13.5628 10.1242V12H16.3369L15.8934 14.8906H13.5628V21.8785C18.3428 21.1283 22.0006 16.9913 22.0006 12C22.0006 6.47732 17.5225 2.00001 12.0003 2.00001Z" />
                </svg>
              </button>
              <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.0003 6.41178C21.2642 6.7303 20.4731 6.95026 19.6438 7.04607C20.4908 6.56155 21.1413 5.7787 21.4475 4.83905C20.6547 5.30122 19.7768 5.62574 18.8422 5.80349C18.0935 4.9466 17.0269 4.41211 15.8472 4.41211C13.5818 4.41211 11.7435 6.28046 11.7435 8.54026C11.7435 8.85118 11.7793 9.15366 11.8476 9.44326C8.43969 9.27489 5.41633 7.6144 3.39156 5.11286C3.04881 5.70093 2.85318 6.37701 2.85318 7.09468C2.85318 8.44919 3.5917 9.63015 4.6626 10.3106C3.98988 10.2894 3.35681 10.1053 2.8035 9.81087C2.80318 9.82808 2.80318 9.84481 2.80318 9.86203C2.80318 11.8408 4.21768 13.4982 6.09506 13.8665C5.75968 13.9576 5.40787 14.0071 5.04443 14.0071C4.78325 14.0071 4.53043 13.9811 4.28468 13.934C4.79756 15.5636 6.31581 16.7608 8.11062 16.7929C6.69975 17.9013 4.93044 18.5596 3.00787 18.5596C2.68931 18.5596 2.37393 18.5402 2.06299 18.5017C3.87662 19.6733 6.06006 20.3545 8.41006 20.3545C15.8375 20.3545 19.9643 14.0696 19.9643 8.6455C19.9643 8.47241 19.9606 8.29959 19.953 8.12779C20.7546 7.5775 21.45 6.89032 22.0003 6.10899V6.41178Z" />
                </svg>
              </button>
              <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.94 3.24-2.04 4.2-1.14 1-2.64 1.56-4.44 1.56-3.52 0-6.44-2.92-6.44-6.44s2.92-6.44 6.44-6.44c1.76 0 3.24.66 4.36 1.76l2.44-2.44C18.84 4.6 16.5 3.44 13.84 3.44 8.24 3.44 3.84 7.84 3.84 13.44s4.4 10 9.6 10c2.8 0 5.12-.92 6.84-2.56 1.84-1.84 2.88-4.52 2.88-7.68 0-.76-.08-1.48-.2-2.2h-10.4z" />
                </svg>
              </button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Auth;