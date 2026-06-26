import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import { Container, Row, Col, Card, Spinner, Table } from "react-bootstrap";
import Header from "../../components/Header/Header";
import LeftTabMenu from "../../components/LeftTabMenu/LeftTabMenu";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosClient.get("/common/dashboard/stats");
        if (res.data?.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="master-page">
      <aside className="sidebar">
        <LeftTabMenu />
      </aside>

      <main className="main-content">
        <Header />
        <Container fluid className="px-5 py-5">
          <div className="mb-4">
            <h2 className="fw-bold">Admin Command Center 🛡️</h2>
            <p className="text-muted">Total visibility into your code generation ecosystem.</p>
          </div>

          <Row className="mb-5">
            <Col md={4}>
              <Card className="stats-card h-100 shadow-sm border-0 bg-primary text-white">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-uppercase opacity-75">Generated Procs</h6>
                      <h2 className="fw-bold mb-0">{stats?.totalProcedures || 0}</h2>
                    </div>
                    <div className="fs-1">⚙️</div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="stats-card h-100 shadow-sm border-0 bg-success text-white">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-uppercase opacity-75">Active Projects</h6>
                      <h2 className="fw-bold mb-0">{stats?.activeProjects || 0}</h2>
                    </div>
                    <div className="fs-1">📁</div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="stats-card h-100 shadow-sm border-0 bg-dark text-white">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-uppercase opacity-75">Total Users</h6>
                      <h2 className="fw-bold mb-0">{stats?.totalUsers || 0}</h2>
                    </div>
                    <div className="fs-1">👥</div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
                <Card.Header className="bg-white py-3 border-0">
                  <h5 className="fw-bold mb-0">Recent Generation Activity</h5>
                </Card.Header>
                <Table hover responsive className="mb-0 align-middle">
                  <thead className="bg-light">
                    <tr>
                      <th className="px-4">Procedure Name</th>
                      <th>Module</th>
                      <th>Author</th>
                      <th>Date</th>
                      <th className="text-end px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recentActivity?.map((act, i) => (
                      <tr key={i}>
                        <td className="px-4 fw-semibold text-primary">{act.name}</td>
                        <td>{act.module}</td>
                        <td>{act.author}</td>
                        <td className="text-muted small">{new Date(act.date).toLocaleDateString()}</td>
                        <td className="text-end px-4">
                          <span className="badge bg-success-soft text-success px-3 py-2 rounded-pill">Success</span>
                        </td>
                      </tr>
                    ))}
                    {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">No recent activity found.</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card>
            </Col>
          </Row>
        </Container>
      </main>
    </div>
  );
};

export default AdminDashboard;
