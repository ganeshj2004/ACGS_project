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

const ProductPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [serverResponse, setServerResponse] = useState(null);
  const [activeTab, setActiveTab] = useState("master");
  const [gridData, setGridData] = useState([]);
  const [error, setError] = useState("");
  const [editRow, setEditRow] = useState(null);
  const [toastData, setToastData] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);

  // 🔹 Fetch Project List for dropdown
  const fetchProjects = async () => {
    try {
      const res = await axiosClient.get("/common/drop-down/PROJECT/NULL");
      if (res.data?.result && Array.isArray(res.data.result)) {
        const formatted = res.data.result.map((item) => ({
          label: item.Name,
          value: item.Id,
        }));
        setProjectOptions(formatted);
      } else {
        console.warn("Invalid response structure:", res.data);
      }
    } catch (err) {
      console.error("Failed to fetch project list:", err);
    }
  };

  // 🔹 Fetch Product master grid
  const fetchMasterGrid = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axiosClient.get(
        "/common/master-grid/DCS_M_PRODUCT/null"
      );
      if (res.data?.success && Array.isArray(res.data.data)) {
        setGridData(res.data.data);
      } else {
        setError("Invalid response format from product API.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch product data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterGrid();
    fetchProjects();
  }, []);
  console.log("Project options:", gridData);
  // 🔹 Product Form Fields
  const fields = [
    {
      name: "projectId",
      label: "Project",
      type: "select",
      required: true,
      options: projectOptions,
      validate: (value) => {
        if (!value || value === "0" || value === 0)
          return "Please select a project";
        return true;
      },
    },
    {
      name: "productName",
      label: "Product Name",
      type: "text",
      required: true,
      validate: (value) => {
        if (!value?.trim()) return "Product name is required";
        if (!/^[A-Za-z0-9\s._-]+$/.test(value))
          return "Product name can only contain letters, numbers, spaces, dots, underscores, or hyphens";
        if (value.length < 3)
          return "Product name must be at least 3 characters long";
        if (value.length > 100)
          return "Product name cannot exceed 100 characters";
        return true;
      },
    },
    {
      name: "productDescription",
      label: "Product Description",
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
            return "Inactive reason is required when product is inactive";
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

  // 🔹 Tabs Configuration
  const tabs = [
    {
      key: "master",
      label: "Master Grid",
      onClick: (key) => setActiveTab(key),
      active: activeTab === "master",
    },
    {
      key: "insert",
      label: "Insert Product",
      onClick: (key) => setActiveTab(key),
      active: activeTab === "insert",
    },
  ];

  // 🔹 Submit Handler
  const handleFormSubmit = async (rows) => {
    setIsLoading(true);
    setServerResponse(null);
    try {
      const payload = rows.map((r) => ({
        ...r,
        productId: editRow?.productId || 0, // update if editing
      }));

      const res = await axiosClient.post("/common/product/names", payload);
      const data = res.data;
      setServerResponse(data);

      if (data.success && !data.failedProducts?.length) {
        setToastData([
          {
            text: data.message || "Product saved successfully.",
            variant: "success",
          },
        ]);
        await fetchMasterGrid();
        setEditRow(null);
        setActiveTab("master");
        return;
      }

      if (data.failedProducts?.length > 0) {
        const summaryToast = {
          text: `${data.message} — Total: ${data.summary.total}, Inserted: ${data.summary.inserted}, Failed: ${data.summary.failed}`,
          variant: "warning",
        };
        const failedToasts = data.failedProducts.map((f) => ({
          text: `❌ ${f.productName}: ${f.error}`,
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

  // 🔹 Edit Handler
  const handleEdit = async (rowData) => {
    try {
      console.log("Row data for editing:", rowData);
      const id = rowData.Product_ID;
      if (!id) {
        console.error("Invalid MODULE_ID for editing:", rowData);
        return;
      }
      setIsLoading(true);

      const res = await axiosClient.get(
        `/common/master-grid/editbind/DCS_M_PRODUCT/${id}`
      );

      if (res.data?.success && res.data?.data.length > 0) {
        const record = res.data.data[0];

        const mappedRow = {
          productId: record.Product_ID || 0,
          productName: record.Product_Name,
          productDescription: record.Product_Description || "",
          projectId: record.Project_ID || "",
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
        setError("No data found for the selected module record.");
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
            <h5><i className="bi bi-info-circle-fill me-2"></i>Product Configuration</h5>
            <p className="mb-0">
              <strong>Usage:</strong> Register individual applications (Products) belonging to a Project (e.g. 'React Frontend', 'Node Backend'). Let the Developer target specific code outputs per product.
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
                    title="Product Creation"
                    fields={fields}
                    onSubmit={handleFormSubmit}
                    isLoading={isLoading}
                    serverResponse={serverResponse}
                    defaultValues={editRow}
                  />
                </div>
              ) : (
                <MasterGrid
                  title="Product Master Grid"
                  data={gridData}
                  isLoading={isLoading}
                  error={error}
                  moduleName="ProductMaster"
                  onEdit={handleEdit}
                />
              )}
            </Col>
          </Row>
        </Container>

        {/* Toast Notification */}
        <Toaster toastData={toastData} setToastData={setToastData} />
      </main>
    </div>
  );
};

export default ProductPage;
