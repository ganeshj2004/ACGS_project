import React, { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";
import Header from "../../../components/Header/Header";
import LeftTabMenu from "../../../components/LeftTabMenu/LeftTabMenu";
import TabMenu from "../../../components/Tabs/TabMenu";
import FormGrid from "../../../components/FormGrid/FormGrid";
import MasterGrid from "../../../components/MasterGrid/MasterGrid";
import { Container, Row, Col, Alert } from "react-bootstrap";
import Toaster from "../../../components/Toaster/Toaster";
import "../../Style.css";

const DbConnectionPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [serverResponse, setServerResponse] = useState(null);
  const [activeTab, setActiveTab] = useState("master");
  const [gridData, setGridData] = useState([]);
  const [error, setError] = useState("");
  const [editRow, setEditRow] = useState(null);
  const [toastData, setToastData] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);

  //  Fetch Dropdown Data (Project List)
  const fetchProjects = async () => {
    try {
      const res = await axiosClient.get("/common/drop-down/PROJECT/NULL");
      if (res.data?.result && Array.isArray(res.data.result)) {
        const formatted = res.data.result.map((item) => ({
          label: item.Name,
          value: item.Id,
        }));
        setProjectOptions(formatted);
        console.log("Fetched project options:", formatted);
      } else {
        console.warn("Invalid response structure:", res.data);
      }
    } catch (err) {
      console.error("Failed to fetch project dropdown:", err);
    }
  };

  //  Fetch Master Grid Data
  const fetchMasterGrid = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axiosClient.get(
        "/common/master-grid/DCS_M_DB_CONNECTION/null"
      );
      if (res.data?.success && Array.isArray(res.data.data)) {
        setGridData(res.data.data);
      } else {
        setError("Invalid response format.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch master grid data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchMasterGrid();
  }, []);
  console.log("Project Options:", projectOptions);
  //  DB Connection Form Fields
  const fields = [
    {
      name: "dbName",
      label: "Database Name",
      type: "text",
      required: true,
      validate: (value) => {
        if (!value?.trim()) return "Database name is required";
        if (!/^[A-Za-z0-9_]+$/.test(value))
          return "Database name can only contain letters, numbers, and underscores";
        if (value.length < 3)
          return "Database name must be at least 3 characters";
        return true;
      },
    },
    {
      name: "serverName",
      label: "Server Name",
      type: "text",
      required: true,
      validate: (value) => {
        if (!value?.trim()) return "Server name is required";
        // Allow domain or IP formats
        if (!/^[A-Za-z0-9.\-_]+$/.test(value))
          return "Server name can contain letters, numbers, dots, and dashes only";
        return true;
      },
    },
    {
      name: "userName",
      label: "Username",
      type: "text",
      required: true,
      validate: (value) => {
        if (!value?.trim()) return "Username is required";
        if (value.length < 3) return "Username must be at least 3 characters";
        if (!/^[A-Za-z0-9_.-]+$/.test(value))
          return "Username can only contain letters, numbers, underscores, dots, and dashes";
        return true;
      },
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      required: true,
      validate: (value) => {
        if (!value) return "Password is required";
        if (value.length < 8)
          return "Password must be at least 8 characters long";
        if (!/[A-Z]/.test(value))
          return "Password must contain at least one uppercase letter";
        if (!/[a-z]/.test(value))
          return "Password must contain at least one lowercase letter";
        if (!/[0-9]/.test(value))
          return "Password must contain at least one number";
        if (!/[!@#$%^&*]/.test(value))
          return "Password must contain at least one special character (!@#$%^&*)";
        return true;
      },
    },
    {
      name: "projectId",
      label: "Project",
      type: "select",
      required: true,
      options: projectOptions,
      validate: (value) => {
        if (!value || value === "0") return "Project selection is required";
        return true;
      },
    },
    {
      name: "companyName",
      label: "Company Name",
      type: "text",
      required: true,
      validate: (value) => {
        if (!value?.trim()) return "Company name is required";
        if (!/^[A-Za-z0-9\s&.,-]+$/.test(value))
          return "Company name contains invalid characters";
        if (value.length < 2)
          return "Company name must be at least 2 characters long";
        return true;
      },
    },
    {
      name: "status",
      label: "Status",
      type: "checkbox",
      required: true,
    },
    {
      name: "inactiveReason",
      label: "Inactive Reason",
      type: "textarea",
      required: false,
      validate: (value, row) => {
        // required only if status = false
        if (row.status === false) {
          if (!value?.trim())
            return "Inactive reason is required when status is inactive";
          if (value.length < 5)
            return "Inactive reason must be at least 5 characters";
        }
        return true;
      },
    },
    {
      name: "createdUser",
      label: "Created User",
      type: "number",
      hidden: true,
    },
  ];

  // ✅ Tabs Configuration
  const tabs = [
    {
      key: "master",
      label: "Master Grid",
      onClick: (key) => setActiveTab(key),
      active: activeTab === "master",
    },
    {
      key: "insert",
      label: "Insert DB Connection",
      onClick: (key) => setActiveTab(key),
      active: activeTab === "insert",
    },
  ];

  //  Submit Handler
  const handleFormSubmit = async (rows) => {
    setIsLoading(true);
    setServerResponse(null);
    try {
      const payload = rows.map((r) => ({
        ...r,
        dbConnectionId: editRow?.dbConnectionId || 0,
      }));

      const res = await axiosClient.post("/common/dbConnection/names", payload);
      const data = res.data;
      setServerResponse(data);

      if (data.success && !data.failedConnections?.length) {
        setToastData([
          {
            text: data.message || "DB Connection saved successfully.",
            variant: "success",
          },
        ]);
        await fetchMasterGrid();
        setEditRow(null);
        setActiveTab("master");
        return;
      }

      if (data.failedConnections?.length > 0) {
        const summaryToast = {
          text: `${data.message} — Total: ${data.summary.total}, Inserted: ${data.summary.inserted}, Failed: ${data.summary.failed}`,
          variant: "warning",
        };

        const failedToasts = data.failedConnections.map((f) => ({
          text: `❌ ${f.dbConnection.dbName}: ${f.error}`,
          variant: "danger",
        }));

        setToastData([summaryToast, ...failedToasts]);
        return;
      }

      setToastData([
        { text: data.message || "Unexpected response.", variant: "warning" },
      ]);
    } catch (err) {
      console.error(err);
      setToastData([
        {
          text: err.response?.data?.message || "Error submitting form.",
          variant: "danger",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  //  Edit Handler
  const handleEdit = async (rowData) => {
    try {
      const id = rowData.DB_CONNECTION_ID;
      if (!id) {
        console.error("Invalid DB_CONNECTION_ID for editing:", rowData);
        return;
      }
      setIsLoading(true);

      const res = await axiosClient.get(
        `/common/master-grid/editbind/DCS_M_DB_CONNECTION/${id}`
      );

      if (res.data?.success && res.data?.data.length > 0) {
        const record = res.data.data[0];

        const mappedRow = {
          dbConnectionId: record.DB_CONNECTION_ID || 0,
          dbName: record.DB_NAME || "",
          serverName: record.SERVER_NAME || "",
          userName: record.USER_NAME || "",
          password: record.PASSWORD || "",
          projectId: record.PROJECT_ID || "",
          companyName: record.COMPANY_NAME || "",
          status: record.C2C_Status === 1,
          inactiveReason: record.C2C_Inactive_Reason || "",
          createdUser: record.C2C_Cuser || 1,
          createdDate: record.C2C_Cdate || "",
        };

        console.log("Fetched Edit Data:", mappedRow);

        setEditRow(mappedRow);
        setActiveTab("insert");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setError("No data found for the selected DB_CONNECTION record.");
      }
    } catch (error) {
      console.error("Edit fetch failed:", err);
      setError("Failed to fetch record for editing.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="master-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <LeftTabMenu />
      </aside>

      {/* Main Area */}
      <main className="main-content">
        <Header />

        <Container fluid className="py-4">
          <Alert variant="info" className="mb-4 shadow-sm">
            <h5><i className="bi bi-info-circle-fill me-2"></i>Database Connection Configuration</h5>
            <p className="mb-0">
              <strong>Usage:</strong> Register the target databases for your Projects. 
              The Code Generator uses these credentials to introspect schemas and auto-generate stored procedures.
            </p>
          </Alert>
          {/* Tabs */}
          <TabMenu tabs={tabs} variant="tabs" defaultActiveKey="master" />

          {/* Grid / Form */}
          <Row className="mt-4">
            <Col xs={12}>
              {activeTab === "insert" ? (
                <div className="form-area">
                  <FormGrid
                    title="DB Connection Creation"
                    fields={fields}
                    onSubmit={handleFormSubmit}
                    isLoading={isLoading}
                    serverResponse={serverResponse}
                    defaultValues={editRow}
                  />
                </div>
              ) : (
                <MasterGrid
                  title="DB Connection Master Grid"
                  data={gridData}
                  isLoading={isLoading}
                  error={error}
                  moduleName="DbConnectionMaster"
                  onEdit={handleEdit}
                />
              )}
            </Col>
          </Row>
        </Container>

        {/* Toast Notifications */}
        <Toaster toastData={toastData} setToastData={setToastData} />
      </main>
    </div>
  );
};

export default DbConnectionPage;
