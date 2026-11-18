import { Link } from "react-router";
import type { User } from "../../types";
import defaultAvatar from "../../assets/default-avatar.jpg";
import styles from "./ModalSeguidores.module.css";

interface ModalSeguidoresProps {
  mostrar: boolean;
  tipo: "seguidores" | "siguiendo";
  usuarios: User[];
  cargando: boolean;
  usuarioActualId: number;
  estaSiguiendo: (idUsuario: number) => boolean;
  onToggleSeguir: (idUsuario: number) => void;
  onCerrar: () => void;
}

export default function ModalSeguidores({
  mostrar,
  tipo,
  usuarios,
  cargando,
  usuarioActualId,
  estaSiguiendo,
  onToggleSeguir,
  onCerrar,
}: ModalSeguidoresProps) {
  if (!mostrar) return null;

  const titulo = tipo === "seguidores" ? "Seguidores" : "Siguiendo";

  return (
    <div className={styles.overlay} onClick={onCerrar}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tituloListaUsuarios"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 id="tituloListaUsuarios">{titulo}</h2>

          <button
            type="button"
            className={styles.botonCerrar}
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            &times;
          </button>
        </div>

        <div className={styles.listaUsuarios}>
          {cargando ? (
            <p className={styles.listaVacia}>Cargando usuarios...</p>
          ) : usuarios.length === 0 ? (
            <p className={styles.listaVacia}>
              {tipo === "seguidores"
                ? "Todavía no tenés seguidores."
                : "Todavía no seguís a ningún usuario."}
            </p>
          ) : (
            usuarios.map((usuario) => (
              <div className={styles.usuarioFila} key={usuario.id}>
                <Link
                  to={`/perfil/${usuario.id}`}
                  className={styles.usuarioLista}
                  onClick={onCerrar}
                >
                  <img
                    src={
                      localStorage.getItem(`avatar-${usuario.id}`) ||
                      defaultAvatar
                    }
                    alt={`Avatar de ${usuario.nickName}`}
                    className={styles.avatarLista}
                    onError={(event) => {
                      event.currentTarget.src = defaultAvatar;
                    }}
                  />

                  <div className={styles.datosLista}>
                    <strong>
                      {localStorage.getItem(`nombre-${usuario.id}`)?.trim() ||
                        usuario.nickName}
                    </strong>
                    <span>@{usuario.nickName}</span>
                  </div>
                </Link>

                {usuario.id !== usuarioActualId && (
                  <button
                    type="button"
                    className={styles.botonSeguir}
                    onClick={() => onToggleSeguir(usuario.id)}
                  >
                    {estaSiguiendo(usuario.id)
                      ? "Dejar de seguir"
                      : "Seguir"}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}