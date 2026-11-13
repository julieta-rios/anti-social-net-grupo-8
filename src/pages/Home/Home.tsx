import { useEffect, useState } from "react";
import API_URL from "../../services/api";
import type { Post, Tag, PostImage, Comment } from "../../types";
import PostCard from "../../components/PostCard/PostCard";
import styles from "./Home.module.css";
import HomeFeed, { type UsuarioSugerido } from "../../components/Suggested/HomeFeed";

interface PostEnriquecido extends Post {
  imagenesCargadas: PostImage[];
  cantidadComentarios: number;
}

export default function Home() {
  const [posts, setPosts] = useState<PostEnriquecido[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagSeleccionado, setTagSeleccionado] = useState<string>("");
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Carga del estado leyendo de localStorage (por si existe algo guardado previamente)
  const [usuariosSugeridos, setUsuariosSugeridos] = useState<UsuarioSugerido[]>(() => {
    const guardados = localStorage.getItem('usuariosSugeridos');
    if (guardados) {
      try {
        return JSON.parse(guardados);
      } catch {
        // Si hay algún error al parsear, retorna el valor por defecto
      }
    }
    return [
      { id: 1, nombre: 'Sofía Martínez', interes: 'Interés en #Tecnología', avatar: 'https://via.placeholder.com/40', siguiendo: false },
      { id: 2, nombre: 'Carlos Gómez', interes: 'Publicó sobre #React', avatar: 'https://via.placeholder.com/40', siguiendo: false },
      { id: 3, nombre: 'Juan Perez', interes: 'Publicó sobre #TypeScript', avatar: 'https://via.placeholder.com/40', siguiendo: false },
    ];
  });

  // Escritura en localStorage cada vez que el estado de usuariosSugeridos cambia
  useEffect(() => {
    localStorage.setItem('usuariosSugeridos', JSON.stringify(usuariosSugeridos));
  }, [usuariosSugeridos]);

  const handleToggleSeguir = (id: number): void => {
    setUsuariosSugeridos((prev) =>
      prev.map((u) => (u.id === id ? { ...u, siguiendo: !u.siguiendo } : u))
    );
  };

  //Filtro de seguidos
  const usuariosSeguidos = usuariosSugeridos.filter((u) => u.siguiendo);

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
          throw new Error("No se pudieron cargar las publicaciones");
        }

        const dataPosts: Post[] = await resPosts.json();
        const dataTags: Tag[] = resTags.ok ? await resTags.json() : [];

        setTags(dataTags);

        // Cargar imágenes y comentarios de cada publicación
        const postsCompletos = await Promise.all(
          dataPosts.map(async (post) => {
            const postId = post.id;

            let imagenesCargadas: PostImage[] = [];
            let listaComentarios: Comment[] = [];

            try {
              const resImg = await fetch(
                `${API_URL}/postimages/post/${postId}`,
              );

              if (resImg.ok) {
                imagenesCargadas = await resImg.json();
              }
            } catch {
              imagenesCargadas = [];
            }

            try {
              const resCom = await fetch(`${API_URL}/comments/post/${postId}`);

              if (resCom.ok) {
                listaComentarios = await resCom.json();
              }
            } catch {
              listaComentarios = [];
            }

            return {
              ...post,
              imagenesCargadas,
              cantidadComentarios: listaComentarios.length,
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
  }, []);

  // Filtrar publicaciones por etiqueta
  const postsFiltrados = tagSeleccionado
    ? posts.filter((post) =>
      post.Tags.some((tag) => tag.name === tagSeleccionado),
    )
    : posts;

  return (
    <div className={`container mt-4 ${styles.contenedorHome}`}>
      <div className="row g-4">
        {/* Columna principal: publicaciones */}
        <div className="col-lg-8">
          {usuariosSeguidos.length > 0 && (
            <div className="card shadow-sm border-0 p-3 bg-white rounded-4 mb-4">
              <h6 className="fw-bold text-dark mb-3">Siguiendo recientemente</h6>
              <div className="d-flex flex-row gap-3 overflow-auto pb-2">
                {usuariosSeguidos.map((usuario) => (
                  <div
                    key={usuario.id}
                    className="d-flex flex-column align-items-center p-2 border rounded-3 bg-light text-center"
                    style={{ minWidth: '110px', flex: '0 0 auto' }}
                  >
                    <img
                      src={usuario.avatar}
                      alt={usuario.nombre}
                      className="rounded-circle mb-1"
                      style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                    />
                    <span className="small fw-semibold text-dark text-truncate w-100" style={{ fontSize: '0.8rem' }}>
                      {usuario.nombre.split(' ')[0]}
                    </span>
                    <button
                      className="btn btn-outline-danger btn-sm py-0 px-2 mt-1"
                      style={{ fontSize: '0.65rem' }}
                      onClick={() => handleToggleSeguir(usuario.id)}
                    >
                      Dejar de seguir
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
            {/* Filtro por etiquetas */}
            {tags.length > 0 && (
              <div className="d-flex flex-wrap gap-1 align-items-center">
                <button
                  type="button"
                  className={`btn btn-sm ${tagSeleccionado === "" ? "btn-dark" : "btn-outline-dark"
                    }`}
                  onClick={() => setTagSeleccionado("")}
                >
                  Todas
                </button>

                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    className={`btn btn-sm ${tagSeleccionado === tag.name
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
                    imagen={post.imagenesCargadas[0]?.url}
                  />
                </div>
              ))}
          </div>
        </div>
        <div className="col-lg-4">
          <HomeFeed usuarios={usuariosSugeridos} onToggleSeguir={handleToggleSeguir} />
        </div>
      </div>
    </div>
  );
}
