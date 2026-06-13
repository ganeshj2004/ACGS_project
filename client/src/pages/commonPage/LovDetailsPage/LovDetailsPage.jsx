import React, { useState, useEffect, useCallback } from "react";
import axiosClient from "../../../api/axiosClient";
import Header from "../../../components/Header/Header";
import TabMenu from "../../../components/Tabs/TabMenu";
import LeftTabMenu from "../../../components/LeftTabMenu/LeftTabMenu";
import Toaster from "../../../components/Toaster/Toaster";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Table,
  Spinner,
  Alert,
} from "react-bootstrap";
import "../../Style.css";

const LovDetailsPage = () => {
  const [lovOptions, setLovOptions] = useState([]);
  const [selectedLov, setSelectedLov] = useState("");
  const [activeTab, setActiveTab] = useState("master");
  const [gridData, setGridData] = useState([]);
  const [backupData, setBackupData] = useState([]);
  const [editRowIndex, setEditRowIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toastData, setToastData] = useState([]);

  /** 🔹 Fetch LOV dropdown list */
  const fetchLovOptions = useCallback(async () => {
    try {
      const res = await axiosClient.get("/common/drop-down/LOV/NULL");
      if (res.data?.result) {
        const formatted = res.data.result.map((item) => ({
          label: item.Name,
          value: item.Id,
        }));
        setLovOptions(formatted);
      } else setLovOptions([]);
    } catch (error) {
      console.error("Error fetching LOV options:", error);
      setLovOptions([]);
    }
  }, []);

  /** 🔹 Fetch LOV details grid */
  const fetchLovDetails = useCallback(async (lovId) => {
    if (!lovId) return;
    setIsLoading(true);
    try {
      const res = await axiosClient.get(
        `/common/master-grid/dcs_m_list_of_values_details/${lovId}`
      );
      if (res.data?.success && Array.isArray(res.data.data)) {
        const cleaned = res.data.data.map((r) => ({
          ...r,
          _isNew: false,
          _isEdited: false,
        }));
        setGridData(cleaned);
        setBackupData(cleaned);
      } else {
        setGridData([]);
        setBackupData([]);
      }
    } catch (error) {
      console.error("Error fetching LOV details:", error);
      setGridData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLovOptions();
  }, [fetchLovOptions]);

  const tabs = [
    {
      key: "master",
      label: "Manage List Of Details",
      onClick: (key) => setActiveTab(key),
      active: activeTab === "master",
    },
  ];

  /** Handle LOV dropdown selection */
  const handleLovChange = (e) => {
    const value = e.target.value;
    setSelectedLov(value);
    setEditRowIndex(null);
    if (value) fetchLovDetails(value);
    else setGridData([]);
  };

  /** 🔹 Add a new record */
  const handleAddRow = () => {
    if (!selectedLov) {
      setToastData([
        { text: "Please select a LOV before adding.", variant: "warning" },
      ]);
      return;
    }

    const newRow = {
      lovDetId: 0,
      lovId: Number(selectedLov),
      lovDetName: "",
      lovDetDescription: "",
      createdUser: 1,
      status: 1,
      inactiveReason: "",
      _isNew: true,
    };
    setGridData((prev) => [...prev, newRow]);
    setEditRowIndex(gridData.length);
  };

  /** 🔹 Handle input changes */
  const handleInputChange = (index, field, value) => {
    setGridData((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
        _isEdited: true,
      };
      return updated;
    });
  };

  /** 🔹 Save only added or edited rows */
  /** 🔹 Save only added or edited rows */
  const handleSave = async () => {
    const changedRows = gridData.filter((r) => r._isNew || r._isEdited);

    if (!changedRows.length) {
      setToastData([{ text: "No changes to save.", variant: "info" }]);
      return;
    }

    const invalidRow = changedRows.find(
      (row) => !row.LOV_DET_NAME?.trim() && !row.lovDetName?.trim()
    );
    if (invalidRow) {
      setToastData([
        {
          text: "Each changed row must have a LOV Details Name.",
          variant: "danger",
        },
      ]);
      return;
    }

    const payload = changedRows.map((row) => ({
      lovDetId: Number(row.LOV_DET_ID || row.lovDetId || 0),
      lovId: Number(row.LOV_ID || row.lovId || selectedLov),
      lovDetName: row.LOV_DET_NAME?.trim() || row.lovDetName?.trim(),
      lovDetDescription:
        row.LOV_DET_DESCP?.trim() || row.lovDetDescription?.trim() || "",
      createdUser: 1,
      status: 1,
      inactiveReason: "",
    }));

    setIsLoading(true);
    try {
      const res = await axiosClient.post("/common/lov_det/names", payload);
      const data = res.data;

      if (data.success) {
        // ✅ All inserts successful
        setToastData([
          {
            text: data.message || "Changes saved successfully.",
            variant: "success",
          },
        ]);
        await fetchLovDetails(selectedLov);
        setEditRowIndex(null);
      } else if (data.summary) {
        // ⚠️ Partial or failed inserts
        const summaryMsg = `${data.message} — Total: ${data.summary.total}, Inserted: ${data.summary.inserted}, Failed: ${data.summary.failed}`;
        const toastArray = [{ text: summaryMsg, variant: "warning" }];

        // Append failed record errors
        if (Array.isArray(data.failedDetails)) {
          data.failedDetails.forEach((fail) => {
            toastArray.push({
              text: `❌ LOVDET: ${fail.error}`,
              variant: "danger",
            });
          });
        }

        setToastData(toastArray);
        await fetchLovDetails(selectedLov);
      } else {
        // ❌ Complete failure
        setToastData([
          { text: data.message || "Save failed.", variant: "danger" },
        ]);
      }
    } catch (error) {
      console.error("Save error:", error);
      setToastData([{ text: "Error saving records.", variant: "danger" }]);
    } finally {
      setIsLoading(false);
    }
  };

  /** 🔹 Cancel all changes */
  const handleCancel = () => {
    setGridData(backupData);
    setEditRowIndex(null);
    setToastData([{ text: "Changes canceled.", variant: "secondary" }]);
  };

  /** 🔹 Enable row editing */
  const handleRowDoubleClick = (index) => {
    setEditRowIndex(index);
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
            <h5><i className="bi bi-info-circle-fill me-2"></i>LOV Details Configuration</h5>
            <p className="mb-0">
              <strong>Usage:</strong> Populate standard dropdown values (e.g., 'Active', 'Inactive', 'Admin') mapped back to their parent LOV categories. 
              These are used to dynamically populate select inputs across generated apps.
            </p>
          </Alert>

          <TabMenu tabs={tabs} variant="tabs" defaultActiveKey="master" />

          {/* Dropdown + Buttons */}
          <Row className="align-items-center mb-4">
            <Col xs={12} md={4}>
              <Form.Select
                value={selectedLov}
                onChange={handleLovChange}
                disabled={isLoading}
              >
                <option value="">-- Select LOV --</option>
                {lovOptions.map((opt) => (
                  <option key={`lov-opt-${opt.value}`} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col xs="auto">
              <Button
                variant="primary"
                onClick={handleAddRow}
                disabled={!selectedLov || isLoading}
              >
                <i className="bi bi-plus-circle me-1"></i> Add New
              </Button>
            </Col>

            <Col xs="auto">
              <Button
                variant="success"
                onClick={handleSave}
                disabled={isLoading}
              >
                <i className="bi bi-save me-1"></i> Save
              </Button>
            </Col>

            <Col xs="auto">
              <Button variant="secondary" onClick={handleCancel}>
                <i className="bi bi-x-circle me-1"></i> Cancel
              </Button>
            </Col>
          </Row>

          {/* Table Section */}
          <div className="form-area">
            {isLoading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : gridData.length === 0 ? (
              <Alert variant="info" className="text-center">
                No records found. Please select an LOV.
              </Alert>
            ) : (
              <Table
                striped
                bordered
                hover
                responsive
                className="shadow-sm align-middle"
              >
                <thead>
                  <tr className="table-header text-center">
                    <th style={{ width: "5%" }}>S.NO</th>
                    <th style={{ width: "35%" }}>LOV Details Name</th>
                    <th>LOV Details Description</th>
                  </tr>
                </thead>
                <tbody>
                  {gridData.map((row, index) => (
                    <tr
                      key={index}
                      onDoubleClick={() => handleRowDoubleClick(index)}
                      className={
                        editRowIndex === index
                          ? "table-active"
                          : "cursor-pointer"
                      }
                    >
                      <td className="text-center">{index + 1}</td>
                      <td>
                        {editRowIndex === index ? (
                          <Form.Control
                            type="text"
                            value={row.LOV_DET_NAME || row.lovDetName || ""}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "LOV_DET_NAME",
                                e.target.value
                              )
                            }
                            autoFocus
                          />
                        ) : (
                          row.LOV_DET_NAME || row.lovDetName
                        )}
                      </td>
                      <td>
                        {editRowIndex === index ? (
                          <Form.Control
                            as="textarea"
                            rows={1}
                            value={
                              row.LOV_DET_DESCP || row.lovDetDescription || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "LOV_DET_DESCP",
                                e.target.value
                              )
                            }
                          />
                        ) : (
                          row.LOV_DET_DESCP || row.lovDetDescription
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        </Container>

        {/* ✅ Toast Notification Area */}
        <Toaster toastData={toastData} setToastData={setToastData} />
      </main>
    </div>
  );
};

export default LovDetailsPage;
