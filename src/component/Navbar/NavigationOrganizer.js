import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaPoll, FaHome } from "react-icons/fa";
import { MdVerifiedUser } from "react-icons/md";
import { FcSignature } from "react-icons/fc";

import "./Navbar.css";

export default function NavbarOrganizer() {
  const [open, setOpen] = useState(false);
  return (
    <nav>
      <div className="header">
        <NavLink to="/">
          <i className="fab fa-hive" /> <FaHome/> Organizer
        </NavLink>
      </div>
      <ul
        className="navbar-links"
        style={{ transform: open ? "translateX(0px)" : "" }}
      >
       
       <li>
          <NavLink to="/Verification" activeClassName="nav-active">
            <MdVerifiedUser/> Verification
          </NavLink>
        </li>

        <li>
          <NavLink to="/Validation" activeClassName="nav-active">
            Validation
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
