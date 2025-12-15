
'use client';

import { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { customLogin, customSignUp } from '../../actions';
import { useRouter } from 'next/navigation';
import OtpDialog from '@/components/otp-dialog';
import { useAuth } from '@/components/providers/auth-provider';
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';
import Auth3DScene from '@/components/auth-3d-scene';
import { LegalDialog } from '@/components/legal-dialog';

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

type AuthMode = 'login' | 'signup';
type ActiveField = 'name' | 'email' | 'password' | 'terms' | 'submit' | null;

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
                const errorMessage = result.error._errors?.join(', ') || 'Invalid credentials.';
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
            if (result.error.email) {
              signupForm.setError('email', { message: result.error.email[0] });
            } else {
              const errorMessage = result.error._errors?.join(', ') || 'Could not create account.';
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

    const FocusedView = ({ field, onClose }: { field: ActiveField, onClose: () => void }) => {
        if (!field) return null;
    
        const commonProps = (fieldName: ActiveField) => ({
            layoutId: fieldName,
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            className: "w-full max-w-sm"
        });

        const activeForm = mode === 'signup' ? signupForm : loginForm;
    
        return (
             <motion.div
                className="fixed inset-0 z-20 flex items-center justify-center bg-black/50"
                onClick={onClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
            <Form {...activeForm}>
                <form onSubmit={activeForm.handleSubmit(mode === 'signup' ? handleSignupSubmit : handleLoginSubmit)} onClick={(e) => e.stopPropagation()}>
                {field === 'name' && mode === 'signup' && (
                    <motion.div {...commonProps('name')}>
                         <FormField control={signupForm.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Your Name" {...field} autoFocus /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </motion.div>
                )}
                 {field === 'email' && (
                    <motion.div {...commonProps('email')}>
                         <FormField control={activeForm.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="name@yourcompany.com" {...field} autoFocus /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </motion.div>
                )}
                {field === 'password' && (
                     <motion.div {...commonProps('password')}>
                         <FormField control={activeForm.control} name="password" render={({ field }) => (
                            <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} autoFocus /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </motion.div>
                )}
                 {field === 'terms' && mode === 'signup' && (
                     <motion.div {...commonProps('terms')}>
                         <FormField control={signupForm.control} name="terms" render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-background/80 backdrop-blur-sm"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange}/></FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>
                                    I agree to the{' '}
                                    <LegalDialog doc="terms">
                                        <span className="font-semibold text-primary hover:underline cursor-pointer">Terms</span>
                                    </LegalDialog>
                                    {' '} & {' '}
                                    <LegalDialog doc="privacy">
                                        <span className="font-semibold text-primary hover:underline cursor-pointer">Privacy Policy</span>
                                    </LegalDialog>
                                    .
                                </FormLabel>
                                <FormMessage />
                            </div>
                            </FormItem>
                        )}/>
                    </motion.div>
                )}
                 {field === 'submit' && (
                     <motion.div {...commonProps('submit')}>
                        <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{mode === 'signup' ? 'Create Account' : 'Log In'}</Button>
                    </motion.div>
                )}
                </form>
            </Form>
            </motion.div>
        )
    }

    return (
      <>
        <div className="relative min-h-[calc(100vh-8rem)] w-full overflow-hidden bg-background">
             <motion.div 
                className="absolute inset-0 z-0"
                animate={{ filter: activeField ? 'blur(8px)' : 'blur(0px)'}}
                transition={{ duration: 0.3 }}
            >
                <Suspense fallback={<div className="bg-background" />}>
                    <Auth3DScene />
                </Suspense>
            </motion.div>
            
            <AnimatePresence>
                {activeField && <FocusedView field={activeField} onClose={() => setActiveField(null)}/>}
            </AnimatePresence>

            <div className="container relative z-10 py-12 flex items-center justify-center min-h-[calc(100vh-8rem)]">
                <div className="relative w-full max-w-md h-[720px]" style={{ perspective: '1200px' }}>
                    <AnimatePresence initial={false} mode="wait">
                        <motion.div
                            key={mode}
                            variants={flipVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="absolute w-full h-full"
                        >
                        {mode === 'signup' ? (
                            <Card className="w-full shadow-2xl bg-card/80 backdrop-blur-sm">
                                <CardHeader className="text-center">
                                    <CardTitle className="text-2xl">Create an Account</CardTitle>
                                    <CardDescription>Join ChatForge AI to get your API key.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Form {...signupForm}>
                                        <form onSubmit={signupForm.handleSubmit(handleSignupSubmit)} className="space-y-4">
                                            <motion.div layoutId="name" onClick={() => setActiveField('name')} style={{ opacity: activeField ? 0 : 1 }}>
                                                <FormField control={signupForm.control} name="name" render={({ field }) => (
                                                    <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Your Name" {...field} readOnly /></FormControl><FormMessage /></FormItem>
                                                )}/>
                                            </motion.div>
                                            <motion.div layoutId="email" onClick={() => setActiveField('email')} style={{ opacity: activeField ? 0 : 1 }}>
                                            <FormField control={signupForm.control} name="email" render={({ field }) => (
                                                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="name@yourcompany.com" {...field} readOnly /></FormControl><FormMessage /></FormItem>
                                            )}/>
                                            </motion.div>
                                            <motion.div layoutId="password" onClick={() => setActiveField('password')} style={{ opacity: activeField ? 0 : 1 }}>
                                            <FormField control={signupForm.control} name="password" render={({ field }) => (
                                                <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} readOnly /></FormControl><FormMessage /></FormItem>
                                            )}/>
                                            </motion.div>
                                            <motion.div layoutId="terms" onClick={() => setActiveField('terms')} style={{ opacity: activeField ? 0 : 1 }}>
                                            <FormField control={signupForm.control} name="terms" render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-background/50"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange}/></FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>
                                                        I agree to the{' '}
                                                        <LegalDialog doc="terms">
                                                            <span className="font-semibold text-primary hover:underline cursor-pointer">Terms</span>
                                                        </LegalDialog>
                                                        {' '} & {' '}
                                                        <LegalDialog doc="privacy">
                                                            <span className="font-semibold text-primary hover:underline cursor-pointer">Privacy Policy</span>
                                                        </LegalDialog>
                                                        .
                                                    </FormLabel>
                                                    <FormMessage />
                                                </div>
                                                </FormItem>
                                            )}/>
                                            </motion.div>
                                            <motion.div layoutId="submit" onClick={() => setActiveField('submit')} style={{ opacity: activeField ? 0 : 1 }}>
                                                <Button type="submit" className="w-full" disabled={isLoading} >{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create Account</Button>
                                            </motion.div>
                                        </form>
                                    </Form>
                                    <div className="mt-6 text-center text-sm">
                                        Already have an account?{' '}
                                        <button onClick={() => { setMode('login'); setActiveField(null); }} className="font-semibold text-primary hover:underline">Log In</button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="w-full shadow-2xl bg-card/80 backdrop-blur-sm">
                                <CardHeader className="text-center">
                                    <CardTitle className="text-2xl">Welcome Back!</CardTitle>
                                    <CardDescription>Log in to access your dashboard.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Form {...loginForm}>
                                        <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
                                            <motion.div layoutId="email" onClick={() => setActiveField('email')} style={{ opacity: activeField ? 0 : 1 }}>
                                                <FormField control={loginForm.control} name="email" render={({ field }) => (
                                                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="name@yourcompany.com" {...field} readOnly /></FormControl><FormMessage /></FormItem>
                                                )}/>
                                            </motion.div>
                                            <motion.div layoutId="password" onClick={() => setActiveField('password')} style={{ opacity: activeField ? 0 : 1 }}>
                                            <FormField control={loginForm.control} name="password" render={({ field }) => (
                                                <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} readOnly /></FormControl><FormMessage /></FormItem>
                                            )}/>
                                            </motion.div>
                                            {loginForm.formState.errors.root && <p className="text-sm font-medium text-destructive">{loginForm.formState.errors.root.message}</p>}
                                            <motion.div layoutId="submit" onClick={() => setActiveField('submit')} style={{ opacity: activeField ? 0 : 1 }}>
                                                <Button type="submit" className="w-full" disabled={isLoading} >{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Log In</Button>
                                            </motion.div>
                                        </form>
                                    </Form>
                                    <div className="mt-6 text-center text-sm">
                                        Don't have an account?{' '}
                                        <button onClick={() => { setMode('signup'); setActiveField(null); }} className="font-semibold text-primary hover:underline">Sign Up</button>
                                    </div>
                                    <p className="px-8 text-center text-xs text-muted-foreground mt-6">
                                        By continuing, you agree to our{' '}
                                        <LegalDialog doc="terms">
                                            <span className="underline underline-offset-4 hover:text-primary cursor-pointer">Terms of Service</span>
                                        </LegalDialog>
                                        .
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
        {userIdForOtp && (
            <OtpDialog isOpen={showOtpDialog} onClose={() => setShowOtpDialog(false)} onSuccess={onOtpSuccess} userId={userIdForOtp} />
        )}
      </>
    );
}

    