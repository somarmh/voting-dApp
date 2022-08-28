import React, { Component } from "react";

import Navbar from "../../Navbar/Navigation";
import NavbarAdmin from "../../Navbar/NavigationAdmin";
import NavbarOrganizer from "../../Navbar/NavigationOrganizer";
import Election from "../../../contracts/election.json";
import BlindSignature from 'blind-signatures';
//37341274217401084917093058644698059369
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
            console.log(localStorage.getItem('OrganizerPrivateKey'));
            console.log(localStorage.getItem('InspectorPrivateKey'));
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
            const voterCount = await this.state.ElectionInstance.getTotalVoter();
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
                    eligible: voter.eligible,
                    blindedVote: voter.blindedVote,
                    organizersig: voter.organizersig,
                    inspectorsig: voter.inspectorsig
                });
                
            }
            //console.log(this.state.voters[0].signedBlindedVote);
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
    console.log(index);
    const verifyVoter = async (verifiedStatus, address) => {
      console.log("DSFA");
      await this.state.ElectionInstance1.verifyVoter(verifiedStatus, address);
      console.log("fad");
      window.location.reload();
    };
    const generateSig = async (address, blindedVote) => {
       
      /*
      Convert a string into an ArrayBuffer
      from https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
      */
      function str2ab(str) {
        const buf = new ArrayBuffer(str.length);
        const bufView = new Uint8Array(buf);
        for (let i = 0, strLen = str.length; i < strLen; i++) {
          bufView[i] = str.charCodeAt(i);
        }
        return buf;
      }


      /*
      Import a PEM encoded RSA private key, to use for RSA-PSS signing.
      Takes a string containing the PEM encoded key, and returns a Promise
      that will resolve to a CryptoKey representing the private key.
      */
      function importPrivateKey(pem) {
        console.log(pem);
        // fetch the part of the PEM string between header and footer
        const pemHeader = "-----BEGIN PRIVATE KEY-----";
        const pemFooter = "-----END PRIVATE KEY-----";
        const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length);
        // base64 decode the string to get the binary data
        const binaryDerString = window.atob(pemContents);
        // convert from a binary string to an ArrayBuffer
        const binaryDer = str2ab(binaryDerString);

        return window.crypto.subtle.importKey(
          "pkcs8",
          binaryDer,
          {
            name: "RSA-PSS",
            // Consider using a 4096-bit key for systems that require long-term security
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
          },
          true,
          ["sign"]
        );
      }


      console.log(localStorage.getItem('OrganizerPrivateKey'));
      const pemEncodedKey = localStorage.getItem('OrganizerPrivateKey');

      const signingKey = await importPrivateKey(pemEncodedKey);
      const enc = new TextEncoder();
      const encoded = enc.encode(blindedVote);;
      console.log(signingKey);
      const signature = await window.crypto.subtle.sign(
        {
          name: "RSA-PSS",
          saltLength: 16,
        },
        signingKey,
        encoded
      );
      const encoded1 = enc.encode(signature);
      
      const sig = encoded1.toString();
      console.log(sig);
      await this.state.ElectionInstance1.writeOrganizerSig(address, sig);
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
                <th>Organizer Signiture</th>
              </tr>
              <tr>
                <td>{voter.name}</td>
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
              <th>Name</th>
              <td>{voter.name}</td>
            </tr>
            <tr>
              <th>Phone</th>
              <td>{voter.phone}</td>
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
