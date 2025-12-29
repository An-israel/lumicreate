import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Loader2, Shield, Briefcase } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const staffLoginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  position: z.string().min(1, "Please select your position"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;
type StaffLoginFormData = z.infer<typeof staffLoginSchema>;

const STAFF_POSITIONS = [
  { value: "admin", label: "Admin" },
  { value: "staff", label: "Staff" },
];

const Auth = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("mode") === "signup" ? "signup" : "login";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showStaffLogin, setShowStaffLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  const staffForm = useForm<StaffLoginFormData>({
    resolver: zodResolver(staffLoginSchema),
    defaultValues: { email: "", password: "", position: "" },
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    const { error } = await signIn(data.email, data.password);
    setIsLoading(false);

    if (error) {
      if (error.message.includes("Invalid login")) {
        toast.error("Invalid email or password");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Welcome back!");
      navigate("/dashboard");
    }
  };

  const handleSignup = async (data: SignupFormData) => {
    setIsLoading(true);
    const { error } = await signUp(data.email, data.password, data.fullName);
    setIsLoading(false);

    if (error) {
      if (error.message.includes("already registered")) {
        toast.error("This email is already registered. Try signing in instead.");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Account created! You're now signed in.");
      navigate("/dashboard");
    }
  };

  const handleStaffLogin = async (data: StaffLoginFormData) => {
    setIsLoading(true);
    const { error } = await signIn(data.email, data.password);
    setIsLoading(false);

    if (error) {
      if (error.message.includes("Invalid login")) {
        toast.error("Invalid email or password");
      } else {
        toast.error(error.message);
      }
    } else {
      const positionLabel = STAFF_POSITIONS.find(p => p.value === data.position)?.label || data.position;
      toast.success(`Welcome back, ${positionLabel}!`);
      navigate("/admin");
    }
  };

  if (user) {
    return null;
  }

  // Staff Login View
  if (showStaffLogin) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                  <span className="text-xl font-bold text-primary-foreground">L</span>
                </div>
                <span className="text-2xl font-display font-bold">Luminate</span>
              </Link>
              <p className="mt-2 text-muted-foreground">
                Staff Portal Access
              </p>
            </div>

            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>Staff Sign In</CardTitle>
                </div>
                <CardDescription>
                  Access the admin dashboard
                </CardDescription>
              </CardHeader>

              <form onSubmit={staffForm.handleSubmit(handleStaffLogin)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="staff-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="staff-email"
                        type="email"
                        placeholder="you@luminate.com"
                        className="pl-10"
                        {...staffForm.register("email")}
                      />
                    </div>
                    {staffForm.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {staffForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="staff-position">Position</Label>
                    <Select
                      onValueChange={(value) => staffForm.setValue("position", value)}
                      defaultValue={staffForm.getValues("position")}
                    >
                      <SelectTrigger className="w-full">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Select your position" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {STAFF_POSITIONS.map((position) => (
                          <SelectItem key={position.value} value={position.value}>
                            {position.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {staffForm.formState.errors.position && (
                      <p className="text-sm text-destructive">
                        {staffForm.formState.errors.position.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="staff-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="staff-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        {...staffForm.register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {staffForm.formState.errors.password && (
                      <p className="text-sm text-destructive">
                        {staffForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex-col gap-4">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In to Dashboard
                  </Button>
                  <button
                    type="button"
                    onClick={() => setShowStaffLogin(false)}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    ← Back to customer login
                  </button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                <span className="text-xl font-bold text-primary-foreground">L</span>
              </div>
              <span className="text-2xl font-display font-bold">Luminate</span>
            </Link>
            <p className="mt-2 text-muted-foreground">
              Your creator journey starts here
            </p>
          </div>

          <Card>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <CardHeader className="pb-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Create Account</TabsTrigger>
                </TabsList>
              </CardHeader>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={loginForm.handleSubmit(handleLogin)}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="you@example.com"
                          className="pl-10"
                          {...loginForm.register("email")}
                        />
                      </div>
                      {loginForm.formState.errors.email && (
                        <p className="text-sm text-destructive">
                          {loginForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          {...loginForm.register("password")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-destructive">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setActiveTab("signup")}
                        className="text-primary hover:underline"
                      >
                        Create one
                      </button>
                    </p>
                  </CardFooter>
                </form>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup">
                <form onSubmit={signupForm.handleSubmit(handleSignup)}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Your name"
                          className="pl-10"
                          {...signupForm.register("fullName")}
                        />
                      </div>
                      {signupForm.formState.errors.fullName && (
                        <p className="text-sm text-destructive">
                          {signupForm.formState.errors.fullName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@example.com"
                          className="pl-10"
                          {...signupForm.register("email")}
                        />
                      </div>
                      {signupForm.formState.errors.email && (
                        <p className="text-sm text-destructive">
                          {signupForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          {...signupForm.register("password")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {signupForm.formState.errors.password && (
                        <p className="text-sm text-destructive">
                          {signupForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-confirm"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10"
                          {...signupForm.register("confirmPassword")}
                        />
                      </div>
                      {signupForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-destructive">
                          {signupForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Account
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setActiveTab("login")}
                        className="text-primary hover:underline"
                      >
                        Sign in
                      </button>
                    </p>
                  </CardFooter>
                </form>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Staff Sign In Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowStaffLogin(true)}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Shield className="h-4 w-4" />
              Sign in as Admin
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
