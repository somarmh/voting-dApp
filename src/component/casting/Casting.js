// Node modules
import React, { Component } from "react";
import { Link } from "react-router-dom";
//import crypto = require('crypto');
import crypto from 'crypto-browserify'
import AesEncryption from 'aes-encryption'
// Components
import Navbar from "../Navbar/Navigation";
import NavbarAdmin from "../Navbar/NavigationAdmin";
import NotInit from "../NotInit";

// CSS
import "./Casting.css";

// Contract
import Election from "../../contracts/election.json";
import { ethers } from "ethers";

const electionAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default class Voting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      randomString: '',
      aes:  new AesEncryption(),
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
        eligible: null,
        hasVoted: false,
        isRegistered: false,
        blindedVote: "",
        organizersig: "",
        inspectorsig: "",
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
            if(localStorage.getItem('secretKey') == null){
              localStorage.setItem('secretKey', crypto.randomBytes(32).toString("hex"));
            }
            if(this.state.randomString === ''){
              const var1 = localStorage.getItem('secretKey');
              this.setState({randomString: var1});
            }
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
            const admin = await this.state.ElectionInstance.getAdmin();
        
            if(this.state.account === admin.toLowerCase()) {
                this.setState({ isAdmin: true });
            }

            const start = await this.state.ElectionInstance.getStart();
            this.setState({ elStarted: start });
            const end = await this.state.ElectionInstance.getEnd();
            this.setState({ elEnded: end });

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
                    isRegistered: voter.isRegistered,
                    eligible: voter.eligible,
                    hasVoted: voter.hasVoted,
                    blindedVote: voter.blindedVote,
                    organizersig: localStorage.getItem('organizersig'),
                    inspectorsig: localStorage.getItem('inspectorsig')
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

    const castBallot = async (id) => {
      this.state.aes.setSecretKey(this.state.randomString);

      // Note: secretKey must be 64 length of only valid HEX characters, 0-9, A, B, C, D, E and F

      const encrypted = this.state.aes.encrypt(id.toString());
      const decrypted = this.state.aes.decrypt(encrypted);


      await this.state.ElectionInstance.vote(id, this.state.randomString, localStorage.getItem('organizersig') ,localStorage.getItem('inspectorsig'));
      //window.location.reload();
    };
    const Vote = (id) => {
        castBallot(id);
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
            onClick={() => Vote(candidate.id)}
            className="vote-bth"
            disabled={
              this.state.currentVoter.organizersig === "" || this.state.currentVoter.inspectorsig === ""
            }
          >
            Cast
          </button>
      </div>
      </div>
    );
  };
  handleChange = (event) => {
    localStorage.setItem('organizersig',event.target.value);
  }

  handleChange1 = (event) => {
    localStorage.setItem('inspectorsig',event.target.value);
  }

  handleSubmit(event) {
    event.preventDefault();
  }

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
                this.state.currentVoter.eligible ? (
                  this.state.currentVoter.hasVoted ? (
                    <div className="container-item success">
                      <div>
                        <strong>You've casted your vote waiting for the signiture</strong>
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
                      <center>Go ahead and choose your candidate<br /> 
                              The system will blind the vote for the signiture
                      </center>
                    </div>
                  )
                ) : (
                  <div className="container-item attention">
                    <center>Please wait for organizer to give you a signiture.</center>
                  </div>
                )
              ) : (
                <>
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
                    
                      <label className="label-home">
                          Organizer Signature{" "}
                          <input
                              className="input-home"
                              type="text"
                              onChange={this.handleChange}
                          />
                      </label>
                      
                      <label className="label-home">
                          Inspector Signature{" "}
                          <input
                              className="input-home"
                              type="text"
                              onChange={this.handleChange1}
                          />
                      </label>
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
