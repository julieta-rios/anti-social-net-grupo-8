import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import API_URL from "../../services/api";
import { validate } from "../../utils/validacionesRegistro";
import type { ErroresRegistro } from "../../utils/validacionesRegistro";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import styles from "./Registro.module.css";

const datosIniciales = {
  nickName: "",
  email: "",
};

export default function Registro() {
  const [formData, setFormData] = useState(datosIniciales);
  const [errors, setErrors] = useState<ErroresRegistro>({});
  const [errorServidor, setErrorServidor] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [procesando, setProcesando] = useState(false);

  const navigate = useNavigate();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((previo) => ({
      ...previo,
      [name]: value,
    }));

    setErrors((previo) => ({
      ...previo,
      [name]: undefined,
    }));

    setErrorServidor("");
    setMensaje("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorServidor("");
    setMensaje("");

    const nuevosErrores = validate(formData);
    setErrors(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) {
      return;
    }

    try {
      setProcesando(true);

      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickName: formData.nickName.trim(),
          email: formData.email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "No se pudo crear el usuario.",
        );
      }

      setMensaje("¡Tu cuenta fue creada correctamente!");
      setFormData(datosIniciales);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error(error);
      setErrorServidor("Ocurrió un error al registrarse. Intentá nuevamente.");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <AuthLayout>
      <form className={styles.formulario} onSubmit={handleSubmit} noValidate>
        <p>Creá tu cuenta</p>

        <div className="mb-3">
          <label htmlFor="nickName" className="form-label">
            Nombre de usuario
          </label>

          <input
            type="text"
            id="nickName"
            name="nickName"
            className={`form-control ${errors.nickName ? "is-invalid" : ""}`}
            value={formData.nickName}
            onChange={handleChange}
            placeholder="Elegí tu usuario"
            disabled={procesando}
            required
          />
          {errors.nickName && (
            <div className="invalid-feedback">{errors.nickName}</div>
          )}
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Correo electrónico
          </label>

          <input
            type="email"
            id="email"
            name="email"
            className={`form-control ${errors.email ? "is-invalid" : ""}`}
            value={formData.email}
            onChange={handleChange}
            placeholder="tucorreo@gmail.com"
            disabled={procesando}
            required
          />

          {errors.email && (
            <div className="invalid-feedback">{errors.email}</div>
          )}
        </div>

        {errorServidor && (
          <div className="alert alert-danger" role="alert">
            {errorServidor}
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
    </AuthLayout>
  );
}
