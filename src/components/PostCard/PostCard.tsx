import { Link } from "react-router";
import type { Post } from "../../types";
import placeholderPost from "../../assets/placeholder-post.png";
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
  return (
    <article className={`card h-100 ${styles.postCard}`}>
      <img
        src={imagen || placeholderPost}
        alt="Imagen de la publicación"
        className={styles.imagenPost}
        onError={(event) => {
          event.currentTarget.src = placeholderPost;
        }}
      />

      <div className="card-body d-flex flex-column">
        <div className="d-flex align-items-center gap-2 mb-3">
          <strong className="small">@{post.User.nickName}</strong>
        </div>

        <p className="card-text flex-grow-1">{post.description}</p>

        {post.Tags.length > 0 && (
          <div className="d-flex flex-wrap gap-2 mb-3">
            {post.Tags.map((tag) => (
              <span key={tag.id} className="badge bg-secondary">
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center pt-3 border-top">
          <small className="text-muted">
            💬 {cantidadComentarios}{" "}
            {cantidadComentarios === 1 ? "comentario" : "comentarios"}
          </small>

          <Link to={`/post/${post.id}`} className="btn btn-sm btn-dark">
            Ver más
          </Link>
        </div>
      </div>
    </article>
  );
}
