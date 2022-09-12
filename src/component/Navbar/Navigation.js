import React, { useState } from "react";
import { NavLink } from "react-router-dom";

import "./Navbar.css";
import { MdHowToVote } from "react-icons/md";
import { BiBroadcast } from "react-icons/bi";
import { RiRegisteredFill } from "react-icons/ri";
import { FaPoll, FaHome } from "react-icons/fa";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav style = {{background: "green"}}>
      <NavLink to="/" className="header" >
        <i className="fab fa-hive"></i> <FaHome/> Home
      </NavLink>
      <ul
        className="navbar-links"
        style={{ width: "50%", transform: open ? "translateX(0px)" : "" }}
      >
        <li>
          <NavLink to="/Registration" activeClassName="nav-active">
            <i className="far fa-registered" /> <RiRegisteredFill/> Registration 
          </NavLink>
        </li>
        <li>
          <NavLink to="/casting" activeClassName="nav-active">
            <i className="fas fa-vote-yea" /> <BiBroadcast/> Casting 
          </NavLink>
        </li>
        <li>
          <NavLink to="/Voting" activeClassName="nav-active">
            <i className="fas fa-vote-yea" /> <MdHowToVote/> Voting 
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
