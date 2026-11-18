import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { Repeat2 } from "lucide-react";
import { useUser } from "../../context/UserContext";
import API_URL from "../../services/api";
import type { Post, Comment, PostImage, User } from "../../types";
import PostCard from "../../components/PostCard/PostCard";
import ModalSeguidores from "../../components/ModalSeguidores/ModalSeguidores";
import defaultAvatar from "../../assets/default-avatar.jpg";
import styles from "./Perfil.module.css";

interface PostConComentarios extends Post {
  cantidadComentarios: number;
  imagenesCargadas: PostImage[];
  esRepost: boolean;
}

type PublicacionPerfil = Post & {
  esRepost: boolean;
};

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
    seguirUsuario,
    dejarDeSeguir,
    estaSiguiendo,
    obtenerIdsSeguidos,
    obtenerIdsSeguidores,
    repostearPost,
    quitarRepost,
    estaReposteando,
    obtenerIdsReposteados,
    obtenerCantidadReposts,
    reposts,
  } = useUser();

  const { userId: userIdParam } = useParams();
  const idPerfil = userIdParam ? Number(userIdParam) : user?.id;
  const esMiPerfil = !userIdParam || Number(userIdParam) === user?.id;
  const [usuarioPerfil, setUsuarioPerfil] = useState<User | null>(null);

  const [misPosts, setMisPosts] = useState<PostConComentarios[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [errorAvatar, setErrorAvatar] = useState("");

  const [urlAvatar, setUrlAvatar] = useState(avatarUrl);
  const [nombreBorrador, setNombreBorrador] = useState(nombreMostrar);
  const [descripcionBorrador, setDescripcionBorrador] =
    useState(descripcionPerfil);
  const [mostrarEditor, setMostrarEditor] = useState(false);

  const userId = user?.id;

  const userLikesKey = user
    ? `user_liked_posts_${user.id}`
    : "guest_liked_posts";

  const handleToggleLike = (postId: number) => {
    if (!user) return;

    setMisPosts((prevPosts) => {
      const nuevosPosts = prevPosts.map((post) => {
        if (post.id !== postId) return post;

        const likedByMe = !post.likedByMe;
        const currentCount = post.likesCount || 0;

        return {
          ...post,
          likedByMe,
          likesCount: likedByMe
            ? currentCount + 1
            : Math.max(0, currentCount - 1),
        };
      });

      const idsQueMeGustan = nuevosPosts
        .filter((post) => post.likedByMe)
        .map((post) => post.id);

      localStorage.setItem(userLikesKey, JSON.stringify(idsQueMeGustan));

      const postsGlobales = JSON.parse(
        localStorage.getItem("postsHome_global") || "[]"
      );

      const postsActualizados = postsGlobales.map((post: Post) => {
        const postActualizado = nuevosPosts.find(
          (item) => item.id === post.id
        );

        return postActualizado
          ? { ...post, likesCount: postActualizado.likesCount }
          : post;
      });

      localStorage.setItem(
        "postsHome_global",
        JSON.stringify(postsActualizados)
      );

      return nuevosPosts;
    });
  };

  const siguiendo = idPerfil ? estaSiguiendo(idPerfil) : false;

  const cantidadSeguidores = idPerfil
    ? obtenerIdsSeguidores(idPerfil).length
    : 0;

  const cantidadSeguidos = idPerfil
    ? obtenerIdsSeguidos(idPerfil).length
    : 0;

  const handleToggleSeguir = () => {
    if (!idPerfil || !user || esMiPerfil) return;

    if (siguiendo) {
      dejarDeSeguir(idPerfil);
    } else {
      seguirUsuario(idPerfil);
    }
  };

  const handleToggleRepost = (postId: number) => {
    if (!user) return;

    if (estaReposteando(postId)) {
      quitarRepost(postId);
    } else {
      repostearPost(postId);
    }
  };

  const abrirListaUsuarios = async (
    tipo: "seguidores" | "siguiendo",
  ) => {
    if (!idPerfil) return;

    setTipoModal(tipo);
    setCargandoUsuarios(true);
    setUsuariosModal([]);

    try {
      const ids =
        tipo === "seguidores"
          ? obtenerIdsSeguidores(idPerfil)
          : obtenerIdsSeguidos(idPerfil);

      if (ids.length === 0) {
        return;
      }

      const response = await fetch(`${API_URL}/users`);

      if (!response.ok) {
        throw new Error("No se pudieron cargar los usuarios.");
      }

      const usuarios: User[] = await response.json();

      const usuariosFiltrados = usuarios.filter((usuario) =>
        ids.includes(usuario.id),
      );

      setUsuariosModal(usuariosFiltrados);
    } catch (error) {
      console.error("Error al cargar la lista de usuarios:", error);
    } finally {
      setCargandoUsuarios(false);
    }
  };

  const nombrePerfil = esMiPerfil
    ? nombreMostrar.trim() || usuarioPerfil?.nickName || "Usuario"
    : usuarioPerfil?.nickName || "Usuario";

  const avatarPerfil = esMiPerfil
    ? avatarUrl || defaultAvatar
    : localStorage.getItem(`avatar-${idPerfil}`) || defaultAvatar;

  const descripcionMostrar = esMiPerfil
    ? descripcionPerfil.trim() ||
      "Un espacio para compartir ideas, intereses y experiencias."
    : localStorage.getItem(`descripcion-${idPerfil}`)?.trim() ||
      "Un espacio para compartir ideas, intereses y experiencias.";

  const [tipoModal, setTipoModal] = useState<
    "seguidores" | "siguiendo" | null
  >(null);

  const [usuariosModal, setUsuariosModal] = useState<User[]>([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);

  useEffect(() => {
    const cargarPerfil = async () => {
      if (!userId) {
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError("");

        let datosUsuario: User;

        if (esMiPerfil && user) {
          datosUsuario = user;
        } else {
          const responseUsuario = await fetch(`${API_URL}/users/${idPerfil}`);

          if (!responseUsuario.ok) {
            throw new Error("No se encontró el usuario.");
          }

          datosUsuario = await responseUsuario.json();
        }

        setUsuarioPerfil(datosUsuario);

        const responsePosts = await fetch(`${API_URL}/posts`);

        if (!responsePosts.ok) {
          throw new Error("No se pudieron cargar las publicaciones.");
        }

        const misLikesIds: number[] = JSON.parse(
          localStorage.getItem(userLikesKey) || "[]"
        );
        
        const postsGlobalesLocales: Post[] = JSON.parse(
          localStorage.getItem("postsHome_global") || "[]"
        );

        const dataPosts: Post[] = await responsePosts.json();
        const idsReposteados = obtenerIdsReposteados(idPerfil!);

        const publicacionesOriginales = dataPosts.filter(
          (post) => post.UserId === idPerfil,
        );

        const publicacionesReposteadas = dataPosts
          .filter((post) => idsReposteados.includes(post.id))
          .map((post) => ({
            ...post,
            esRepost: true,
          }));

        const publicacionesUsuario: PublicacionPerfil[] = [
          ...publicacionesOriginales.map((post) => ({
            ...post,
            esRepost: false,
          })),
          ...publicacionesReposteadas,
        ];

        const postsEnriquecidos = await Promise.all(
          publicacionesUsuario.map(async (post) => {
            let cantidadComentarios = 0;
            let imagenesCargadas: PostImage[] = [];

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
                imagenesCargadas = await resImg.json();
              }
            } catch (error) {
              console.error("Error al cargar datos de la publicación:", error);
            }


            return {
              ...post,
              cantidadComentarios,
              imagenesCargadas,
              esRepost: post.esRepost,
              likesCount:
                postsGlobalesLocales.find((p) => p.id === post.id)?.likesCount ||
                post.likesCount ||
                0,
              likedByMe: misLikesIds.includes(post.id),
            };
          }),
        );

        setMisPosts(postsEnriquecidos);
      } catch (error) {
        console.error(error);
        setError("No se pudo cargar el perfil.");
      } finally {
        setCargando(false);
      }
    };

    cargarPerfil();
  }, [idPerfil, esMiPerfil, user, reposts, userLikesKey]);

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
          <span className={styles.detallePortada}>
            {esMiPerfil ? "TU ESPACIO" : "PERFIL DE USUARIO"}
          </span>
          <span className={styles.decoracionPortada}>✦</span>
        </div>

        <div className={styles.informacionPerfil}>
          <div className={styles.encabezadoPerfil}>
            <div className={styles.identidadPerfil}>
              <img
                src={avatarPerfil}
                alt="Avatar de perfil"
                className={styles.avatarPerfil}
                onError={(event) => {
                  event.currentTarget.src = defaultAvatar;
                }}
              />

              <div className={styles.datosUsuario}>
                <h1>{nombrePerfil}</h1>
                <p>@{usuarioPerfil?.nickName}</p>
              </div>
            </div>

            {esMiPerfil && (
              <div className={styles.accionesPerfil}>
                <button
                  type="button"
                  className={styles.botonEditar}
                  onClick={abrirEditor}
                >
                  <span aria-hidden="true">✎</span> Editar perfil
                </button>

                <Link to="/crear-post" className={styles.botonCrear}>
                  + Crear publicación
                </Link>

                <button
                  type="button"
                  className={styles.botonCerrarSesion}
                  onClick={handleLogout}
                >
                  Cerrar Sesión
                </button>
              </div>
            )}

            {!esMiPerfil && (
              <button
                type="button"
                className={styles.botonSeguir}
                onClick={handleToggleSeguir}
              >
                {siguiendo ? "Dejar de seguir" : "Seguir"}
              </button>
            )}
          </div>

          <p className={styles.descripcionPerfil}>{descripcionMostrar}</p>

          <div className={styles.estadisticasPerfil}>
            <div>
              <strong>{misPosts.length}</strong>
              <span>Publicaciones</span>
            </div>

            <button
              type="button"
              className={styles.botonEstadistica}
              onClick={() => abrirListaUsuarios("seguidores")}
            >
              <strong>{cantidadSeguidores}</strong>
              <span>Seguidores</span>
            </button>

            <button
              type="button"
              className={styles.botonEstadistica}
              onClick={() => abrirListaUsuarios("siguiendo")}
            >
              <strong>{cantidadSeguidos}</strong>
              <span>Siguiendo</span>
            </button>
          </div>
        </div>
      </section>

      {esMiPerfil && mostrarEditor && (
        <div className={styles.modalOverlay} onClick={cerrarEditor}>
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

                <strong>{nombreBorrador.trim() || user?.nickName}</strong>

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
                  onChange={(event) => setNombreBorrador(event.target.value)}
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
                <label htmlFor="avatar" className="form-label fw-semibold">
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
            <span>{esMiPerfil ? "MÁS DE VOS" : "SU ACTIVIDAD"}</span>
            <h2>{esMiPerfil ? "Mis publicaciones" : "Publicaciones"}</h2>
          </div>
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
            <h3>
              {esMiPerfil
                ? "Tu espacio está esperando"
                : "Todavía no hay publicaciones"}
            </h3>
            <p>
              {esMiPerfil
                ? "Todavía no realizaste ninguna publicación. ¡Animate a compartir algo con la comunidad!"
                : "Este usuario todavía no realizó publicaciones."}
            </p>
          </div>
        )}

        {!cargando && !error && misPosts.length > 0 && (
          <div className={styles.listaPublicaciones}>
            {misPosts.map((post) => (
              <div className={styles.publicacion} key={`${post.id}-${post.esRepost ? "repost" : "original"}`}>
                {post.esRepost && (
                  <p className={styles.etiquetaRepost}>
                    <Repeat2 size={16} aria-hidden="true" /> Reposteado
                  </p>
                )}

                <PostCard
                  post={post}
                  cantidadComentarios={post.cantidadComentarios}
                  imagenes={post.imagenesCargadas}
                  onToggleLike={handleToggleLike}
                  onToggleRepost={handleToggleRepost}
                  estaReposteando={estaReposteando(post.id)}
                  cantidadReposts={obtenerCantidadReposts(post.id)}
                />
              </div>
            ))}
          </div>
        )}
      </section>
      {tipoModal && (
        <ModalSeguidores
          mostrar={true}
          tipo={tipoModal}
          usuarios={usuariosModal}
          cargando={cargandoUsuarios}
          usuarioActualId={user!.id}
          estaSiguiendo={estaSiguiendo}
          onToggleSeguir={(idUsuario) => {
            if (estaSiguiendo(idUsuario)) {
              dejarDeSeguir(idUsuario);
            } else {
              seguirUsuario(idUsuario);
            }
          }}
          onCerrar={() => setTipoModal(null)}
        />
      )}
    </main>
  );
}
