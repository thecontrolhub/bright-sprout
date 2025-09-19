import React from 'react';
import { Container, Row, Col, Image, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';

const TheApp: React.FC = () => {
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
        <motion.h1 className="text-center display-4 fw-bold mb-4" variants={itemVariants}>
          The BrightSprout App
        </motion.h1>
        <motion.p className="lead text-center mb-5" variants={itemVariants}>
          Your child's personalized learning companion.
        </motion.p>

        {/* Feature Section 1 */}
        <Row className="align-items-center my-5 py-5">
          <Col md={6}>
            <motion.div variants={itemVariants}>
              <Image src="https://via.placeholder.com/500x300" fluid rounded className="shadow-lg mb-4 mb-md-0" alt="App Feature 1" />
            </motion.div>
          </Col>
          <Col md={6}>
            <motion.div variants={itemVariants}>
              <h2 className="fw-bold mb-3">Interactive Learning Environment</h2>
              <p>
                The BrightSprout app offers a rich and interactive learning environment designed to make education enjoyable and effective. With a wide range of subjects and activities, children can explore new concepts at their own pace.
              </p>
            </motion.div>
          </Col>
        </Row>

        {/* Feature Section 2 */}
        <Row className="align-items-center my-5 py-5 flex-row-reverse">
          <Col md={6}>
            <motion.div variants={itemVariants}>
              <Image src="https://via.placeholder.com/500x300" fluid rounded className="shadow-lg mb-4 mb-md-0" alt="App Feature 2" />
            </motion.div>
          </Col>
          <Col md={6}>
            <motion.div variants={itemVariants}>
              <h2 className="fw-bold mb-3">Adaptive Learning Paths</h2>
              <p>
                Our intelligent adaptive learning paths guide children through personalized content, ensuring they are always challenged but never overwhelmed. The app adjusts to their unique needs and pace, maximizing learning outcomes.
              </p>
            </motion.div>
          </Col>
        </Row>

        {/* Feature Section 3 */}
        <Row className="align-items-center my-5 py-5">
          <Col md={6}>
            <motion.div variants={itemVariants}>
              <Image src="https://via.placeholder.com/500x300" fluid rounded className="shadow-lg mb-4 mb-md-0" alt="App Feature 3" />
            </motion.div>
          </Col>
          <Col md={6}>
            <motion.div variants={itemVariants}>
              <h2 className="fw-bold mb-3">Progress Tracking for Parents</h2>
              <p>
                Parents can easily track their child's progress, monitor performance, and customize learning goals through an intuitive dashboard. Stay informed and involved in your child's educational journey.
              </p>
            </motion.div>
          </Col>
        </Row>

        {/* Call to Action */}
        <Row className="my-5 py-5 text-center">
          <Col>
            <motion.h2 className="fw-bold mb-4" variants={itemVariants}>Ready to get started?</motion.h2>
            <motion.div variants={itemVariants}>
              <Button variant="primary" size="lg" className="px-5 py-3 rounded-pill me-3">
                Download on iOS
              </Button>
              <Button variant="success" size="lg" className="px-5 py-3 rounded-pill">
                Get on Android
              </Button>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </motion.div>
  );
};

export default TheApp;
