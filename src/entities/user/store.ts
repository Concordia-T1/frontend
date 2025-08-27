import { create } from "zustand";
import { fetchWithAuth } from '../../shared/api/fetchWithAuth.ts';

export interface AuthState {
  isAuthenticated: boolean;
  role: "ROLE_MANAGER" | "ROLE_ADMIN" | null;
  userId: number | null;
  email: string | null;
  isAuthChecked: boolean;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setRole: (role: "ROLE_MANAGER" | "ROLE_ADMIN" | null) => void;
  setUserData: (id: number | null, email: string | null) => void;
  setAuthChecked: (checked: boolean) => void;
  logout: (navigate?: (path: string) => void) => Promise<void>;
  refreshTrigger: number;
  setRefreshTrigger: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  role: null,
  userId: null,
  email: null,
  isAuthChecked: false,

  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

  setRole: (role) => {
    set({ role });
  },


  setUserData: (id, email) => {
    console.log("[useAuthStore] Сохранение userId и email:", { id, email });
    set({ userId: id, email });
  },

  setAuthChecked: (checked) => set({ isAuthChecked: checked }),

  logout: async (navigate) => {
    try {
      await fetchWithAuth("/auth/logout", {
        method: "GET",
        withCredentials: true,
      });
    } catch (err) {
      console.error("[useAuthStore] Ошибка при выходе из системы:", err);
    } finally {
      localStorage.removeItem("authData");
      set({
        isAuthenticated: false,
        role: null,
        userId: null,
        email: null,
        isAuthChecked: true,
      });
      if (navigate) {
        navigate("/login");
      }
    }
  },

  refreshTrigger: 0,
  setRefreshTrigger: () =>
    set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}));