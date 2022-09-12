// Node modules
import React, { Component } from "react";

// Components
import Navbar from "../Navbar/Navigation";
import NavbarAdmin from "../Navbar/NavigationAdmin";
import NotInit from "../NotInit";

// CSS
import "./Registration.css";
import { FcApproval, FcDisapprove } from "react-icons/fc";
// Contract
import Election from "../../contracts/election.json";
import { ethers } from "ethers";

const electionAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default class Registration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ElectionInstance: undefined,
      provider: null,
      account: null,
      isAdmin: false,
      elStarted: false,
      elEnded: false,
      voterCount: undefined,
      voterName: "",
      voterPhone: "",
      voterNationalNumber: "",
      voterPassword: "",
      voters: [],
      currentVoter: {
        address: undefined,
        phone: null,
        nationalNumber: null,
        eligible: false,
        hasVoted: false,
        isRegistered: false,
        blindedVote: "",
        organizersig: "",
        inspectorsig: "",
      },
    };
  }

  // refreshing once
  componentDidMount = async () => {
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
            
            // Loading all the voters
            for (let i = 0; i < this.state.voterCount; i++) {
                const voterAddress = await this.state.ElectionInstance.voters(i)
                const voter = await this.state.ElectionInstance.Voters(voterAddress);
                this.state.voters.push({
                    address: voter.voterAddress,
                    phone: voter.phone,
                    nationalNumber: voter.nationalNumber,
                    hasVoted: voter.hasVoted,
                    isRegistered: voter.isRegistered,
                    votingPassword: voter.votingPassword,
                    eligible: voter.eligible,
                    blindedVote: voter.blindedVote,
                    signedBlindedVote: voter.signedBlindedVote,
                });
            }
            this.setState({ voters: this.state.voters });
            // Loading current voters
            const voter = await this.state.ElectionInstance.Voters(this.state.account);
            this.setState({
                currentVoter: {
                    address: voter.voterAddress,
                    nationalNumber: voter.nationalNumber,
                    phone: voter.phone,
                    hasVoted: voter.hasVoted,
                    isVerified: voter.eligible,
                    isRegistered: voter.isRegistered,
                    eligible: voter.eligible,
                    blindedVote: voter.blindedVote,
                    organizersig: voter.organizersig,
                    inspectorsig: voter.inspectorsig
                },
            });
        }      
    } catch (error) {
      // Catch any errors for any of the above operations.
      console.error(error);
      alert(
        `Failed to load web3, accounts, or contract. Check console for details (f12).`
      );
    }
  };
  updateVoterPhone = (event) => {
    this.setState({ voterPhone: event.target.value });
  };
  updateNationalNumber = (event) => {
    this.setState({ voterNationalNumber: event.target.value });
  };
  registerAsVoter = async () => {
    await this.state.ElectionInstance.registerAsVoter(this.state.voterNationalNumber, this.state.voterPhone );
    window.location.reload();
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
        {!this.state.elStarted && !this.state.elEnded ? (
          <NotInit />
        ) : (
          <>
            <div className="container-item info">
              <p>Total registered voters: {this.state.voters.length}</p>
            </div>
            <div className="container-main">
              <h3>Registration</h3>
              <small>Register to vote.</small>
              <div className="container-item">
                <form>
                  
                  <div className="div-li">
                    <label className={"label-r"}>
                      National number
                      <input
                        className={"input-r"}
                        type="text"
                        placeholder="eg. 051900032514"
                        value={this.state.voterNationalNumber}
                        onChange={this.updateNationalNumber}
                      />{" "}
                    </label>
                  </div>
                  <div className="div-li">
                    <label className={"label-r"}>
                      Phone number <span style={{ color: "tomato" }}></span>
                      <input
                        className={"input-r"}
                        type="number"
                        placeholder="eg. 937940832"
                        value={this.state.voterPhone}
                        onChange={this.updateVoterPhone}
                      />
                    </label>
                  </div>
                  <p className="note">
                    <span style={{ color: "tomato" }}> Note: </span>
                    <br /> Make sure your phone number and your national number are
                    correct. <br /> Organizers and Inspectors might not approve your account if the
                    provided Phone number does not matches the national number
                    registered in their catalogue.
                  </p>
                    
                  <button
                    className="btn-add"
                    disabled={
                      this.state.voterPhone.length !== 10 ||
                      this.state.currentVoter.isVerified
                    }
                    onClick={this.registerAsVoter}
                  >
                    {this.state.currentVoter.isRegistered
                      ? "Update"
                      : "Register"}
                  </button>
                </form>
              </div>
            </div>
            <div
              className="container-main"
              style={{
                borderTop: this.state.currentVoter.isRegistered
                  ? null
                  : "1px solid",
              }}
            >
              {loadCurrentVoter(
                this.state.currentVoter,
                this.state.currentVoter.isRegistered
              )}
            </div>
            {this.state.isAdmin ? (
              <div
                className="container-main"
                style={{ borderTop: "1px solid" }}
              >
                <small>TotalVoters: {this.state.voters.length}</small>
                {loadAllVoters(this.state.voters)}
              </div>
            ) : null}
          </>
        )}
      </>
    );
  }
}
export function loadCurrentVoter(voter, isRegistered) {
  return (
    <>
      <div
        className={"container-item " + (isRegistered ? "success" : "attention")}
      >
        <center>Your Registered Info</center>
      </div>
      <div
        className={"container-list " + (isRegistered ? "success" : "attention")}
      >
        <table>
          <tr>
            <th>Account Address</th>
            <td>{voter.address}</td>
          </tr>
          <tr>
            <th>National Number</th>
            <td>{voter.nationalNumber}</td>
          </tr>
          <tr>
            <th>Phone</th>
            <td>{voter.phone}</td>
          </tr>
          <tr>
            <th>Voted</th>
            <td>{voter.hasVoted ? <FcApproval className="App-logo" /> : <FcDisapprove className="App-logo"/>}</td>
          </tr>
          <tr>
            <th>Verification</th>
            <td>{voter.isVerified ? <FcApproval className="App-logo"/> : <FcDisapprove className="App-logo"/>}</td>
          </tr>
          <tr>
            <th>Registered</th>
            <td>{voter.isRegistered ? <FcApproval className="App-logo"/> : <FcDisapprove className="App-logo"/>}</td>
          </tr>
          <tr>
            <th>blindedVote</th>
            <td>{voter.blindedVote}</td>
          </tr>
          <tr>
            <th>Organizer Signiture</th>
            <td>{voter.organizersig}</td>
          </tr>
          <tr>
            <th>Inspector Signiture</th>
            <td>{voter.inspectorsig}</td>
          </tr>
        </table>
      </div>
    </>
  );
}
export function loadAllVoters(voters) {
  const renderAllVoters = (voter) => {
    return (
      <>
        <div className="container-list success">
          <table>
            <tr>
              <th>Account address</th>
              <td>{voter.address}</td>
            </tr>
            <tr>
              <th>National number</th>
              <td>{voter.nationalNumber}</td>
            </tr>
            <tr>
              <th>Phone</th>
              <td>{voter.phone}</td>
            </tr>
            <tr>
              <th>Voted</th>
              <td>{voter.hasVoted ? "True" : "False"}</td>
            </tr>
            <tr>
              <th>Verified</th>
              <td>{voter.isVerified ? "True" : "False"}</td>
            </tr>
            <tr>
              <th>Registered</th>
              <td>{voter.isRegistered ? "True" : "False"}</td>
            </tr>
          </table>
        </div>
      </>
    );
  };
  return (
    <>
      <div className="container-item success">
        <center>List of voters</center>
      </div>
      {voters.map(renderAllVoters)}
    </>
  );
}
