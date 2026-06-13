import React, { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";
import Header from "../../../components/Header/Header";
import LeftTabMenu from "../../../components/LeftTabMenu/LeftTabMenu";
import TabMenu from "../../../components/Tabs/TabMenu";
import MasterGrid from "../../../components/MasterGrid/MasterGrid";
import FormGrid from "../../../components/FormGrid/FormGrid";
import { Container, Row, Col, Alert } from "react-bootstrap";
import Toaster from "../../../components/Toaster/Toaster";
import "../../Style.css";

const UserPage = () => {
  const [activeTab, setActiveTab] = useState("master");
  const [gridData, setGridData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [editRow, setEditRow] = useState(null);
  const [toastData, setToastData] = useState([]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await axiosClient.get("/common/master-grid/DCS_M_USER/null");
      if (res.data?.success) setGridData(res.data.data);
    } catch (err) {
      setError("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fields = [
    { name: "username", label: "Username", type: "text", required: true },
    { name: "password", label: "Password", type: "password", required: true },
    { 
      name: "role", 
      label: "Role", 
      type: "select", 
      options: [
        { value: "Admin", label: "Admin" },
        { value: "Developer", label: "Developer" }
      ],
      required: true 
    },
    { name: "status", label: "Status", type: "checkbox" },
    { name: "inactiveReason", label: "Inactive Reason", type: "textarea" }
  ];

  const handleFormSubmit = async (rows) => {
    setIsLoading(true);
    try {
      const payload = rows.map(r => ({
        ...r,
        userId: editRow?.userId || 0,
        status: r.status ? 1 : 0
      }))[0];
      const res = await axiosClient.post("/common/user/upsert", payload);
      if (res.data.success) {
        setToastData([{ text: res.data.message, variant: "success" }]);
        fetchUsers();
        setActiveTab("master");
      } else {
        setToastData([{ text: res.data.message, variant: "warning" }]);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Error saving user";
      setToastData([{ text: errorMsg, variant: "danger" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="master-page">
      <aside className="sidebar">
        <LeftTabMenu />
      </aside>
      <main className="main-content">
        <Header />
        <Container fluid className="py-4">
          <Alert variant="info" className="mb-4 shadow-sm">
            <h5><i className="bi bi-info-circle-fill me-2"></i>User Management</h5>
            <p className="mb-0">
              <strong>Usage:</strong> Administer system users. Create 'Admin' accounts for full configuration access or 'Developer' accounts for the team to use the Code Generator tools.
            </p>
          </Alert>
          <TabMenu 
            tabs={[
              { key: "master", label: "User List", onClick: setActiveTab, active: activeTab === "master" },
              { key: "insert", label: "Add/Edit User", onClick: setActiveTab, active: activeTab === "insert" }
            ]} 
          />
          <Row className="mt-4">
            <Col>
              {activeTab === "insert" ? (
                <FormGrid title="User Management" fields={fields} onSubmit={handleFormSubmit} isLoading={isLoading} defaultValues={editRow} />
              ) : (
                <MasterGrid title="Users" data={gridData} isLoading={isLoading} error={error} onEdit={(row) => {
                   setEditRow({
                     userId: row.User_ID,
                     username: row.Username,
                     role: row.Role,
                     status: row.C2C_Status === 1,
                     inactiveReason: row.C2C_Inactive_Reason
                   });
                   setActiveTab("insert");
                }} />
              )}
            </Col>
          </Row>
        </Container>
        <Toaster toastData={toastData} setToastData={setToastData} />
      </main>
    </div>
  );
};

export default UserPage;
