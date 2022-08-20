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
//const crypto = require("crypto");
//const AesEncryption = require('aes-encryption');
export default class Voting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      randomString: crypto.randomBytes(32).toString("hex"),
      aes:  new AesEncryption(),
      ElectionInstance: undefined,
      ElectionInstance1: undefined,
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
        hasVoted: false,
        isRegistered: false,
        blindedVote: "",
        signedBlindedVote: "",
        hasUsedSig: false
      },
    };
  }
  componentDidMount = async () => {
    console.log('voter1     ' + this.setState.randomString);
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
                    votingPassword: voter.votingPassword,
                    eligible: voter.eligible,
                    hasVoted: voter.hasVoted,
                    blindedVote: voter.blindedVote,
                    signedBlindedVote: voter.signedBlindedVote,
                },
            });
            console.log(this.state.currentVoter.signedBlindedVote);
            this.setState({ hasUsedSig: await this.state.ElectionInstance1.signitureIsUsed(this.state.currentVoter.signedBlindedVote)});
    
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

      
      console.log('voter1     ' + this.state.randomString);
      this.state.aes.setSecretKey(this.state.randomString);
      //aes.setSecretKey('11122233344455566677788822244455555555555555555231231321313aaaff')
      // Note: secretKey must be 64 length of only valid HEX characters, 0-9, A, B, C, D, E and F

      const encrypted = this.state.aes.encrypt(id.toString());
      const decrypted = this.state.aes.decrypt(encrypted);

      console.log('encrypted >>>>>>', encrypted);
      console.log('decrypted >>>>>>', decrypted);
      console.log(this.state.currentVoter.signedBlindedVote);


      await this.state.ElectionInstance1.vote(id, this.state.randomString, this.state.currentVoter.signedBlindedVote);
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
              this.state.currentVoter.signedBlindedVote === "" 
            }
          >
            Cast
          </button>
      </div>
      </div>
    );
  };
  handleChange = (event) => {
    this.setState({
      currentVoter : {
        signedBlindedVote : event.target.value
      }
    });
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
                    
                      <label className="label-home">
                          Signiture{" "}
                          <input
                              className="input-home"
                              type="text"
                              onChange={this.handleChange}
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
