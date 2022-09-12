import React, { Component } from "react";

import Navbar from "../../Navbar/Navigation";
import NavbarAdmin from "../../Navbar/NavigationAdmin";
import NavbarOrganizer from "../../Navbar/NavigationOrganizer";
import Election from "../../../contracts/election.json";
import "./Verification.css";
import { FcApproval, FcDisapprove } from "react-icons/fc";

import { ethers } from "ethers";
const electionAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default class Registration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ElectionInstance: undefined,
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
                signer
            );

            this.setState({
                provider: provider,
                ElectionInstance: contract,
                account: accounts[0],
            });

            // Total number of candidates
            const candidateCount = await this.state.ElectionInstance.candidateCount();
            this.setState({ candidateCount: candidateCount });

            const admin = await this.state.ElectionInstance.getAdmin();
            
            if(this.state.account === admin.toLowerCase()) {
                this.setState({ isAdmin: true });
            }

            const orgnaizer = await this.state.ElectionInstance.getOrganizerAddress();

            // Get election start and end values
            if(this.state.account === orgnaizer.toLowerCase()) {
                this.setState({ isOrganizer: true });
            }
           

            // Total number of voters
            const voterCount = await this.state.ElectionInstance.getTotalVoter();
            this.setState({ voterCount: voterCount });

            // Loading all the voters
            for (let i = 0; i < this.state.voterCount.toNumber(); i++) {
                const voterAddress = await this.state.ElectionInstance.voters(i);
                const voter = await this.state.ElectionInstance.Voters(voterAddress);
                this.state.voters.push({
                    address: voter.voterAddress,
                    phone: voter.phone,
                    nationalNumber: voter.nationalNumber,
                    hasVoted: voter.hasVoted,
                    isRegistered: voter.isRegistered,
                    eligible: voter.eligible,
                    blindedVote: voter.blindedVote,
                    organizersig: voter.organizersig,
                    inspectorsig: voter.inspectorsig
                });
                
            }
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

  renderUnverifiedVoters = (voter , index) => {
    const verifyVoter = async (verifiedStatus, address) => {
      await this.state.ElectionInstance.verifyVoter(verifiedStatus, address);
      window.location.reload();
    };
    const generateSig = async (address, blindedVote) => {
      /*
      Import a JSON Web Key format EC private key, to use for ECDSA signing.
      Takes a string containing the JSON Web Key, and returns a Promise
      that will resolve to a CryptoKey representing the private key.
      */
      function importPrivateKey(jwk) {
        return window.crypto.subtle.importKey(
          "jwk",
          jwk,
          {
            name: "ECDSA",
            namedCurve: "P-384"
          },
          true,
          ["sign"]
        );
      }

      const jwkEcKey = JSON.parse(localStorage.getItem('OrganizerPrivateKey'));
      const pbb = JSON.parse(localStorage.getItem('OrganizerPublicKey'));

      const importedOrganizerPublicKey = await importpublicKey(pbb);
      const signingKey = await importPrivateKey(jwkEcKey);
      const enc = new TextEncoder();
      const encoded = enc.encode(blindedVote);
      async function verify(publicKey, sig) {
      let result = await window.crypto.subtle.verify(
        {
            name: "ECDSA",
            hash: {name: "SHA-384"},
        },
        publicKey,
        sig,
        encoded
      );
      return result;
      }

      function importpublicKey(jwk) {
        return window.crypto.subtle.importKey(
          "jwk",
          jwk,
          {
            name: "ECDSA",
            namedCurve: "P-384"
          },
          true,
          ["verify"]
        );
      }
      const signature = await window.crypto.subtle.sign(
        {
          name: "ECDSA",
          hash: "SHA-384"
        },
        signingKey,
        encoded
      );
      let osig = await verify(importedOrganizerPublicKey, signature);
      var ab2str = require('arraybuffer-to-string');
      const sig = ab2str(signature, 'base64');
      await this.state.ElectionInstance.writeOrganizerSig(address, sig);
      window.location.reload();
    };
    return (
      <>
        {   
        voter.eligible ? (
          <div className="container-list success">
            <p style={{ margin: "7px 0px", width: "70px"}}>AC: {voter.address}</p>
            <table>
              <tr>
                <th>national number</th>
                <th>Phone</th>
                <th>blindedVote</th>
                <th>Organizer Signiture</th>
              </tr>
              <tr>
                <td>{voter.nationalNumber}</td>
                <td>{voter.phone}</td>
                <td>{voter.blindedVote}</td>
                <td>{voter.organizersig}</td>
              </tr>
            </table>
            <div className="vote-btn-container">
                <button
                    onClick={() => generateSig(voter.address, voter.blindedVote)}
                    className="vote-bth"
                    disabled={voter.blindedVote === "" || voter.organizersig !== ""}
                >
                    Generate a signature
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
              <th>National number</th>
              <td>{voter.nationalNumber}</td>
            </tr>
            <tr>
              <th>Phone</th>
              <td>{voter.phone}</td>
            </tr>
            <tr>
              <th>Verified</th>
              <td>{voter.eligible ? <FcApproval className="App-logo" /> : <FcDisapprove className="App-logo"/>}</td>
            </tr>
            <tr>
              <th>Registered</th>
              <td>{voter.isRegistered ? <FcApproval className="App-logo" /> : <FcDisapprove className="App-logo"/>}</td>
            </tr>
            <tr>
              <th>has voted</th>
              <td>{voter.hasVoted ? <FcApproval className="App-logo" /> : <FcDisapprove className="App-logo"/>}</td>
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
