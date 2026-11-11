import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { useUser } from "../../context/UserContext";
import API_URL from "../../services/api";
import type { User } from "../../types";
import logo from "../../assets/logo.png";
import styles from "./Login.module.css";

const datosIniciales = {
  nickName: "",
  password: "",
};

export default function Login() {
  const [formData, setFormData] = useState(datosIniciales);
  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState(false);

  const { login } = useUser();
  const navigate = useNavigate();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((previo) => ({
      ...previo,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!formData.nickName.trim() || !formData.password.trim()) {
      setError("Por favor, completá todos los campos requeridos");
      return;
    }

    if (formData.password !== "123456") {
      setError("La contraseña es incorrecta");
      return;
    }

    try {
      setProcesando(true);

      const response = await fetch(`${API_URL}/users`);

      if (!response.ok) {
        throw new Error("No se pudieron obtener los usuarios");
      }

      const users: User[] = await response.json();

      const usuarioEncontrado = users.find(
        (user) =>
          user.nickName.toLowerCase() ===
          formData.nickName.trim().toLowerCase()
      );

      if (!usuarioEncontrado) {
        setError("No existe un usuario con ese nickName");
        return;
      }

      login(usuarioEncontrado);
      navigate("/");
    } catch (error) {
      console.error(error);
      setError("Ocurrió un error al iniciar sesión. Intentá nuevamente.");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className={styles.contenedorLogin}>
      <form className={styles.formulario} onSubmit={handleSubmit} noValidate>
        <div className="text-center mb-3">
          <img
            src={logo}
            alt="UnaHur Anti-Social Net"
            style={{ maxHeight: "65px", width: "auto" }}
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        </div>

        <h1>¡Hola de nuevo!</h1>
        <p>Iniciá sesión para continuar</p>

        <div className="mb-3">
          <label htmlFor="nickName" className="form-label">
            Nombre de usuario
          </label>
          <input
            type="text"
            id="nickName"
            name="nickName"
            className="form-control"
            value={formData.nickName}
            onChange={handleChange}
            placeholder="Ingresá tu nickName"
            disabled={procesando}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
            placeholder="Ingresá tu contraseña"
            disabled={procesando}
            required
          />
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-dark w-100"
          disabled={procesando}
        >
          {procesando ? "Ingresando..." : "Iniciar sesión"}
        </button>

        <p className={styles.registro}>
          ¿Todavía no tenés cuenta? <Link to="/registro">Registrate</Link>
        </p>
      </form>
    </div>
  );
}