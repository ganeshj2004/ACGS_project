import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { Container, Row, Col, Card, Button, Spinner, Alert } from "react-bootstrap";
import "./DeveloperDashboard.css";
import Header from "../../components/Header/Header";
import LeftTabMenu from "../../components/LeftTabMenu/LeftTabMenu";

const DeveloperDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignedProjects = async () => {
      if (!user?.User_ID) {
        setLoading(false);
        setError("Session error. Please log in again.");
        return;
      }
      try {
        setError("");
        const response = await axiosClient.get(`/common/user/developer-projects/${user.User_ID}`);
        if (response.data.success) {
          setProjects(response.data.projects || []);
        } else {
          setError("Failed to load your projects. Please try again.");
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError(err.response?.data?.message || "Could not connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedProjects();
  }, [user]);

  const handleProjectSelect = (projectId) => {
    navigate(`/gen-page?projectId=${projectId}`);
  };

  return (
    <div className="master-page">
      <aside className="sidebar">
        <LeftTabMenu />
      </aside>

      <main className="main-content">
        <Header />
        <Container fluid className="px-5 py-5">
          <div className="dashboard-hero">
            <h1 className="fw-black display-5 mb-2">Welcome back, {user?.Username}! 👋</h1>
            <p className="text-muted fs-5 mb-0">You have {projects.length} project(s) assigned to your workspace.</p>
          </div>

          {loading ? (
            <div className="d-flex flex-column align-items-center justify-content-center py-5">
              <Spinner animation="border" variant="primary" size="lg" />
              <p className="mt-4 text-muted fw-medium">Configuring your development environment...</p>
            </div>
          ) : error ? (
            <Alert variant="danger" className="alert-modern shadow-sm border-0 bg-white">
              <Alert.Heading className="text-danger">⚠️ Connection Issue</Alert.Heading>
              <p className="text-muted mb-0">{error}</p>
              <div className="mt-3">
                <Button variant="outline-danger" size="sm" onClick={() => window.location.reload()}>Retry Connection</Button>
              </div>
            </Alert>
          ) : (
            <div className="project-grid mt-4">
              <Row>
                {projects.length > 0 ? (
                  projects.map((project) => (
                    <Col key={project.PROJECT_ID} lg={4} md={6} className="mb-4">
                      <Card className="project-card shadow-sm border-0">
                        <Card.Body className="p-4 d-flex flex-column">
                          <div className="project-icon">📂</div>
                          <h4 className="fw-bold mb-2">{project.PROJECT_NAME}</h4>
                          <p className="text-muted small mb-4 flex-grow-1">
                            Access your modules, database connections, and generate optimized procedures for this project.
                          </p>
                          <Button
                            variant="primary"
                            className="btn-work w-100 mt-auto shadow-sm"
                            onClick={() => handleProjectSelect(project.PROJECT_ID)}
                          >
                            Work on Project →
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))
                ) : (
                  <Col>
                    <Card className="alert-modern shadow-sm border-0 py-5">
                      <div className="text-center">
                        <div className="display-1 mb-4">🚀</div>
                        <h2 className="fw-bold text-dark">Get Started with Your First Project</h2>
                        <p className="text-muted mb-5 mx-auto" style={{maxWidth: '500px'}}>
                          You haven't been assigned any projects yet. Reach out to your system administrator to get started with your development workspace.
                        </p>
                        <Button variant="dark" className="px-5 py-3 rounded-pill fw-bold" onClick={() => navigate('/login')}>
                          Return to Login
                        </Button>
                      </div>
                    </Card>
                  </Col>
                )}
              </Row>
            </div>
          )}
        </Container>
      </main>
    </div>
  );
};

export default DeveloperDashboard;
