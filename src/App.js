import React, { Component } from "react";
import { BrowserRouter as BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Home from "./component/Home";

import Voting from "./component/Voting/Voting";
import Casting from "./component/casting/Casting";
import Results from "./component/Results/Results";
import Registration from "./component/Registration/Registration";

import AddCandidate from "./component/Admin/AddCandidate/AddCandidate";
import Verification from "./component/Admin/Verification/Verification";
import test from "./component/test";
import StartEnd from "./component/Admin/StartEnd/StartEnd";

import Footer from "./component/Footer/Footer";

import "./App.css";

export default class App extends Component {
  render() {
    return (
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route exact path="/" element={ <Home/>} />
            <Route exact path="/AddCandidate" element={<AddCandidate/>} />
            <Route exact path="/Voting" element={<Voting/>} />
            <Route exact path="/Casting" element={<Casting/>} />
            <Route exact path="/Results" element={<Results/>} />
            <Route exact path="/Registration" element={<Registration/>} />
            <Route exact path="/Verification" element={<Verification/>} />
            <Route exact path="/test" element={<test/>} />
            <Route exact path="*" element={<NotFound/>} />
          </Routes>
        </BrowserRouter>
        <Footer />
      </div>
    );
  }
}
class NotFound extends Component {
  render() {
    return (
      <>
        <h1>404 NOT FOUND!</h1>
        <center>
          <p>
            The page your are looking for doesn't exist.
            <br />
            Go to{" "}
            <Link
              to="/"
              style={{ color: "black", textDecoration: "underline" }}
            >
              Home
            </Link>
          </p>
        </center>
      </>
    );
  }
}
