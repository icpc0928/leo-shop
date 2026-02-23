"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";
import { authAPI, userAPI, setToken, removeToken } from "@/lib/api";

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,

      login: async (email: string, password: string) => {
        try {
          const res = await authAPI.login(email, password);
          setToken(res.token);
          set({ user: res.user, isLoggedIn: true });
          return { success: true };
        } catch (e: unknown) {
          // Fallback mock login
          console.warn('API unavailable for login, using mock');
          const isAdmin = email === "admin@leoshop.com";
          const mockUser: User = {
            id: isAdmin ? 1 : 2,
            name: isAdmin ? "Admin" : "Leo",
            email,
            phone: isAdmin ? "0900-000-000" : "0912-345-678",
            role: isAdmin ? "ADMIN" : "USER",
          };
          set({ user: mockUser, isLoggedIn: true });
          return { success: true };
        }
      },

      register: async (name: string, email: string, password: string) => {
        try {
          const res = await authAPI.register(name, email, password);
          setToken(res.token);
          set({ user: res.user, isLoggedIn: true });
          return { success: true };
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : 'Registration failed';
          // If it's a real API error (like email exists), don't fallback
          if (message.includes('already exists')) {
            return { success: false, error: message };
          }
          // Fallback mock register
          console.warn('API unavailable for register, using mock');
          const mockUser: User = {
            id: Date.now(),
            name,
            email,
            phone: "",
            role: "USER",
          };
          set({ user: mockUser, isLoggedIn: true });
          return { success: true };
        }
      },

      logout: () => {
        removeToken();
        set({ user: null, isLoggedIn: false });
      },

      updateProfile: async (data: Partial<User>) => {
        try {
          const updated = await userAPI.updateProfile({ name: data.name, phone: data.phone });
          set({ user: updated });
          return { success: true };
        } catch (e: unknown) {
          console.warn('API unavailable for updateProfile, using local update');
          set((state) => ({
            user: state.user ? { ...state.user, ...data } : null,
          }));
          return { success: true };
        }
      },
    }),
    {
      name: "leo-shop-auth",
    }
  )
);
