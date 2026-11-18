import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "../types";

// Permite mantener la sesión y las preferencias del usuario.

interface UserContextType {
  user: User | null;
  avatarUrl: string;
  nombreMostrar: string;
  descripcionPerfil: string;
  seguidos: number[];
  login: (user: User) => void;
  logout: () => void;
  actualizarAvatar: (url: string) => void;
  actualizarNombre: (nombre: string) => void;
  actualizarDescripcion: (descripcion: string) => void;
  seguirUsuario: (idUsuario: number) => void;
  dejarDeSeguir: (idUsuario: number) => void;
  estaSiguiendo: (idUsuario: number) => boolean;
  obtenerIdsSeguidos: (idUsuario: number) => number[];
  obtenerIdsSeguidores: (idUsuario: number) => number[];
  reposts: number[];
  repostearPost: (postId: number) => void;
  quitarRepost: (postId: number) => void;
  estaReposteando: (postId: number) => boolean;
  obtenerIdsReposteados: (idUsuario: number) => number[];
  obtenerCantidadReposts: (postId: number) => number;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

const obtenerSeguidosGuardados = (idUsuario: number): number[] => {
  try {
    return JSON.parse(localStorage.getItem(`seguidos-${idUsuario}`) || "[]");
  } catch {
    return [];
  }
};

const obtenerRepostsGuardados = (idUsuario: number): number[] => {
  try {
    return JSON.parse(localStorage.getItem(`reposts-${idUsuario}`) || "[]");
  } catch {
    return [];
  }
};

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

  const [seguidos, setSeguidos] = useState<number[]>(() => {
    const usuarioGuardado = localStorage.getItem("user");

    if (!usuarioGuardado) return [];

    const usuario: User = JSON.parse(usuarioGuardado);
    return obtenerSeguidosGuardados(usuario.id);
  });

  const [reposts, setReposts] = useState<number[]>(() => {
    const usuarioGuardado = localStorage.getItem("user");

    if (!usuarioGuardado) return [];

    const usuario: User = JSON.parse(usuarioGuardado);
    return obtenerRepostsGuardados(usuario.id);
  });

  const login = (user: User) => {
    setUser(user);
    setAvatarUrl(localStorage.getItem(`avatar-${user.id}`) || "");
    setNombreMostrar(localStorage.getItem(`nombre-${user.id}`) || "");
    setDescripcionPerfil(localStorage.getItem(`descripcion-${user.id}`) || "");
    setSeguidos(obtenerSeguidosGuardados(user.id));
    setReposts(obtenerRepostsGuardados(user.id));
    localStorage.setItem("user", JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    setAvatarUrl("");
    setNombreMostrar("");
    setDescripcionPerfil("");
    setSeguidos([]);
    setReposts([]);
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

  const actualizarNombre = (nombre: string) => {
    if (!user) return;

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
      localStorage.setItem(`descripcion-${user.id}`, descripcion.trim());
    } else {
      localStorage.removeItem(`descripcion-${user.id}`);
    }
  };

  const seguirUsuario = (idUsuario: number) => {
    if (!user || user.id === idUsuario || seguidos.includes(idUsuario)) return;

    const nuevosSeguidos = [...seguidos, idUsuario];

    setSeguidos(nuevosSeguidos);
    localStorage.setItem(`seguidos-${user.id}`, JSON.stringify(nuevosSeguidos));
  };

  const dejarDeSeguir = (idUsuario: number) => {
    if (!user) return;

    const nuevosSeguidos = seguidos.filter((id) => id !== idUsuario);

    setSeguidos(nuevosSeguidos);
    localStorage.setItem(`seguidos-${user.id}`, JSON.stringify(nuevosSeguidos));
  };

  const estaSiguiendo = (idUsuario: number) => {
    return seguidos.includes(idUsuario);
  };

  const obtenerIdsSeguidos = (idUsuario: number) => {
    return obtenerSeguidosGuardados(idUsuario);
  };

  const obtenerIdsSeguidores = (idUsuario: number) => {
    const idsSeguidores: number[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const clave = localStorage.key(i);

      if (clave?.startsWith("seguidos-")) {
        const idUsuarioSeguidor = Number(clave.replace("seguidos-", ""));

        if (obtenerSeguidosGuardados(idUsuarioSeguidor).includes(idUsuario)) {
          idsSeguidores.push(idUsuarioSeguidor);
        }
      }
    }

    return idsSeguidores;
  };

  const repostearPost = (postId: number) => {
    if (!user || reposts.includes(postId)) return;

    const nuevosReposts = [...reposts, postId];

    setReposts(nuevosReposts);
    localStorage.setItem(`reposts-${user.id}`, JSON.stringify(nuevosReposts));
  };

  const quitarRepost = (postId: number) => {
    if (!user) return;

    const nuevosReposts = reposts.filter((id) => id !== postId);

    setReposts(nuevosReposts);
    localStorage.setItem(`reposts-${user.id}`, JSON.stringify(nuevosReposts));
  };

  const estaReposteando = (postId: number) => {
    return reposts.includes(postId);
  };

  const obtenerIdsReposteados = (idUsuario: number) => {
    return obtenerRepostsGuardados(idUsuario);
  };

  const obtenerCantidadReposts = (postId: number) => {
    let cantidad = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const clave = localStorage.key(i);

      if (clave?.startsWith("reposts-")) {
        const idUsuario = Number(clave.replace("reposts-", ""));

        if (obtenerRepostsGuardados(idUsuario).includes(postId)) {
          cantidad++;
        }
      }
    }

    return cantidad;
  };

  return (
    <UserContext.Provider
      value={{
        user,
        avatarUrl,
        nombreMostrar,
        seguidos,
        login,
        logout,
        actualizarAvatar,
        actualizarNombre,
        descripcionPerfil,
        actualizarDescripcion,
        seguirUsuario,
        dejarDeSeguir,
        estaSiguiendo,
        obtenerIdsSeguidos,
        obtenerIdsSeguidores,
        reposts,
        repostearPost,
        quitarRepost,
        estaReposteando,
        obtenerIdsReposteados,
        obtenerCantidadReposts,
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
