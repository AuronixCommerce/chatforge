
// src/app/actions.ts
'use server';
import 'dotenv/config';
import { z } from 'zod';
import { getDb } from '@/lib/firebase';
import { collection, doc, addDoc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, Timestamp, writeBatch, orderBy, limit as firestoreLimit } from 'firebase/firestore';
import { randomBytes, createHmac } from 'crypto';
import { sendOtpEmail, sendSubmissionStatusEmail, sendBulkEmail, sendDirectUserEmail } from '@/lib/nodemailer';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { generateNewsletterEmail, generateChatResponse } from '@/ai/flows/generate-chat-response';
import { generateDirectEmail as generateDirectEmailFlow } from '@/ai/flows/generate-direct-email';


const submissionSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  company: z.string().optional(),
  plan: z.enum(['Pro', 'Enterprise']),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

export async function createSubmission(values: z.infer<typeof submissionSchema>) {
    const validation = submissionSchema.safeParse(values);
    if(!validation.success) {
        return { error: validation.error.flatten().fieldErrors };
    }

    try {
        const db = getDb();
        const newSubmission = {
            ...validation.data,
            status: 'pending', // 'pending', 'accepted', 'rejected'
            createdAt: Timestamp.now(),
        };
        await addDoc(collection(db, 'submissions'), newSubmission);

        return { success: true };
    } catch (error) {
        console.error('Submission error:', error);
        return { error: { _errors: ['Could not submit your request.'] } };
    }
}

export async function listSubmissions(): Promise<{submissions?: any[], error?: string}> {
    try {
        const db = getDb();
        const q = query(collection(db, 'submissions'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const submissions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Convert Timestamps to string for serialization
        return { submissions: submissions.map(s => ({...s, _id: s.id, createdAt: s.createdAt.toDate().toISOString()})) };
    } catch (error) {
        console.error('Error listing submissions:', error);
        return { error: 'Could not list submissions.' };
    }
}

const updateSubmissionStatusSchema = z.object({
    id: z.string(),
    status: z.enum(['accepted', 'rejected']),
});
  
export async function updateSubmissionStatus(values: z.infer<typeof updateSubmissionStatusSchema>) {
    const validation = updateSubmissionStatusSchema.safeParse(values);
    if (!validation.success) {
        return { error: 'Invalid input.' };
    }
    const { id, status } = validation.data;

    try {
        const db = getDb();
        const submissionRef = doc(db, 'submissions', id);
        const submissionSnap = await getDoc(submissionRef);

        if (!submissionSnap.exists() || submissionSnap.data().status !== 'pending') {
            return { error: 'Submission not found or already processed.' };
        }
        
        await updateDoc(submissionRef, { status });

        const updatedSubmissionData = { id, ...submissionSnap.data(), status };

        await sendSubmissionStatusEmail({
            to: updatedSubmissionData.email,
            name: updatedSubmissionData.name,
            plan: updatedSubmissionData.plan,
            status: status,
        });
        
        const serializableSubmission = { ...updatedSubmissionData, createdAt: updatedSubmissionData.createdAt.toDate().toISOString() };
        return { success: true, updatedSubmission: serializableSubmission };

    } catch (error) {
        console.error(`Error updating submission ${id} to ${status}:`, error);
        return { error: 'Could not update submission status.' };
    }
}

export async function deleteSubmission(id: string): Promise<{success: boolean, error?: string}> {
    try {
      const db = getDb();
      await deleteDoc(doc(db, 'submissions', id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting submission:', error);
      return { success: false, error: 'Could not delete the submission.' };
    }
}


// --- Authentication Actions ---
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const secretKey = new TextEncoder().encode(JWT_SECRET);


function generateApiKey() {
    return `cfai_${randomBytes(16).toString('hex')}`;
}

async function createDefaultChatbot(db: any, batch: any, userId: string) {
    const defaultBot = {
        userId,
        name: 'My First Bot',
        instructions: 'You are a helpful assistant.',
        qa: [],
        welcomeMessage: 'Hello! How can I help you today?',
        color: '#007BFF',
        apiKey: generateApiKey(),
        createdAt: Timestamp.now(),
        authorizedDomains: [],
    };
    const chatbotRef = doc(collection(db, 'chatbots'));
    batch.set(chatbotRef, defaultBot);
}

const signUpSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters long.'),
});


export async function customSignUp(values: z.infer<typeof signUpSchema>) {
    const validation = signUpSchema.safeParse(values);
    if (!validation.success) {
        return { error: validation.error.flatten().fieldErrors };
    }

    const { email, password } = validation.data;
    
    try {
        const db = getDb();
        
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email));
        const existingUserSnap = await getDocs(q);

        if (!existingUserSnap.empty) {
             return { error: { email: ['A user with this email already exists.'] } };
        }
            
        const otp = randomBytes(3).toString('hex').toUpperCase();
        const otpExpires = Timestamp.fromDate(new Date(Date.now() + 10 * 60 * 1000)); // OTP expires in 10 minutes

        const salt = randomBytes(16).toString('hex');
        const hash = createHmac('sha256', salt).update(password).digest('hex');
        
        const newUser = {
            email,
            name: email.split('@')[0],
            passwordHash: `${salt}:${hash}`,
            isVerified: false,
            isBanned: false,
            authMethod: 'email',
            otp,
            otpExpires,
            createdAt: Timestamp.now(),
            messagesSent: 0,
            messageLimit: 1000,
            chatbotLimit: 1,
            plan: 'Free',
            planCycleStartDate: Timestamp.now(),
        };

        const batch = writeBatch(db);
        const userRef = doc(collection(db, 'users'));
        batch.set(userRef, newUser);

        await createDefaultChatbot(db, batch, userRef.id);
        
        await batch.commit();

        await sendOtpEmail(email, otp);

        return { success: true, userId: userRef.id };

    } catch (error: any) {
        console.error('Sign up transaction error:', error);
        return { error: { _errors: [`Could not create your account: An unexpected database error occurred.`] } };
    }
}

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

async function generateToken(user: any) {
    if (!user || !user.id) {
        throw new Error('Invalid user object for token generation');
    }
    const payload = {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
    };
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(secretKey);
}

export async function customLogin(values: z.infer<typeof loginSchema>) {
    const validation = loginSchema.safeParse(values);
    if (!validation.success) {
        return { error: validation.error.flatten().fieldErrors };
    }
    
    const { email, password } = validation.data;
    try {
        const db = getDb();
        const q = query(collection(db, 'users'), where('email', '==', email), firestoreLimit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
             return { error: { _errors: ['Invalid email or password.'] } };
        }
        
        const userDoc = querySnapshot.docs[0];
        const user = { id: userDoc.id, ...userDoc.data() };

        if (user.authMethod === 'google') {
            return { error: { _errors: ['This account was created with Google. Please use Google Sign-In.'] } };
        }

        if (!user.passwordHash) {
            return { error: { _errors: ['Invalid account configuration. Please contact support.'] } };
        }
        
        const [salt, storedHash] = user.passwordHash.split(':');
        const hash = createHmac('sha256', salt).update(password).digest('hex');

        if (hash !== storedHash) {
            return { error: { _errors: ['Invalid email or password.'] } };
        }
        
        if (!user.isVerified) {
            const otp = randomBytes(3).toString('hex').toUpperCase();
            const otpExpires = Timestamp.fromDate(new Date(Date.now() + 10 * 60 * 1000));
            
            await updateDoc(userDoc.ref, { otp, otpExpires });
            await sendOtpEmail(email, otp);
            
            return { success: false, requiresOtp: true, userId: user.id };
        }
        
        const token = await generateToken(user);
        return { success: true, token };
    } catch (error: any) {
        console.error('Login error:', error);
        return { error: { _errors: [`An unexpected error occurred.`] } };
    }
}

const otpSchema = z.object({
    userId: z.string(),
    otp: z.string().length(6, 'OTP must be 6 characters.'),
});

export async function verifyOtp(values: z.infer<typeof otpSchema>) {
    const validation = otpSchema.safeParse(values);
    if (!validation.success) {
        return { error: validation.error.flatten().fieldErrors };
    }
    const { userId, otp } = validation.data;
    try {
        const db = getDb();
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
             return { error: { otp: ['Invalid user ID.'] } };
        }
        
        const user = { id: userSnap.id, ...userSnap.data() };

        if (!user || user.otp !== otp.toUpperCase()) {
            return { error: { otp: ['Invalid OTP.'] } };
        }

        if (user.otpExpires.toDate() < new Date()) {
            return { error: { otp: ['OTP has expired.'] } };
        }
        
        await updateDoc(userRef, { isVerified: true, otp: null, otpExpires: null });
        
        const verifiedUserSnap = await getDoc(userRef);
        const verifiedUser = { id: verifiedUserSnap.id, ...verifiedUserSnap.data() };

        if (!verifiedUser) {
            return { error: { _errors: ['Could not find user after verification.'] } };
        }

        const token = await generateToken(verifiedUser);
        return { success: true, token };
    } catch (error: any) {
        console.error('OTP verification error:', error);
        return { error: { _errors: [`An unexpected error occurred: ${error.message}`] } };
    }
}

export async function resendOtp(userId: string) {
    if (!userId) return { error: 'User ID is required.' };
    
    try {
        const db = getDb();
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) return { error: 'User not found.' };

        const otp = randomBytes(3).toString('hex').toUpperCase();
        const otpExpires = Timestamp.fromDate(new Date(Date.now() + 10 * 60 * 1000));

        await updateDoc(userRef, { otp, otpExpires });
        await sendOtpEmail(userSnap.data().email, otp);

        return { success: true };
    } catch (error: any) {
        console.error('Resend OTP error:', error);
        return { error: `An unexpected error occurred: ${error.message}` };
    }
}

// --- Chatbot Management Actions ---

const serializeChatbot = (chatbot: any) => {
    if (!chatbot) return null;
    const data = chatbot.data();
    return {
        _id: chatbot.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString(),
    };
};

export async function listUserChatbots(userId: string): Promise<{chatbots?: any[], error?: string}> {
    if (!userId) return { error: 'User not authenticated' };
    try {
        const db = getDb();
        const q = query(collection(db, 'chatbots'), where('userId', '==', userId), orderBy('createdAt', 'asc'));
        const querySnapshot = await getDocs(q);
        const chatbots = querySnapshot.docs.map(serializeChatbot);
        return { chatbots };
    } catch (error) {
        console.error('Error listing chatbots:', error);
        return { error: 'Could not list chatbots.' };
    }
}

const createChatbotSchema = z.object({
    token: z.string(),
    name: z.string().min(2, 'Bot name must be at least 2 characters.'),
});

export async function createChatbot(values: z.infer<typeof createChatbotSchema>) {
    const validation = createChatbotSchema.safeParse(values);
    if (!validation.success) return { error: 'Invalid input' };

    try {
        const { payload } = await jwtVerify(values.token, secretKey);
        const userId = payload.id as string;
        if (!userId) throw new Error('Invalid token');

        const db = getDb();

        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return { error: 'User not found' };
        const user = userSnap.data();

        const chatbotsQuery = query(collection(db, 'chatbots'), where('userId', '==', userId));
        const existingBotsSnap = await getDocs(chatbotsQuery);
        
        if (existingBotsSnap.size >= (user.chatbotLimit ?? 1)) {
            return { error: 'You have reached your chatbot limit for this plan.' };
        }

        const newBot = {
            userId: userId,
            name: values.name,
            instructions: `You are a helpful assistant named ${values.name}.`,
            qa: [],
            welcomeMessage: 'Hello! How can I help you today?',
            color: '#007BFF',
            apiKey: generateApiKey(),
            createdAt: Timestamp.now(),
            authorizedDomains: [],
        };

        const docRef = await addDoc(collection(db, 'chatbots'), newBot);
        const createdBotSnap = await getDoc(docRef);
        
        return { success: true, newChatbot: serializeChatbot(createdBotSnap) };
    } catch (error: any) {
        console.error('Create chatbot error:', error);
        return { error: error.message || 'Could not create chatbot.' };
    }
}


const chatbotSettingsSchema = z.object({
    chatbotId: z.string(),
    token: z.string(),
    values: z.object({
        instructions: z.string().optional(),
        qa: z.array(z.object({
          question: z.string(),
          answer: z.string()
        })).optional(),
        name: z.string().optional(),
        welcomeMessage: z.string().optional(),
        color: z.string().optional(),
        authorizedDomains: z.array(z.string()).optional(),
    })
});

export async function updateChatbotSettings(input: z.infer<typeof chatbotSettingsSchema>) {
    const validation = chatbotSettingsSchema.safeParse(input);
    if (!validation.success) {
        return { error: { _errors: ['Invalid input shape.'] } };
    }
    const { token, chatbotId, values } = validation.data;

    try {
        const { payload } = await jwtVerify(token, secretKey);
        const userId = payload.id as string;
        if (!userId) throw new Error('Invalid token');
        
        const db = getDb();
        const chatbotRef = doc(db, 'chatbots', chatbotId);
        const chatbotSnap = await getDoc(chatbotRef);
        
        if (!chatbotSnap.exists() || chatbotSnap.data().userId !== userId) {
            return { error: { _errors: ['Chatbot not found or you do not have permission to edit it.'] }};
        }

        await updateDoc(chatbotRef, values);
        
        const updatedBotSnap = await getDoc(chatbotRef);
        
        return { success: true, updatedChatbot: serializeChatbot(updatedBotSnap) };

    } catch (error) {
        console.error('Update chatbot settings error:', error);
        return { error: { _errors: ['Could not update settings. Your session might be invalid.'] } };
    }
}

const deleteChatbotSchema = z.object({
    chatbotId: z.string(),
    token: z.string(),
});

export async function deleteChatbot(values: z.infer<typeof deleteChatbotSchema>) {
    const validation = deleteChatbotSchema.safeParse(values);
    if (!validation.success) return { error: 'Invalid input' };

    try {
        const { payload } = await jwtVerify(values.token, secretKey);
        const userId = payload.id as string;
        if (!userId) throw new Error('Invalid token');

        const db = getDb();
        const chatbotRef = doc(db, 'chatbots', values.chatbotId);
        const chatbotSnap = await getDoc(chatbotRef);
        
        if (!chatbotSnap.exists() || chatbotSnap.data().userId !== userId) {
            return { error: 'Chatbot not found or you do not have permission to delete it.' };
        }

        await deleteDoc(chatbotRef);

        return { success: true };
    } catch (error: any) {
        console.error('Delete chatbot error:', error);
        return { error: error.message || 'Could not delete chatbot.' };
    }
}


// --- Admin User Management Actions ---
const serializeUser = (userDoc: any) => {
    if (!userDoc.exists()) return null;
    const { passwordHash, otp, otpExpires, ...rest } = userDoc.data();
    
    // Convert Timestamps
    const serialized = { ...rest };
    for (const key in serialized) {
        if (serialized[key] instanceof Timestamp) {
            serialized[key] = serialized[key].toDate().toISOString();
        }
    }
    
    return {
        ...serialized,
        _id: userDoc.id,
    };
};

export async function listUsers(queryString?: string): Promise<{users?: any[], error?: string}> {
    try {
        const db = getDb();
        let q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        // Firestore doesn't support regex search. A more complex search would need a third-party service like Algolia.
        // For this app, we will filter after fetching if a query is provided.
        const querySnapshot = await getDocs(q);
        let users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (queryString) {
            users = users.filter(user => user.email.toLowerCase().includes(queryString.toLowerCase()));
        }
        
        return { users: users.map(u => ({...u, _id: u.id, createdAt: u.createdAt.toDate().toISOString() })) };
    } catch (error) {
        console.error('Error listing users:', error);
        return { error: 'Could not list users.' };
    }
}

export async function getUserDetails(userId: string): Promise<{user?: any, error?: string}> {
    try {
        const db = getDb();
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) return { error: 'User not found.' };

        const chatbotsQuery = query(collection(db, 'chatbots'), where('userId', '==', userId));
        const chatbotsSnap = await getDocs(chatbotsQuery);
        
        const chatbots = chatbotsSnap.docs.map(serializeChatbot);
        
        const user = serializeUser(userSnap);
        user.chatbots = chatbots;
        
        return { user };
    } catch (error) {
        console.error('Error getting user details:', error);
        return { error: 'Could not retrieve user details.' };
    }
}


export async function updateUserStatus(userId: string, isBanned: boolean): Promise<{success?: boolean, error?: string}> {
    try {
        const db = getDb();
        await updateDoc(doc(db, 'users', userId), { isBanned });
        return { success: true };
    } catch (error) {
        console.error('Error updating user status:', error);
        return { error: 'Could not update user status.' };
    }
}

const updateUserPlanSchema = z.object({
    userId: z.string(),
    plan: z.enum(['Free', 'Pro', 'Enterprise']),
    messageLimit: z.number().int().min(0),
    chatbotLimit: z.number().int().min(0),
});

export async function updateUserPlanAndLimit(values: z.infer<typeof updateUserPlanSchema>): Promise<{success?: boolean, error?: string}> {
    const validation = updateUserPlanSchema.safeParse(values);
    if (!validation.success) {
        return { error: 'Invalid input.' };
    }
    const { userId, plan, messageLimit, chatbotLimit } = validation.data;
    try {
        const db = getDb();
        await updateDoc(doc(db, 'users', userId), { plan, messageLimit, chatbotLimit });
        return { success: true };
    } catch (error) {
        console.error('Error updating user plan:', error);
        return { error: 'Could not update user plan.' };
    }
}

export async function regenerateUserApiKey(chatbotId: string): Promise<{success?: boolean, newApiKey?: string, error?: string}> {
    try {
        const db = getDb();
        const newApiKey = generateApiKey();
        await updateDoc(doc(db, 'chatbots', chatbotId), { apiKey: newApiKey });
        return { success: true, newApiKey };
    } catch (error) {
        console.error('Error regenerating API key:', error);
        return { error: 'Could not regenerate API key.' };
    }
}

export async function deleteUserChatbot(chatbotId: string): Promise<{success?: boolean, error?: string}> {
    try {
        const db = getDb();
        await deleteDoc(doc(db, 'chatbots', chatbotId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting chatbot:', error);
        return { error: 'Could not delete chatbot.' };
    }
}

export async function deleteUser(userId: string): Promise<{success?: boolean, error?: string}> {
    try {
        const db = getDb();
        const batch = writeBatch(db);

        // Delete the user
        batch.delete(doc(db, 'users', userId));

        // Delete their chatbots
        const chatbotsQuery = query(collection(db, 'chatbots'), where('userId', '==', userId));
        const chatbotsSnap = await getDocs(chatbotsQuery);
        chatbotsSnap.forEach(doc => batch.delete(doc.ref));
        
        await batch.commit();

        return { success: true };
    } catch (error) {
        console.error('Error deleting user:', error);
        return { error: 'Could not delete user.' };
    }
}

const directEmailSchema = z.object({
    to: z.string().email(),
    subject: z.string().min(1, 'Subject is required.'),
    message: z.string().min(1, 'Message is required.'),
});

export async function sendDirectEmail(values: z.infer<typeof directEmailSchema>): Promise<{success: boolean, error?: string}> {
    const validation = directEmailSchema.safeParse(values);
    if (!validation.success) {
        return { success: false, error: 'Invalid input.' };
    }

    try {
        await sendDirectUserEmail(values);
        return { success: true };
    } catch (error) {
        console.error('Error sending direct email:', error);
        return { success: false, error: 'Could not send the email.' };
    }
}

const bulkEmailSchema = z.object({
    subject: z.string().min(1, 'Subject is required.'),
    message: z.string().min(1, 'Message is required.'),
});
  
export async function sendEmailToAllUsers(values: z.infer<typeof bulkEmailSchema>): Promise<{success: boolean, error?: string, userCount?: number}> {
    const validation = bulkEmailSchema.safeParse(values);
    if (!validation.success) {
        return { success: false, error: 'Subject and message are required.' };
    }

    try {
        const { users, error } = await listUsers();
        if (error || !users) {
            return { success: false, error: 'Could not retrieve user list.' };
        }
        if (users.length === 0) {
            return { success: false, error: 'There are no registered users to send to.' };
        }

        const recipients = users.map(u => u.email).join(',');

        await sendBulkEmail({
            to: recipients,
            subject: values.subject,
            html: values.message,
        });

        return { success: true, userCount: users.length };
    } catch (error) {
        console.error('Error sending bulk email to users:', error);
        return { success: false, error: 'Could not send bulk email.' };
    }
}


// --- Admin Dashboard Actions ---
export async function getDashboardStats(): Promise<any> {
    try {
      const db = getDb();
  
      const sevenDaysAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  
      const usersSnap = await getDocs(collection(db, 'users'));
      const newUsersQuery = query(collection(db, 'users'), where('createdAt', '>=', sevenDaysAgo));
      const newUsersSnap = await getDocs(newUsersQuery);
      const submissionsSnap = await getDocs(collection(db, 'submissions'));

      const recentSubmissionsQuery = query(collection(db, 'submissions'), orderBy('createdAt', 'desc'), firestoreLimit(5));
      const recentSubmissionsSnap = await getDocs(recentSubmissionsQuery);
      const recentSubmissions = recentSubmissionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const userSignupsByDayQuery = query(collection(db, 'users'), where('createdAt', '>=', sevenDaysAgo));
      const userSignupsSnap = await getDocs(userSignupsByDayQuery);
      const signupsByDate: { [key: string]: number } = {};
      userSignupsSnap.forEach(doc => {
          const dateString = doc.data().createdAt.toDate().toISOString().split('T')[0];
          signupsByDate[dateString] = (signupsByDate[dateString] || 0) + 1;
      });
  
      // Format chart data
      const signupChartData = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateString = d.toISOString().split('T')[0];
        signupChartData.push({
          date: dateString,
          signups: signupsByDate[dateString] || 0,
        });
      }
  
      return {
        stats: {
          totalUsers: usersSnap.size,
          newUsers: newUsersSnap.size,
          totalSubmissions: submissionsSnap.size,
        },
        recentSubmissions: recentSubmissions.map(s => ({ ...s, _id: s.id, createdAt: s.createdAt.toDate().toISOString() })),
        signupChartData,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return { error: 'Could not retrieve dashboard statistics.' };
    }
  }

export async function generateDirectEmail(prompt: string, userName: string): Promise<{success: boolean, html?: string, error?: string}> {
    if (!prompt) {
        return { success: false, error: 'Prompt cannot be empty.' };
    }
    try {
        const html = await generateDirectEmailFlow({ prompt, userName });
        return { success: true, html };
    } catch (error: any) {
        console.error('Error generating direct email:', error);
        return { success: false, error: `Could not generate email content: ${error.message}` };
    }
}


// --- Newsletter Actions ---
const subscribeSchema = z.string().email({ message: 'Invalid email address.' });

export async function subscribeToNewsletter(email: string): Promise<{success: boolean, error?: string}> {
    const validation = subscribeSchema.safeParse(email);
    if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message };
    }

    try {
        const db = getDb();
        const q = query(collection(db, 'subscribers'), where('email', '==', email));
        const existing = await getDocs(q);
        if (!existing.empty) {
            return { success: false, error: 'This email is already subscribed.' };
        }
        await addDoc(collection(db, 'subscribers'), {
            email,
            subscribedAt: Timestamp.now(),
        });
        return { success: true };
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        return { success: false, error: 'Could not subscribe at this time.' };
    }
}

export async function listSubscribers(): Promise<{subscribers?: any[], error?: string}> {
    try {
        const db = getDb();
        const q = query(collection(db, 'subscribers'), orderBy('subscribedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const subscribers = querySnapshot.docs.map(doc => ({...doc.data(), _id: doc.id, subscribedAt: doc.data().subscribedAt.toDate().toISOString()}));
        return { subscribers };
    } catch (error) {
        console.error('Error listing subscribers:', error);
        return { error: 'Could not list subscribers.' };
    }
}

const sendNewsletterSchema = z.object({
  subject: z.string().min(1, 'Subject is required.'),
  htmlContent: z.string().min(1, 'Email content is required.'),
});

export async function sendNewsletter(values: z.infer<typeof sendNewsletterSchema>): Promise<{success: boolean, error?: string}> {
    const validation = sendNewsletterSchema.safeParse(values);
    if (!validation.success) {
        return { success: false, error: 'Subject and content are required.' };
    }

    try {
        const { subscribers, error } = await listSubscribers();
        if (error || !subscribers) {
            return { success: false, error: 'Could not retrieve subscriber list.' };
        }
        if(subscribers.length === 0) {
            return { success: false, error: 'There are no subscribers to send to.' };
        }

        const recipients = subscribers.map(s => s.email).join(',');

        await sendBulkEmail({
            to: recipients,
            subject: values.subject,
            html: values.htmlContent,
        });

        return { success: true };
    } catch (error) {
        console.error('Error sending newsletter:', error);
        return { success: false, error: 'Could not send newsletter.' };
    }
}

export async function generateNewsletter(prompt: string): Promise<{success: boolean, html?: string, error?: string}> {
    if (!prompt) {
        return { success: false, error: 'Prompt cannot be empty.' };
    }
    try {
        const html = await generateNewsletterEmail({ prompt: prompt });
        return { success: true, html };
    } catch (error: any) {
        console.error('Error generating newsletter:', error);
        return { success: false, error: `Could not generate email content: ${error.message}` };
    }
}

// --- Admin OTP Actions ---
const ADMIN_ACCESS_KEY = "25157576";
const ADMIN_ACCESS_SECRET = process.env.ADMIN_ACCESS_SECRET || 'your-super-secret-admin-key-that-is-long';


export async function verifyAdminAccess(data: { key: string }): Promise<{ success: boolean; error?: string }> {
    if (data.key !== ADMIN_ACCESS_KEY) {
        return { success: false, error: 'Invalid access key.' };
    }
    
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour session
    const sessionToken = await new SignJWT({ admin: true })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(new TextEncoder().encode(ADMIN_ACCESS_SECRET));
    
    cookies().set('admin_session', sessionToken, { httpOnly: true, expires, secure: process.env.NODE_ENV === 'production' });

    return { success: true };
}

export async function checkAdminAuthStatus(): Promise<{ isAuthenticated: boolean }> {
    const session = cookies().get('admin_session')?.value;
    if (!session) return {isAuthenticated: false};
    try {
        const { payload } = await jwtVerify(session, new TextEncoder().encode(ADMIN_ACCESS_SECRET));
        return { isAuthenticated: !!payload?.admin };
    } catch (e) {
        return { isAuthenticated: false };
    }
}

export async function findOrCreateUserFromGoogle(profile: any): Promise<{token?: string, error?: string}> {
    if (!profile || !profile.email) {
      return { error: 'Google profile is missing email.' };
    }
  
    try {
      const db = getDb();
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', profile.email));
      const querySnapshot = await getDocs(q);
      
      let user;
      let userDocRef;
      
      if (querySnapshot.empty) {
        // User does not exist, create a new one
        const newUser = {
            email: profile.email,
            name: profile.name,
            avatar: profile.picture,
            authMethod: 'google',
            isVerified: true, // Google accounts are pre-verified
            isBanned: false,
            createdAt: Timestamp.now(),
            messagesSent: 0,
            messageLimit: 1000,
            chatbotLimit: 1,
            plan: 'Free',
            planCycleStartDate: Timestamp.now(),
        };

        const batch = writeBatch(db);
        userDocRef = doc(collection(db, "users"));
        batch.set(userDocRef, newUser);
        await createDefaultChatbot(db, batch, userDocRef.id);
        await batch.commit();

        user = { id: userDocRef.id, ...newUser };

      } else {
        const userDoc = querySnapshot.docs[0];
        user = { id: userDoc.id, ...userDoc.data() };
        userDocRef = userDoc.ref;
        
        if (user.authMethod !== 'google') {
            return { error: 'This email is already registered with a password. Please log in with your password.' };
        }
        await updateDoc(userDocRef, { name: profile.name, avatar: profile.picture });
        user = {...user, name: profile.name, avatar: profile.picture};
      }
      
      if (!user) {
        return { error: 'Could not find or create user.' };
      }

      const token = await generateToken(user);
      return { token };
  
    } catch (error) {
      console.error('Google user find/create error:', error);
      return { error: 'An unexpected database error occurred.' };
    }
}


type HistoryItem = {
    role: 'user' | 'model';
    text: string;
}
export async function getLiveDemoResponse(message: string, history: HistoryItem[]): Promise<{reply?: string, error?: string}> {
    if (!message) {
        return { error: 'Message cannot be empty.' };
    }

    try {
        const historyForApi = history.map(h => ({
            role: h.role,
            content: [{ text: h.text }]
        }));

        const response = await generateChatResponse({
            message,
            instructions: "You are a friendly and helpful demo chatbot for a company called ChatForge AI. Your goal is to showcase your abilities and encourage users to sign up.",
            qa: [
                { question: "How much does it cost?", answer: "We have a free plan to get started, and our Pro plan is just $15.99/month! You can see full details on our pricing page." },
                { question: "Is it easy to install?", answer: "Yes! It's incredibly easy. You just copy a single line of code and paste it into your website. That's it!" }
            ],
            history: historyForApi,
        });

        return { reply: response.reply };
    } catch (error: any) {
        console.error('Error in getLiveDemoResponse:', error);
        return { error: `Sorry, the AI demo is currently unavailable. Error: ${error.message}` };
    }
}
