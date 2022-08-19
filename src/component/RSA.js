const crypto = require("crypto");

// The `generateKeyPairSync` method accepts two arguments:
// 1. The type ok keys we want, which in this case is "rsa"
// 2. An object with the properties of the key
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  // The standard secure default length for RSA keys is 2048 bits
  modulusLength: 2048,
});


export default y=publicKey.export({
		type: "pkcs1",
		format: "pem",
});

const X=privateKey.export({
    type: "pkcs1",
    format: "pem",
});

console.log("public key:\n" +y.toString());
/*
let y = "MIIBCgKCAQEAzhjiOLdgMZqoCEK3XjwnIDFC4z+qbquov1Qb6CtS+IAVOZVGJR41U+C5B08KX5k0vpTFGlAfpB0XrlIdsTsu2UnnteO/l4ykpXjS8GKIXpsyq7EYDLQJ6KxaR0+YWTCBGkomUVLVVFFXbX9GVvmqcmufOoxt+NpPYRHhXdp0naxXDfTi+TQ8VIQL1U5+UdbcLz6UUqgY7CdJ5HTlaRuqtbL+oKkbkipqEmWErFlUj4Fd7pzwQnws8clgDm6/fqL79CCA+Y06Y5cciUhkAqOSYbLGG39FwXCuhO6kKEOjWpO321aKff2iTy4wbuZug9HvKzkF4yR3FQot2Ph/AREFwQIDAQAB"
let x=privateKey.export({
  type: "pkcs1",
  format: "pem",
});*/
//console.log("private key:  " +x);
//let y = 'MIIBCgKCAQEA5Ik3KVopfX0wnlUpuUFO6weIYIh0GyGlwYnr2QWY2CBk3AGGkXe2K/tTbJIOjGIwNkT75+IwO+nLpz0hAyjfxXU5mCGBTNJSLXKDp1FIwdY7TzNhCnLRr1SMaKOphAY2n3JRqqwMQMg3GE1rVmtprFCuY+rs0vJcb+a4BlqiuJ/m4WcGhO3fS1SXlI5bq0dMcqy6dx0TXSyTUh7yOC7oc2N4mfvdXgg2xAFZJJRdkjaNoOb6v8dkeTBTN6ZooWgMyoVPAwdHRq1iM64HHSsj0GvP2IdpYGooMRRE52zCWu1SCMvqHWO/2nPf4nBKhARDev9etTFZYH9FqJlfDryf9QIDAQAB'
//console.log(y);
// Create some sample data that we want to sign
const verifiableData = "this need to be verified";
const verifiableData1 = "this n1eed to be verified";
const blindedvote1 = '3b2993815f8c90b4bd41998851568422';
const blindedvote2 = '67a0e09f6d124b5fdf112cacf40f34c8';
const blindedvote3 = '4e1b030af7b6321ea63d0d18cfec88c5';

// The signature method takes the data we want to sign, the
// hashing algorithm, and the padding scheme, and generates
// a signature in the form of bytes
const signature1 = crypto.sign("sha256", Buffer.from(blindedvote1), {
  key: privateKey,
  padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
});

const signature2 = crypto.sign("sha256", Buffer.from(blindedvote2), {
  key: privateKey,
  padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
});

const signature3 = crypto.sign("sha256", Buffer.from(blindedvote3), {
  key: privateKey,
  padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
});
//console.log('siniture1     ',signature1.toString("base64"));
//console.log('siniture2     ',signature2.toString("base64"));
//console.log('siniture3     ',signature3.toString("base64"));

// To verify the data, we provide the same hashing algorithm and
// padding scheme we provided to generate the signature, along
// with the signature itself, the data that we want to
// verify against the signature, and the public key
const isVerified = crypto.verify(
  "sha256",
  Buffer.from(blindedvote3),
  {
    key: publicKey,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
  },
  signature3
);

// isVerified should be `true` if the signature is valid
console.log("signature verified: ", isVerified);