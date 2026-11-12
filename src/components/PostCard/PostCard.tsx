
import { Link } from "react-router";
import type { Post } from "../../types";
import defaultAvatar from "../../assets/default-avatar.png";
import styles from "./PostCard.module.css";

interface PostCardProps {
  post: Post;
  cantidadComentarios: number;
  imagen?: string;
}

export default function PostCard({
  post,
  cantidadComentarios,
  imagen,
}: PostCardProps) {
  const tieneImagen = Boolean(imagen?.trim());

  return (
    <article className={styles.postCard}>
      <div className={styles.encabezadoPost}>
        <img
          src={defaultAvatar}
          alt="Avatar del usuario"
          className={styles.avatarPost}
        />

        <div className={styles.datosAutor}>
          <strong>{post.User.nickName}</strong>
          <span>@{post.User.nickName}</span>
        </div>

        <span className={styles.etiquetaPublicacion}>
          Publicación
        </span>
      </div>

      <div className={styles.contenidoPost}>
        <p className={styles.descripcionPost}>
          {post.description}
        </p>

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

      {tieneImagen && (
        <div className={styles.contenedorImagen}>
          <img
            src={imagen}
            alt="Imagen de la publicación"
            className={styles.imagenPost}
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}

      <div className={styles.piePost}>
        <span className={styles.cantidadComentarios}>
          <span aria-hidden="true">♡</span>
          {cantidadComentarios}{" "}
          {cantidadComentarios === 1 ? "comentario" : "comentarios"}
        </span>

        <Link
          to={`/post/${post.id}`}
          className={styles.botonVerMas}
        >
          Ver publicación
          <span aria-hidden="true"> →</span>
        </Link>
      </div>
    </article>
  );
}
