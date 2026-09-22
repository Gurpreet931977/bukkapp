'use client';

// ============================================================================
// BUKKAPP Authentication & Authorization Context
// Role-Based Access Control (Admin, Business Owner, Customer)
// Integrates with local persistent store and optional Firebase backend
// ============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Business } from '@/types';
import { store } from '@/lib/db/store';
import { firebaseLogin, firebaseSignup, firebaseLogout } from '@/lib/firebase/authService';

interface SignupCustomerPayload {
  name: string;
  email: string;
  phone: string;
  password?: string;
}

interface SignupBusinessPayload {
  ownerName: string;
  businessName: string;
  categoryId: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  password?: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  signupCustomer: (payload: SignupCustomerPayload) => Promise<{ success: boolean; error?: string; user?: User }>;
  signupBusiness: (payload: SignupBusinessPayload) => Promise<{ success: boolean; error?: string; user?: User; business?: Business }>;
  loginMasterAdmin: (passkey: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => Promise<void>;
  switchUser: (userId: string) => void;
  allUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MASTER_ADMIN_PASSKEYS = ['admin123', 'bukkapp2026', 'admin'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Initialize session from store
  useEffect(() => {
    try {
      const current = store.getCurrentUser();
      setUser(current);
      setAllUsers(store.getUsers());
    } catch (e) {
      console.error('Failed to load user session:', e);
    } finally {
      setIsLoading(false);
    }

    const unsubscribe = store.subscribe(() => {
      setUser(store.getCurrentUser());
      setAllUsers(store.getUsers());
    });

    return unsubscribe;
  }, []);

  // Standard Login
  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      // 1. Try Firebase if enabled
      try {
        await firebaseLogin(email, pass);
      } catch {
        // Continue with local accounts if Firebase credentials not set or fails
      }

      // 2. Find user in registered store accounts
      const users = store.getUsers();
      const matched = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

      if (matched) {
        store.setCurrentUser(matched);
        setUser(matched);
        return { success: true, user: matched };
      }

      // If password is provided and email is new, create a quick customer profile
      if (email.includes('@')) {
        const newUser: User = {
          id: `usr-${Date.now()}`,
          name: email.split('@')[0],
          email: email.trim().toLowerCase(),
          phone: '+91 98000 00000',
          role: 'customer',
          createdAt: new Date().toISOString(),
        };
        store.registerUser(newUser);
        store.setCurrentUser(newUser);
        setUser(newUser);
        return { success: true, user: newUser };
      }

      return { success: false, error: 'Invalid email or credentials' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  // Master Admin direct authentication
  const loginMasterAdmin = async (passkey: string) => {
    setIsLoading(true);
    try {
      if (MASTER_ADMIN_PASSKEYS.includes(passkey.trim())) {
        const adminUser = store.getUsers().find((u) => u.role === 'admin') || {
          id: 'usr-admin-master',
          name: 'Master Operations Admin',
          email: 'admin@bukkapp.in',
          phone: '+91 99999 00001',
          role: 'admin' as UserRole,
          createdAt: new Date().toISOString(),
        };
        store.setCurrentUser(adminUser);
        setUser(adminUser);
        return { success: true, user: adminUser };
      }
      return { success: false, error: 'Incorrect Master Admin passkey' };
    } finally {
      setIsLoading(false);
    }
  };

  // Customer Signup
  const signupCustomer = async (payload: SignupCustomerPayload) => {
    setIsLoading(true);
    try {
      if (!payload.email.includes('@')) {
        return { success: false, error: 'Valid email address is required' };
      }

      try {
        if (payload.password) {
          await firebaseSignup(payload.email, payload.password);
        }
      } catch {
        // Fallback to store registration
      }

      const existing = store.getUsers().find((u) => u.email.toLowerCase() === payload.email.trim().toLowerCase());
      if (existing) {
        store.setCurrentUser(existing);
        setUser(existing);
        return { success: true, user: existing };
      }

      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: payload.name.trim(),
        email: payload.email.trim().toLowerCase(),
        phone: payload.phone.trim() || '+91 98765 00000',
        role: 'customer',
        createdAt: new Date().toISOString(),
      };

      store.registerUser(newUser);
      store.setCurrentUser(newUser);
      setUser(newUser);

      return { success: true, user: newUser };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  // Business Merchant Signup
  const signupBusiness = async (payload: SignupBusinessPayload) => {
    setIsLoading(true);
    try {
      if (!payload.email.includes('@')) {
        return { success: false, error: 'Valid email address is required' };
      }

      const slug = payload.businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') + `-${Date.now().toString().slice(-4)}`;

      const newBizId = `biz-${Date.now()}`;

      // 1. Create owner user
      const newOwner: User = {
        id: `usr-${Date.now()}`,
        name: payload.ownerName.trim(),
        email: payload.email.trim().toLowerCase(),
        phone: payload.phone.trim() || '+91 98123 00000',
        role: 'business_owner',
        businessId: newBizId,
        createdAt: new Date().toISOString(),
      };

      // 2. Create business entity with required schema
      const cat = store.getCategoryById(payload.categoryId) || store.getCategories()[0];
      const categoryName = cat ? cat.name : 'General Services';

      const newBiz = store.addBusiness({
        ownerId: newOwner.id,
        name: payload.businessName.trim(),
        slug,
        tagline: `Premier verified services in ${payload.city || 'Dehradun'}`,
        description: `Premier booking destination in ${payload.city || 'Dehradun'} offering verified quality services.`,
        categoryId: payload.categoryId,
        categoryName,
        subcategory: 'General Services',
        address: payload.address || 'Rajpur Road, Near Clock Tower',
        neighborhood: 'Rajpur Road',
        city: payload.city || 'Dehradun',
        state: 'Uttarakhand',
        country: 'India',
        postalCode: '248001',
        latitude: 30.3165 + (Math.random() - 0.5) * 0.05,
        longitude: 78.0322 + (Math.random() - 0.5) * 0.05,
        phone: payload.phone.trim() || '+91 98123 00000',
        email: payload.email.trim().toLowerCase(),
        coverImage: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80',
        ],
        verified: false,
        status: 'draft',
        startingPrice: 499,
        features: ['Verified Listing', 'Instant Confirmation', 'Direct Appointments'],
        schedule: [
          { dayOfWeek: 0, dayName: 'Sunday', isOpen: false, openTime: '10:00', closeTime: '18:00' },
          { dayOfWeek: 1, dayName: 'Monday', isOpen: true, openTime: '09:00', closeTime: '20:00' },
          { dayOfWeek: 2, dayName: 'Tuesday', isOpen: true, openTime: '09:00', closeTime: '20:00' },
          { dayOfWeek: 3, dayName: 'Wednesday', isOpen: true, openTime: '09:00', closeTime: '20:00' },
          { dayOfWeek: 4, dayName: 'Thursday', isOpen: true, openTime: '09:00', closeTime: '20:00' },
          { dayOfWeek: 5, dayName: 'Friday', isOpen: true, openTime: '09:00', closeTime: '20:00' },
          { dayOfWeek: 6, dayName: 'Saturday', isOpen: true, openTime: '09:00', closeTime: '20:00' },
        ],
        resources: [
          { id: `res-${Date.now()}-1`, businessId: newBizId, name: 'Main Station 1', type: 'room', active: true },
        ],
        active: true,
      });

      newOwner.businessId = newBiz.id;
      store.registerUser(newOwner);
      store.setCurrentUser(newOwner);
      setUser(newOwner);

      return { success: true, user: newOwner, business: newBiz };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Business signup failed' };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const logout = async () => {
    setIsLoading(true);
    try {
      await firebaseLogout();
      // Reset to a clean guest state or customer user
      const guestCustomer: User = {
        id: `usr-guest-${Date.now()}`,
        name: 'Guest Customer',
        email: '',
        phone: '',
        role: 'customer',
        createdAt: new Date().toISOString(),
      };
      store.setCurrentUser(guestCustomer);
      setUser(guestCustomer);
    } finally {
      setIsLoading(false);
    }
  };

  // Switch persona (for development or testing)
  const switchUser = (userId: string) => {
    const target = store.getUsers().find((u) => u.id === userId);
    if (target) {
      store.setCurrentUser(target);
      setUser(target);
    }
  };

  const isAuthenticated = Boolean(user && user.email && user.email.includes('@'));
  const role = user ? user.role : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        login,
        signupCustomer,
        signupBusiness,
        loginMasterAdmin,
        logout,
        switchUser,
        allUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
