import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate, Link } from "react-router";
import { useUser } from "../../context/UserContext";
import API_URL from "../../services/api";
import type { Tag } from "../../types";
import styles from "./CrearPost.module.css";

function CrearPost() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [descripcion, setDescripcion] = useState("");
  const [imagenes, setImagenes] = useState<string[]>([""]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagsSeleccionados, setTagsSeleccionados] = useState<number[]>([]);

  const [cargandoTags, setCargandoTags] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");
  const [errorDescripcion, setErrorDescripcion] = useState("");

  useEffect(() => {
    const cargarTags = async () => {
      try {
        const response = await fetch(`${API_URL}/tags`);

        if (!response.ok) {
          throw new Error("No se pudieron cargar las etiquetas.");
        }

        const data: Tag[] = await response.json();
        setTags(data);
      } catch (error) {
        console.error(error);
        setError("No se pudieron cargar las etiquetas disponibles.");
      } finally {
        setCargandoTags(false);
      }
    };

    cargarTags();
  }, []);

  const handleImagenChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const nuevasImagenes = [...imagenes];
    nuevasImagenes[index] = event.target.value;
    setImagenes(nuevasImagenes);
  };

  const agregarImagen = () => {
    setImagenes([...imagenes, ""]);
  };

  const eliminarImagen = (index: number) => {
    if (imagenes.length === 1) {
      setImagenes([""]);
      return;
    }
    setImagenes(imagenes.filter((_, i) => i !== index));
  };

  const handleTagChange = (tagId: number) => {
    setTagsSeleccionados((previos) =>
      previos.includes(tagId)
        ? previos.filter((id) => id !== tagId)
        : [...previos, tagId],
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setErrorDescripcion("");

    const descripcionLimpia = descripcion.trim();

    if (!descripcionLimpia) {
      setErrorDescripcion("La descripción es obligatoria.");
      return;
    }

    if (!user) {
      setError("Debés iniciar sesión para crear una publicación.");
      return;
    }

    const imagenesValidas = imagenes
      .map((url) => url.trim())
      .filter((url) => url !== "");

    const urlsInvalidas = imagenesValidas.some((url) => {
      try {
        new URL(url);
        return false;
      } catch {
        return true;
      }
    });

    if (urlsInvalidas) {
      setError("Una o más URLs de imágenes no son válidas.");
      return;
    }

    try {
      setProcesando(true);

      const response = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: descripcionLimpia,
          userId: user.id,
          tagIds: tagsSeleccionados,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "No se pudo crear la publicación.",
        );
      }

      const postId = data.id;

      if (!postId) {
        throw new Error("La publicación se creó, pero no se recibió su ID.");
      }

      // Agregar las imágenes a la publicación creada
      for (const url of imagenesValidas) {
        const responseImagen = await fetch(`${API_URL}/postimages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url,
            postId,
          }),
        });

        if (!responseImagen.ok) {
          throw new Error(
            "La publicación se creó, pero no se pudieron guardar todas las imágenes.",
          );
        }
      }

      navigate(`/post/${postId}`);
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al crear la publicación.",
      );
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className={`container mt-4 ${styles.contenedorCrear}`}>
      <div className="mb-3">
        <Link to="/" className="btn btn-sm btn-outline-dark">
          Volver al inicio
        </Link>
      </div>

      <div className={`card p-4 ${styles.tarjetaCrear}`}>
        <h1 className="h3 fw-bold mb-2">Crear publicación</h1>
        <p className="text-muted mb-4">Compartí algo con la comunidad.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="descripcion" className="form-label fw-semibold">
              Descripción
            </label>

            <textarea
              id="descripcion"
              className={`form-control ${errorDescripcion ? "is-invalid" : ""}`}
              rows={4}
              placeholder="¿Qué querés compartir?"
              value={descripcion}
              onChange={(event) => {
                setDescripcion(event.target.value);
                setErrorDescripcion("");
              }}
            />

            {errorDescripcion && (
              <div className="invalid-feedback">{errorDescripcion}</div>
            )}
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Imágenes</label>

            {imagenes.map((imagen, index) => (
              <div className="d-flex gap-2 mb-2" key={index}>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  value={imagen}
                  onChange={(event) => handleImagenChange(index, event)}
                />

                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={() => eliminarImagen(index)}
                  aria-label="Eliminar imagen"
                >
                  &times;
                </button>
              </div>
            ))}

            <button
              type="button"
              className="btn btn-sm btn-outline-primary mt-2"
              onClick={agregarImagen}
            >
              + Agregar otra imagen
            </button>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Etiquetas</label>

            {cargandoTags ? (
              <p className="text-muted">Cargando etiquetas...</p>
            ) : tags.length === 0 ? (
              <p className="text-muted">No hay etiquetas disponibles.</p>
            ) : (
              <div className="d-flex flex-wrap gap-3">
                {tags.map((tag) => (
                  <div className="form-check" key={tag.id}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`tag-${tag.id}`}
                      checked={tagsSeleccionados.includes(tag.id)}
                      onChange={() => handleTagChange(tag.id)}
                    />

                    <label
                      className="form-check-label"
                      htmlFor={`tag-${tag.id}`}
                    >
                      #{tag.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-dark w-100"
            disabled={procesando || cargandoTags}
          >
            {procesando ? "Publicando..." : "Crear publicación"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CrearPost;
