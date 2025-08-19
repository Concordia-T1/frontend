import { create } from "zustand";
import Cookies from "js-cookie";

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  role: "MANAGER" | "ADMIN" | null;
  isAuthChecked: boolean;
  setTokens: (accessToken: string | null, refreshToken: string | null) => void;
  setRole: (role: "MANAGER" | "ADMIN" | null) => void;
  setAuthChecked: (checked: boolean) => void;
  logout: (navigate?: (path: string) => void) => Promise<void>;
  refreshTrigger: number;
  setRefreshTrigger: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: Cookies.get("access_token") || null,
  refreshToken: Cookies.get("refresh_token") || null,
  role: Cookies.get("role") as "MANAGER" | "ADMIN" | null,
  isAuthChecked: false,
  setTokens: (accessToken, refreshToken) => {
    if (accessToken && refreshToken) {
      Cookies.set("access_token", accessToken, {
        expires: 7,
        secure: true,
        sameSite: "strict",
        path: "/",
      });
      Cookies.set("refresh_token", refreshToken, {
        expires: 7,
        secure: true,
        sameSite: "strict",
        path: "/",
      });
    } else {
      Cookies.remove("access_token", { path: "/" });
      Cookies.remove("refresh_token", { path: "/" });
    }
    set({ accessToken, refreshToken });
  },
  setRole: (role) => {
    if (role) {
      Cookies.set("role", role, {
        expires: 7,
        secure: true,
        sameSite: "strict",
        path: "/",
      });
    } else {
      Cookies.remove("role", { path: "/" });
    }
    set({ role });
  },
  setAuthChecked: (checked) => set({ isAuthChecked: checked }),
  logout: async (navigate) => {
    try {
      // if (useAuthStore.getState().role === "ADMIN") {
      //   await fetchWithAuth("/auth/revoke?id=me", {
      //     method: "DELETE",
      //     credentials: "include",
      //   });
      // }

      Object.keys(Cookies.get()).forEach((cookieName) => {
        Cookies.remove(cookieName, { path: "/" });
      });

      set({
        accessToken: null,
        refreshToken: null,
        role: null,
        isAuthChecked: true,
      });

      if (navigate) navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      set({
        accessToken: null,
        refreshToken: null,
        role: null,
        isAuthChecked: true,
      });
    }
  },
  refreshTrigger: 0,
  setRefreshTrigger: () =>
    set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}));
