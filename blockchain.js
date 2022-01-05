const SHA256 = require('js-sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction{
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }
  calculateHash() {
    return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
  }

  signTransaction(signingKey){
    if(signingKey.getPublic('hex') !== this.fromAddress){
      throw new Error('You cannot sign for other Wallets');
    }
    const hashTx = this.calculateHash();
    const sig = signingKey.sign(hashTx, 'base64');
    this.signature = sig.toDER('hex');
  }

  isValid() {
    if (this.fromAddress === null) return true;

    if (!this.signature || this.signature.length === 0) {
      throw new Error('No signature in this transaction');
    }

    const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
    return publicKey.verify(this.calculateHash(), this.signature);
  }
  }

class Block {
  constructor(timestamp, transactions, previousHash = ''){
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nounce = 0;
  }
  calculateHash() {
    return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nounce).toString();
  }
//difficulty adds 0s to the beginning of the hash
  mineBlock(difficulty){
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')){
      this.nounce++;
      this.hash = this.calculateHash();

    }

    console.log("Block Mined__" + this.hash)
  }

  hasValidTransactions() {
    for(const tx of this.transactions){
      if(!tx.isValid()){
        return false;
      }
    }
    return true;
  }
}

class Blockchain {
  constructor(){
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.miningReward = 100;
    }
    createGenesisBlock() {
    return new Block(Date.now(), "Genesis Block", "0")
    }
    getLatestBlock(){
      return this.chain[this.chain.length - 1];
    }
    minePendingTransactions(miningRewardAddress) {
      const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
    this.pendingTransactions.push(rewardTx);

    const block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
    block.mineBlock(this.difficulty);

    this.pendingTransactions = [];
    }


    addTransaction(transaction) {
        if (!transaction.fromAddress || !transaction.toAddress) {
          throw new Error('Transaction must include from and to address');
        }

        // Verify the transactiion
        if (!transaction.isValid()) {
          throw new Error('Cannot add invalid transaction to chain');
        }

        if (transaction.amount <= 0) {
          throw new Error('Transaction amount should be higher than 0');
        }

        // Making sure that the amount sent is not greater than existing balance
        // if (this.getBalanceOfAddress(transaction.fromAddress) < transaction.amount) {
        //   throw new Error('Not enough balance');
        // }

        this.pendingTransactions.push(transaction);
        //debug('transaction added: %s', transaction);
      }

    getBalanceOfAddress(address){}




    addBlock (newBlock) {
      newBlock.previousHash = this.getLatestBlock().hash;
      //newBlock.hash = newBlock.calculateHash();
      newBlock.mineBlock(this.difficulty);
      this.chain.push(newBlock);

   }
    isChainValid() {
      for(let i = 1; i < this.chain.length; i++){
        const currentBlock = this.chain[i];
        const previousBlock = this.chain[i - 1];

        if(!currentBlock.hasValidTransactions()){
          return false;

        }

        if(currentBlock.hash !== currentBlock.calculateHash()) {
          return false;
        }

        if(currentBlock.previousHash !== previousBlock.hash){
          return false;
        }
      }
      return true;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;








console.log('Mining Block 1...');
kotfCoin.addBlock(new Block (1, "01/02/2022", {amount:5}));
console.log('Mining Block 2...');
kotfCoin.addBlock(new Block (2, "01/02/2022", {amount:8}));
console.log('Mining Block 3...');
kotfCoin.addBlock(new Block (3, "01/02/2022", {amount:9}));



// kotfCoin.chain[1].transactions = {amount:100};
// console.log('Is Blockchain Valid ' + kotfCoin.isChainValid());

// // show Blockchain
// console.log(JSON.stringify(kotfCoin, null, 4));
