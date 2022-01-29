module.exports = {
     // See <http://truffleframework.com/docs/advanced/configuration>
     // to customize your Truffle configuration!
     networks: {
          ganache: {
               host: "localhost",
               port: 7545,
               network_id: "*" // Match any network id
          },
          chainskills: {
               host: "localhost",
               port: 8545,
               network_id: "4224", // Match any network id
               gas: 400000,
               //from: '0xbc0bd5c45901dd1bb65d59782826251df9913f49' // phai unlock account trc khi 
               // >unlock account
               // C:\_MyFolder\_Learning\EthereumSolidity\ChainSkills\Training\chainlist>truffle console --network chainskills
               // truffle(chainskills)> web3.personal.unlockAccount(web3.eth.accounts[1], "pass1234", 600)
          }
     }
};
