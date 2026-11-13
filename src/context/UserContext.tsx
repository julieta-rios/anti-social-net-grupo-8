
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "../types";

// Permite mantener la sesión y las preferencias del usuario.

interface UserContextType {
  user: User | null;
  avatarUrl: string;
  nombreMostrar: string;
  login: (user: User) => void;
  logout: () => void;
  actualizarAvatar: (url: string) => void;
  actualizarNombre: (nombre: string) => void;
  descripcionPerfil: string;
  actualizarDescripcion: (descripcion: string) => void;
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

  const [nombreMostrar, setNombreMostrar] = useState(() => {
    const usuarioGuardado = localStorage.getItem("user");

    if (!usuarioGuardado) return "";

    const usuario: User = JSON.parse(usuarioGuardado);
    return localStorage.getItem(`nombre-${usuario.id}`) || "";
  });

  const [descripcionPerfil, setDescripcionPerfil] = useState(() => {
    const usuarioGuardado = localStorage.getItem("user");

    if (!usuarioGuardado) return "";

    const usuario: User = JSON.parse(usuarioGuardado);
    return localStorage.getItem(`descripcion-${usuario.id}`) || "";
  });

  const login = (user: User) => {
    setUser(user);
    setAvatarUrl(localStorage.getItem(`avatar-${user.id}`) || "");
    setNombreMostrar(localStorage.getItem(`nombre-${user.id}`) || "");
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.getItem(`descripcion-${user.id}`) || "";
    setDescripcionPerfil(localStorage.getItem(`descripcion-${user.id}`) || "");
  };

  const logout = () => {
    setUser(null);
    setAvatarUrl("");
    setNombreMostrar("");
    localStorage.removeItem("user");
    setDescripcionPerfil("");
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

  const actualizarNombre = (nombre: string) => {
    if (!user) return;

  const actualizarDescripcion = (descripcion: string) => {
    if (!user) return;

    setDescripcionPerfil(descripcion);

    if (descripcion.trim()) {
      localStorage.setItem(
        `descripcion-${user.id}`,
        
        descripcion.trim()
      );
    } else {
      localStorage.removeItem(`descripcion-${user.id}`);
    }
};

    setNombreMostrar(nombre);

    if (nombre.trim()) {
      localStorage.setItem(`nombre-${user.id}`, nombre.trim());
    } else {
      localStorage.removeItem(`nombre-${user.id}`);
    }
  };

  const actualizarDescripcion = (descripcion: string) => {
    if (!user) return;

    setDescripcionPerfil(descripcion);

    if (descripcion.trim()) {
      localStorage.setItem(
        `descripcion-${user.id}`,
        descripcion.trim()
      );
    } else {
      localStorage.removeItem(`descripcion-${user.id}`);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        avatarUrl,
        nombreMostrar,
        login,
        logout,
        actualizarAvatar,
        actualizarNombre,
        descripcionPerfil,
        actualizarDescripcion,
      }}
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
