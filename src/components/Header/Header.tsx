import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { useUser } from "../../context/UserContext";
import Avatar from "../../components/Avatar/Avatar";
import defaultAvatar from "../../assets/default-avatar.jpg";
import styles from "./Header.module.css";

function Header() {
  const { user, logout, avatarUrl, nombreMostrar } = useUser();
  const navigate = useNavigate();

  const [expanded, setExpanded] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  const cerrarMenu = () => setExpanded(false);

  useEffect(() => {
    const handleClickFuera = (event: MouseEvent) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        cerrarMenu();
      }
    };

    document.addEventListener("mousedown", handleClickFuera);

    return () => {
      document.removeEventListener("mousedown", handleClickFuera);
    };
  }, []);

  const handleLogout = () => {
    cerrarMenu();
    logout();
    navigate("/login");
  };

  return (
    <Navbar
      expand="lg"
      expanded={expanded}
      onToggle={setExpanded}
      className={styles.barraNavegacion}
      ref={headerRef}
    >
      <Container className={styles.contenedor}>
        <Nav.Link
          as={Link}
          to="/"
          className={styles.titulo}
          onClick={cerrarMenu}
        >
          antisocial_net
        </Nav.Link>
        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          aria-label="Abrir menú de navegación"
        />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto align-items-center">
            <Nav.Link
              as={Link}
              to="/"
              className={styles.enlace}
              onClick={cerrarMenu}
            >
              Inicio
            </Nav.Link>

            {user && (
              <Nav.Link
                as={Link}
                to="/crear-post"
                className={styles.enlace}
                onClick={cerrarMenu}
              >
                Crear publicación
              </Nav.Link>
            )}
          </Nav>

          <Nav className="ms-auto align-items-center">
            {user ? (
              <NavDropdown
                title={
                  <span className="d-inline-flex align-items-center gap-2">
                    <Avatar
                      src={avatarUrl || defaultAvatar}
                      alt="Foto de perfil"
                      className={styles.avatarHeader}
                    />
                    <span>{nombreMostrar.trim() || user?.nickName}</span>
                  </span>
                }
                id="cuenta-dropdown"
                className={styles.menuDesplegable}
              >
                <NavDropdown.Item
                  as={Link}
                  to="/perfil"
                  className={styles.itemDesplegable}
                  onClick={cerrarMenu}
                >
                  Mi perfil
                </NavDropdown.Item>

                <NavDropdown.Divider />

                <NavDropdown.Item
                  onClick={handleLogout}
                  className={styles.itemDesplegable}
                >
                  Cerrar sesión
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link
                  as={Link}
                  to="/login"
                  className={styles.enlace}
                  onClick={cerrarMenu}
                >
                  Iniciar sesión
                </Nav.Link>

                <Nav.Link
                  as={Link}
                  to="/registro"
                  className={styles.enlace}
                  onClick={cerrarMenu}
                >
                  Registrarse
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
