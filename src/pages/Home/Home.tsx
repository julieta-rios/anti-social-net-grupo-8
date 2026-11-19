import { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import API_URL from "../../services/api";
import type { Post, Tag, PostImage, Comment } from "../../types";
import PostCard from "../../components/PostCard/PostCard";
import styles from "./Home.module.css";

interface PostEnriquecido extends Post {
  imagenesCargadas: PostImage[];
  cantidadComentarios: number;
}

export default function Home() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagSeleccionado, setTagSeleccionado] = useState<string>("");
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const {
    user,
    repostearPost,
    quitarRepost,
    estaReposteando,
    obtenerCantidadReposts,
  } = useUser();

  // Claves para el localStorage
  const globalPostsKey = "postsHome_global";
  const userLikesKey = user
    ? `user_liked_posts_${user.id}`
    : "guest_liked_posts";

  // Estado de un post, (likes,etc)
  const [posts, setPosts] = useState<PostEnriquecido[]>(() => {
    const guardados = localStorage.getItem(globalPostsKey);
    if (guardados) {
      try {
        return JSON.parse(guardados);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Guardar siempre en la clave global para que todos los usuarios compartan el contador
  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem(globalPostsKey, JSON.stringify(posts));
    }
  }, [posts]);

  // Función para manejar los "likes" por ID
  const handleToggleLike = (postId: number) => {
    if (!user) return;

    setPosts((prevPosts) => {
      const nuevosPosts = prevPosts.map((post) => {
        if (post.id === postId) {
          const likedByMe = !post.likedByMe;
          const currentCount = post.likesCount || 0;
          const newCount = likedByMe
            ? currentCount + 1
            : Math.max(0, currentCount - 1);
          return {
            ...post,
            likedByMe,
            likesCount: newCount,
          };
        }
        return post;
      });
      // Actualizamos la lista de IDs a los que este usuario dio like
      const idsQueMeGustan = nuevosPosts
        .filter((p) => p.likedByMe)
        .map((p) => p.id);

      localStorage.setItem(userLikesKey, JSON.stringify(idsQueMeGustan));

      return nuevosPosts;
    });
  };

  const handleToggleRepost = (postId: number) => {
    if (!user) return;

    if (estaReposteando(postId)) {
      quitarRepost(postId);
    } else {
      repostearPost(postId);
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        setError("");

        const [resPosts, resTags] = await Promise.all([
          fetch(`${API_URL}/posts`),
          fetch(`${API_URL}/tags`),
        ]);

        if (!resPosts.ok) {
          throw new Error("No se pudieron cargar las publicaciones.");
        }

        const dataPosts: Post[] = await resPosts.json();
        const dataTags: Tag[] = resTags.ok ? await resTags.json() : [];

        setTags(dataTags);

        const postsGlobalesLocales: PostEnriquecido[] = JSON.parse(
          localStorage.getItem(globalPostsKey) || "[]",
        );

        const misLikesIds: number[] = JSON.parse(
          localStorage.getItem(userLikesKey) || "[]",
        );

        const postsCompletos = await Promise.all(
          dataPosts.map(async (post) => {
            const postId = post.id;
            const postGlobalLocal = postsGlobalesLocales.find(
              (p) => p.id === postId,
            );

            let imagenesCargadas: PostImage[] = [];
            let listaComentarios: Comment[] = [];

            try {
              const resImg = await fetch(
                `${API_URL}/postimages/post/${postId}`,
              );
              if (resImg.ok) imagenesCargadas = await resImg.json();
            } catch {
              imagenesCargadas = [];
            }

            try {
              const resCom = await fetch(`${API_URL}/comments/post/${postId}`);
              if (resCom.ok) listaComentarios = await resCom.json();
            } catch {
              listaComentarios = [];
            }

            const likedByMe = misLikesIds.includes(postId);

            return {
              ...post,
              imagenesCargadas,
              cantidadComentarios: listaComentarios.length,
              likesCount: postGlobalLocal
                ? postGlobalLocal.likesCount
                : post.likesCount || 0,
              likedByMe,
            };
          }),
        );

        setPosts(postsCompletos);
      } catch (err) {
        console.error(err);
        setError("Ocurrió un error al cargar el feed de publicaciones.");
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [user, userLikesKey]);

  // Filtrar publicaciones por etiqueta
  const postsFiltrados = (
    tagSeleccionado
      ? posts.filter((post) =>
          post.Tags.some((tag) => tag.name === tagSeleccionado),
        )
      : [...posts]
                      ).reverse() // orden del mas nuevo al mas viejo;

  return (
    <div className={`container mt-4 ${styles.contenedorHome}`}>
      <div className="row g-4">
        <div className="col-12">
          <span className={styles.textoPublicaciones}>Publicaciones</span>

          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
            {/* Filtro por etiquetas */}
            {tags.length > 0 && (
              <div className="d-flex flex-wrap gap-1 align-items-center">
                <button
                  type="button"
                  className={`btn btn-sm ${
                    tagSeleccionado === "" ? "btn-dark" : "btn-outline-dark"
                  }`}
                  onClick={() => setTagSeleccionado("")}
                >
                  Todas
                </button>

                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    className={`btn btn-sm ${
                      tagSeleccionado === tag.name
                        ? "btn-dark"
                        : "btn-outline-secondary"
                    }`}
                    onClick={() => setTagSeleccionado(tag.name)}
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cargando */}
          {cargando && (
            <div className="text-center py-5">
              <div className="spinner-border text-dark" role="status" />
              <p className="mt-2 text-muted">Cargando publicaciones...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Sin publicaciones */}
          {!cargando && !error && postsFiltrados.length === 0 && (
            <div className="alert alert-secondary text-center py-4">
              No hay publicaciones para mostrar en este momento.
            </div>
          )}

          {/* Tarjetas de publicaciones */}
          <div className="row g-4">
            {!cargando &&
              !error &&
              postsFiltrados.map((post) => (
                <div className="col-12" key={post.id}>
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
        </div>
      </div>
    </div>
  );
}
