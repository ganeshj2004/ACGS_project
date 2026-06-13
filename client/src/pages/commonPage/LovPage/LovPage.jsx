import React, { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";
import Header from "../../../components/Header/Header";
import LeftTabMenu from "../../../components/LeftTabMenu/LeftTabMenu";
import TabMenu from "../../../components/Tabs/TabMenu";
import MasterGrid from "../../../components/MasterGrid/MasterGrid";
import FormGrid from "../../../components/FormGrid/FormGrid";
import Toaster from "../../../components/Toaster/Toaster";
import { Container, Row, Col, Alert } from "react-bootstrap";
import "../../Style.css";

const LovPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [serverResponse, setServerResponse] = useState(null);
  const [activeTab, setActiveTab] = useState("master");
  const [gridData, setGridData] = useState([]);
  const [error, setError] = useState("");
  const [editRow, setEditRow] = useState(null);
  const [toastData, setToastData] = useState([]);

  const fetchMasterGrid = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axiosClient.get(
        "/common/master-grid/DCS_M_LIST_OF_VALUES/null"
      );
      if (res.data?.success && Array.isArray(res.data.data)) {
        setGridData(res.data.data);
      } else {
        setError("Invalid response format.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch LOV master grid data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterGrid();
  }, []);

  //  LOV Form Fields
  const fields = [
    {
      name: "lovName",
      label: "LOV Name",
      type: "text",
      required: true,
      validate: (value) => {
        if (!value?.trim()) return "LOV name is required";
        if (!/^[A-Za-z0-9\s._-]+$/.test(value))
          return "LOV name can only contain letters, numbers, spaces, dots, underscores, or hyphens";
        if (value.length < 2)
          return "LOV name must be at least 2 characters long";
        if (value.length > 100) return "LOV name cannot exceed 100 characters";
        return true;
      },
    },
    {
      name: "lovDescription",
      label: "LOV Description",
      type: "textarea",
      required: false,
      validate: (value) => {
        if (value?.trim() && value.length < 5)
          return "Description must be at least 5 characters long";
        if (value?.length > 300)
          return "Description cannot exceed 300 characters";
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
        if (row.status === false) {
          if (!value?.trim())
            return "Inactive reason is required when status is inactive";
          if (value.length < 5)
            return "Inactive reason must be at least 5 characters long";
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

  // Tabs Configuration
  const tabs = [
    {
      key: "master",
      label: "Master Grid",
      onClick: (key) => setActiveTab(key),
      active: activeTab === "master",
    },
    {
      key: "insert",
      label: "Insert LOV",
      onClick: (key) => setActiveTab(key),
      active: activeTab === "insert",
    },
  ];

  // Submit Handler
  const handleFormSubmit = async (rows) => {
    setIsLoading(true);
    setServerResponse(null);
    try {
      const payload = rows.map((r) => ({
        ...r,
        lovId: editRow?.lovId || 0, // new or edit
      }));

      const res = await axiosClient.post("/common/lov/names", payload);
      const data = res.data;
      setServerResponse(data);

      if (data.success && !data.failedLOVs?.length) {
        setToastData([
          {
            text: data.message || "LOV saved successfully.",
            variant: "success",
          },
        ]);
        await fetchMasterGrid();
        setEditRow(null);
        setActiveTab("master");
        return;
      }

      if (data.failedLOVs?.length > 0) {
        const summaryToast = {
          text: `${data.message} — Total: ${data.summary.total}, Inserted: ${data.summary.inserted}, Failed: ${data.summary.failed}`,
          variant: "warning",
        };

        const failedToasts = data.failedLOVs.map((f) => ({
          text: `❌ ${f.lov.lovName}: ${f.error}`,
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
          text: err.response?.data?.message || "Error submitting LOV form.",
          variant: "danger",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Edit Handler
  const handleEdit = async (rowData) => {
    try {
      const id = rowData.LOV_ID;
      if (!id) {
        console.error("Invalid LOV_ID for editing:", rowData);
        return;
      }
      setIsLoading(true);

      const res = await axiosClient.get(
        `/common/master-grid/editbind/DCS_M_LIST_OF_VALUES/${id}`
      );

      if (res.data?.success && res.data?.data.length > 0) {
        const record = res.data.data[0];

        const mappedRow = {
          lovId: record.LOV_ID || 0,
          lovName: record.LOV_NAME || "",
          lovDescription: record.LOV_DESCRIPTION || "",
          inactiveReason: record.C2C_Inactive_Reason || "",
          status: record.C2C_Status === 1,
          createdUser: record.C2C_Cuser || 1,
          createdDate: record.C2C_Cdate || "",
        };

        console.log("Fetched Edit Data:", mappedRow);

        setEditRow(mappedRow);
        setActiveTab("insert");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setError("No data found for the selected LOV record.");
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
            <h5><i className="bi bi-info-circle-fill me-2"></i>List of Values (LOV) Configuration</h5>
            <p className="mb-0">
              <strong>Usage:</strong> Define lookup categories or enums (e.g., 'Status', 'Roles') used across your Projects. 
              These serve as parent categories for the actual dropdown items configured in LOV Details.
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
                    title="LOV Creation"
                    fields={fields}
                    onSubmit={handleFormSubmit}
                    isLoading={isLoading}
                    serverResponse={serverResponse}
                    defaultValues={editRow}
                  />
                </div>
              ) : (
                <MasterGrid
                  title="LOV Master Grid"
                  data={gridData}
                  isLoading={isLoading}
                  error={error}
                  moduleName="LovMaster"
                  onEdit={handleEdit}
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

export default LovPage;
