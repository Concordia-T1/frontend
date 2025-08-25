import { create } from "zustand";

export interface AuthState {
  isAuthenticated: boolean;
  role: "MANAGER" | "ADMIN" | null;
  userId: number | null;
  email: string | null;
  isAuthChecked: boolean;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setRole: (role: "MANAGER" | "ADMIN" | null) => void;
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
    console.log(role);
    set({ role });

  },


  setUserData: (id, email) => {
    console.log("[useAuthStore] Сохранение userId и email:", { id, email });
    set({ userId: id, email });
  },

  setAuthChecked: (checked) => set({ isAuthChecked: checked }),

  logout: async (navigate) => {
    // try {
    //   await fetchWithCppdAuth("/auth/logout", { method: "POST" });
    //   set({
    //     isAuthenticated: false,
    //     role: null,
    //     userId: null,
    //     email: null,
    //     isAuthChecked: true,
    //   });
    //   if (navigate) navigate("/login");
    // } catch (err) {
    //   console.error("Logout error:", err);
    //   set({
    //     isAuthenticated: false,
    //     role: null,
    //     userId: null,
    //     email: null,
    //     isAuthChecked: true,
    //   });
    // }
    if (navigate) {
      navigate('/login');
    }
  },

  refreshTrigger: 0,
  setRefreshTrigger: () =>
    set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}));