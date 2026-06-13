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

const LanguagePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [serverResponse, setServerResponse] = useState(null);
  const [activeTab, setActiveTab] = useState("master");
  const [gridData, setGridData] = useState([]);
  const [error, setError] = useState("");
  const [editRow, setEditRow] = useState(null); //  store row being edited
  const [toastData, setToastData] = useState([]);

  const fetchMasterGrid = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axiosClient.get(
        "/common/master-grid/DCS_M_LANGUAGE/null"
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
    fetchMasterGrid();
  }, []);

  const fields = [
    {
      name: "languageName",
      label: "Language Name",
      type: "text",
      required: true,
      validate: (value) => {
        if (!/^[A-Za-z\s]+$/.test(value))
          return "Language name must contain only letters";
        if (value.length < 2)
          return "Language name must be at least 2 characters";
        return true;
      },
    },
    { name: "status", label: "Status", type: "checkbox" },
    {
      name: "inactiveReason",
      label: "Inactive Reason",
      type: "textarea",
      validate: (value, row) => {
        if (row.status === false && !value.trim())
          return "Inactive reason is required when status is inactive";
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

  const tabs = [
    {
      key: "master",
      label: "Master Grid",
      onClick: (key) => setActiveTab(key),
      active: activeTab === "master",
    },
    {
      key: "insert",
      label: "Insert the Language",
      onClick: (key) => setActiveTab(key),
      active: activeTab === "insert",
    },
  ];

  const handleFormSubmit = async (rows) => {
    setIsLoading(true);
    setServerResponse(null);
    try {
      const payload = rows.map((r) => ({
        ...r,
        languageId: editRow?.languageId || 0, // if editing, send existing ID
      }));
      const res = await axiosClient.post("/common/language/names", payload);
      const data = res.data;
      setServerResponse(data);

      if (data.success && !data.failedLanguages?.length) {
        setToastData([
          {
            text: data.message || "Language saved successfully.",
            variant: "success",
          },
        ]);
        await fetchMasterGrid(); //refresh grid instantly
        setEditRow(null); // reset edit
        setActiveTab("master"); // switch back to grid
        return;
      }
      if (data.failedLanguages?.length > 0) {
        const summaryToast = {
          text: `${data.message} — Total: ${data.summary.total}, Inserted: ${data.summary.inserted}, Failed: ${data.summary.failed}`,
          variant: "warning",
        };

        const failedToasts = data.failedLanguages.map((f) => ({
          text: `❌ ${f.language.languageName}: ${f.error}`,
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

  //  When user clicks edit in MasterGrid
  const handleEdit = async (rowData) => {
    try {
      const id = rowData.Language_ID;
      if (!id) {
        console.error("Invalid Language ID for editing:", rowData);
        return;
      }
      setIsLoading(true);

      const res = await axiosClient.get(
        `/common/master-grid/editbind/DCS_M_LANGUAGE/${id}`
      );

      if (res.data?.success && res.data?.data.length > 0) {
        const record = res.data.data[0];

        const mappedRow = {
          languageId: record.Language_ID || 0,
          languageName: record.Language_Name || "",
          inactiveReason: record.C2C_Inactive_Reason || "",
          status: record.C2C_Status === 1, // ✅ converts numeric status to boolean
          createdBy: record.C2C_Cuser || 1,
          createdDate: record.C2C_Cdate || "",
        };

        setEditRow(mappedRow);
        setActiveTab("insert");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setError("No data found for the selected record.");
      }
    } catch (err) {
      console.error("Edit fetch failed:", err);
      setError("Failed to fetch record for editing.");
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
            <h5><i className="bi bi-info-circle-fill me-2"></i>Language Configuration</h5>
            <p className="mb-0">
              <strong>Usage:</strong> Register the programming languages Supported by your Code Generator (e.g., Javascript, Python). This is the base context required before creating Projects.
            </p>
          </Alert>

          <TabMenu tabs={tabs} variant="tabs" defaultActiveKey="master" />

          <Row className="mt-4">
            <Col xs={12}>
              {activeTab === "insert" ? (
                <div className="form-area">
                  <FormGrid
                    title="Language Creation"
                    fields={fields}
                    onSubmit={handleFormSubmit}
                    isLoading={isLoading}
                    serverResponse={serverResponse}
                    defaultValues={editRow} // ✅ pass edit values
                  />
                </div>
              ) : (
                <MasterGrid
                  title="Language Master Grid"
                  data={gridData}
                  isLoading={isLoading}
                  error={error}
                  moduleName="LanguageMaster"
                  onEdit={handleEdit} // ✅ pass handler
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

export default LanguagePage;
