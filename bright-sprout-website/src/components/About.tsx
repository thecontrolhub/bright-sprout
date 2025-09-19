import React from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';
import { motion } from 'framer-motion';

const About: React.FC = () => {
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
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Container className="my-5 py-5" style={{ paddingTop: '80px' }}>
        <motion.h1 className="text-center display-4 fw-bold mb-5" variants={itemVariants}>
          About Us
        </motion.h1>
        <Row className="align-items-center">
          <Col md={6}>
            <motion.div variants={itemVariants}>
              <Image src="https://via.placeholder.com/500" fluid rounded className="shadow-lg mb-4 mb-md-0" alt="About BrightSprout" />
            </motion.div>
          </Col>
          <Col md={6}>
            <motion.div variants={itemVariants}>
              <p className="lead">
                BrightSprout is dedicated to fostering a love for learning in children through innovative and engaging educational tools. We believe every child deserves access to high-quality, personalized learning experiences that adapt to their unique needs and pace.
              </p>
              <p>
                Our team of educators, developers, and designers work tirelessly to create a platform that is not only effective but also fun and inspiring. We are committed to continuous improvement and incorporating the latest pedagogical research into our app.
              </p>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </motion.div>
  );
};

export default About;
