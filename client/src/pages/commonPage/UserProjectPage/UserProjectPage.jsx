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

const UserProjectPage = () => {
  const [activeTab, setActiveTab] = useState("master");
  const [gridData, setGridData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [editRow, setEditRow] = useState(null);
  const [toastData, setToastData] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);

  const fetchMappings = async () => {
    setIsLoading(true);
    try {
      const res = await axiosClient.get("/common/master-grid/DCS_M_USER_PROJECT/null");
      if (res.data?.success) setGridData(res.data.data);
    } catch (err) {
      setError("Failed to fetch user-project mappings");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [userRes, projRes] = await Promise.all([
        axiosClient.get("/common/drop-down/USER/NULL"),
        axiosClient.get("/common/drop-down/PROJECT/NULL")
      ]);
      if (userRes.data?.result) {
        setUserOptions(userRes.data.result.map(i => ({ label: i.Name, value: i.Id })));
      }
      if (projRes.data?.result) {
        setProjectOptions(projRes.data.result.map(i => ({ label: i.Name, value: i.Id })));
      }
    } catch (err) {
      console.error("Failed to fetch dropdowns");
    }
  };

  useEffect(() => {
    fetchMappings();
    fetchDropdowns();
  }, []);

  const fields = [
    { 
      name: "userId", 
      label: "Developer User", 
      type: "select", 
      options: userOptions,
      required: true 
    },
    { 
      name: "projectId", 
      label: "Project", 
      type: "select", 
      options: projectOptions,
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
        userProjectId: editRow?.userProjectId || 0,
        status: r.status ? 1 : 0
      }))[0];
      
      const res = await axiosClient.post("/common/user-project/upsert", payload);
      if (res.data.success) {
        setToastData([{ text: res.data.message, variant: "success" }]);
        fetchMappings();
        setActiveTab("master");
      } else {
        setToastData([{ text: res.data.message, variant: "warning" }]);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Error saving user-project mapping";
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
            <h5><i className="bi bi-info-circle-fill me-2"></i>User-Project Mapping Configuration</h5>
            <p className="mb-0">
              <strong>Usage:</strong> Allocate Projects to Developer Users here. 
              A Developer must be assigned to at least one active project to begin working.
              This connects the core logic of the Automated Code Generator application.
            </p>
          </Alert>

          <TabMenu 
            tabs={[
              { key: "master", label: "Mapping List", onClick: setActiveTab, active: activeTab === "master" },
              { key: "insert", label: "Add/Edit Mapping", onClick: setActiveTab, active: activeTab === "insert" }
            ]} 
          />
          <Row className="mt-4">
            <Col>
              {activeTab === "insert" ? (
                <div className="form-area">
                  <FormGrid 
                    title="User-Project Mapping Allocation" 
                    fields={fields} 
                    onSubmit={handleFormSubmit} 
                    isLoading={isLoading} 
                    defaultValues={editRow} 
                  />
                </div>
              ) : (
                <MasterGrid 
                   title="Developer Project Mappings" 
                   data={gridData} 
                   isLoading={isLoading} 
                   error={error} 
                   moduleName="UserProjectMaster"
                   onEdit={async (row) => {
                     try {
                       setIsLoading(true);
                       const res = await axiosClient.get(`/common/master-grid/editbind/DCS_M_USER_PROJECT/${row.User_Project_ID}`);
                       if (res.data?.success && res.data?.data.length > 0) {
                         const record = res.data.data[0];
                         setEditRow({
                           userProjectId: record.User_Project_ID,
                           // Note: Using the ID here, not the text name
                           userId: record.User_ID, 
                           projectId: record.Project_ID,
                           status: record.C2C_Status === 1,
                           inactiveReason: record.C2C_Inactive_Reason
                         });
                         setActiveTab("insert");
                       } else {
                         setToastData([{ text: "Mapping data not found.", variant: "warning" }]);
                       }
                     } catch (err) {
                       setToastData([{ text: "Error loading edit data.", variant: "danger" }]);
                     } finally {
                       setIsLoading(false);
                     }
                  }} 
                />
              )}
            </Col>
          </Row>
        </Container>
        <Toaster toastData={toastData} setToastData={setToastData} />
      </main>
    </div>
  );
};

export default UserProjectPage;
