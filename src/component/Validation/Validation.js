import React, { Component } from "react";

import Navbar from "../Navbar/Navigation";
import NavbarAdmin from "../Navbar/NavigationAdmin";
import NavbarOrganizer from "../Navbar/NavigationOrganizer";
import Election from "../../contracts/election.json";
import AesEncryption from 'aes-encryption'
import NotInit from "../NotInit";
//37341274217401084917093058644698059369
import "./Validation.css";

import { ethers } from "ethers";
const electionAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default class Registration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ElectionInstance: undefined,
      aes:  new AesEncryption(),
      account: null,
      provider: null,
      isAdmin: false,
      ballots: [],
      ballotCount : undefined,
      OrganizerPublicKey : '',
      InspectorPublicKey : '',
      usedSignatures :[],
      elStarted: false,
      elEnded: false,
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
            
            const start = await this.state.ElectionInstance.getStart();
            this.setState({ elStarted: start });
            const end = await this.state.ElectionInstance.getEnd();
            this.setState({ elEnded: end });

            const ballotCount = await this.state.ElectionInstance.getTotalBallots();
            this.setState({ballotCount : ballotCount.toNumber()});
            for (let i = 0; i < ballotCount; i++) {
                const ballot = await this.state.ElectionInstance.Ballots(i);
                this.state.ballots.push({
                    choiceCode: ballot.choiceCode.toNumber(),
                    secretKey: ballot.secretKey,
                    organizersig: ballot.organizersig,
                    inspectorsig: ballot.inspectorsig,
                });
                
            }
            this.setState({ ballots: this.state.ballots });
            let OrganizerPublicKey = await this.state.ElectionInstance.getOrganizerSigniturePublicKey();
            let InspectorPublicKey = await this.state.ElectionInstance.getInspectorSigniturePublicKey();
            this.setState({OrganizerPublicKey: OrganizerPublicKey});
            this.setState({InspectorPublicKey: InspectorPublicKey});
            
        }
    } catch (error) {
      // Catch any errors for any of the above operations.
        alert(
            `Failed to load web3, accounts, or contract. Check console for details.`
        );
        console.error(error);
    }
  };

  renderBallots = (ballot , index) => {

    
    const validate = async (choiceCode, secretKey, organizersig, inspectorsig) => {

        this.state.aes.setSecretKey(secretKey);
        const encrypted = this.state.aes.encrypt(choiceCode.toString());
        const decrypted = this.state.aes.decrypt(encrypted);
        const enc = new TextEncoder();
        /*
        Fetch the encoded message-to-sign and verify it against the stored signature.
        * If it checks out, set the "valid" class on the signature.
        * Otherwise set the "invalid" class.
        */
        async function verify(publicKey, sig) {
            
            let encoded = enc.encode(encrypted);
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
        
      /*
      Import a JSON Web Key format EC private key, to use for ECDSA signing.
      Takes a string containing the JSON Web Key, and returns a Promise
      that will resolve to a CryptoKey representing the private key.
      */
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
      const organizerPublicKey = JSON.parse(this.state.OrganizerPublicKey);
      const inspectorPublicKey = JSON.parse(this.state.InspectorPublicKey);
      const importedOrganizerPublicKey = await importpublicKey(organizerPublicKey);
      const importedInspectorPublicKey = await importpublicKey(inspectorPublicKey);
      var str2ab = require('string-to-arraybuffer');
      var inssig = str2ab(inspectorsig);
      var orgsig = str2ab(organizersig);
      let osig = await verify(importedOrganizerPublicKey, orgsig);
      let isig = await verify(importedInspectorPublicKey, inssig);
      if(osig && isig){
          const x1 = await this.state.ElectionInstance.signitureIsUsed(encrypted);
          const x2 = await this.state.ElectionInstance.getEnd();
          await this.state.ElectionInstance.validBallots(encrypted, choiceCode);
      }
    }

    return (
      <>
          <div className="container-list success">
            <table>
              <tr>
                <th>choice Code</th>
                <th>secretKey</th>
                <th>organizersig</th>
                <th>inspectorsig</th>
              </tr>
              <tr>
                <td>{ballot.choiceCode}</td>
                <td>{ballot.secretKey}</td>
                <td>{ballot.organizersig}</td>
                <td>{ballot.inspectorsig}</td>
              </tr>
            </table>
            <div className="vote-btn-container">
                <button
                    onClick={() => validate(ballot.choiceCode, ballot.secretKey, ballot.organizersig, ballot.inspectorsig)}
                    className="vote-bth"
                    //disabled={ballot.finish}
                >
                    validate and count
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
        <br />
        <div>
            {!this.state.elStarted && !this.state.elEnded ? (
            <NotInit />
            ) : this.state.elStarted && !this.state.elEnded ? (
            <div className="container-item attention">
                <center>
                <h3>The election is being conducted at the movement.</h3>
                <br />
                </center>
            </div>
            ) : !this.state.elStarted && this.state.elEnded ? (
                <div className="container-main">
                <h3>Validation</h3>
                <small>Total Ballots: {this.state.ballotCount}</small>
                {this.state.ballotCount < 1 ? (
                    <div className="container-item info">There isn't any ballot yet.</div>
                ) : (
                    <>
                    <div className="container-item info">
                        <center>List of ballots</center>
                    </div>
                    
                    {this.state.ballots.map(this.renderBallots)}
                    
                    </>
                )}
                </div>
            ) : null}
        </div>
        
      </>
    );
  }
}
