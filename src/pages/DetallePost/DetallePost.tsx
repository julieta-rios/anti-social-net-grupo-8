import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router";
import { useUser } from "../../context/UserContext";
import API_URL from "../../services/api";
import type { Post, Comment, PostImage, Tag, User } from "../../types";
import placeholderPost from "../../assets/placeholder-post.png";
import defaultAvatar from "../../assets/default-avatar.png";
import styles from "./DetallePost.module.css";

export default function DetallePost() {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();

  const [post, setPost] = useState<Post | null>(null);
  const [imagenes, setImagenes] = useState<PostImage[]>([]);
  const [comentarios, setComentarios] = useState<Comment[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
  const [tagsMap, setTagsMap] = useState<Record<string, string>>({});

  const [cargando, setCargando] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState<string>("");

  // Estados del formulario controlado de comentarios
  const [nuevoComentario, setNuevoComentario] = useState<string>("");
  const [errorComentario, setErrorComentario] = useState<string>("");
  const [mensajeExito, setMensajeExito] = useState<string>("");
  const [enviando, setEnviando] = useState<boolean>(false);

  useEffect(() => {
    const cargarDetalle = async () => {
      if (!id) return;

      try {
        setCargando(true);
        setErrorCarga("");

        const [resPost, resCom, resImg, resUsers, resTags] = await Promise.all([
          fetch(`${API_URL}/posts/${id}`),
          fetch(`${API_URL}/comments/post/${id}`),
          fetch(`${API_URL}/postimages/post/${id}`),
          fetch(`${API_URL}/users`),
          fetch(`${API_URL}/tags`),
        ]);

        if (!resPost.ok) {
          throw new Error("No se encontró la publicación solicitada.");
        }

        const dataPost: Post = await resPost.json();
        setPost(dataPost);

        // Mapear usuarios y tags por ID por si la API devuelve solo IDs
        if (resUsers.ok) {
          const listaUsers: User[] = await resUsers.json();
          const mapaU: Record<string, string> = {};
          listaUsers.forEach((u) => {
            const uid = u._id || u.id;
            if (uid) mapaU[uid] = u.nickName;
          });
          setUsersMap(mapaU);
        }

        if (resTags.ok) {
          const listaTags: Tag[] = await resTags.json();
          const mapaT: Record<string, string> = {};
          listaTags.forEach((t) => {
            const tid = t._id || t.id;
            if (tid) mapaT[tid] = t.nombre || t.name || tid;
          });
          setTagsMap(mapaT);
        }

        // Cargar imágenes asociadas
        if (resImg.ok) {
          const dataImg: PostImage[] = await resImg.json();
          setImagenes(dataImg.length > 0 ? dataImg : dataPost.images || []);
        } else {
          setImagenes(dataPost.images || []);
        }

        // Cargar comentarios visibles
        if (resCom.ok) {
          const dataCom: Comment[] = await resCom.json();
          setComentarios(dataCom);
        } else {
          setComentarios(dataPost.comentarios || dataPost.comments || []);
        }
      } catch (err) {
        console.error(err);
        setErrorCarga(
          err instanceof Error
            ? err.message
            : "Ocurrió un error al cargar la publicación."
        );
      } finally {
        setCargando(false);
      }
    };

    cargarDetalle();
  }, [id]);

  const obtenerNombreUsuario = (userRef?: User | string): string => {
    if (!userRef) return "Usuario UnaHur";
    if (typeof userRef === "object" && "nickName" in userRef) {
      return userRef.nickName;
    }
    if (typeof userRef === "string") {
      return usersMap[userRef] || "Usuario UnaHur";
    }
    return "Usuario UnaHur";
  };

  const obtenerNombreTag = (tag: Tag | string): string => {
    if (typeof tag === "string") {
      return tagsMap[tag] || tag;
    }
    return tag.nombre || tag.name || "tag";
  };

  const handleSubmitComentario = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorComentario("");
    setMensajeExito("");

    const textoLimpio = nuevoComentario.trim();

    if (!textoLimpio) {
      setErrorComentario("El comentario no puede estar vacío.");
      return;
    }

    if (!user || !id) {
      setErrorComentario("Debés iniciar sesión para comentar.");
      return;
    }

    try {
      setEnviando(true);
      const userIdActual = user._id || user.id;

      // Enviamos tanto description/content/contenido para compatibilidad total con la API
      const response = await fetch(`${API_URL}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: id,
          userId: userIdActual,
          content: textoLimpio,
          contenido: textoLimpio,
          description: textoLimpio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "No se pudo publicar el comentario."
        );
      }

      // Refrescar la lista de comentarios desde la API
      const resComActualizados = await fetch(`${API_URL}/comments/post/${id}`);
      if (resComActualizados.ok) {
        const listaActualizada: Comment[] = await resComActualizados.json();
        setComentarios(listaActualizada);
      } else {
        setComentarios((prev) => [
          ...prev,
          {
            _id: data._id || data.id || String(Date.now()),
            postId: id,
            userId: user,
            contenido: textoLimpio,
            content: textoLimpio,
          },
        ]);
      }

      setNuevoComentario("");
      setMensajeExito("¡Comentario publicado con éxito!");
    } catch (err) {
      console.error(err);
      setErrorComentario(
        err instanceof Error
          ? err.message
          : "Error al enviar el comentario. Intentá de nuevo."
      );
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-dark" role="status" />
        <p className="mt-2 text-muted">Cargando publicación...</p>
      </div>
    );
  }

  if (errorCarga || !post) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {errorCarga || "No se encontró la publicación."}
        </div>
        <Link to="/" className="btn btn-outline-dark">
          ← Volver al inicio
        </Link>
      </div>
    );
  }

  const textoDescripcion =
    post.descripcion || post.description || "Sin descripción";

  return (
    <div className={`container mt-4 ${styles.contenedorDetalle}`}>
      <div className="mb-3">
        <Link to="/" className="btn btn-sm btn-outline-dark">
          ← Volver al feed
        </Link>
      </div>

      {/* Tarjeta con el detalle del Post */}
      <article className={`card mb-4 ${styles.tarjetaPrincipal}`}>
        {imagenes.length > 0 ? (
          <div className={styles.galeriaImagenes}>
            {imagenes.map((img, idx) => (
              <img
                key={img._id || img.id || idx}
                src={img.url}
                alt={`Imagen ${idx + 1} del post`}
                className={styles.imagenDetalle}
                onError={(e) => {
                  e.currentTarget.src = placeholderPost;
                }}
              />
            ))}
          </div>
        ) : (
          <div className={styles.galeriaImagenes}>
            <img
              src={placeholderPost}
              alt="Sin imagen adjunta"
              className={styles.imagenDetalle}
            />
          </div>
        )}

        <div className="card-body p-4">
          <div className="d-flex align-items-center gap-2 mb-3">
            <img
              src={defaultAvatar}
              alt="Avatar autor"
              className={styles.avatar}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <div>
              <h2 className="h6 m-0 fw-bold">
                @{obtenerNombreUsuario(post.userId)}
              </h2>
              {post.createdAt && (
                <small className="text-muted">
                  {new Date(post.createdAt).toLocaleDateString()}
                </small>
              )}
            </div>
          </div>

          <p className="fs-5 mb-3">{textoDescripcion}</p>

          {/* Etiquetas */}
          {post.tags && post.tags.length > 0 && (
            <div className="d-flex flex-wrap gap-2">
              {post.tags.map((tag, idx) => (
                <span key={idx} className="badge bg-secondary">
                  #{obtenerNombreTag(tag)}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>

      {/* Sección de Comentarios */}
      <section className="mb-4">
        <h3 className="h5 fw-bold mb-3">
          Comentarios visibles ({comentarios.length})
        </h3>

        {comentarios.length === 0 ? (
          <div className="alert alert-light border text-muted">
            Todavía no hay comentarios en esta publicación. ¡Sé el primero en
            comentar!
          </div>
        ) : (
          <div className="d-flex flex-column gap-3 mb-4">
            {comentarios.map((com, idx) => {
              const textoComentario =
                com.contenido ||
                com.content ||
                com.text ||
                (com as unknown as { description?: string }).description ||
                "";

              return (
                <div
                  key={com._id || com.id || idx}
                  className={`p-3 ${styles.tarjetaComentario}`}
                >
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <img
                      src={defaultAvatar}
                      alt="Avatar"
                      className={styles.avatarComentario}
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                    <strong className="small">
                      @{obtenerNombreUsuario(com.userId)}
                    </strong>
                  </div>
                  <p className="mb-0 text-dark">{textoComentario}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Formulario controlado para agregar comentario */}
      <section className={`card p-4 ${styles.tarjetaPrincipal}`}>
        <h4 className="h6 fw-bold mb-3">Agregar un comentario</h4>

        <form onSubmit={handleSubmitComentario} noValidate>
          <div className="mb-3">
            <label htmlFor="nuevoComentario" className="form-label visually-hidden">
              Escribí tu comentario
            </label>
            <textarea
              id="nuevoComentario"
              name="nuevoComentario"
              rows={3}
              className={`form-control ${errorComentario ? "is-invalid" : ""}`}
              placeholder="Escribí tu comentario acá..."
              value={nuevoComentario}
              onChange={(e) => {
                setNuevoComentario(e.target.value);
                setErrorComentario("");
                setMensajeExito("");
              }}
              disabled={enviando}
              required
            />
          </div>

          {errorComentario && (
            <div className="alert alert-danger py-2" role="alert">
              {errorComentario}
            </div>
          )}

          {mensajeExito && (
            <div className="alert alert-success py-2" role="alert">
              {mensajeExito}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-dark"
            disabled={enviando}
          >
            {enviando ? "Publicando..." : "Publicar comentario"}
          </button>
        </form>
      </section>
    </div>
  );
}