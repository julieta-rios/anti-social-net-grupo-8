import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "../types";

//permite mantener la sesión iniciada

interface UserContextType {
  user: User | null;
  avatarUrl: string;
  login: (user: User) => void;
  logout: () => void;
  actualizarAvatar: (url: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(() => {
    const usuarioGuardado = localStorage.getItem("user");
    return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  });

  const [avatarUrl, setAvatarUrl] = useState(() => {
    const usuarioGuardado = localStorage.getItem("user");

    if (!usuarioGuardado) return "";

    const usuario: User = JSON.parse(usuarioGuardado);
    return localStorage.getItem(`avatar-${usuario.id}`) || "";
  });

  const login = (user: User) => {
    setUser(user);
    setAvatarUrl(localStorage.getItem(`avatar-${user.id}`) || "");
    localStorage.setItem("user", JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    setAvatarUrl("");
    localStorage.removeItem("user");
  };

  const actualizarAvatar = (url: string) => {
    if (!user) return;

    setAvatarUrl(url);

    if (url) {
      localStorage.setItem(`avatar-${user.id}`, url);
    } else {
      localStorage.removeItem(`avatar-${user.id}`);
    }
  };

  return (
    <UserContext.Provider
      value={{ user, avatarUrl, login, logout, actualizarAvatar }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser debe utilizarse dentro de UserProvider");
  }

  return context;
}
