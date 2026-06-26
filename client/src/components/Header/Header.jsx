import React from "react";
import { useLocation } from "react-router-dom";
import { Breadcrumb } from "react-bootstrap";
import "./Header.css";

const Header = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <div className="custom-header">
      <div className="breadcrumb-wrapper">
        <Breadcrumb>
          <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
          {pathnames.map((value, index) => {
            const last = index === pathnames.length - 1;
            const to = `/${pathnames.slice(0, index + 1).join("/")}`;

            return last ? (
              <Breadcrumb.Item active key={to}>
                {value.charAt(0).toUpperCase() + value.slice(1).replace("-", " ")}
              </Breadcrumb.Item>
            ) : (
              <Breadcrumb.Item href={to} key={to}>
                {value.charAt(0).toUpperCase() + value.slice(1).replace("-", " ")}
              </Breadcrumb.Item>
            );
          })}
        </Breadcrumb>
      </div>
      <div className="header-actions">
        <div className="badge-notification">
          <span className="dot"></span>
          System Online
        </div>
      </div>
    </div>
  );
};

export default Header;
