import { useEffect, useState } from "react";
import { Link } from "react-router";
import API_URL from "../../services/api";
import type { Post, Tag, PostImage, Comment } from "../../types";
import PostCard from "../../components/PostCard/PostCard";
import heroImg from "../../assets/hero.png";
import styles from "./Home.module.css";

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
      {/* Banner de bienvenida */}
      <section className={`p-4 p-md-5 mb-4 ${styles.heroBanner}`}>
        <div className="row align-items-center">
          <div className="col-md-7 mb-3 mb-md-0">
            <span className="badge bg-light text-dark mb-2">
              UnaHur Anti-Social Net
            </span>

            <h1 className="display-6 fw-bold">
              Conectá sin algoritmos ni distracciones
            </h1>

            <p className="lead mb-3">
              "Menos ruido, más código y mejores ideas." El espacio de la
              comunidad donde compartimos lo que realmente importa.
            </p>

            <Link to="/crear-post" className="btn btn-light fw-semibold">
              + Crear nueva publicación
            </Link>
          </div>

          <div className="col-md-5 text-center">
            <img
              src={heroImg}
              alt="Banner de bienvenida"
              className={styles.heroImagen}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          </div>
        </div>
      </section>

      <div className="row g-4">
        {/* Columna principal: publicaciones */}
        <div className="col-lg-8">
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
            <h2 className="h4 m-0 fw-bold">Publicaciones recientes</h2>

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
                <div className="col-md-6" key={post.id}>
                  <PostCard
                    post={post}
                    cantidadComentarios={post.cantidadComentarios}
                    imagen={post.imagenesCargadas[0]?.url}
                  />
                </div>
              ))}
          </div>
        </div>

        {/* Columna lateral */}
        <div className="col-lg-4">
          <div className={`card p-4 mb-4 ${styles.tarjetaLateral}`}>
            <h3 className="h5 fw-bold mb-2">Sobre nosotros</h3>

            <p className="text-muted mb-0">
              <strong>UnaHur Anti-Social Net</strong> nació como un proyecto de
              Construcción de Interfaces de Usuario. Buscamos volver a las
              raíces de internet: compartir ideas, proyectos y debates entre
              estudiantes sin publicidad invasiva.
            </p>
          </div>

          <div className={`card p-4 mb-4 ${styles.tarjetaLateral}`}>
            <h3 className="h5 fw-bold mb-3">Frases destacadas</h3>

            <blockquote className="blockquote fs-6 mb-3">
              "Primero resolvé el problema. Después, escribí el código."
              <footer className="blockquote-footer mt-1">John Johnson</footer>
            </blockquote>

            <blockquote className="blockquote fs-6 mb-0">
              "El código es como el humor. Cuando tenés que explicarlo, es
              malo."
              <footer className="blockquote-footer mt-1">Cory House</footer>
            </blockquote>
          </div>

          <div className={`card p-4 ${styles.tarjetaLateral}`}>
            <h3 className="h5 fw-bold mb-2">¿Sabías que...? 💡</h3>

            <ul className="text-muted ps-3 mb-0">
              <li className="mb-2">
                El primer sitio web de la historia sigue online y fue creado por
                Tim Berners-Lee en 1991.
              </li>

              <li className="mb-2">
                TypeScript fue lanzado públicamente por Microsoft en octubre de
                2012 tras dos años de desarrollo interno.
              </li>

              <li>
                Las Single Page Applications (SPA) recargan únicamente los datos
                necesarios mediante JSON sin refrescar todo el navegador.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
