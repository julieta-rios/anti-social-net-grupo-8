import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useUser } from "../../context/UserContext";
import API_URL from "../../services/api";
import type { Post, Comment } from "../../types";
import defaultAvatar from "../../assets/default-avatar.png";
import styles from "./Perfil.module.css";

interface PostConComentarios extends Post {
  cantidadComentarios: number;
}

export default function Perfil() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const [misPosts, setMisPosts] = useState<PostConComentarios[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const userId = user?._id || user?.id;

  useEffect(() => {
    const cargarMisPosts = async () => {
      if (!userId) return;

      try {
        setCargando(true);
        setError("");

        const response = await fetch(`${API_URL}/posts?userId=${userId}`);

        if (!response.ok) {
          throw new Error("No se pudieron cargar tus publicaciones.");
        }

        const dataPosts: Post[] = await response.json();

        // Enriquecer con la cantidad de comentarios visibles de cada post
        const postsEnriquecidos = await Promise.all(
          dataPosts.map(async (post) => {
            const postId = post._id || post.id || "";
            let cantidadComentarios = post.comentarios?.length || post.comments?.length || 0;

            if (cantidadComentarios === 0 && postId) {
              try {
                const resCom = await fetch(`${API_URL}/comments/post/${postId}`);
                if (resCom.ok) {
                  const comData: Comment[] = await resCom.json();
                  cantidadComentarios = comData.length;
                }
              } catch {
                cantidadComentarios = 0;
              }
            }

            return {
              ...post,
              cantidadComentarios,
            };
          })
        );

        setMisPosts(postsEnriquecidos);
      } catch (err) {
        console.error(err);
        setError("Ocurrió un error al obtener tus publicaciones.");
      } finally {
        setCargando(false);
      }
    };

    cargarMisPosts();
  }, [userId]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className={`container mt-4 ${styles.contenedorPerfil}`}>
      {/* Tarjeta de cabecera del Perfil */}
      <div className={`card p-4 mb-4 ${styles.tarjetaPerfil}`}>
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3 text-center text-md-start">
            <img
              src={defaultAvatar}
              alt="Avatar de perfil"
              className={styles.avatarPerfil}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <div>
              <h1 className="h3 fw-bold mb-1">
                @{user ? user.nickName : "Invitado"}
              </h1>
              <p className="mb-0 opacity-75">Miembro de UnaHur Anti-Social Net</p>
            </div>
          </div>

          <div className="d-flex gap-2">
            <Link to="/crear-post" className="btn btn-light fw-semibold">
              + Crear publicación
            </Link>
            <button
              type="button"
              className="btn btn-outline-light"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      {/* Sección de publicaciones del usuario */}
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
            Todavía no realizaste ninguna publicación. ¡Animate a compartir tu primer post!
          </div>
        )}

        <div className="row g-3">
          {misPosts.map((post) => {
            const postId = post._id || post.id;
            const descripcion = post.descripcion || post.description || "Sin descripción";

            return (
              <div className="col-md-6" key={postId}>
                <div className={`card p-3 h-100 ${styles.tarjetaPost}`}>
                  <div className="card-body d-flex flex-column">
                    <p className="card-text flex-grow-1">{descripcion}</p>

                    <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-2">
                      <small className="text-muted">
                        💬 {post.cantidadComentarios}{" "}
                        {post.cantidadComentarios === 1 ? "comentario" : "comentarios"}
                      </small>

                      <Link to={`/post/${postId}`} className="btn btn-sm btn-dark">
                        Ver más
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}