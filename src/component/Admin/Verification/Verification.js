import React, { Component } from "react";

import Navbar from "../../Navbar/Navigation";
import NavbarAdmin from "../../Navbar/NavigationAdmin";
import NavbarOrganizer from "../../Navbar/NavigationOrganizer";
import Election from "../../../contracts/election.json";
import BlindSignature from 'blind-signatures';

import "./Verification.css";

import { ethers } from "ethers";
const electionAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default class Registration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //key: crypto.generateKeyPairSync("rsa", {modulusLength: 2048,}),
      ElectionInstance: undefined,
      ElectionInstance1: undefined,
      account: null,
      provider: null,
      isAdmin: false,
      voterCount: undefined,
      voters: [],
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

            // Total number of candidates
            const candidateCount = await this.state.ElectionInstance.candidateCount();
            this.setState({ candidateCount: candidateCount });

            const admin = await this.state.ElectionInstance.getAdmin();
            //console.log(this.state.account);
            
            if(this.state.account === admin.toLowerCase()) {
                this.setState({ isAdmin: true });
            }

            const orgnaizer = await this.state.ElectionInstance.getOrganizerAddress();
            //console.log(orgnaizer);
            // Get election start and end values
            if(this.state.account === orgnaizer.toLowerCase()) {
                //console.log("SDF");
                this.setState({ isOrganizer: true });
            }
           

            // Total number of voters
            const voterCount = await this.state.ElectionInstance.getTotalVoter()
            this.setState({ voterCount: voterCount });
            // Loading all the voters
            //console.log("dszf" + this.state.voterCount.toNumber());
            for (let i = 0; i < this.state.voterCount.toNumber(); i++) {
                const voterAddress = await this.state.ElectionInstance.voters(i);
                const voter = await this.state.ElectionInstance.Voters(voterAddress);
                this.state.voters.push({
                    address: voter.voterAddress,
                    name: voter.name,
                    phone: voter.phone,
                    hasVoted: voter.hasVoted,
                    isRegistered: voter.isRegistered,
                    votingPassword: voter.votingPassword,
                    eligible: voter.eligible,
                    blindedVote: voter.blindedVote,
                    signedBlindedVote: voter.signedBlindedVote,
                });
                
            }
            console.log(this.state.voters[0].signedBlindedVote);
            this.setState({ voters: this.state.voters });
            
    }
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };
  /*async generateKeyPair(keyTag) {
    let keys = await RSAKeychain.generate(keyTag);
    return keys.public;
  }*/
  /*iterateonvoters = () => {
    console.log(this.state.voterCount.toNumber());
    for (let i = 0; i < this.state.voterCount.toNumber(); i++) {
        console.log(i);
        this.renderUnverifiedVoters(this.state.voters[i] , i);
    }
  }*/
  renderUnverifiedVoters = (voter , index) => {
    console.log(index);
    const verifyVoter = async (verifiedStatus, address) => {
      console.log("DSFA");
      await this.state.ElectionInstance1.verifyVoter(verifiedStatus, address);
      console.log("fad");
      window.location.reload();
    };
    const generateSig = async (address, blindedVote) => {
        console.log("DSFA");
        const key = BlindSignature.keyGeneration({ b: 128 });
        const blindSig = BlindSignature.sign({
            blinded: blindedVote,
            key: key,
        }); // signs blinded message
        console.log(voter.signedBlindedVote);
        console.log(blindSig.toString());
        await this.state.ElectionInstance1.writeBlindSig(address, blindSig.toString());
        //this.state.voters[index].signedBlindedVote = blindSig;
        window.location.reload();
    };
    return (
      <>
        {   
        voter.eligible ? (
          <div className="container-list success">
            <p style={{ margin: "7px 0px" }}>AC: {voter.address}</p>
            <table>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>blindedVote</th>
                <th>signedBlindedVote</th>
              </tr>
              <tr>
                <td>{voter.name}</td>
                <td>{voter.phone}</td>
                <td>{voter.blindedVote}</td>
                <td>{voter.signedBlindedVote}</td>
              </tr>
            </table>
            <div className="vote-btn-container">
                <button
                    onClick={() => generateSig(voter.address, voter.blindedVote)}
                    className="vote-bth"
                    disabled={voter.signedBlindedVote != null}
                >
                    Generate a signiture
                </button>
            </div>
          </div>
        ) : null}
        <div
          className="container-list attention"
          style={{ display: voter.eligible ? "none" : null }}
        >
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
              <th>Password</th>
              <td>{voter.votingPassword}</td>
            </tr>
            <tr>
              <th>Verified</th>
              <td>{voter.eligible ? "True" : "False"}</td>
            </tr>
            <tr>
              <th>Registered</th>
              <td>{voter.isRegistered ? "True" : "False"}</td>
            </tr>
            <tr>
              <th>has voted</th>
              <td>{voter.hasVoted ? "True" : "False"}</td>
            </tr>
          </table>
          <div style={{}}>
            <button
              className="btn-verification approve"
              disabled={voter.eligible}
              onClick={() => verifyVoter(true, voter.address)}
            >
              Approve
            </button>
          </div>
        </div>
      </>
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
    /*if (!this.state.isAdmin && ) {
      return (
        <>
          <Navbar />
          <AdminOnly page="Verification Page." />
        </>
      );
    }*/
    return (
      <>
        <NavbarOrganizer />
        <div className="container-main">
          <h3>Verification</h3>
          <small>Total Voters: {this.state.voters.length}</small>
          {this.state.voters.length < 1 ? (
            <div className="container-item info">None has registered yet.</div>
          ) : (
            <>
              <div className="container-item info">
                <center>List of registered voters</center>
              </div>
              
              {this.state.voters.map(this.renderUnverifiedVoters)}
              
            </>
          )}
        </div>
      </>
    );
  }
}
