import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router";
import { useUser } from "../../context/UserContext";
import API_URL from "../../services/api";
import type { Post, Comment, PostImage } from "../../types";
import placeholderPost from "../../assets/placeholder-post.png";
import defaultAvatar from "../../assets/default-avatar.jpg";
import styles from "./DetallePost.module.css";

export default function DetallePost() {
  const { id } = useParams<{ id: string }>();
  const { user, avatarUrl } = useUser();

  const [post, setPost] = useState<Post | null>(null);
  const [imagenes, setImagenes] = useState<PostImage[]>([]);
  const [comentarios, setComentarios] = useState<Comment[]>([]);
  const [likes, setLikes] = useState<Comment[]>([]);

  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");

  // Estados del formulario controlado de comentarios
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [errorComentario, setErrorComentario] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const cargarDetalle = async () => {
      if (!id) {
        setErrorCarga("No se indicó una publicación.");
        setCargando(false);
        return;
      }
      try {
        setCargando(true);
        setErrorCarga("");

        const [resPost, resImg, resCom] = await Promise.all([
          fetch(`${API_URL}/posts/${id}`),
          fetch(`${API_URL}/postimages/post/${id}`),
          fetch(`${API_URL}/comments/post/${id}`),
        ]);

        if (!resPost.ok) {
          throw new Error("No se encontró la publicación solicitada.");
        }

        const dataPost: Post = await resPost.json();
        setPost(dataPost);

        // Cargar imágenes asociadas
        if (resImg.ok) {
          const dataImg: PostImage[] = await resImg.json();
          setImagenes(dataImg);
        } else {
          setImagenes([]);
        }

        // Cargar comentarios visibles
        if (resCom.ok) {
          const dataCom: Comment[] = await resCom.json();
          setComentarios(dataCom);
        } else {
          setComentarios([]);
        }
      } catch (error) {
        console.error(error);
        setErrorCarga(
          error instanceof Error
            ? error.message
            : "Ocurrió un error al cargar la publicación.",
        );
      } finally {
        setCargando(false);
      }
    };

    cargarDetalle();
  }, [id]);

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

      const response = await fetch(`${API_URL}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: textoLimpio,
          userId: user.id,
          postId: Number(id),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "No se pudo publicar el comentario.",
        );
      }

      setNuevoComentario("");
      setMensajeExito("¡Comentario publicado con éxito!");

      //se intenta actualizar la lista
      try {
        const resComentarios = await fetch(`${API_URL}/comments/post/${id}`);

        if (resComentarios.ok) {
          const comentariosActualizados: Comment[] =
            await resComentarios.json();
          setComentarios(comentariosActualizados);
        }
      } catch (error) {
        console.error("No se pudo actualizar la lista de comentarios:", error);
      }
    } catch (error) {
      console.error(error);

      setErrorComentario(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al publicar el comentario. Intentá de nuevo.",
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
            {imagenes.map((imagen) => (
              <img
                key={imagen.id}
                src={imagen.url}
                alt={`Imagen del post`}
                className={styles.imagenDetalle}
                onError={(event) => {
                  event.currentTarget.src = placeholderPost;
                }}
              />
            ))}
          </div>
        ) : (
          <div className={styles.galeriaImagenes}>
            <img
              src={placeholderPost}
              alt="Publicación sin imágenes"
              className={styles.imagenDetalle}
            />
          </div>
        )}

        <div className="card-body p-4">
          <div className="d-flex align-items-center gap-2 mb-3">
            <img
              src={
                Number(
                  localStorage.getItem("user")
                    ? JSON.parse(localStorage.getItem("user")!).id ===
                        post.UserId
                    : false,
                )
                  ? avatarUrl || defaultAvatar
                  : localStorage.getItem(`avatar-${post.UserId}`) ||
                    defaultAvatar
              }
              alt="Avatar del autor"
              className={styles.avatar}
              onError={(event) => {
                event.currentTarget.src = defaultAvatar;
              }}
            />
            <div>
              <h2 className="h6 m-0 fw-bold">@{post.User.nickName}</h2>

              <small className="text-muted">
                {new Date(post.createdAt).toLocaleDateString()}
              </small>
            </div>
          </div>

          <p className="fs-5 mb-3">{post.description}</p>

          {/* Etiquetas */}
          {post.Tags.length > 0 && (
            <div className="d-flex flex-wrap gap-2">
              {post.Tags.map((tag) => (
                <span key={tag.id} className="badge bg-secondary">
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>

      {/* Sección de Comentarios */}
      <section className="mb-4">
        <h3 className="h5 fw-bold mb-3">Comentarios ({comentarios.length})</h3>
        {comentarios.length === 0 ? (
          <div className="alert alert-light border text-muted">
            Todavía no hay comentarios en esta publicación. ¡Sé el primero en
            comentar!
          </div>
        ) : (
          <div className="d-flex flex-column gap-3 mb-4">
            {comentarios.map((comentario) => (
              <div
                key={comentario.id}
                className={`card p-3 mb-3 ${styles.tarjetaComentario}`}
              >
                <div className="d-flex align-items-center gap-2 mb-2">
                  <img
                    src={
                      comentario.UserId === user?.id
                        ? avatarUrl || defaultAvatar
                        : localStorage.getItem(`avatar-${comentario.UserId}`) ||
                          defaultAvatar
                    }
                    alt="Avatar del usuario"
                    className={styles.avatarComentario}
                    onError={(event) => {
                      event.currentTarget.src = defaultAvatar;
                    }}
                  />

                  <strong className="small">@{comentario.User.nickName}</strong>
                </div>

                <p className="mb-1 text-dark">{comentario.content}</p>

                <small className="text-muted">
                  {new Date(comentario.createdAt).toLocaleDateString()}
                </small>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Formulario controlado para agregar comentario */}
      <section className={`card p-4 ${styles.tarjetaPrincipal}`}>
        <h4 className="h6 fw-bold mb-3">Agregar un comentario</h4>

        <form onSubmit={handleSubmitComentario} noValidate>
          <div className="mb-3">
            <label
              htmlFor="nuevoComentario"
              className="form-label visually-hidden"
            >
              Escribí tu comentario
            </label>
            <textarea
              id="nuevoComentario"
              name="nuevoComentario"
              rows={3}
              className={`form-control ${errorComentario ? "is-invalid" : ""}`}
              placeholder="Escribí tu comentario acá..."
              value={nuevoComentario}
              onChange={(event) => {
                setNuevoComentario(event.target.value);
                setErrorComentario("");
                setMensajeExito("");
              }}
              disabled={enviando}
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

          <button type="submit" className="btn btn-dark" disabled={enviando}>
            {enviando ? "Publicando..." : "Publicar comentario"}
          </button>
        </form>
      </section>
    </div>
  );
}
