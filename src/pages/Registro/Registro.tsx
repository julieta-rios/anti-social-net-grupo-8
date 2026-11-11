import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import API_URL from "../../services/api";
import logo from "../../assets/logo.png";
import styles from "./Registro.module.css";

const datosIniciales = {
  nickName: "",
  email: "",
};

export default function Registro() {
  const [formData, setFormData] = useState(datosIniciales);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [procesando, setProcesando] = useState(false);

  const navigate = useNavigate();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((previo) => ({
      ...previo,
      [name]: value,
    }));

    setError("");
    setMensaje("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setMensaje("");

    const nickName = formData.nickName.trim();
    const email = formData.email.trim();

    if (!nickName || !email) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (nickName.length < 3 || nickName.length > 15) {
      setError("El nickname debe tener entre 3 y 15 caracteres");
      return;
    }

    try {
      setProcesando(true);

      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nickName, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "No se pudo crear el usuario");
      }

      setMensaje("¡Tu cuenta fue creada correctamente!");
      setFormData(datosIniciales);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al registrarse"
      );
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className={styles.contenedorRegistro}>
      <form className={styles.formulario} onSubmit={handleSubmit} noValidate>
        <div className="text-center mb-3">
          <img
            src={logo}
            alt="UnaHur Anti-Social Net"
            style={{ maxHeight: "65px", width: "auto" }}
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        </div>

        <h1>¡Sumate a la comunidad!</h1>
        <p>Creá tu cuenta para empezar a compartir</p>

        <div className="mb-3">
          <label htmlFor="nickName" className="form-label">
            Nombre de usuario
          </label>

          <input
            type="text"
            id="nickName"
            name="nickName"
            className={`form-control ${error ? "is-invalid" : ""}`}
            value={formData.nickName}
            onChange={handleChange}
            placeholder="Elegí tu nickName"
            disabled={procesando}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Correo electrónico
          </label>

          <input
            type="email"
            id="email"
            name="email"
            className={`form-control ${error ? "is-invalid" : ""}`}
            value={formData.email}
            onChange={handleChange}
            placeholder="ejemplo@correo.com"
            disabled={procesando}
            required
          />
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {mensaje && (
          <div className="alert alert-success" role="alert">
            {mensaje}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-dark w-100"
          disabled={procesando}
        >
          {procesando ? "Creando cuenta..." : "Registrarme"}
        </button>

        <p className={styles.login}>
          ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
        </p>
      </form>
    </div>
  );
}