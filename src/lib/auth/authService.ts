'use client';

import { User, UserRole } from '@/types';
import { store } from '@/lib/db/store';

export interface AuthSession {
  user: User;
  token: string;
}

export interface SignupCustomerData {
  name: string;
  email: string;
  phone: string;
  password?: string;
}

export interface SignupBusinessData {
  ownerName: string;
  email: string;
  phone: string;
  password?: string;
  businessName: string;
  categoryId: string;
  subcategory?: string;
}

const STORAGE_KEY_SESSION = 'bukkapp_auth_session_v2';
const STORAGE_KEY_USERS = 'bukkapp_registered_users_v2';

// Pre-seeded Master Admin & Verified Accounts
export const DEFAULT_ACCOUNTS: (User & { passwordHash: string })[] = [
  {
    id: 'usr-admin-master',
    name: 'Master Administrator',
    email: 'admin@bukkapp.in',
    phone: '+91 11223 34455',
    role: 'admin',
    passwordHash: 'AdminPass123!',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    createdAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'usr-owner-arjun',
    name: 'Dr. Arjun Verma',
    email: 'arjun@smilestudio.in',
    phone: '+91 98123 45678',
    role: 'business_owner',
    businessId: 'biz-smile-studio',
    passwordHash: 'Business123!',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80',
    createdAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'usr-customer-gurpreet',
    name: 'Gurpreet Singh',
    email: 'gurpreet@bukkapp.in',
    phone: '+91 98765 43210',
    role: 'customer',
    passwordHash: 'Customer123!',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    createdAt: '2026-08-01T10:00:00Z',
  },
];

class AuthService {
  private currentUser: User | null = null;
  private registeredUsers: (User & { passwordHash: string })[] = [...DEFAULT_ACCOUNTS];
  private listeners: (() => void)[] = [];

  constructor() {
    this.initAuth();
  }

  private initAuth() {
    if (typeof window === 'undefined') return;

    try {
      // 1. Load registered users
      const storedUsers = localStorage.getItem(STORAGE_KEY_USERS);
      if (storedUsers) {
        this.registeredUsers = JSON.parse(storedUsers);
      } else {
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(DEFAULT_ACCOUNTS));
      }

      // 2. Load active session
      const storedSession = localStorage.getItem(STORAGE_KEY_SESSION);
      if (storedSession) {
        const session: AuthSession = JSON.parse(storedSession);
        this.currentUser = session.user;
        // Sync to legacy store for backward compatibility
        store.setCurrentUser(session.user);
      } else {
        // By default, start with guest (null session) for real login/signup flow
        this.currentUser = null;
      }
    } catch (e) {
      this.currentUser = null;
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  public hasRole(role: UserRole | UserRole[]): boolean {
    if (!this.currentUser) return false;
    // Master admin has access to everything
    if (this.currentUser.role === 'admin') return true;

    if (Array.isArray(role)) {
      return role.includes(this.currentUser.role);
    }
    return this.currentUser.role === role;
  }

  public login(email: string, password?: string): { success: boolean; error?: string; user?: User } {
    const trimmedEmail = email.trim().toLowerCase();
    const found = this.registeredUsers.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (!found) {
      return { success: false, error: 'No account found with this email address.' };
    }

    // If password provided and registered user has a passwordHash, verify it
    if (password && found.passwordHash && found.passwordHash !== password) {
      return { success: false, error: 'Incorrect password entered.' };
    }

    const { passwordHash, ...userClean } = found;
    this.currentUser = userClean;

    if (typeof window !== 'undefined') {
      try {
        const session: AuthSession = {
          user: userClean,
          token: `jwt_sim_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        };
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
      } catch (e) {}
    }

    store.setCurrentUser(userClean);
    this.notify();
    return { success: true, user: userClean };
  }

  public signupCustomer(data: SignupCustomerData): { success: boolean; error?: string; user?: User } {
    const email = data.email.trim().toLowerCase();
    if (this.registeredUsers.some((u) => u.email.toLowerCase() === email)) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: User & { passwordHash: string } = {
      id: `usr-cust-${Date.now()}`,
      name: data.name.trim(),
      email,
      phone: data.phone.trim(),
      role: 'customer',
      passwordHash: data.password || 'BukkappPass123!',
      createdAt: new Date().toISOString(),
    };

    this.registeredUsers.push(newUser);
    this.persistUsers();

    return this.login(email, data.password);
  }

  public signupBusiness(data: SignupBusinessData): { success: boolean; error?: string; user?: User } {
    const email = data.email.trim().toLowerCase();
    if (this.registeredUsers.some((u) => u.email.toLowerCase() === email)) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUserId = `usr-own-${Date.now()}`;
    const newBusinessSlug = data.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const newBusinessId = `biz-${newBusinessSlug}-${Date.now().toString().slice(-4)}`;

    const newUser: User & { passwordHash: string } = {
      id: newUserId,
      name: data.ownerName.trim(),
      email,
      phone: data.phone.trim(),
      role: 'business_owner',
      businessId: newBusinessId,
      passwordHash: data.password || 'BukkappPass123!',
      createdAt: new Date().toISOString(),
    };

    this.registeredUsers.push(newUser);
    this.persistUsers();

    // Auto-create initial draft business entity in store
    store.createBusiness({
      ownerId: newUserId,
      name: data.businessName.trim(),
      slug: newBusinessSlug,
      tagline: 'Premier local service storefront in Dehradun',
      description: 'Newly registered business on BUKKAPP. Profile setup and slots currently in progress.',
      categoryId: data.categoryId,
      subcategory: data.subcategory || 'General Services',
      address: 'Dehradun, Uttarakhand',
      neighborhood: 'Rajpur Road',
      city: 'Dehradun',
      state: 'Uttarakhand',
      country: 'India',
      postalCode: '248001',
      phone: data.phone.trim(),
      email,
      coverImage: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80',
      startingPrice: 500,
    });

    return this.login(email, data.password);
  }

  public logout() {
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY_SESSION);
      } catch (e) {}
    }
    // Set dummy guest persona in store
    store.setCurrentUser({
      id: 'usr-guest',
      name: 'Guest User',
      email: 'guest@bukkapp.in',
      phone: '',
      role: 'customer',
      createdAt: new Date().toISOString(),
    });
    this.notify();
  }

  private persistUsers() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(this.registeredUsers));
      } catch (e) {}
    }
  }

  public getAllRegisteredUsersAdmin(): User[] {
    return this.registeredUsers.map(({ passwordHash, ...clean }) => clean);
  }
}

export const authService = new AuthService();
