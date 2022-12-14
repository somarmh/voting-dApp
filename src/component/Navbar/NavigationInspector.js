import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaPoll, FaHome, FaFileSignature } from "react-icons/fa";

import "./Navbar.css";

export default function NavbarOrganizer() {
  const [open, setOpen] = useState(false);
  return (
    <nav style = {{background: "red"}}>
      <div className="header">
        <NavLink to="/">
          <i className="fab fa-hive" /> <FaHome/> Inspector
        </NavLink>
      </div>
      <ul
        className="navbar-links"
        style={{ transform: open ? "translateX(0px)" : "" }}
      >
       
       <li>
          <NavLink to="/Signature" activeClassName="nav-active">
            <FaFileSignature/> Signature
          </NavLink>
        </li>


        <li>
          <NavLink to="/Results" activeClassName="nav-active">
            <i className="fas fa-poll-h" /> <FaPoll/> Results
          </NavLink>
        </li>
      </ul>
      <i onClick={() => setOpen(!open)} className="fas fa-bars burger-menu"></i>
    </nav>
  );
}
