import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { RiAdminFill } from "react-icons/ri";
import { FaPoll, FaHome } from "react-icons/fa";
import { MdPersonAdd } from "react-icons/md";

import "./Navbar.css";

export default function NavbarAdmin() {
  const [open, setOpen] = useState(false);
  return (
    <nav style = {{background: "blue"}}>
      <div className="header">
        <NavLink to="/">
          <i className="fab fa-hive" /> <RiAdminFill/> Admin
        </NavLink>
      </div>
      <ul
        className="navbar-links"
        style={{ transform: open ? "translateX(0px)" : "" }}
      >
       
        <li>
          <NavLink to="/AddCandidate" activeClassName="nav-active">
            <MdPersonAdd/> Add Candidate
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
