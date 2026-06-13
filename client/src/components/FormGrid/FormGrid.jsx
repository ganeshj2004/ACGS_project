import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Table,
  Button,
  Form,
  Card,
  Spinner,
  Alert,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import { Trash } from "react-bootstrap-icons";
import Select from "react-select";
import "./FormGrid.css";
import {
  validateAllRows,
  clearValidationCache,
} from "../../utils/validationHelper";

const FormGrid = ({
  title,
  fields,
  onSubmit,
  isLoading,
  serverResponse,
  defaultValues,
}) => {
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState([]);

  // 🧩 Create an empty row dynamically
  const createEmptyRow = () =>
    Object.fromEntries(
      fields.map((f) => {
        switch (f.name) {
          case "status":
            return [f.name, true];
          case "createdUser":
            return [f.name, 1];
          default:
            if (f.type === "select") {
              return [f.name, ""];
            }
            return [f.name, f.type === "checkbox" ? false : ""];
        }
      })
    );

  // 🪄 Initialize first row (or defaultValues for edit)
  useEffect(() => {
    if (fields?.length > 0) {
      setRows(defaultValues ? [defaultValues] : [createEmptyRow()]);
    }
  }, [fields, defaultValues]);

  // ➕ Add new row
  const handleAddRow = () => setRows((prev) => [...prev, createEmptyRow()]);

  // ✏️ Handle field changes
  const handleChange = (index, fieldName, value) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [fieldName]: value } : row))
    );
  };

  // ❌ Delete row
  const handleRemoveRow = (index) =>
    setRows((prev) => prev.filter((_, i) => i !== index));

  // ✅ Optimized Submit with centralized validation
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateAllRows(rows, fields);

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    clearValidationCache();
    onSubmit?.(rows);
  };

  const showInactiveColumn = rows.some((r) => r.status === false);

  if (!fields?.length)
    return <Alert variant="warning">No field definitions found.</Alert>;

  // 🧩 Helper: find error message for a field
  const getFieldErrors = (rowIdx, field) =>
    errors.filter((err) => err.row === rowIdx && err.field === field);

  return (
    <Container fluid className="mt-4">
      <Row className="justify-content-center">
        <Col xs={12}>
          <Card.Body className="p-4">
            <div className="d-flex justify-content-end mb-4">
              <Button variant="primary" onClick={handleAddRow} size="sm">
                + Add Row
              </Button>
            </div>

            <Form onSubmit={handleSubmit}>
              <div className="table-responsive">
                <Table bordered hover className="align-middle text-center">
                  <thead className="table-primary">
                    <tr>
                      <th style={{ width: "70px" }}>S.No</th>
                      {fields.map(
                        (f, i) =>
                          !f.hidden &&
                          (f.name !== "inactiveReason" ||
                            showInactiveColumn) && (
                            <th key={i} className="text-nowrap">
                              {f.label}
                            </th>
                          )
                      )}
                      <th style={{ width: "100px" }}>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i}>
                        <td className="fw-semibold">{i + 1}</td>

                        {fields.map(
                          (f, j) =>
                            !f.hidden &&
                            (f.name !== "inactiveReason" ||
                              showInactiveColumn) && (
                              <td key={j}>
                                <div style={{ position: "relative" }}>
                                  {f.name === "status" ? (
                                    <Form.Check
                                      type="switch"
                                      id={`status-${i}`}
                                      label={
                                        row[f.name] ? "Active" : "Inactive"
                                      }
                                      checked={!!row[f.name]}
                                      onChange={(e) =>
                                        handleChange(
                                          i,
                                          f.name,
                                          e.target.checked
                                        )
                                      }
                                    />
                                  ) : f.type === "select" ? (
                                    <Select
                                      options={f.options || []}
                                      value={
                                        row[f.name]
                                          ? (f.options || []).find(
                                              (opt) =>
                                                String(opt.value) ===
                                                String(row[f.name])
                                            ) || null
                                          : null
                                      }
                                      onChange={(selected) =>
                                        handleChange(
                                          i,
                                          f.name,
                                          selected ? selected.value : ""
                                        )
                                      }
                                      menuPortalTarget={document.body}
                                      styles={{
                                        control: (base, state) => ({
                                          ...base,
                                          minHeight: 38,
                                          fontSize: "0.9rem",
                                          borderColor: getFieldErrors(i, f.name)
                                            .length
                                            ? "red"
                                            : state.isFocused
                                            ? "#4f9dff"
                                            : "#ced4da",
                                          boxShadow: state.isFocused
                                            ? "0 0 0 0.2rem rgba(79,157,255,0.25)"
                                            : "none",
                                        }),
                                        menuPortal: (base) => ({
                                          ...base,
                                          zIndex: 9999,
                                        }),
                                      }}
                                    />
                                  ) : f.type === "textarea" ? (
                                    <Form.Control
                                      as="textarea"
                                      rows={2}
                                      value={row[f.name]}
                                      onChange={(e) =>
                                        handleChange(i, f.name, e.target.value)
                                      }
                                      style={{
                                        borderColor: getFieldErrors(i, f.name)
                                          .length
                                          ? "red"
                                          : undefined,
                                      }}
                                      disabled={
                                        f.name === "inactiveReason" &&
                                        row.status
                                      }
                                    />
                                  ) : (
                                    <Form.Control
                                      type={f.type}
                                      value={row[f.name]}
                                      onChange={(e) =>
                                        handleChange(i, f.name, e.target.value)
                                      }
                                      style={{
                                        borderColor: getFieldErrors(i, f.name)
                                          .length
                                          ? "red"
                                          : undefined,
                                      }}
                                    />
                                  )}

                                  {/* 🧩 Error Message */}
                                  {getFieldErrors(i, f.name).map((err, idx) => (
                                    <small
                                      key={idx}
                                      style={{
                                        color: "red",
                                        fontSize: "0.8rem",
                                        display: "block",
                                        marginTop: "4px",
                                        textAlign: "left",
                                      }}
                                    >
                                      {err.message}
                                    </small>
                                  ))}
                                </div>
                              </td>
                            )
                        )}

                        <td>
                          <Button
                            variant="light"
                            size="sm"
                            className="border-0"
                            onClick={() => handleRemoveRow(i)}
                            disabled={rows.length === 1}
                            title="Delete Row"
                          >
                            <Trash className="text-dark" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <div className="d-flex justify-content-end mt-3">
                <Button
                  type="submit"
                  variant="success"
                  className="px-4"
                  disabled={isLoading || rows.length === 0}
                >
                  {isLoading ? (
                    <>
                      <Spinner animation="border" size="sm" /> Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Col>
      </Row>
    </Container>
  );
};

FormGrid.propTypes = {
  title: PropTypes.string,
  fields: PropTypes.array.isRequired,
  onSubmit: PropTypes.func,
  isLoading: PropTypes.bool,
  serverResponse: PropTypes.object,
  defaultValues: PropTypes.object,
};

FormGrid.defaultProps = {
  title: "",
  onSubmit: () => {},
  isLoading: false,
  serverResponse: null,
};

export default FormGrid;