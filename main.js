const {Blockchain, Transaction} = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('0b5e4a2ddbbd6631171995c741b1f8f3d19b02a37441ddbf75befcbb1c06a448');
const myWalletAddress = myKey.getPublic('hex');




const kotfCoin = new Blockchain();
kotfCoin.minePendingTransactions(myWalletAddress);


const tx1 = new Transaction(myWalletAddress, 'address2', 10);
tx1.signTransaction(myKey);
kotfCoin.addTransaction(tx1);


console.log('\n Balance', kotfCoin.getBalanceOfAddress(myWalletAddress));

kotfCoin.minePendingTransactions(myWalletAddress);

console.log('\n Balance', kotfCoin.getBalanceOfAddress(myWalletAddress));

console.log(JSON.stringify(kotfCoin, null, 4));
