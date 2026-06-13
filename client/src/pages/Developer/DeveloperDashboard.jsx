import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import "./DeveloperDashboard.css";
import Header from "../../components/Header/Header";
import LeftTabMenu from "../../components/LeftTabMenu/LeftTabMenu";

const DeveloperDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignedProjects = async () => {
      try {
        const response = await axiosClient.get(`/common/user/developer-projects/${user.User_ID}`);
        if (response.data.success) {
          setProjects(response.data.projects);
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };


    if (user) {
      fetchAssignedProjects();
    }
  }, [user]);

  const handleProjectSelect = (projectId) => {
    // Navigate to GenPage with pre-selected project
    navigate(`/gen-page?projectId=${projectId}`);
  };

  return (
    <div className="master-page">
      <aside className="sidebar">
        <LeftTabMenu />
      </aside>

      <main className="main-content">
        <Header />
        <Container fluid className="py-4">
          <div className="mb-4">
            <h2 className="fw-bold">Welcome back, {user?.Username}! 👋</h2>
            <p className="text-muted">Select a project you are working on to generate code.</p>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <Row>
              {projects.length > 0 ? (
                projects.map((project) => (
                  <Col key={project.PROJECT_ID} md={4} className="mb-4">
                    <Card className="project-card h-100 shadow-sm border-0">
                      <Card.Body className="d-flex flex-column">
                        <div className="project-icon mb-3">📁</div>
                        <Card.Title className="fw-bold mb-2">{project.PROJECT_NAME}</Card.Title>
                        <Card.Text className="text-muted small mb-4">
                          Associated modules and tables are ready for generation.
                        </Card.Text>
                        <Button 
                          variant="dark" 
                          className="mt-auto fw-bold"
                          onClick={() => handleProjectSelect(project.PROJECT_ID)}
                        >
                          Work on Project
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col>
                  <Alert variant="info">No projects assigned to you yet. Please contact your Admin.</Alert>
                </Col>
              )}
            </Row>
          )}
        </Container>
      </main>
    </div>
  );
};

export default DeveloperDashboard;
