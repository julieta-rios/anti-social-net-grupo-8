import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import API_URL from "../../services/api";
import styles from "./Registro.module.css";

const datosIniciales = {
    nickName: "",
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
                body: JSON.stringify({ nickName }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "No se pudo crear el usuario");
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