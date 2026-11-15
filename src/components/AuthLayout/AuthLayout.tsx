import type { ReactNode } from "react";
import icono from "../../assets/icono.png";
import styles from "./AuthLayout.module.css";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className={styles.contenedor}>
      <div className={styles.ladoIzquierdo}>
        <img
          src={icono}
          alt="UnaHur Anti-Social Net"
          className={styles.iconoPrincipal}
        />
        <span className={styles.titulo}>antisocial_net</span>
      </div>

      <div className={styles.ladoDerecho}>{children}</div>
    </div>
  );
}
