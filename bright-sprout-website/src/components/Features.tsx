import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';

const Features: React.FC = () => {
  const featuresList = [
    { title: 'Personalized Learning Paths', description: 'Adaptive curriculum tailored to each child\'s pace and style.', icon: '🌟' },
    { title: 'Interactive Lessons', description: 'Engaging activities, games, and quizzes to make learning fun.', icon: '🎮' },
    { title: 'Progress Tracking', description: 'Parents can monitor their child\'s performance and achievements.', icon: '📈' },
    { title: 'Curated Content', description: 'High-quality educational materials developed by experts.', icon: '📚' },
    { title: 'Safe & Secure Environment', description: 'A protected space for children to learn and explore.', icon: '🔒' },
    { title: 'Offline Access', description: 'Learn anytime, anywhere, even without an internet connection.', icon: '✈️' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8, staggerChildren: 0.1 } },
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
          App Features
        </motion.h1>
        <Row xs={1} md={2} lg={3} className="g-4">
          {featuresList.map((feature, index) => (
            <Col key={index}>
              <motion.div variants={itemVariants}>
                <Card className="h-100 shadow-lg border-0 transform-on-hover">
                  <Card.Body className="text-center p-4">
                    <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>{feature.icon}</div>
                    <Card.Title className="h4 fw-bold mb-3">{feature.title}</Card.Title>
                    <Card.Text>{feature.description}</Card.Text>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </Container>
    </motion.div>
  );
};

export default Features;
