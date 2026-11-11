import { useEffect, useState } from "react";
import defaultAvatar from "../../assets/default-avatar.png";
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
  const [cargando, setCargando] = useState(true);
  const [imagen, setImagen] = useState(src || defaultAvatar);

  useEffect(() => {
    setCargando(true);
    setImagen(src || defaultAvatar);
  }, [src]);

  const handleLoad = () => {
    setCargando(false);
  };

  const handleError = () => {
    setImagen(defaultAvatar);
    setCargando(false);
  };

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
        onLoad={handleLoad}
        onError={handleError}
        className={cargando ? styles.imagenOculta : styles.imagen}
      />
    </div>
  );
}
