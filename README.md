# UnaHur Anti-Social Net

## Descripción

UnaHur Anti-Social Net es una aplicación web que simula una red social. Permite a los usuarios registrarse e iniciar sesión, compartir publicaciones, comentar, interactuar con el contenido de otros usuarios y consultar perfiles. Además, ofrece funcionalidades para seguir usuarios, dar likes y realizar reposts.

El frontend se comunica con una API REST desarrollada previamente para gestionar los usuarios, las publicaciones y los comentarios.

## Integrantes del proyecto

- Calzon Fabrizio, Ernesto - 47.313.652
- Lucero, Jimena Mariel - 41.688.483
- Perezlindo, Ezequiel Gustavo - 34.499.941
- Rios, Julieta Carolina - 45.206.363
- Roces, Guido Nicolás - 32.140.509

## Tecnologías utilizadas

- **React:** desarrollo de la interfaz de usuario mediante componentes reutilizables.
- **TypeScript:** tipado estático para mejorar la organización y el mantenimiento del código.
- **React Router:** navegación entre las diferentes páginas y gestión de rutas.
- **Bootstrap:** diseño responsive y componentes de interfaz.
- **React-Bootstrap:** integración de componentes de Bootstrap con React.
- **CSS Modules:** estilos específicos para los componentes.
- **Lucide React:** biblioteca de iconos para la interfaz.
- **Vite:** herramienta de desarrollo y compilación del proyecto.
- **Fetch API:** comunicación con la API REST.
- **localStorage:** almacenamiento local de la sesión y determinadas preferencias e interacciones del usuario.

## Instalación y ejecución

### Requisitos previos

- Tener instalado [Node.js](https://nodejs.org/).
- Tener instalado npm, que se incluye con Node.js.
- Tener acceso a los repositorios del frontend y del backend.

### Pasos para instalar y ejecutar el proyecto

#### 1. Clonar e iniciar el backend

1. Clonar el repositorio del backend e instalar las dependencias:

   ```bash
   git clone https://github.com/lucasfigarola/backend-api.git
   cd backend-api
   npm install
   ```

2. Iniciar el servidor del backend utilizando el comando configurado en su proyecto.

#### 2. Clonar e iniciar el frontend

1. Clonar el repositorio del frontend e instalar las dependencias:

   ```bash
   git clone https://github.com/julieta-rios/anti-social-net-grupo-8.git
   cd anti-social-net-grupo-8
   npm install
   ```

2. Configurar las variables de entorno.

   Copiar el archivo de ejemplo `.env.example` a `.env` en la raíz del proyecto:

   ```bash
   cp .env.example .env
   ```

   (En Windows PowerShell: `Copy-Item .env.example .env`)

   El archivo `.env` debe contener la URL del backend:

   ```env
   VITE_API_URL=http://localhost:3001
   ```

3. Iniciar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

4. Abrir en el navegador la dirección que muestra la terminal, generalmente `http://localhost:5173/`.

**Importante:** ambos servidores deben permanecer en ejecución mientras se utiliza la aplicación.

## URL de la API utilizada

La aplicación consume la API REST del backend mediante la siguiente dirección:

```text
http://localhost:3001
```

Esta dirección se configura mediante la variable de entorno `VITE_API_URL` y se utiliza en el archivo `src/services/api.ts`.

## Funcionalidades principales

### 1. Registro e inicio de sesión

- Registro de nuevos usuarios.
- Inicio de sesión mediante nickname y contraseña.
- Validación de los datos ingresados.
- Persistencia de la sesión mediante `localStorage`.
- Protección de rutas que requieren autenticación.

### 2. Inicio y visualización de publicaciones

- Visualización de las publicaciones disponibles.
- Presentación de las publicaciones mediante tarjetas reutilizables.
- Visualización de información del autor y de las imágenes asociadas.
- Acceso a los comentarios de cada publicación.

### 3. Creación de publicaciones

- Formulario para crear nuevas publicaciones.
- Ingreso de una descripción.
- Posibilidad de agregar imágenes a las publicaciones.

### 4. Comentarios

- Visualización de los comentarios de las publicaciones.
- Posibilidad de agregar comentarios.
- Asociación de los comentarios con el usuario que los realiza.

### 5. Perfiles de usuario

- Visualización del perfil propio y de otros usuarios.
- Edición de la información del perfil.
- Personalización del nombre mostrado, descripción y foto de perfil.
- Visualización de las publicaciones y comentarios del usuario.
- Consulta de seguidores y usuarios seguidos.

### 6. Seguimiento de usuarios

- Posibilidad de seguir y dejar de seguir a otros usuarios.
- Visualización de las listas de seguidores y seguidos.
- Actualización de la información de seguimiento en el perfil.

### 7. Interacción con publicaciones

- Posibilidad de dar y quitar likes.
- Visualización de la cantidad de likes.
- Posibilidad de realizar y quitar reposts.
- Visualización de la cantidad de reposts.
- Incorporación de las publicaciones reposteadas al perfil del usuario.

### 8. Diseño adaptable

- Interfaz adaptable a distintos tamaños de pantalla.
- Uso de componentes reutilizables de React.
- Estilos personalizados mediante CSS Modules y componentes de React Bootstrap.

