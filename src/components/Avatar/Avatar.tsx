import { useEffect, useState } from "react";
import defaultAvatar from "../../assets/default-avatar.jpg";
import styles from "./Avatar.module.css";

interface AvatarProps {
  src?: string;
  alt?: string;
  className?: string;
}

export default function Avatar({
  src,
  alt = "Foto de perfil",
  className = "",
}: AvatarProps) {
  const fuente = src?.trim() || defaultAvatar;

  const [cargando, setCargando] = useState(true);
  const [imagen, setImagen] = useState(fuente);

  useEffect(() => {
    let activo = true;

    setCargando(true);

    const imagenPrueba = new Image();

    imagenPrueba.onload = () => {
      if (activo) {
        setImagen(fuente);
        setCargando(false);
      }
    };

    imagenPrueba.onerror = () => {
      if (activo) {
        setImagen(defaultAvatar);
        setCargando(false);
      }
    };

    imagenPrueba.src = fuente;

    return () => {
      activo = false;
    };
  }, [fuente]);

  return (
    <div className={`${styles.contenedorAvatar} ${className}`}>
      {cargando && (
        <div className={styles.spinner}>
          <span className="spinner-border spinner-border-sm" />
        </div>
      )}

      <img
        src={imagen}
        alt={alt}
        className={cargando ? styles.imagenOculta : styles.imagen}
      />
    </div>
  );
}
