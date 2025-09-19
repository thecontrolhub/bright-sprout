
import './components/Navbar.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';

import Home from './components/Home';
import About from './components/About';
import TheApp from './components/TheApp';
import Features from './components/Features';
import Contact from './components/Contact';

function App() {
  return (
    <Router>
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm custom-navbar fixed-top">
        <Container>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <img
              src="/logo.svg" // Placeholder for your logo
              width="30"
              height="30"
              className="d-inline-block align-top me-2"
              alt="BrightSprout Logo"
            />
            BrightSprout
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/about">About Us</Nav.Link>
              <Nav.Link as={Link} to="/the-app">The App</Nav.Link>
              <Nav.Link as={Link} to="/features">Features</Nav.Link>
              <Nav.Link as={Link} to="/contact">Contact</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/the-app" element={<TheApp />} />
        <Route path="/features" element={<Features />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
}

export default App;