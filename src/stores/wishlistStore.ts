"use client";

import { create } from "zustand";
import { wishlistAPI } from "@/lib/api";

const STORAGE_KEY = "leo-shop-wishlist";

function getLocalWishlist(): number[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function setLocalWishlist(ids: number[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }
}

function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("leo-shop-token");
}

interface WishlistState {
  wishlistIds: number[];
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (productId: number) => Promise<boolean>;
  isWishlisted: (productId: number) => boolean;
  clearWishlist: () => void;
  syncAfterLogin: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlistIds: getLocalWishlist(),
  isLoading: false,

  fetchWishlist: async () => {
    if (!isLoggedIn()) {
      // Not logged in, use local storage
      set({ wishlistIds: getLocalWishlist() });
      return;
    }
    set({ isLoading: true });
    try {
      const ids = await wishlistAPI.getIds();
      set({ wishlistIds: ids, isLoading: false });
      setLocalWishlist(ids);
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
      set({ isLoading: false });
    }
  },

  toggleWishlist: async (productId: number) => {
    const { wishlistIds } = get();
    const wasWishlisted = wishlistIds.includes(productId);

    if (!isLoggedIn()) {
      // Not logged in — toggle in local storage only
      const newIds = wasWishlisted
        ? wishlistIds.filter((id) => id !== productId)
        : [...wishlistIds, productId];
      set({ wishlistIds: newIds });
      setLocalWishlist(newIds);
      return !wasWishlisted;
    }

    try {
      const response = await wishlistAPI.toggle(productId);
      const newIds = response.wishlisted
        ? [...wishlistIds, productId]
        : wishlistIds.filter((id) => id !== productId);
      set({ wishlistIds: newIds });
      setLocalWishlist(newIds);
      return response.wishlisted;
    } catch (error) {
      console.error("Failed to toggle wishlist:", error);
      throw error;
    }
  },

  isWishlisted: (productId: number) => {
    return get().wishlistIds.includes(productId);
  },

  clearWishlist: () => {
    set({ wishlistIds: [] });
    setLocalWishlist([]);
  },

  // Call after login: sync local wishlist to server, then fetch merged result
  syncAfterLogin: async () => {
    const localIds = getLocalWishlist();
    
    if (localIds.length > 0) {
      // Sync local favorites to server
      try {
        const serverIds = await wishlistAPI.getIds();
        const toAdd = localIds.filter((id) => !serverIds.includes(id));
        // Toggle each local item that's not on server
        for (const id of toAdd) {
          await wishlistAPI.toggle(id);
        }
      } catch (e) {
        console.error("Failed to sync wishlist:", e);
      }
    }

    // Fetch final merged list
    await get().fetchWishlist();
  },
}));
