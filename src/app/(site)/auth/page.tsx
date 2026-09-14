
'use client';

import { useState, Suspense, ReactNode } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, X } from 'lucide-react';
import { customLogin, customSignUp } from '../../actions';
import { useRouter } from 'next/navigation';
import OtpDialog from '@/components/otp-dialog';
import { useAuth } from '@/components/providers/auth-provider';
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';
import Auth3DScene from '@/components/auth-3d-scene';
import TermsContent from '@/components/legal/terms-content';
import PrivacyContent from '@/components/legal/privacy-content';
import { ScrollArea } from '@/components/ui/scroll-area';

const loginSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z.string().min(1, { message: 'Password is required.' }),
});

const signupSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.'}),
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
    terms: z.boolean().refine(val => val === true, {
      message: 'You must accept the terms and conditions.',
    }),
});

type AuthMode = 'login' | 'signup' | 'terms' | 'privacy';
type ActiveField = 'name' | 'email' | 'password' | null;

const LegalPage = ({ title, onBack, children }: { title: string, onBack: () => void, children: ReactNode }) => (
    <Card className="glass-surface w-full h-full shadow-2xl bg-card/60 backdrop-blur-2xl flex flex-col">
        <CardHeader>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4 -mr-4">
                {children}
            </ScrollArea>
        </CardContent>
        <CardFooter>
            <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to form
            </Button>
        </CardFooter>
    </Card>
);

const FocusedView = ({ field, form, children, onClose }: { field: ActiveField, form: any, children: ReactNode, onClose: () => void }) => {
    return (
        <motion.div
            className="absolute inset-0 z-20 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div layoutId={`${field}-wrapper`} className="w-full max-w-sm">
                <FormProvider {...form}>
                     <form>
                        <Card>
                            <CardContent className="p-6 relative">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 z-30 rounded-full h-8 w-8"
                                    onClick={onClose}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                                {children}
                            </CardContent>
                        </Card>
                    </form>
                </FormProvider>
            </motion.div>
        </motion.div>
    );
};


export default function AuthPage() {
    const [mode, setMode] = useState<AuthMode>('signup');
    const [isLoading, setIsLoading] = useState(false);
    const [showOtpDialog, setShowOtpDialog] = useState(false);
    const [userIdForOtp, setUserIdForOtp] = useState<string | null>(null);
    const [activeField, setActiveField] = useState<ActiveField>(null);
    const { toast } = useToast();
    const router = useRouter();
    const { login: setAuthToken } = useAuth();
    
    const loginForm = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    const signupForm = useForm<z.infer<typeof signupSchema>>({
        resolver: zodResolver(signupSchema),
        defaultValues: { name: '', email: '', password: '', terms: false },
    });
    
    const handleRedirect = () => {
        router.push('/dashboard');
        router.refresh(); 
    };

    const onOtpSuccess = (token: string) => {
        toast({ title: 'Account Verified!', description: 'Welcome to your dashboard.' });
        setShowOtpDialog(false);
        setAuthToken(token);
        handleRedirect();
    };

    const handleLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
        setIsLoading(true);
        loginForm.clearErrors('root');
        try {
            const result = await customLogin(values);
            if (result.error) {
                const error = result.error as any;
                const errorMessage = error._errors?.join(', ') || error.email?.[0] || error.password?.[0] || 'Invalid credentials.';
                toast({ title: 'Login Failed', description: errorMessage, variant: 'destructive' });
                loginForm.setError('root', { message: errorMessage });
            } else if (result.requiresOtp && result.userId) {
                toast({
                    title: 'Verification Required',
                    description: "Your account isn't verified. We've sent a new OTP to your email.",
                    variant: 'default'
                });
                setUserIdForOtp(result.userId);
                setShowOtpDialog(true);
            } else if (result.token) {
                toast({ title: 'Login Successful', description: 'Welcome back!' });
                setAuthToken(result.token);
                handleRedirect();
            }
        } catch (error) {
            toast({ title: 'Login Failed', description: 'An unexpected error occurred.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSignupSubmit = async (values: z.infer<typeof signupSchema>) => {
        setIsLoading(true);
        signupForm.clearErrors();
        try {
          const result = await customSignUp(values);
          if (result.error) {
            const error = result.error as any;
            if (error.email) {
              signupForm.setError('email', { message: error.email[0] });
            } else {
              const errorMessage = error._errors?.join(', ') || 'Could not create account.';
              toast({ title: 'Sign Up Failed', description: errorMessage, variant: 'destructive' });
            }
          } else if (result.success && result.userId) {
            toast({ title: 'Account Created!', description: 'Please check your email for a verification code.' });
            setUserIdForOtp(result.userId);
            setShowOtpDialog(true);
          }
        } catch (error) {
          toast({ title: 'Sign Up Failed', description: 'An unexpected client error occurred.', variant: 'destructive' });
        } finally {
          setIsLoading(false);
        }
    };
    
    const flipVariants = {
        initial: { rotateY: -90, opacity: 0, scale: 0.95 },
        animate: { rotateY: 0, opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
        exit: { rotateY: 90, opacity: 0, scale: 0.95, transition: { duration: 0.4, ease: 'easeIn' } },
    };

    const renderContent = () => {
        switch (mode) {
            case 'signup':
                return (
                    <Card className="glass-surface w-full h-full shadow-2xl bg-card/60 backdrop-blur-2xl">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">Create an Account</CardTitle>
                            <CardDescription>Join ChatForge AI to get your API key.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FormProvider {...signupForm}>
                                <form onSubmit={signupForm.handleSubmit(handleSignupSubmit)} className="space-y-4">
                                     <motion.div layoutId="name-wrapper" onClick={() => setActiveField('name')}>
                                        <FormField control={signupForm.control} name="name" render={({ field }) => (
                                            <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Your Name" {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                    </motion.div>
                                    <motion.div layoutId="email-wrapper" onClick={() => setActiveField('email')}>
                                        <FormField control={signupForm.control} name="email" render={({ field }) => (
                                            <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="name@yourcompany.com" {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                    </motion.div>
                                    <motion.div layoutId="password-wrapper" onClick={() => setActiveField('password')}>
                                        <FormField control={signupForm.control} name="password" render={({ field }) => (
                                            <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                    </motion.div>
                                    <FormField control={signupForm.control} name="terms" render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-background/50"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange}/></FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                I agree to the{' '}
                                                <button type="button" onClick={() => setMode('terms')} className="font-semibold text-primary hover:underline">Terms</button>
                                                {' '} & {' '}
                                                <button type="button" onClick={() => setMode('privacy')} className="font-semibold text-primary hover:underline">Privacy Policy</button>
                                                .
                                            </FormLabel>
                                            <FormMessage />
                                        </div>
                                        </FormItem>
                                    )}/>
                                    <Button type="submit" className="w-full" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create Account</Button>
                                </form>
                            </FormProvider>
                            <div className="mt-6 text-center text-sm">
                                Already have an account?{' '}
                                <button onClick={() => setMode('login')} className="font-semibold text-primary hover:underline">Log In</button>
                            </div>
                        </CardContent>
                    </Card>
                );
            case 'login':
                 return (
                    <Card className="glass-surface w-full h-full shadow-2xl bg-card/60 backdrop-blur-2xl">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">Welcome Back!</CardTitle>
                            <CardDescription>Log in to access your dashboard.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FormProvider {...loginForm}>
                                <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
                                     <motion.div layoutId="email-wrapper" onClick={() => setActiveField('email')}>
                                        <FormField control={loginForm.control} name="email" render={({ field }) => (
                                            <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="name@yourcompany.com" {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                    </motion.div>
                                    <motion.div layoutId="password-wrapper" onClick={() => setActiveField('password')}>
                                    <FormField control={loginForm.control} name="password" render={({ field }) => (
                                        <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    </motion.div>
                                    {loginForm.formState.errors.root && <p className="text-sm font-medium text-destructive">{loginForm.formState.errors.root.message}</p>}
                                    <Button type="submit" className="w-full" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Log In</Button>
                                </form>
                            </FormProvider>
                            <div className="mt-6 text-center text-sm">
                                Don't have an account?{' '}
                                <button onClick={() => setMode('signup')} className="font-semibold text-primary hover:underline">Sign Up</button>
                            </div>
                            <p className="px-8 text-center text-xs text-muted-foreground mt-6">
                                By continuing, you agree to our{' '}
                                <button type="button" onClick={() => setMode('terms')} className="underline underline-offset-4 hover:text-primary cursor-pointer">Terms of Service</button>.
                            </p>
                        </CardContent>
                    </Card>
                );
            case 'terms':
                return (
                    <LegalPage title="Terms & Conditions" onBack={() => setMode(signupForm.formState.isSubmitted ? 'login' : 'signup')}>
                        <TermsContent />
                    </LegalPage>
                );
            case 'privacy':
                return (
                    <LegalPage title="Privacy Policy" onBack={() => setMode(signupForm.formState.isSubmitted ? 'login' : 'signup')}>
                        <PrivacyContent />
                    </LegalPage>
                );
            default:
                return null;
        }
    }

    return (
      <>
        <div className="page-enter relative min-h-[calc(100vh-8rem)] w-full overflow-hidden bg-transparent">
             <motion.div 
                className="absolute inset-0 z-0"
                animate={{ filter: activeField ? 'blur(8px)' : 'blur(0px)' }}
                transition={{ duration: 0.3 }}
              >
                <Suspense fallback={<div className="bg-background" />}>
                    <Auth3DScene />
                </Suspense>
            </motion.div>
            
            <div className="container relative z-10 py-12 flex items-center justify-center min-h-[calc(100vh-8rem)]">
                <motion.div 
                    className="relative w-full max-w-md h-[720px]" 
                    style={{ perspective: '1200px' }}
                    animate={{ opacity: activeField ? 0 : 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <AnimatePresence initial={false} mode="wait">
                        <motion.div
                            key={mode}
                            variants={flipVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="absolute w-full h-full"
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </div>
             <AnimatePresence>
                {activeField && (
                    <>
                        <motion.div
                            className="absolute inset-0 z-10 bg-black/30"
                            onClick={() => setActiveField(null)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />
                        <FocusedView 
                            field={activeField} 
                            form={mode === 'signup' ? signupForm : loginForm} 
                            onClose={() => setActiveField(null)}
                        >
                            {activeField === 'name' && (
                                <FormField control={signupForm.control} name="name" render={({ field }) => (
                                    <FormItem><FormLabel>Name</FormLabel><FormControl><Input autoFocus placeholder="Your Name" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            )}
                            {activeField === 'email' && (
                                <FormField control={(mode === 'signup' ? signupForm.control : loginForm.control) as any} name="email" render={({ field }) => (
                                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input autoFocus type="email" placeholder="name@yourcompany.com" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            )}
                             {activeField === 'password' && (
                                <FormField control={(mode === 'signup' ? signupForm.control : loginForm.control) as any} name="password" render={({ field }) => (
                                    <FormItem><FormLabel>Password</FormLabel><FormControl><Input autoFocus type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            )}
                        </FocusedView>
                    </>
                )}
            </AnimatePresence>
        </div>
        {userIdForOtp && (
            <OtpDialog isOpen={showOtpDialog} onClose={() => setShowOtpDialog(false)} onSuccess={onOtpSuccess} userId={userIdForOtp} />
        )}
      </>
    );
}

    
