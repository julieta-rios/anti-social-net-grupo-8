import { Link } from "react-router";
import type { Post, PostImage } from "../../types";
import { useUser } from "../../context/UserContext";
import { Heart, Repeat2, MessageCircle } from "lucide-react";
import Avatar from "../Avatar/Avatar";
import Carousel from "../Carousel/Carousel";
import defaultAvatar from "../../assets/default-avatar.jpg";
import styles from "./PostCard.module.css";

interface PostCardProps {
  post: Post;
  cantidadComentarios: number;
  cantidadReposts: number;
  imagenes: PostImage[];
  onToggleLike: (postId: number) => void; // <-- Nueva prop para manejar el like
  onToggleShare: (postId: number) => void;
  onToggleRepost: (postId: number) => void;
  estaReposteando: boolean;
}

export default function PostCard({
  post,
  cantidadComentarios,
  cantidadReposts,
  imagenes = [],
  onToggleLike,
  onToggleShare,
  onToggleRepost,
  repostearPost,
  quitarRepost,
  estaReposteando,
  obtenerIdsReposteados,
  obtenerCantidadReposts,
}: PostCardProps) {
  const { user, avatarUrl, nombreMostrar } = useUser();

  // recupera el avatar correspondiente al autor del post
  const avatarAutor =
    user?.id === post.UserId
      ? avatarUrl
      : localStorage.getItem(`avatar-${post.UserId}`) || "";

  const nombreAutor =
    user?.id === post.UserId
      ? nombreMostrar.trim() || post.User.nickName
      : localStorage.getItem(`nombre-${post.UserId}`)?.trim() ||
      post.User.nickName;

       const handleLike = () => {
    if (!user) return;
    onToggleLike(post.id);
  };

  const handleRepost = () => {
    if (!user) return;
    onToggleRepost(post.id);
  };

  return (
    <article className={styles.postCard}>
      <div className={styles.encabezadoPost}>
        <Link
          to={`/perfil/${post.UserId}`}
          className={styles.enlaceAutor}
          aria-label={`Visitar perfil de ${post.User.nickName}`}
        >
          <Avatar
            src={avatarAutor || defaultAvatar}
            alt={`Avatar de ${post.User.nickName}`}
            className={styles.avatarPost}
          />
        </Link>

        <Link to={`/perfil/${post.UserId}`} className={styles.enlaceAutor}>
          <div className={styles.datosAutor}>
            <strong>{nombreAutor}</strong>
            <span>@{post.User.nickName}</span>
          </div>
        </Link>
      </div>

      <div className={styles.contenidoPost}>
        <p className={styles.descripcionPost}>{post.description}</p>

        {post.Tags.length > 0 && (
          <div className={styles.listaTags}>
            {post.Tags.map((tag) => (
              <span key={tag.id} className={styles.tag}>
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {imagenes.length > 0 && (
        <div className={styles.contenedorImagen}>
          <Carousel imagenes={imagenes} />
        </div>
      )}

      <div className={styles.piePost}>
        <div className={styles.accionesPost}>
          <button
            type="button"
            className={`${styles.botonAccion} ${post.likedByMe ? styles.liked : ""}`}
            onClick={handleLike}
            disabled={!user}
            aria-label={post.likedByMe ? "Quitar me gusta" : "Dar me gusta"}
          >
            <Heart
              size={19}
              fill={post.likedByMe ? "currentColor" : "none"}
            />
            <span>{post.likesCount || 0}</span>
          </button>

          <button
            type="button"
            className={`${styles.botonAccion} ${
              estaReposteando ? styles.reposteado : ""
            }`}
            onClick={handleRepost}
            disabled={!user}
            aria-label={estaReposteando ? "Quitar repost" : "Repostear publicación"}
            title={estaReposteando ? "Quitar repost" : "Repostear"}
          >
            <Repeat2 size={19} />
            <span>{cantidadReposts}</span>
          </button>

          <Link
            to={`/post/${post.id}`}
            className={styles.botonAccion}
            aria-label="Ver comentarios"
          >
            <MessageCircle size={19} />
            <span>
              {cantidadComentarios}{" "}
              {cantidadComentarios === 1 ? "comentario" : "comentarios"}
            </span>
          </Link>
        </div>

        <Link to={`/post/${post.id}`} className={styles.botonVerMas}>
          Ver publicación
          <span aria-hidden="true"> →</span>
        </Link>
      </div>
    </article>
  );
}
