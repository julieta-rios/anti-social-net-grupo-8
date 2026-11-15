import { Link } from "react-router";
import type { Post, PostImage } from "../../types";
import { useUser } from "../../context/UserContext";
import Avatar from "../Avatar/Avatar";
import Carousel from "../Carousel/Carousel";
import defaultAvatar from "../../assets/default-avatar.jpg";
import styles from "./PostCard.module.css";

interface PostCardProps {
  post: Post;
  cantidadComentarios: number;
  imagenes: PostImage[];
}

export default function PostCard({
  post,
  cantidadComentarios,
  imagenes = [],
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
        <Link to={`/post/${post.id}`} className={styles.cantidadComentarios}>
          <span aria-hidden="true">💬</span>
          {cantidadComentarios}{" "}
          {cantidadComentarios === 1 ? "comentario" : "comentarios"}
        </Link>

        <Link to={`/post/${post.id}`} className={styles.botonVerMas}>
          Ver publicación
          <span aria-hidden="true"> →</span>
        </Link>
      </div>
    </article>
  );
}
