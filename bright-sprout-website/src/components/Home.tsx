import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import './Home.css'; // Import the new CSS file

const Home: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8, staggerChildren: 0.3 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      className="hero-section d-flex align-items-center justify-content-center text-white"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="text-center" style={{ paddingTop: '80px', paddingLeft: '15px', paddingRight: '15px' }}>
        <Row>
          <Col>
            <motion.h1 className="display-3 fw-bold mb-4" variants={itemVariants}>
              Welcome to BrightSprout
            </motion.h1>
            <motion.p className="lead mb-5" variants={itemVariants}>
              Empowering young minds through interactive learning and engaging experiences.
            </motion.p>
            <motion.div variants={itemVariants}>
              <Button className="hero-button"> {/* Use custom class */}
                Discover Our App
              </Button>
            </motion.div>
          </Col>
        </Row>
      </div>
    </motion.div>
  );
};

export default Home;