// Node modules
import React, { Component } from "react";
import { Link } from "react-router-dom";

// Components
import Navbar from "../Navbar/Navigation";
import NavbarAdmin from "../Navbar/NavigationAdmin";
import NavbarOrganizer from "../Navbar/NavigationOrganizer";
import NavbarInspector from "../Navbar/NavigationInspector";
import NotInit from "../NotInit";



// CSS
import "./Results.css";

// Contract
import Election from "../../contracts/election.json";
import { ethers } from "ethers";

const electionAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default class Result extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ElectionInstance: undefined,
      account: null,
      web3: null,
      isAdmin: false,
      candidateCount: undefined,
      ballotCount: undefined,
      candidates: [],
      elStarted: false,
      elEnded: false,
      Ballots: [],
    };
  }
  componentDidMount = async () => {
    // refreshing once
    if (!window.location.hash) {
      window.location = window.location + "#loaded";
      window.location.reload();
    }
    try {
        if (typeof window.ethereum !== "undefined") {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();

            const contract = new ethers.Contract(
                electionAddress,
                Election.abi,
                signer
            );
    
            this.setState({
                provider: provider,
                ElectionInstance: contract,
                account: accounts[0],
            });
            // Admin account and verification
            const admin = await this.state.ElectionInstance.getAdmin();

            if(this.state.account === admin.toLowerCase()) {
                this.setState({ isAdmin: true });
            }

            const orgnaizer = await this.state.ElectionInstance.getOrganizerAddress();
            
            // Get election start and end values
            if(this.state.account === orgnaizer.toLowerCase()) {
                this.setState({ isOrganizer: true });
            }
            const inspector = await this.state.ElectionInstance.getInspectorAddress();

            // Get election start and end values
            if(this.state.account === inspector.toLowerCase()) {
                this.setState({ isInspector: true });
            }
            // Get total number of candidates
            const candidateCount = await this.state.ElectionInstance.getTotalCandidate();
            this.setState({ candidateCount: candidateCount.toNumber() });

             // Get start and end values
            const start = await this.state.ElectionInstance.getStart();
            this.setState({ elStarted: start });
            const end = await this.state.ElectionInstance.getEnd();
            this.setState({ elEnded: end });

            // Loadin Candidates detials
            for (let i = 0; i < this.state.candidateCount; i++) {
                const candidate = await this.state.ElectionInstance.candidateDetails(i);
                this.state.candidates.push({
                    id: candidate.candidateId.toNumber(),
                    name: candidate.name,
                    slogan: candidate.slogan,
                    voteCount: candidate.voteCount.toNumber(),
                });
            }
            
            this.setState({ candidates: this.state.candidates });
            
 
        }
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  render() {
    if (!this.state.provider) {
      return (
        <>
          {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
          <center>Loading Web3, accounts, and contract...</center>
        </>
      );
    }

    return (
      <>
        {this.state.isAdmin ? <NavbarAdmin /> : this.state.isOrganizer ?  <NavbarOrganizer /> :this.state.isInspector ? <NavbarInspector /> :<Navbar />}
        <br />
        <div>
          {!this.state.elStarted && !this.state.elEnded ? (
            <NotInit />
          ) : this.state.elStarted && !this.state.elEnded ? (
            <div className="container-item attention">
              <center>
                <h3>The election is being conducted at the movement.</h3>
                <p>Result will be displayed once the election has ended.</p>
                <p>Go ahead and cast your vote {"(if not already)"}.</p>
                <br />
                <Link
                  to="/Voting"
                  style={{ color: "black", textDecoration: "underline" }}
                >
                  Voting Page
                </Link>
              </center>
            </div>
          ) : !this.state.elStarted && this.state.elEnded ? (
            displayResults(this.state.candidates)
          ) : null}
        </div>
      </>
    );
  }
}

function displayWinner(candidates) {
  const getWinner = (candidates) => {
    // Returns an object having maxium vote count
    let maxVoteRecived = 0;
    let winnerCandidate = [];
    for (let i = 0; i < candidates.length; i++) {
      if (candidates[i].voteCount > maxVoteRecived) {
        maxVoteRecived = candidates[i].voteCount;
        winnerCandidate = [candidates[i]];
      } else if (candidates[i].voteCount === maxVoteRecived) {
        winnerCandidate.push(candidates[i]);
      }
    }
    return winnerCandidate;
  };
  const renderWinner = (winner) => {
    return (
      <div className="container-winner">
        <div className="winner-info">
          <p className="winner-tag">Winner!</p>
          <h2> {winner.header}</h2>
          <p className="winner-slogan">{winner.slogan}</p>
        </div>
        <div className="winner-votes">
          <div className="votes-tag">Total Votes: </div>
          <div className="vote-count">{winner.voteCount}</div>
        </div>
      </div>
    );
  };
  const winnerCandidate = getWinner(candidates);
  return <>{winnerCandidate.map(renderWinner)}</>;
}

export function displayResults(candidates) {
  const renderResults = (candidate) => {
    return (
      <tr>
        <td>{candidate.id}</td>
        <td>{candidate.name}</td>
        <td>{candidate.voteCount}</td>
      </tr>
    );
  };
  return (
    <>
      {candidates.length > 0 ? (
        <div className="container-main">{displayWinner(candidates)}</div>
      ) : null}
      <div className="container-main" style={{ borderTop: "1px solid" }}>
        <h2>Results</h2>
        <small>Total candidates: {candidates.length}</small>
        {candidates.length < 1 ? (
          <div className="container-item attention">
            <center>No candidates.</center>
          </div>
        ) : (
          <>
            <div className="container-item">
              <table>
                <tr>
                  <th>Id</th>
                  <th>Candidate</th>
                  <th>Votes</th>
                </tr>
                {candidates.map(renderResults)}
              </table>
            </div>
            <div
              className="container-item"
              style={{ border: "1px solid black" }}
            >
              <center>That is all.</center>
            </div>
          </>
        )}
      </div>
    </>
  );
}