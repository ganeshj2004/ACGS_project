export function generateReactStack(meta) {
  const parent = meta.parent || {};
  const rows = meta.columns || [];

  const table = parent.table || "YOUR_TABLE";
  const moduleName = parent.module || "General";
  
  function colArray(val) {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return [val];
  }

  const insertCols = rows.flatMap((r) => colArray(r.Insert));
  const updateCols = rows.flatMap((r) => colArray(r.Update));
  const whereCols = rows.flatMap((r) => colArray(r.Where));

  const uniqueFields = [...new Set([...insertCols, ...updateCols])].filter(p => 
    !["C2C_CUSER", "C2C_UUSER", "C2C_CDATE", "C2C_UDATE"].includes(p.toUpperCase())
  );

  const componentName = `${table.toLowerCase().split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}Page`;

  const reactCode = `
import React, { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";
import Header from "../../../components/Header/Header";
import LeftTabMenu from "../../../components/LeftTabMenu/LeftTabMenu";
import TabMenu from "../../../components/Tabs/TabMenu";
import MasterGrid from "../../../components/MasterGrid/MasterGrid";
import FormGrid from "../../../components/FormGrid/FormGrid";
import { Container, Row, Col, Alert } from "react-bootstrap";
import Toaster from "../../../components/Toaster/Toaster";

const ${componentName} = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("master");
  const [gridData, setGridData] = useState([]);
  const [error, setError] = useState("");
  const [editRow, setEditRow] = useState(null);
  const [toastData, setToastData] = useState([]);

  const apiPath = "/module/${table.toLowerCase()}"; // Update this to your actual API path

  const fetchGridData = async () => {
    setIsLoading(true);
    try {
      const res = await axiosClient.get(\`\${apiPath}/list\`);
      if (res.data?.success) setGridData(res.data.data);
    } catch (err) {
      setError("Failed to fetch data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchGridData(); }, []);

  const fields = [
    ${uniqueFields.map(f => `{ name: "${f}", label: "${f.replace(/_/g, ' ')}", type: "${f.toLowerCase().includes('date') ? 'date' : 'text'}" }`).join(',\n    ')}
  ];

  const handleFormSubmit = async (rows) => {
    setIsLoading(true);
    try {
      const res = await axiosClient.post(\`\${apiPath}/save\`, { rows });
      if (res.data.success) {
        setToastData([{ text: "Successfully saved", variant: "success" }]);
        fetchGridData();
        setActiveTab("master");
      }
    } catch (err) {
      setToastData([{ text: "Error saving data", variant: "danger" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { key: "master", label: "View List", active: activeTab === "master", onClick: setActiveTab },
    { key: "insert", label: "Add/Edit ${moduleName}", active: activeTab === "insert", onClick: setActiveTab }
  ];

  return (
    <div className="master-page">
      <aside className="sidebar"><LeftTabMenu /></aside>
      <main className="main-content">
        <Header />
        <Container fluid className="py-4">
          <Alert variant="info" className="mb-4 shadow-sm">
            <h5 className="fw-bold">${moduleName} Management</h5>
            <p className="mb-0 text-muted">Generated management interface for table: <strong>${table}</strong></p>
          </Alert>

          <TabMenu tabs={tabs} />

          <Row className="mt-4">
            <Col xs={12}>
              {activeTab === "insert" ? (
                <div className="form-area shadow-sm">
                  <FormGrid
                    title="${moduleName} Form"
                    fields={fields}
                    onSubmit={handleFormSubmit}
                    isLoading={isLoading}
                    defaultValues={editRow}
                  />
                </div>
              ) : (
                <MasterGrid
                  data={gridData}
                  isLoading={isLoading}
                  error={error}
                  moduleName="${table}Grid"
                  onEdit={(row) => { setEditRow(row); setActiveTab("insert"); }}
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

export default ${componentName};
`;

  return reactCode;
}
