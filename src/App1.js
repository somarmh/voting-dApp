import { useState } from "react";
import { ethers } from "ethers";
// Import ABI Code to interact with smart contract
import Election from "./contracts/election.json";
import "./App.css";

// The contract address
const electionAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
  // Property Variables

  const [message, setMessage] = useState("");
  const [currentElection, setCurrentElection] = useState("");

  // Helper Functions

  // Requests access to the user's Meta Mask Account
  // https://metamask.io/
  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  // Fetches the current value store in greeting
  async function fetchElection() {
    // If MetaMask exists
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        electionAddress,
        Election.abi,
        provider
      );
      try {
        // Call Greeter.greet() and display current greeting in `console`
        /* 
          function greet() public view returns (string memory) {
            return greeting;
          }
        */
        const data = await contract.getStart();
        console.log("data: ", data);
        setCurrentElection(data);
      } catch (error) {
        console.log("Error: ", error);
      }
    }
  }

  // Sets the greeting from input text box
  async function setElection() {
    if (!message) return;
 
    // If MetaMask exists
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Create contract with signer
      /*
        function setGreeting(string memory _greeting) public {
          console.log("Changing greeting from '%s' to '%s'", greeting, _greeting);
          greeting = _greeting;
        } 
      */
      const contract = new ethers.Contract(electionAddress, Election.abi, signer);
      const transaction = await contract.endElection();

      setMessage("");
      await transaction.wait();
      fetchElection();
    }
  }

  // Return
  return (
    <div className="App">
      <div className="App-header">
        {/* DESCRIPTION  */}
        <div className="description">
          <h1>Election.sol</h1>
          <h3>Full stack dapp using ReactJS and Hardhat</h3>
        </div>
        {/* BUTTONS - Fetch and Set */}
        <div className="custom-buttons">
          <button onClick={fetchElection} style={{ backgroundColor: "green" }}>
            Fetch Election
          </button>
          <button onClick={setElection} style={{ backgroundColor: "red" }}>
            Set Election
          </button>
        </div>
        {/* INPUT TEXT - String  */}
        <input
          onChange={(e) => setMessage(e.target.value)}
          value={message}
          placeholder="Set Election Message"
        />

        {/* Current Value stored on Blockchain */}
        <h2 className="greeting">Election: {currentElection}</h2>
      </div>
    </div>
  );
}

export default App;
