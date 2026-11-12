import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useUser } from "../../context/UserContext";
import API_URL from "../../services/api";
import type { Post, Comment, PostImage } from "../../types";
import PostCard from "../../components/PostCard/PostCard";
import defaultAvatar from "../../assets/default-avatar.png";
import styles from "./Perfil.module.css";


interface PostConComentarios extends Post {
  cantidadComentarios: number;
  imagen?: string;
}

export default function Perfil() {
  const { user, logout, avatarUrl, actualizarAvatar } = useUser();
  const navigate = useNavigate();

  const [misPosts, setMisPosts] = useState<PostConComentarios[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [errorAvatar, setErrorAvatar] = useState("");

  const [urlAvatar, setUrlAvatar] = useState(avatarUrl);
  const [mostrarEditor, setMostrarEditor] = useState(false);
  const userId = user?.id;

  useEffect(() => {
    const cargarMisPosts = async () => {
      if (!userId) {
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError("");

        const response = await fetch(`${API_URL}/posts?userId=${userId}`);

        if (!response.ok) {
          throw new Error("No se pudieron cargar tus publicaciones.");
        }

        const dataPosts: Post[] = await response.json();

        const postsEnriquecidos = await Promise.all(
          dataPosts.map(async (post) => {
            let cantidadComentarios = 0;
            let imagen: string | undefined;

            try {
              const [resCom, resImg] = await Promise.all([
                fetch(`${API_URL}/comments/post/${post.id}`),
                fetch(`${API_URL}/postimages/post/${post.id}`),
              ]);

              if (resCom.ok) {
                const comentarios: Comment[] = await resCom.json();
                cantidadComentarios = comentarios.length;
              }

              if (resImg.ok) {
                const imagenes: PostImage[] = await resImg.json();
                imagen = imagenes[0]?.url;
              }
            } catch (error) {
              console.error("Error al cargar datos de la publicación:", error);
            }

            return {
              ...post,
              cantidadComentarios,
              imagen,
            };
          }),
        );

        setMisPosts(postsEnriquecidos);
      } catch (error) {
        console.error(error);
        setError("Ocurrió un error al obtener tus publicaciones.");
      } finally {
        setCargando(false);
      }
    };

    cargarMisPosts();
  }, [userId]);

  useEffect(() => {
    setUrlAvatar(avatarUrl);
  }, [avatarUrl]);

  const handleGuardarAvatar = () => {
    const url = urlAvatar.trim();

    if (url) {
      try {
        const urlValidada = new URL(url);

        if (!["http:", "https:"].includes(urlValidada.protocol)) {
          throw new Error();
        }
        actualizarAvatar(url);
        setErrorAvatar("");
        setMostrarEditor(false);
        
      } catch {
        setErrorAvatar("Ingresá una URL de imagen válida.");
        return;
      }
    }

  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className={`container mt-4 ${styles.contenedorPerfil}`}>
      <div className={`card p-4 mb-4 ${styles.tarjetaPerfil}`}>
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3 text-center text-md-start">
            <img
              src={avatarUrl || defaultAvatar}
              alt="Avatar de perfil"
              className={styles.avatarPerfil}
            />

            <div>
              <h1 className="h3 fw-bold mb-1">@{user?.nickName}</h1>
              <p className="mb-0 opacity-75">
                Miembro de UnaHur Anti-Social Net
              </p>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <button type="button" className={styles.botonEditar} onClick={() => setMostrarEditor(true)}>
              <i className="bi bi-pencil-square me-1"></i>
              Editar Perfil
            </button>
            
            <Link to="/crear-post" className="btn btn-light fw-semibold">
              + Crear publicación
            </Link>

            <button
              type="button"
              className="btn btn-light fw-semibold"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      <div className={styles.cambiarAvatar}>
        <label htmlFor="avatar" className="form-label small fw-semibold mb-2">
          Cambiar foto de perfil
        </label>

        {mostrarEditor && (
          <div className={styles.modalOverlay}>
            <div
              className={styles.modalEditar}
              role="dialog"
              aria-modal="true"
              aria-labelledby="tituloEditarPerfil"
            >
            <div className={styles.modalHeader}>
              <h2 id="tituloEditarPerfil">Editar perfil</h2>

              <button
                type="button"
                className={styles.botonCerrar}
                onClick={() => setMostrarEditor(false)}
                aria-label="Cerrar"
              >
                &times;
              </button>
            </div>

            <div className={styles.modalContenido}>
              <div className="text-center mb-3">
                <img
                  src={urlAvatar || defaultAvatar}
                  alt="Vista previa del avatar"
                  className={styles.avatarPreview}
                />
                <p className="fw-semibold mt-2 mb-0">
                  @{user?.nickName}
                </p>
                <small className="text-muted">
                  Vista previa de tu perfil
                </small>
              </div>

              <label
                htmlFor="avatar"
                className="form-label fw-semibold"
              >
                Foto de perfil
              </label>

              <input
                id="avatar"
                type="url"
                className="form-control"
                placeholder="Pegá la URL de tu imagen"
                value={urlAvatar}
                onChange={(event) => {
                  setUrlAvatar(event.target.value);
                  setErrorAvatar("");
                }}
              />

              {errorAvatar && (
                <small className="text-danger d-block mt-2">
                  {errorAvatar}
                </small>
              )}
            </div>

      <div className={styles.modalFooter}>
        <button
          type="button"
          className={styles.botonCancelar}
          onClick={() => setMostrarEditor(false)}
        >
          Cancelar
        </button>

        <button
          type="button"
          className={styles.botonGuardar}
          onClick={handleGuardarAvatar}
        >
          Guardar cambios
        </button>
      </div>
    </div>
  </div>
)}

        {errorAvatar && <small className="text-warning">{errorAvatar}</small>}
      </div>

      <section>
        <h2 className="h4 fw-bold mb-3">Mis publicaciones</h2>

        {cargando && (
          <div className="text-center py-5">
            <div className="spinner-border text-dark" role="status" />
            <p className="mt-2 text-muted">Cargando tus posteos...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {!cargando && !error && misPosts.length === 0 && (
          <div className="alert alert-secondary text-center py-4">
            Todavía no realizaste ninguna publicación. ¡Animate a compartir tu
            primer post!
          </div>
        )}

        <div className="row g-3">
          {!cargando &&
            !error &&
            misPosts.map((post) => (
              <div className="col-md-6" key={post.id}>
                <PostCard
                  post={post}
                  cantidadComentarios={post.cantidadComentarios}
                  imagen={post.imagen}
                />
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
