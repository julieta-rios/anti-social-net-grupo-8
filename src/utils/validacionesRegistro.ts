interface DatosRegistro {
  nickName: string;
  email: string;
}

export interface ErroresRegistro {
  nickName?: string;
  email?: string;
}

export function validate(formData: DatosRegistro): ErroresRegistro {
  const errors: ErroresRegistro = {};

  const nickName = formData.nickName.trim();
  const email = formData.email.trim();

  if (!nickName) {
    errors.nickName = "El nickname es obligatorio.";
  } else if (nickName.length < 3 || nickName.length > 15) {
    errors.nickName = "El nickname debe tener entre 3 y 15 caracteres.";
  }

  if (!email) {
    errors.email = "El correo electrónico es obligatorio.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Ingresá un correo electrónico válido.";
  }

  return errors;
}
