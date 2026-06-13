import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Form, Button, Card, Alert } from "react-bootstrap";
import "./LoginPage.css";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post("http://localhost:5000/api/common/user/login", {
        username,
        password,
      });

      if (response.data.success) {
        login(response.data.user);
        if (response.data.user.Role === "Admin") {
          navigate("/language");
        } else {
          navigate("/developer-dashboard");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </div>
      <Container className="d-flex align-items-center justify-content-center min-vh-100">
        <Card className="login-card shadow-lg border-0">
          <Card.Body className="p-5">
            <div className="text-center mb-4">
              <div className="brand-logo mb-3">⚡</div>
              <h2 className="brand-name">CodeGen Pro</h2>
              <p className="text-muted">Enter your credentials to continue</p>
            </div>
            {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="username">
                <Form.Label className="small fw-bold">Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="custom-input"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-4" controlId="password">
                <Form.Label className="small fw-bold">Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="custom-input"
                  required
                />
              </Form.Group>
              <Button type="submit" className="w-100 btn-primary-gradient py-2 fw-bold bg-dark border-0">
                Sign In
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default LoginPage;
