import { Link, useNavigate } from "react-router";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { useUser } from "../../context/UserContext";
import logo from "../../assets/logo.png";
import defaultAvatar from "../../assets/default-avatar.png";
import styles from "./Header.module.css";

function Header() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Navbar expand="lg" className={styles.barraNavegacion}>
      <Container className={styles.contenedor}>
        <Navbar.Brand
          as={Link}
          to="/"
          className={`position-absolute top-50 start-50 translate-middle m-0 d-flex align-items-center gap-2 ${styles.logo}`}
        >
          <img
            src={logo}
            alt="Logo"
            style={{ height: "32px", width: "auto" }}
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <span>UnaHur Anti-Social Net</span>
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          aria-label="Abrir menú de navegación"
        />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className={styles.enlace}>
              Inicio
            </Nav.Link>

            <Nav.Link as={Link} to="/crear-post" className={styles.enlace}>
              Crear publicación
            </Nav.Link>
          </Nav>

          <Nav className="ms-auto align-items-center">
            <NavDropdown
              title={
                <span className="d-inline-flex align-items-center gap-2">
                  <img
                    src={defaultAvatar}
                    alt="Avatar"
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                  <span>{user ? user.nickName : "Cuenta"}</span>
                </span>
              }
              id="cuenta-dropdown"
              className={styles.menuDesplegable}
            >
              <NavDropdown.Item
                as={Link}
                to="/perfil"
                className={styles.itemDesplegable}
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
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;