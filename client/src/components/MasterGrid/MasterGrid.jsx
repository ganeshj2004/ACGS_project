import React from "react";
import PropTypes from "prop-types";
import { Table, Spinner, Alert, Button } from "react-bootstrap";
import { hiddenColumns } from "../../config/fieldConfig.jsx";
import "./MasterGrid.css";

const MasterGrid = ({ title, data, isLoading, error, moduleName, onEdit }) => {
  if (isLoading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="text-center">
        {error}
      </Alert>
    );
  }
  console.log(data);
  if (!data || data.length === 0) {
    return (
      <Alert variant="info" className="text-center">
        No records found.
      </Alert>
    );
  }

  // ✅ Get columns to hide for this module
  const hidden = hiddenColumns[moduleName] || [];

  // ✅ Extract headers dynamically
  const headers = Object.keys(data[0]).filter((key) => !hidden.includes(key));

  return (
    <div className="master-grid-card">
      <div className="table-responsive">
        <Table bordered hover size="sm" className="align-middle text-center">
          <thead className="table-primary">
            <tr>
              <th>Action</th>
              {headers.map((key) => (
                <th key={key}>{key.replace(/_/g, " ")}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {/* 🖊️ Edit button */}
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => onEdit(row)}
                  >
                    Edit
                  </Button>
                </td>
                {headers.map((key) => (
                  <td key={key}>
                    {key.toLowerCase().includes("status") ? (
                      <span
                        className={
                          String(row[key]) === "1" || String(row[key]).toLowerCase() === "active" || row[key] === true
                            ? "text-success fw-semibold"
                            : "text-danger fw-semibold"
                        }
                      >
                        {String(row[key]) === "1" || row[key] === true ? "Active" : 
                         String(row[key]) === "0" || row[key] === false ? "Inactive" : row[key]}
                      </span>

                    ) : (
                      row[key]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

MasterGrid.propTypes = {
  title: PropTypes.string,
  data: PropTypes.array,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  moduleName: PropTypes.string.isRequired,
  onEdit: PropTypes.func,
};

export default MasterGrid;
