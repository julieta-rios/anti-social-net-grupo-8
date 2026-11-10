import { Routes, Route, useLocation } from "react-router";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Registro from "./pages/Registro/Registro";
import DetallePost from "./pages/DetallePost/DetallePost";
import Perfil from "./pages/Perfil/Perfil";
import CrearPost from "./pages/CrearPost/CrearPost";
import Header from "./components/Header/Header";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const location = useLocation();

  return (
    <>
      {!["/login", "/registro"].includes(location.pathname) && <Header />}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/post/:id" element={<DetallePost />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/crear-post" element={<CrearPost />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
