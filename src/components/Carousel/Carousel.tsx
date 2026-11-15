import { useState } from "react";
import type { PostImage } from "../../types";
import styles from "./Carousel.module.css";

interface CarouselProps {
  imagenes: PostImage[];
}

export default function Carousel({ imagenes }: CarouselProps) {
  const [indiceActual, setIndiceActual] = useState(0);

  if (imagenes.length === 0) return null;

  const imagenActual = imagenes[indiceActual];

  const anterior = () => {
    setIndiceActual((indice) =>
      indice === 0 ? imagenes.length - 1 : indice - 1,
    );
  };

  const siguiente = () => {
    setIndiceActual((indice) =>
      indice === imagenes.length - 1 ? 0 : indice + 1,
    );
  };

  return (
    <div className={styles.carousel}>
      <img
        src={imagenActual.url}
        alt={`Imagen ${indiceActual + 1} de la publicación`}
        className={styles.imagen}
      />

      {imagenes.length > 1 && (
        <>
          <button
            type="button"
            className={`${styles.boton} ${styles.botonAnterior}`}
            onClick={anterior}
            aria-label="Imagen anterior"
          >
            ‹
          </button>

          <button
            type="button"
            className={`${styles.boton} ${styles.botonSiguiente}`}
            onClick={siguiente}
            aria-label="Imagen siguiente"
          >
            ›
          </button>

          <div className={styles.indicadores}>
            {Array.from({ length: Math.min(imagenes.length, 3) }).map(
              (_, indice) => (
                <span
                  key={indice}
                  className={`${styles.indicador} ${
                    indice === indiceActual % 3 ? styles.indicadorActivo : ""
                  }`}
                />
              ),
            )}
          </div>
        </>
      )}
    </div>
  );
}
