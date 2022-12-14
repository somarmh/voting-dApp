// Node modules
import React, { Component } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

// Components
import Navbar from "./Navbar/Navigation";
import NavbarAdmin from "./Navbar/NavigationAdmin";
import NavbarOrganizer from "./Navbar/NavigationOrganizer";
import NavbarInspector from "./Navbar/NavigationInspector";
import UserHome from "./UserHome";
import StartEnd from "./StartEnd";
import ElectionStatus from "./ElectionStatus";

// CSS
import "./Home.css";

// Contract 
import Election from "../contracts/election.json";
import { ethers } from "ethers";

const electionAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default class Home extends Component {

    constructor(props) {
      super(props);
      this.state = {
        ElectionInstance: undefined,
        account: null,
        provider: null,
        isAdmin: false,
        isOrganizer: false,
        isInspector: false,
        elStarted: false,
        elEnded: false,
        ballotCount : undefined,
        OrganizerPublicKey : '',
        InspectorPublicKey : '',
        elDetails: {},
      };
    }
    // refreshing once
    componentDidMount = async () => {

      if (!window.location.hash) {
        window.location = window.location + "#loaded";
        window.location.reload();
      }
      try{

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

            const orgnaizer = await this.state.ElectionInstance.getOrganizerAddress();
            
            // Get election start and end values
            if(this.state.account === orgnaizer.toLowerCase()) {
                this.setState({ isOrganizer: true });
                let pk;
                if( localStorage.getItem('OrganizerPublicKey') === null) {
                  /*
                  Export the given key and write it into the "exported-key" space.
                  */
                  async function exportCryptoKey(key, type) {
                    const exported = await window.crypto.subtle.exportKey(
                      "jwk",
                      key
                    );
                    
                    const pemExported = JSON.stringify(exported, null, " ");
                    if(type == 0 )localStorage.setItem('OrganizerPrivateKey', pemExported);
                    if(type == 1 )localStorage.setItem('OrganizerPublicKey', pemExported);
                  }
                /*
                Generate a sign/verify key pair,
                then set up an event listener on the "Export" button.
                */
                window.crypto.subtle.generateKey(
                  {
                    name: "ECDSA",
                    namedCurve: "P-384"
                  },
                  true,
                  ["sign", "verify"]
                ).then((keyPair) => {
                    exportCryptoKey(keyPair.privateKey,0);
                    exportCryptoKey(keyPair.publicKey,1);
                });            
                   
                 
            }}
            const var1 = await this.state.ElectionInstance.getOrganizerSigniturePublicKey();
            this.setState({ OrganizerPublicKey: var1 });
            const inspector = await this.state.ElectionInstance.getInspectorAddress();

            // Get election start and end values
            if(this.state.account === inspector.toLowerCase()) {
                this.setState({ isInspector: true });

                let pk;
                if( localStorage.getItem('InspectorPublicKey') === null) {
                  /*
                  Export the given key and write it into the "exported-key" space.
                  */
                  async function exportCryptoKey(key, type) {
                    const exported = await window.crypto.subtle.exportKey(
                      "jwk",
                      key
                    );
                      
                    const pemExported = JSON.stringify(exported, null, " ");
                    if(type == 0 )localStorage.setItem('InspectorPrivateKey', pemExported);
                    if(type == 1 )localStorage.setItem('InspectorPublicKey', pemExported);
                  }
                  /*
                  Generate a sign/verify key pair,
                  then set up an event listener on the "Export" button.
                  */
                  window.crypto.subtle.generateKey(
                    {
                      name: "ECDSA",
                      namedCurve: "P-384"
                    },
                    true,
                    ["sign", "verify"]
                  ).then((keyPair) => {
                      exportCryptoKey(keyPair.privateKey,0);
                      exportCryptoKey(keyPair.publicKey,1);
                  });            
                     
            }}

            const var2 = await this.state.ElectionInstance.getInspectorSigniturePublicKey();
            this.setState({ InspectorPublicKey: var2 });

            const start = await this.state.ElectionInstance.getStart();
            this.setState({ elStarted: start });
            const end = await this.state.ElectionInstance.getEnd();
            this.setState({ elEnded: end });

            // Getting election details from the contract
            const adminName = await this.state.ElectionInstance.getAdminName();
            const adminEmail = await this.state.ElectionInstance.getAdminEmail();
            const adminTitle = await this.state.ElectionInstance.getAdminTitle();
            const electionTitle = await this.state.ElectionInstance.getElectionTitle();
            const organizationTitle = await this.state.ElectionInstance.getOrganizationTitle();

            this.setState({
                elDetails: {
                    adminName: adminName,
                    adminEmail: adminEmail,
                    adminTitle: adminTitle,
                    electionTitle: electionTitle,
                    organizationTitle: organizationTitle,
                }
            });
        }
        }catch (error) {
            // Catch any errors for any of the above operations.
            alert(
            `Failed to load web3, accounts, or contract. Check console for details.`
            );
            console.error(error);
       } 
    };
    // end election
    endElection = async () => {
      await this.state.ElectionInstance.endElection();
      window.location.reload();
    };
    // register and start election
    registerElection = async (data) => {
      await this.state.ElectionInstance
        .setElectionDetails(
          data.adminFName + " " + data.adminLName,
          data.adminEmail,
          data.adminTitle,
          data.electionTitle,
          data.organizationTitle,
          data.organizerAddress,
          data.inspectorAddress
        )
        window.location.reload();
    };
    render() {
        const btn = {
          display: "block",
          padding: "21px",
          margin: "7px",
          minWidth: "max-content",
          textAlign: "center",
          width: "333px",
          alignSelf: "center",
        };

        const publishPublicKey = async () => {
            if(this.state.isOrganizer){
                let publicKey = await this.state.ElectionInstance.getOrganizerSigniturePublicKey();
                if(publicKey === ''){
                  await this.state.ElectionInstance.setOrganizerSigniturePublicKey(localStorage.getItem('OrganizerPublicKey'));
                }
            }
            else{
                let publicKey = await this.state.ElectionInstance.getInspectorSigniturePublicKey();
                if(publicKey === ''){
                  await this.state.ElectionInstance.setInspectorSigniturePublicKey(localStorage.getItem('InspectorPublicKey'));
                }
            }
        };

        if (!this.state.provider) {
          return (
            <>
              <Navbar />
              <center>Loading Web3, accounts, and contract...</center>
            </>
          );
        }
        return (
          <>
            {this.state.isAdmin ? <NavbarAdmin /> : this.state.isOrganizer ?  <NavbarOrganizer /> :this.state.isInspector ? <NavbarInspector /> :<Navbar />}
            <div className="container-main">
              <div className="container-item center-items info">
                Your Account: {this.state.account}
              </div>
              {!this.state.elStarted & !this.state.elEnded ? (
                <div className="container-item info">
                  <center>
                    <h3>The election has not been initialize.</h3>
                    {this.state.isAdmin ? (
                      <p>Set up the election.</p>
                    ) : (
                      <p>Please wait..</p>
                    )}
                  </center>
                </div>
              ) : null}
            </div>
            {this.state.isAdmin ? (
              <>
                <this.renderAdminHome />
              </>
            ) : this.state.elStarted ? (
              <>
                <UserHome el={this.state.elDetails} />
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
            {this.state.isOrganizer || this.state.isInspector? (
              <>
                <div className="container-item">
                    <button
                      type="button"
                      onClick={publishPublicKey}
                      style={btn}
                      disabled = {(this.state.OrganizerPublicKey !== '' && this.state.isOrganizer) ||
                                  (this.state.InspectorPublicKey !== '' && this.state.isInspector)}
                    >
                      Publish the Signature publicKey
                    </button>
                </div>
              </>
            ):null }
          </>
        );
      }
    
      renderAdminHome = () => {
        const EMsg = (props) => {
          return <span style={{ color: "tomato" }}>{props.msg}</span>;
        };
    
        const AdminHome = () => {
          // Contains of Home page for the Admin
          const {
            handleSubmit,
            register,
            formState: { errors },
          } = useForm();
    
          const onSubmit = (data) => {
            this.registerElection(data);
          };
    
          return (
            <div>
              <form onSubmit={handleSubmit(onSubmit)}>
                {!this.state.elStarted & !this.state.elEnded ? (
                  <div className="container-main">
                    {/* about-admin */}
                    <div className="about-admin">
                      <h3>About Admin</h3>
                      <div className="container-item center-items">
                        <div>
                          <label className="label-home">
                            Full Name{" "}
                            {errors.adminFName && <EMsg msg="*required" />}
                            <input
                              className="input-home"
                              type="text"
                              placeholder="First Name"
                              {...register("adminFName", {
                                required: true,
                              })}
                            />
                            <input
                              className="input-home"
                              type="text"
                              placeholder="Last Name"
                              {...register("adminLName")}
                            />
                          </label>
    
                          <label className="label-home">
                            Email{" "}
                            {errors.adminEmail && (
                              <EMsg msg={errors.adminEmail.message} />
                            )}
                            <input
                              className="input-home"
                              placeholder="eg. you@example.com"
                              name="adminEmail"
                              {...register("adminEmail", {
                                required: "*Required",
                                pattern: {
                                  value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/, // email validation using RegExp
                                  message: "*Invalid",
                                },
                              })}
                            />
                          </label>
    
                          <label className="label-home">
                            Job Title or Position{" "}
                            {errors.adminTitle && <EMsg msg="*required" />}
                            <input
                              className="input-home"
                              type="text"
                              placeholder="eg. HR Head "
                              {...register("adminTitle", {
                                required: true,
                              })}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                    {/* about-election */}
                    <div className="about-election">
                      <h3>About Election</h3>
                      <div className="container-item center-items">
                        <div>
                          <label className="label-home">
                            Election Title{" "}
                            {errors.electionTitle && <EMsg msg="*required" />}
                            <input
                              className="input-home"
                              type="text"
                              placeholder="eg. School Election"
                              {...register("electionTitle", {
                                required: true,
                              })}
                            />
                          </label>
                          <label className="label-home">
                            Organization Name{" "}
                            {errors.organizationName && <EMsg msg="*required" />}
                            <input
                              className="input-home"
                              type="text"
                              placeholder="eg. HIAST"
                              {...register("organizationTitle", {
                                required: true,
                              })}
                            />
                          </label>
                          <label className="label-home">
                            Organizer Address{" "}
                            {errors.organizerAddress && <EMsg msg="*required" />}
                            <input
                              className="input-home"
                              type="text"
                              placeholder="eg. 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"
                              {...register("organizerAddress", {
                                required: true,
                              })}
                            />
                          </label>
                          <label className="label-home">
                            Inspector Address{" "}
                            {errors.inspectorAddress && <EMsg msg="*required" />}
                            <input
                              className="input-home"
                              type="text"
                              placeholder="eg. 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"
                              {...register("inspectorAddress", {
                                required: true,
                              })}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : this.state.elStarted ? (
                  <UserHome el={this.state.elDetails} />
                ) : null}
                <StartEnd
                  elStarted={this.state.elStarted}
                  elEnded={this.state.elEnded}
                  endElFn={this.endElection}
                />
                <ElectionStatus
                  elStarted={this.state.elStarted}
                  elEnded={this.state.elEnded}
                />
              </form>
            </div>
          );
        };
        return <AdminHome />;
      };
};
    