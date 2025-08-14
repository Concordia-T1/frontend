import { create } from "zustand";
import Cookies from "js-cookie";

export interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    role: "MANAGER" | "ADMIN" | null;
    setTokens: (accessToken: string | null, refreshToken: string | null) => void;
    setRole: (role: "MANAGER" | "ADMIN" | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    accessToken: Cookies.get("access_refresh")?.split("_")[0] || null,
    refreshToken: Cookies.get("access_refresh")?.split("_")[1] || null,
    role: Cookies.get("role") as "MANAGER" | "ADMIN" | null,
    setTokens: (accessToken, refreshToken) => {
        if (accessToken && refreshToken) {
            Cookies.set("access_refresh", `${accessToken}_${refreshToken}`, { expires: 7 });
        } else {
            Cookies.remove("access_refresh");
        }
        set({ accessToken, refreshToken });
    },
    setRole: (role) => {
        if (role) {
            Cookies.set("role", role, { expires: 7 });
        } else {
            Cookies.remove("role");
        }
        set({ role });
    },
    logout: () => {
        Cookies.remove("access_refresh");
        Cookies.remove("role");
        set({ accessToken: null, refreshToken: null, role: null });
    }
}));