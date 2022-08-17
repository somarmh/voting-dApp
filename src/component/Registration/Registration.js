// Node modules
import React, { Component } from "react";

// Components
import Navbar from "../Navbar/Navigation";
import NavbarAdmin from "../Navbar/NavigationAdmin";
import NotInit from "../NotInit";

// CSS
import "./Registration.css";

// Contract
import Election from "../../contracts/election.json";
import { ethers } from "ethers";

const electionAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default class Registration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ElectionInstance: undefined,
      ElectionInstance1: undefined,
      provider: null,
      account: null,
      isAdmin: false,
      elStarted: false,
      elEnded: false,
      voterCount: undefined,
      voterName: "",
      voterPhone: "",
      voterPassword: "",
      voters: [],
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
            
            // Loading all the voters
            for (let i = 0; i < this.state.voterCount; i++) {
                const voterAddress = await this.state.ElectionInstance.voters(i)
                const voter = await this.state.ElectionInstance.Voters(voterAddress);
                this.state.voters.push({
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
                });
            }
            this.setState({ voters: this.state.voters });
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
      console.error(error);
      alert(
        `Failed to load web3, accounts, or contract. Check console for details (f12).`
      );
    }
  };
  updateVoterName = (event) => {
    this.setState({ voterName: event.target.value });
  };
  updateVoterPhone = (event) => {
    this.setState({ voterPhone: event.target.value });
  };
  updateVoterPassword = (event) => {
    this.setState({ voterPassword: event.target.value });
  };
  registerAsVoter = async () => {
    console.log("DSf1");
    await this.state.ElectionInstance1.registerAsVoter(this.state.voterName, this.state.voterPhone , this.state.voterPassword);
    console.log("DSf2");
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
                      Name
                      <input
                        className={"input-r"}
                        type="text"
                        placeholder="eg. Somar"
                        value={this.state.voterName}
                        onChange={this.updateVoterName}
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
                  <div className="div-li">
                    <label className={"label-r"}>
                      Voting password <span style={{ color: "tomato" }}></span>
                      <input
                        className={"input-r"}
                        type="text"
                        placeholder=""
                        value={this.state.voterPassword}
                        onChange={this.updateVoterPassword}
                      />
                    </label>
                  </div>
                  <p className="note">
                    <span style={{ color: "tomato" }}> Note: </span>
                    <br /> Make sure your account address and Phone number are
                    correct. <br /> Organizer might not approve your account if the
                    provided Password does not matches the account
                    address registered in organizer catalogue.
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
            <th>Name</th>
            <td>{voter.name}</td>
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
            <th>Verification</th>
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
              <th>Name</th>
              <td>{voter.name}</td>
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
