// Node modules
import React, { Component } from "react";
import { Link } from "react-router-dom";

// Components
import Navbar from "../Navbar/Navigation";
import NavbarAdmin from "../Navbar/NavigationAdmin";
import NotInit from "../NotInit";

// CSS
import "./Voting.css";

// Contract
import Election from "../../contracts/election.json";
import { ethers } from "ethers";

const electionAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";


export default class Voting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ElectionInstance: undefined,
      account: null,
      provider: null,
      isAdmin: false,
      candidateCount: undefined,
      candidates: [],
      elStarted: false,
      elEnded: false,
      currentVoter: {
        address: undefined,
        name: null,
        phone: null,
        votingPassword: null,
        eligible: null,
        //hasVoted: false,
        isVerified: false,
        isRegistered: false,
        blindedVote: "",
        signedBlindedVote: "",
      },
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
                provider
            );
            
            const contract1 = new ethers.Contract(
                electionAddress,
                Election.abi,
                signer
            );

            this.setState({
                provider: provider,
                ElectionInstance: contract,
                ElectionInstance1: contract1,
                account: accounts[0],
            });
            const admin = await this.state.ElectionInstance.getAdmin();
        
            if(this.state.account === admin.toLowerCase()) {
                this.setState({ isAdmin: true });
            }

            const start = await this.state.ElectionInstance.getStart();
            this.setState({ elStarted: start });
            const end = await this.state.ElectionInstance.getEnd();
            this.setState({ elEnded: end });
            console.log(end);
            console.log(start);
            // Total number of voters
            const voterCount = await this.state.ElectionInstance.getTotalVoter()
            this.setState({ voterCount: voterCount });
            

            // Total number of candidates
            const candidateCount = await this.state.ElectionInstance.getTotalCandidate();
            this.setState({ candidateCount: candidateCount.toNumber() });

           // Loading Candidates details
           for (let i = 0; i < this.state.candidateCount; i++) {
                const candidate = await this.state.ElectionInstance.candidateDetails(i);
                this.state.candidates.push({
                    id: candidate.candidateId.toNumber(),
                    header: candidate.name,
                    slogan: candidate.slogan,
                });
            }

            this.setState({ candidates: this.state.candidates });
            // Loading current voters
            const voter = await this.state.ElectionInstance.Voters(this.state.account);
            this.setState({
                currentVoter: {
                    address: voter.voterAddress,
                    name: voter.name,
                    phone: voter.phone,
                    //hasVoted: voter.hasVoted,
                    isVerified: voter.isVerified,
                    isRegistered: voter.isRegistered,
                    votingPassword: voter.votingPassword,
                    eligible: voter.eligible,
                    blindedVote: voter.blindedVote,
                    signedBlindedVote: voter.signedBlindedVote,
                },
            });
        }      
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  renderCandidates = (candidate) => {
    const castVote = async (id) => {
      await this.state.ElectionInstance.methods
        .vote(id)
        .send({ from: this.state.account, gas: 1000000 });
      window.location.reload();
    };
    const confirmVote = (id, header) => {
      var r = window.confirm(
        "Vote for " + header + " with Id " + id + ".\nAre you sure?"
      );
      if (r === true) {
        castVote(id);
      }
    };
    return (
      <div className="container-item">
        <div className="candidate-info">
          <h2>
            {candidate.header} <small>#{candidate.id}</small>
          </h2>
          <p className="slogan">{candidate.slogan}</p>
        </div>
        <div className="vote-btn-container">
          <button
            onClick={() => confirmVote(candidate.id, candidate.header)}
            className="vote-bth"
            disabled={
              !this.state.currentVoter.isRegistered ||
              !this.state.currentVoter.isVerified ||
              this.state.currentVoter.hasVoted
            }
          >
            Vote
          </button>
        </div>
      </div>
    );
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
        {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
        <div>
          {!this.state.elStarted && !this.state.elEnded ? (
            <NotInit />
          ) : this.state.elStarted && !this.state.elEnded ? (
            <>
              {this.state.currentVoter.isRegistered ? (
                this.state.currentVoter.isVerified ? (
                  this.state.currentVoter.hasVoted ? (
                    <div className="container-item success">
                      <div>
                        <strong>You've casted your vote.</strong>
                        <p />
                        <center>
                          <Link
                            to="/Results"
                            style={{
                              color: "black",
                              textDecoration: "underline",
                            }}
                          >
                            See Results
                          </Link>
                        </center>
                      </div>
                    </div>
                  ) : (
                    <div className="container-item info">
                      <center>Go ahead and cast your vote.</center>
                    </div>
                  )
                ) : (
                  <div className="container-item attention">
                    <center>Please wait for admin to verify.</center>
                  </div>
                )
              ) : (
                <>
                  <div className="container-item attention">
                    <center>
                      <p>You're not registered. Please register first.</p>
                      <br />
                      <Link
                        to="/Registration"
                        style={{ color: "black", textDecoration: "underline" }}
                      >
                        Registration Page
                      </Link>
                    </center>
                  </div>
                </>
              )}
              <div className="container-main">
                <h2>Candidates</h2>
                <small>Total candidates: {this.state.candidates.length}</small>
                {this.state.candidates.length < 1 ? (
                  <div className="container-item attention">
                    <center>Not one to vote for.</center>
                  </div>
                ) : (
                  <>
                    {this.state.candidates.map(this.renderCandidates)}
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
          ) : !this.state.elStarted && this.state.elEnded ? (
            <>
              <div className="container-item attention">
                <center>
                  <h3>The Election ended.</h3>
                  <br />
                  <Link
                    to="/Results"
                    style={{ color: "black", textDecoration: "underline" }}
                  >
                    See results
                  </Link>
                </center>
              </div>
            </>
          ) : null}
        </div>
      </>
    );
  }
}
