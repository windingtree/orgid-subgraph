const fs = require('fs');

const {
  OrgIdContract,
} = require('@windingtree/org.id');

const {
  DirectoryContract,
  DirectoryIndexContract,
  DirectoryInterfaceContract,
  DirectoryIndexInterfaceContract,
} = require('@windingtree/org.id-directories');

// Define the list of contracts to import
const contracts = [
  OrgIdContract,
  DirectoryIndexContract,
];

// Write the ABI of a contract build to a path on the filesystem
const writeContractAbi = (abi, path) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, JSON.stringify(abi) , err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Write all required ABIs
Promise.all(contracts.map(contract => writeContractAbi(contract.abi, `abis/${contract.contractName}.json`)))
.then(() => console.log('Success'))
.catch(console.error);



