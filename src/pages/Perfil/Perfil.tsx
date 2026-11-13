import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import API_URL from "../../services/api";
import type { Post, Comment, PostImage } from "../../types";
import PostCard from "../../components/PostCard/PostCard";
import defaultAvatar from "../../assets/default-avatar.jpg";
import styles from "./Perfil.module.css";

interface PostConComentarios extends Post {
  cantidadComentarios: number;
  imagen?: string;
}

export default function Perfil() {
  const {
    user,
    logout,
    avatarUrl,
    actualizarAvatar,
    nombreMostrar,
    actualizarNombre,
    descripcionPerfil,
    actualizarDescripcion,
  } = useUser();

  const [misPosts, setMisPosts] = useState<PostConComentarios[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [errorAvatar, setErrorAvatar] = useState("");

  const [urlAvatar, setUrlAvatar] = useState(avatarUrl);
  const [nombreBorrador, setNombreBorrador] = useState(nombreMostrar);
  const [descripcionBorrador, setDescripcionBorrador] = useState(descripcionPerfil);
  const [mostrarEditor, setMostrarEditor] = useState(false);

  const userId = user?.id;

  const nombrePerfil = nombreMostrar.trim() || user?.nickName || "Usuario";

  useEffect(() => {
    const cargarMisPosts = async () => {
      if (!userId) {
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError("");

        const response = await fetch(`${API_URL}/posts`);

          if (!response.ok) {
            throw new Error("No se pudieron cargar tus publicaciones.");
          }

          const dataPosts: Post[] = await response.json();

          console.log("Usuario logueado:", userId); //
          console.log("Publicaciones recibidas:", dataPosts); //

          const misPublicaciones = dataPosts.filter(
            (post) => post.UserId === userId
          );
          
          console.log("Mis publicaciones filtradas:", misPublicaciones); //

        const postsEnriquecidos = await Promise.all(
          misPublicaciones.map(async (post) => {
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
              console.error(
                "Error al cargar datos de la publicación:",
                error
              );
            }

            return {
              ...post,
              cantidadComentarios,
              imagen,
            };
          })
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

  useEffect(() => {
    setNombreBorrador(nombreMostrar);
  }, [nombreMostrar]);

  const abrirEditor = () => {
    setUrlAvatar(avatarUrl);
    setNombreBorrador(nombreMostrar);
    setErrorAvatar("");
    setMostrarEditor(true);
    setDescripcionBorrador(descripcionPerfil);
  };

  const cerrarEditor = () => {
    setUrlAvatar(avatarUrl);
    setNombreBorrador(nombreMostrar);
    setErrorAvatar("");
    setMostrarEditor(false);
    setDescripcionBorrador(descripcionPerfil);
  };

  const handleGuardarPerfil = () => {
    const url = urlAvatar.trim();
    const nombre = nombreBorrador.trim();

    if (url) {
      try {
        const urlValidada = new URL(url);

        if (!["http:", "https:"].includes(urlValidada.protocol)) {
          throw new Error();
        }
      } catch {
        setErrorAvatar("Ingresá una URL de imagen válida.");
        return;
      }
    }

    actualizarAvatar(url);
    actualizarNombre(nombre);
    actualizarDescripcion(descripcionBorrador);
    setErrorAvatar("");
    setMostrarEditor(false);
  };

  const totalComentarios = misPosts.reduce(
    (total, post) => total + post.cantidadComentarios,
    0
  );

  console.log("Publicaciones guardadas en el estado:", misPosts);
  console.log("Cantidad de publicaciones:", misPosts.length);
  console.log("Cargando:", cargando);
  console.log("Error:", error);

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    setDescripcionBorrador(descripcionPerfil);
  }, [descripcionPerfil]);

  return (
    <main className={`container ${styles.contenedorPerfil}`}>
      <section className={styles.tarjetaPerfil}>
        <div className={styles.portadaPerfil}>
          <span className={styles.detallePortada}>TU ESPACIO</span>
          <span className={styles.decoracionPortada}>✦</span>
        </div>

        <div className={styles.informacionPerfil}>
          <div className={styles.encabezadoPerfil}>
            <div className={styles.identidadPerfil}>
              <img
                src={avatarUrl || defaultAvatar}
                alt="Avatar de perfil"
                className={styles.avatarPerfil}
                onError={(event) => {
                  event.currentTarget.src = defaultAvatar;
                }}
              />

              <div className={styles.datosUsuario}>
                <h1>{nombrePerfil}</h1>
                <p>@{user?.nickName}</p>
              </div>
            </div>
          <div className={styles.accionesPerfil}>
            <button
              type="button"
              className={styles.botonEditar}
              onClick={abrirEditor}
            >
              <span aria-hidden="true">✎</span> Editar perfil
            </button>

            <Link to="/crear-post" className={styles.botonCrear}>
            + Crear publicación </Link>
            <button type="button" className={styles.botonCerrarSesion} onClick={handleLogout}>
              Cerrar Sesión 
            </button>
          </div>
           
          </div>

          <p className={styles.descripcionPerfil}>
            {descripcionPerfil.trim() ||
              "Un espacio para compartir ideas, intereses y experiencias."}
          </p>

          <div className={styles.estadisticasPerfil}>
            <div>
              <strong>{misPosts.length}</strong>
              <span>Publicaciones</span>
            </div>

            <div>
              <strong>{totalComentarios}</strong>
              <span>Comentarios</span>
            </div>
          </div>
        </div>
      </section>

      {mostrarEditor && (
        <div
          className={styles.modalOverlay}
          onClick={cerrarEditor}
        >
          <div
            className={styles.modalEditar}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tituloEditarPerfil"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 id="tituloEditarPerfil">Editar perfil</h2>

              <button
                type="button"
                className={styles.botonCerrar}
                onClick={cerrarEditor}
                aria-label="Cerrar"
              >
                &times;
              </button>
            </div>

            <div className={styles.modalContenido}>
              <div className={styles.vistaPrevia}>
                <img
                  src={urlAvatar || defaultAvatar}
                  alt="Vista previa del avatar"
                  className={styles.avatarPreview}
                  onError={(event) => {
                    event.currentTarget.src = defaultAvatar;
                  }}
                />

                <strong>
                  {nombreBorrador.trim() || user?.nickName}
                </strong>

                <span>@{user?.nickName}</span>
              </div>

              <div className="mb-3">
                <label
                  htmlFor="nombreMostrar"
                  className="form-label fw-semibold"
                >
                  Nombre para mostrar
                </label>

                <input
                  id="nombreMostrar"
                  type="text"
                  className="form-control"
                  placeholder="¿Cómo querés que te llamen?"
                  maxLength={40}
                  value={nombreBorrador}
                  onChange={(event) =>
                    setNombreBorrador(event.target.value)
                  }
                />

                <small className="text-muted">
                  Este nombre se mostrará en tu perfil. Tu usuario seguirá
                  siendo @{user?.nickName}.
                </small>
              </div>

              <div className="mb-3">
                <label
                  htmlFor="descripcionPerfil"
                  className="form-label fw-semibold"
                >
                  Descripción de perfil
                </label>

                <textarea
                  id="descripcionPerfil"
                  className="form-control"
                  placeholder="Contales algo sobre vos..."
                  maxLength={160}
                  rows={3}
                  value={descripcionBorrador}
                  onChange={(event) =>
                    setDescripcionBorrador(event.target.value)
                  }
                />

                <small className="text-muted">
                  Escribí una breve presentación. Máximo 160 caracteres.
                </small>
              </div>

              <div>
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

                <small className="text-muted">
                  Podés dejarlo vacío para volver al avatar predeterminado.
                </small>

                {errorAvatar && (
                  <small className="text-danger d-block mt-2">
                    {errorAvatar}
                  </small>
                )}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.botonCancelar}
                onClick={cerrarEditor}
              >
                Cancelar
              </button>

              <button
                type="button"
                className={styles.botonGuardar}
                onClick={handleGuardarPerfil}
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      <section className={styles.seccionPublicaciones}>
        <div className={styles.tituloPublicaciones}>
          <div>
            <span>MÁS DE VOS</span>
            <h2>Mis publicaciones</h2>
          </div>
          <span className={styles.contadorPosts}>
            {misPosts.length} {misPosts.length === 1 ? "post" : "posts"}
          </span>
        </div>

        {cargando && (
          <div className={styles.estadoVacio}>
            <div className="spinner-border" role="status" />
            <p>Cargando tus publicaciones...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {!cargando && !error && misPosts.length === 0 && (
          <div className={styles.estadoVacio}>
            <span className={styles.iconoVacio}>✧</span>
            <h3>Tu espacio está esperando</h3>
            <p>
              Todavía no realizaste ninguna publicación. ¡Animate a compartir
              algo con la comunidad!
            </p>
          </div>
        )}

        {!cargando && !error && misPosts.length > 0 && (
          <div className={styles.listaPublicaciones}>
            {misPosts.map((post) => (
              <div className={styles.publicacion} key={post.id}>
                <PostCard
                  post={post}
                  cantidadComentarios={post.cantidadComentarios}
                  imagen={post.imagen}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
