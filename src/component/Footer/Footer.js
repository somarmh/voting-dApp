import React from "react";

import "./Footer.css";

const Footer = () => (
  <>
    <div className="footer-block"></div>
    <div className="footer">
      <div className="footer-container">
        <p>
          View this project on{" "}
          <a
            className="profile"
            href="https://github.com/somarmh/voting-dApp"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          .
        </p>
        <p>
          Made <i className="fas fa-heartbeat" /> by{" "}
          <a
            className="profile"
            href="https://github.com/somarmh"
            target="_blank"
            rel="noopener noreferrer"
          >
            Somar Mohammad
          </a>
          .
        </p>
      </div>
    </div>
  </>
);

export default Footer;
