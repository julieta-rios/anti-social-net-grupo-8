import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import styles from "./Header.module.css";

function Header() {
  return (
    <Navbar expand="lg" className={styles.barraNavegacion}>
      <Container className="position-relative">
        <Navbar.Brand 
          href="/" 
          className={`position-absolute top-50 start-50 translate-middle m-0 ${styles.logo}`}
        >
          cammelcase
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="ms-auto" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/" className={styles.enlace}>Inicio</Nav.Link>
          </Nav>
          <Nav className="ms-auto align-items-center">
            <NavDropdown title="Cuenta" id="cuenta-dropdown" className={styles.menuDesplegable}>
              <NavDropdown.Item href="#registro" className={styles.itemDesplegable}>
                Crear cuenta
              </NavDropdown.Item>
              <NavDropdown.Item href="#login" className={styles.itemDesplegable}>
                Iniciar sesión
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;