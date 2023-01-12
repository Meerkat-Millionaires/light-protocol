"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseProofToBytesArray =
  exports.Transaction =
  exports.createEncryptionKeypair =
    void 0;
const anchor = require("@project-serum/anchor");
const nacl = require("tweetnacl");
const createEncryptionKeypair = () => nacl.box.keyPair();
exports.createEncryptionKeypair = createEncryptionKeypair;
var assert = require("assert");
let circomlibjs = require("circomlibjs");
var ffjavascript = require("ffjavascript");
const { unstringifyBigInts, stringifyBigInts, leInt2Buff, leBuff2int } =
  ffjavascript.utils;
const bigint_buffer_1 = require("bigint-buffer");
const ethers = require("ethers");
const FIELD_SIZE_ETHERS = ethers.BigNumber.from(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617"
);
const fs_1 = require("fs");
const snarkjs = require("snarkjs");
const constants_1 = require("./constants");
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const testChecks_1 = require("./test-utils/testChecks");
const newNonce = () => nacl.randomBytes(nacl.box.nonceLength);
const utxo_1 = require("./utxo");
const anchor_1 = require("@project-serum/anchor");
const constants_2 = require("./constants");
// add verifier class which is passed in with the constructor
// this class replaces the send transaction, also configures path the provingkey and witness, the inputs for the integrity hash
// input custom verifier with three functions by default prepare, proof, send
// include functions from sdk in shieldedTransaction
// Changes for instantiation
// replace verifierProgram with verifier class
// remove merkleTreeProgram
// TODO: write functional test for every method
class Transaction {
  /**
   * Initialize transaction
   *
   * @param encryptionKeypair encryptionKeypair used for encryption
   * @param relayerFee recipient of the unshielding
   * @param merkleTreePubkey
   * @param merkleTree
   * @param merkleTreeAssetPubkey
   * @param recipient utxos to pay with
   * @param lookupTable fee for the relayer
   * @param payer RPC connection
   * @param provider shieldedKeypair
   * @param relayerRecipient shieldedKeypair
   * @param poseidon shieldedKeypair
   * @param verifier shieldedKeypair
   * @param shuffleEnabled
   */
  constructor({
    // keypair, // : Keypair shielded pool keypair that is derived from seedphrase. OutUtxo: supply pubkey
    // user object { payer, encryptionKe..., utxos?} or utxos in wallet object
    payer, //: Keypair
    // TODO: remove and take this from utxo keypairs
    encryptionKeypair = (0, exports.createEncryptionKeypair)(),
    // need to check how to handle several merkle trees here
    merkleTree,
    // relayer
    relayerPubkey, //PublicKey
    relayerRecipient,
    // relayer fee
    // network
    provider,
    lookupTable, //PublicKey
    poseidon,
    verifier,
    shuffleEnabled = true,
  }) {
    // user
    this.encryptionKeypair = encryptionKeypair;
    this.payer = payer;
    // relayer
    if (relayerPubkey == null) {
      this.relayerPubkey = new web3_js_1.PublicKey(payer.publicKey);
    } else {
      this.relayerPubkey = relayerPubkey;
    }
    this.relayerRecipient = relayerRecipient;
    // this.relayerFee = new anchor.BN('10_000'); //U64(10_000),;
    // merkle tree
    this.merkleTree = merkleTree;
    this.merkleTreeProgram = constants_2.merkleTreeProgram;
    this.merkleTreePubkey = constants_2.MERKLE_TREE_KEY;
    this.merkleTreeFeeAssetPubkey = constants_2.REGISTERED_POOL_PDA_SOL;
    this.preInsertedLeavesIndex = constants_2.PRE_INSERTED_LEAVES_INDEX;
    this.feeAsset = constants_1.FEE_ASSET;
    // network
    this.provider = provider;
    this.lookupTable = lookupTable;
    // verifier
    this.verifier = verifier;
    this.sendTransaction = verifier.sendTransaction;
    // misc
    this.poseidon = poseidon;
    this.shuffle = shuffleEnabled;
    this.publicInputs = {
      root: new Array(),
      publicAmount: new Array(),
      extDataHash: new Array(),
      feeAmount: new Array(),
      mintPubkey: new Array(),
      nullifiers: new Array(),
      leaves: new Array(),
    };
    // init stuff for ts
    this.utxos = [];
    this.outputUtxos = [];
  }
  getRootIndex() {
    return __awaiter(this, void 0, void 0, function* () {
      let root = Uint8Array.from(
        leInt2Buff(unstringifyBigInts(this.merkleTree.root()), 32)
      );
      let merkle_tree_account = yield this.provider.connection.getAccountInfo(
        this.merkleTreePubkey
      );
      let merkle_tree_account_data =
        this.merkleTreeProgram.account.merkleTree._coder.accounts.decode(
          "MerkleTree",
          merkle_tree_account.data
        );
      merkle_tree_account_data.roots.map((x, index) => {
        if (x.toString() === root.toString()) {
          this.rootIndex = index;
        }
      });
    });
  }
  prepareUtxos() {
    var _a, _b;
    /// Validation
    if (
      this.inputUtxos.length > this.config.in ||
      this.outputUtxos.length > this.config.out
    ) {
      throw new Error("Incorrect inputUtxos/outputUtxos count");
    }
    console.log("inputUtxos.length ", this.inputUtxos.length);
    /// fill inputUtxos until 2 or 10
    while (this.inputUtxos.length < this.config.in) {
      this.inputUtxos.push(new utxo_1.Utxo({ poseidon: this.poseidon }));
      // throw "inputUtxos.length > 2 are not implemented";
    }
    /// if there are no outputUtxo add one
    while (this.outputUtxos.length < this.config.out) {
      // TODO: add algorithm to select utxos to be merged in here
      this.outputUtxos.push(new utxo_1.Utxo({ poseidon: this.poseidon }));
    }
    /// mixes the input utxos
    /// mixes the output utxos
    if (this.shuffle) {
      console.log("shuffling utxos");
      this.inputUtxos = shuffle(this.inputUtxos);
      this.outputUtxos = shuffle(this.outputUtxos);
    } else {
      console.log("commented shuffle");
    }
    /// the fee plus the amount to pay has to be bigger than the amount in the input utxo
    // which doesn't make sense it should be the other way arround right
    // the external amount can only be made up of utxos of asset[0]
    // This might be too specific since the circuit allows assets to be in any index
    const getExternalAmount = (assetIndex) => {
      return new anchor.BN(0)
        .add(
          this.outputUtxos
            .filter((utxo) => {
              // console.log("this.assetPubkeys ", this.assetPubkeys);
              // console.log("utxo.assetsCircuit ", utxo.assetsCircuit);
              // console.log(`${utxo.assetsCircuit[assetIndex].toString('hex')} == ${this.assetPubkeys[assetIndex].toString('hex')}`);
              return (
                utxo.assetsCircuit[assetIndex].toString("hex") ==
                this.assetPubkeys[assetIndex].toString("hex")
              );
            })
            .reduce(
              (sum, utxo) =>
                // add all utxos of the same asset
                sum.add(utxo.amounts[assetIndex]),
              new anchor.BN(0)
            )
        )
        .sub(
          this.inputUtxos
            .filter((utxo) => {
              return (
                utxo.assetsCircuit[assetIndex].toString("hex") ==
                this.assetPubkeys[assetIndex].toString("hex")
              );
            })
            .reduce(
              (sum, utxo) => sum.add(utxo.amounts[assetIndex]),
              new anchor.BN(0)
            )
        );
    };
    this.externalAmountBigNumber = getExternalAmount(1);
    this.feeAmount = getExternalAmount(0);
    console.log(
      "this.externalAmountBigNumber ",
      (_a = this.externalAmountBigNumber) === null || _a === void 0
        ? void 0
        : _a.toString()
    );
    console.log(
      "this.feeAmount ",
      (_b = this.feeAmount) === null || _b === void 0 ? void 0 : _b.toString()
    );
    /// if it is a deposit and the amount going in is smaller than 0 throw error
    if (
      this.action === "DEPOSIT" &&
      this.externalAmountBigNumber < new anchor.BN(0)
    ) {
      throw new Error(
        `Incorrect Extamount: ${this.externalAmountBigNumber.toNumber()}`
      );
    }
    this.outputUtxos.map((utxo) => {
      if (utxo.assets == null) {
        throw new Error(`output utxo asset not defined ${utxo}`);
      }
    });
    this.inputUtxos.map((utxo) => {
      if (utxo.assets == null) {
        throw new Error(`intput utxo asset not defined ${utxo}`);
      }
    });
    let assetPubkeys = [this.feeAsset, this.assetPubkeys].concat();
    if (this.assetPubkeys.length != 3) {
      throw new Error(`assetPubkeys.length != 3 ${this.assetPubkeys}`);
    }
    if (
      this.assetPubkeys[0] === this.assetPubkeys[1] ||
      this.assetPubkeys[1] === this.assetPubkeys[2] ||
      this.assetPubkeys[0] === this.assetPubkeys[2]
    ) {
      throw new Error(`asset pubKeys need to be distinct ${this.assetPubkeys}`);
    }
    const getIndices = (utxos) => {
      let inIndices = [];
      utxos.map((utxo) => {
        let tmpInIndices = [];
        for (var a = 0; a < 3; a++) {
          let tmpInIndices1 = [];
          for (var i = 0; i < utxo.assets.length; i++) {
            console.log(
              `utxo asset ${utxo.assetsCircuit[i]} === ${this.assetPubkeys[a]}`
            );
            console.log(
              `utxo asset ${
                utxo.assetsCircuit[i].toString() ===
                this.assetPubkeys[a].toString()
              } utxo.amounts[a].toString()  ${utxo.amounts[a].toString() > "0"}`
            );
            if (
              utxo.assetsCircuit[i].toString() ===
                this.assetPubkeys[a].toString() &&
              utxo.amounts[a].toString() > "0" &&
              !tmpInIndices1.includes("1")
            ) {
              tmpInIndices1.push("1");
            } else {
              tmpInIndices1.push("0");
            }
          }
          tmpInIndices.push(tmpInIndices1);
        }
        inIndices.push(tmpInIndices);
        console.log("-----------");
      });
      return inIndices;
    };
    this.inIndices = getIndices(this.inputUtxos);
    this.outIndices = getIndices(this.outputUtxos);
    console.log("inIndices: ", this.inIndices);
    console.log("outIndices: ", this.outIndices);
    // console.log("utxos ", this.inputUtxos);
    // process.exit()
  }
  prepareTransaction(encrypedUtxos) {
    var _a;
    let inputMerklePathIndices = [];
    let inputMerklePathElements = [];
    /// if the input utxo has an amount bigger than 0 and it has an valid index add it to the indices of the merkel tree
    /// also push the path to the leaf
    /// else push a 0 to the indices
    /// and fill the path to the leaf with 0s
    // getting merkle proofs
    for (const inputUtxo of this.inputUtxos) {
      if (this.test) {
        inputMerklePathIndices.push(0);
        inputMerklePathElements.push(new Array(this.merkleTree.levels).fill(0));
      } else if (
        inputUtxo.amounts[0] > 0 ||
        inputUtxo.amounts[1] > 0 ||
        inputUtxo.amounts[2] > 0
      ) {
        inputUtxo.index = this.merkleTree.indexOf(inputUtxo.getCommitment());
        console.log("inputUtxo.index ", inputUtxo.index);
        if (inputUtxo.index || inputUtxo.index == 0) {
          console.log("here");
          if (inputUtxo.index < 0) {
            throw new Error(
              `Input commitment ${inputUtxo.getCommitment()} was not found`
            );
          }
          console.log("here1");
          inputMerklePathIndices.push(inputUtxo.index);
          console.log("here2");
          inputMerklePathElements.push(
            this.merkleTree.path(inputUtxo.index).pathElements
          );
        }
      } else {
        inputMerklePathIndices.push(0);
        inputMerklePathElements.push(new Array(this.merkleTree.levels).fill(0));
      }
    }
    let relayer_fee;
    if (this.action !== "DEPOSIT") {
      relayer_fee = (0, bigint_buffer_1.toBufferLE)(
        BigInt(this.relayerFee.toString()),
        8
      );
    } else {
      relayer_fee = new Uint8Array(8).fill(0);
    }
    console.log("feesLE: ", relayer_fee);
    // ----------------------- getting integrity hash -------------------
    const nonces = new Array(this.config.out).fill(newNonce());
    console.log("nonces ", nonces);
    console.log("newNonce()", nonces[0]);
    // const senderThrowAwayKeypairs = [
    //     newKeypair(),
    //     newKeypair()
    // ];
    // console.log(outputUtxos)
    /// Encrypt outputUtxos to bytes
    // removed throwaway keypairs since we already have message integrity with integrity_hashes
    // TODO: should be a hardcoded keypair in production not the one of the sender
    let encryptedOutputs = new Array();
    if (encrypedUtxos) {
      encryptedOutputs = Array.from(encrypedUtxos);
    } else {
      this.outputUtxos.map((utxo, index) =>
        encryptedOutputs.push(
          utxo.encrypt(
            nonces[index],
            this.encryptionKeypair,
            this.encryptionKeypair
          )
        )
      );
      // console.log("removed senderThrowAwayKeypairs TODO: always use fixed keypair or switch to salsa20 without poly153");
      if (this.config.out == 2) {
        console.log("nonces[0] ", nonces[0]);
        console.log("this.encryptionKeypair ", this.encryptionKeypair);
        console.log("encryptedOutputs[0] ", encryptedOutputs[0]);
        console.log("nonces[1] ", nonces[1]);
        this.encryptedUtxos = new Uint8Array([
          ...encryptedOutputs[0],
          ...nonces[0],
          ...encryptedOutputs[1],
          ...nonces[1],
          ...new Array(256 - 190).fill(0),
        ]);
      } else {
        let tmpArray = new Array();
        for (var i = 0; i < this.config.out; i++) {
          tmpArray.push(...encryptedOutputs[i]);
          tmpArray.push(...nonces[i]);
        }
        console.log(this.config);
        console.log(tmpArray.length);
        console.log(this.config.out * 128 - tmpArray.length);
        if (tmpArray.length < 512) {
          tmpArray.push(
            new Array(this.config.out * 128 - tmpArray.length).fill(0)
          );
        }
        this.encryptedUtxos = new Uint8Array(tmpArray.flat());
      }
      console.log("this.encryptedUtxos ", this.encryptedUtxos.toString());
    }
    console.log(
      "this.recipient.toBytes(), ",
      Array.from(this.recipient.toBytes())
    );
    console.log(
      "this.recipientFee.toBytes(), ",
      Array.from(this.recipientFee.toBytes())
    );
    console.log(
      "this.payer.toBytes(), ",
      Array.from(this.payer.publicKey.toBytes())
    );
    console.log("relayer_fee ", relayer_fee);
    console.log(
      "this.encryptedUtxos ",
      (_a = this.encryptedUtxos) === null || _a === void 0 ? void 0 : _a.length
    );
    let extDataBytes = new Uint8Array([
      ...this.recipient.toBytes(),
      ...this.recipientFee.toBytes(),
      ...this.payer.publicKey.toBytes(),
      ...relayer_fee,
      ...this.encryptedUtxos,
    ]);
    console.log("extDataBytes ", extDataBytes.toString());
    const hash = ethers.ethers.utils.keccak256(Buffer.from(extDataBytes));
    // const hash = anchor.utils.sha256.hash(extDataBytes)
    console.log("Hash: ", hash);
    (this.extDataHash = ethers.BigNumber.from(hash.toString()).mod(
      FIELD_SIZE_ETHERS
    )), //new anchor.BN(anchor.utils.bytes.hex.decode(hash)).mod(constants_1.FIELD_SIZE),
      console.log(this.merkleTree);
    // ----------------------- building input object -------------------
    this.input = {
      root: this.merkleTree.root(),
      inputNullifier: this.inputUtxos.map((x) => x.getNullifier()),
      outputCommitment: this.outputUtxos.map((x) => x.getCommitment()),
      // TODO: move public and fee amounts into tx preparation
      publicAmount: this.externalAmountBigNumber
        .add(constants_1.FIELD_SIZE)
        .mod(constants_1.FIELD_SIZE)
        .toString(),
      extDataHash: this.extDataHash.toString(),
      feeAmount: new anchor.BN(this.feeAmount)
        .add(constants_1.FIELD_SIZE)
        .mod(constants_1.FIELD_SIZE)
        .toString(),
      mintPubkey: this.mintPubkey,
      // data for 2 transaction inputUtxos
      inAmount: this.inputUtxos.map((x) => x.amounts),
      inPrivateKey: this.inputUtxos.map((x) => x.keypair.privkey),
      inBlinding: this.inputUtxos.map((x) => x.blinding),
      inPathIndices: inputMerklePathIndices,
      inPathElements: inputMerklePathElements,
      assetPubkeys: this.assetPubkeys,
      // data for 2 transaction outputUtxos
      outAmount: this.outputUtxos.map((x) => x.amounts),
      outBlinding: this.outputUtxos.map((x) => x.blinding),
      outPubkey: this.outputUtxos.map((x) => x.keypair.pubkey),
      inIndices: this.inIndices,
      outIndices: this.outIndices,
      inInstructionType: this.inputUtxos.map((x) => x.instructionType),
      outInstructionType: this.outputUtxos.map((x) => x.instructionType),
    };
    // console.log("extDataHash: ", input.extDataHash);
    // console.log("input.inputNullifier ",input.inputNullifier[0] );
    // console.log("input feeAmount: ", input.feeAmount);
    // console.log("input publicAmount: ", input.publicAmount);
    // console.log("input relayerFee: ", relayerFee);
    //
    // console.log("inIndices ", JSON.stringify(inIndices, null, 4));
    // console.log("outIndices ", JSON.stringify(outIndices, null, 4));
  }
  prepareTransactionFull({
    inputUtxos,
    outputUtxos,
    action,
    assetPubkeys,
    recipient,
    // mintPubkey,
    relayerFee = null, // public amount of the fee utxo adjustable if you want to deposit a fee utxo alongside your spl deposit
    shuffle = true,
    recipientFee,
    sender,
    merkleTreeAssetPubkey,
    config,
    encrypedUtxos,
  }) {
    return __awaiter(this, void 0, void 0, function* () {
      // TODO: create and check for existence of merkleTreeAssetPubkey depending on utxo asset
      this.merkleTreeAssetPubkey = merkleTreeAssetPubkey;
      this.poseidon = yield circomlibjs.buildPoseidonOpt();
      this.config = config;
      // TODO: build assetPubkeys from inputUtxos, if those are empty then outputUtxos
      let mintPubkey = assetPubkeys[1];
      if (typeof mintPubkey != anchor_1.BN) {
      }
      if (assetPubkeys[0].toString() != this.feeAsset.toString()) {
        throw "feeAsset should be assetPubkeys[0]";
      }
      if (action == "DEPOSIT") {
        console.log("Deposit");
        console.log();
        this.relayerFee = relayerFee;
        this.sender = sender;
        this.senderFee = new web3_js_1.PublicKey(this.payer.publicKey);
        this.recipient = this.merkleTreeAssetPubkey;
        this.recipientFee = this.merkleTreeFeeAssetPubkey;
        if (
          this.relayerPubkey.toBase58() !=
          new web3_js_1.PublicKey(this.payer.publicKey).toBase58()
        ) {
          throw "relayerPubkey and payer pubkey need to be equivalent at deposit";
        }
      } else if (action == "WITHDRAWAL") {
        this.senderFee = this.merkleTreeFeeAssetPubkey;
        this.recipientFee = recipientFee;
        this.sender = this.merkleTreeAssetPubkey;
        this.recipient = recipient;
        if (relayerFee != null) {
          this.relayerFee = relayerFee;
          if (relayerFee == undefined) {
            throw "relayerFee undefined";
          }
        }
        if (recipient == undefined) {
          throw "recipient undefined";
        }
        if (recipientFee == undefined) {
          throw "recipientFee undefined";
        }
      }
      this.inputUtxos = inputUtxos;
      this.outputUtxos = outputUtxos;
      this.assetPubkeys = assetPubkeys;
      this.mintPubkey = mintPubkey;
      this.action = action;
      this.prepareUtxos();
      yield this.prepareTransaction(encrypedUtxos);
      yield this.getRootIndex();
      assert(this.input.mintPubkey == this.mintPubkey);
      assert(this.input.mintPubkey == this.assetPubkeys[1]);
      if (this.externalAmountBigNumber != 0) {
        if (assetPubkeys[1].toString() != mintPubkey.toString()) {
          throw "mintPubkey should be assetPubkeys[1]";
        }
      }
    });
  }
  overWriteEncryptedUtxos(bytes, offSet = 0) {
    // this.encryptedUtxos.slice(offSet, bytes.length + offSet) = bytes;
    this.encryptedUtxos = Uint8Array.from([
      ...this.encryptedUtxos.slice(0, offSet),
      ...bytes,
      ...this.encryptedUtxos.slice(
        offSet + bytes.length,
        this.encryptedUtxos.length
      ),
    ]);
  }
  getPublicInputs() {
    this.publicInputs = this.verifier.parsePublicInputsFromArray(this);
  }
  getProof() {
    return __awaiter(this, void 0, void 0, function* () {
      if (this.merkleTree == null) {
        throw "merkle tree not built";
      }
      if (this.inIndices == null) {
        throw "transaction not prepared";
      }
      console.log("this.input ", this.input);
      const buffer = (0, fs_1.readFileSync)(
        `${this.verifier.wtnsGenPath}.wasm`
      );
      let witnessCalculator = yield this.verifier.calculateWtns(buffer);
      console.time("Proof generation");
      let wtns = yield witnessCalculator.calculateWTNSBin(
        stringifyBigInts(this.input),
        0
      );
      const { proof, publicSignals } = yield snarkjs.groth16.prove(
        `${this.verifier.zkeyPath}.zkey`,
        wtns
      );
      this.proofJson = JSON.stringify(proof, null, 1);
      this.publicInputsJson = JSON.stringify(publicSignals, null, 1);
      console.timeEnd("Proof generation");
      const vKey = yield snarkjs.zKey.exportVerificationKey(
        `${this.verifier.zkeyPath}.zkey`
      );
      const res = yield snarkjs.groth16.verify(vKey, publicSignals, proof);
      if (res === true) {
        console.log("Verification OK");
      } else {
        console.log("Invalid proof");
        throw new Error("Invalid Proof");
      }
      this.publicInputsBytes = JSON.parse(this.publicInputsJson.toString());
      for (var i in this.publicInputsBytes) {
        this.publicInputsBytes[i] = Array.from(
          leInt2Buff(unstringifyBigInts(this.publicInputsBytes[i]), 32)
        ).reverse();
      }
      this.proofBytes = yield (0, exports.parseProofToBytesArray)(
        this.proofJson
      );
      this.publicInputs = this.verifier.parsePublicInputsFromArray(this);
      console.log("this.publicInputs ", this.publicInputs);
      console.log("proof ", proof);
      console.log("publicSignals ", publicSignals);
      // await this.checkProof()
      yield this.getPdaAddresses();
    });
  }
  checkProof() {
    return __awaiter(this, void 0, void 0, function* () {
      let publicSignals = [
        leBuff2int(Buffer.from(this.publicInputs.root.reverse())).toString(),
        leBuff2int(
          Buffer.from(this.publicInputs.publicAmount.reverse())
        ).toString(),
        leBuff2int(
          Buffer.from(this.publicInputs.extDataHash.reverse())
        ).toString(),
        leBuff2int(
          Buffer.from(this.publicInputs.feeAmount.reverse())
        ).toString(),
        leBuff2int(
          Buffer.from(this.publicInputs.mintPubkey.reverse())
        ).toString(),
        leBuff2int(
          Buffer.from(this.publicInputs.nullifiers[0].reverse())
        ).toString(),
        leBuff2int(
          Buffer.from(this.publicInputs.nullifiers[1].reverse())
        ).toString(),
        leBuff2int(
          Buffer.from(this.publicInputs.leaves[0].reverse())
        ).toString(),
        leBuff2int(
          Buffer.from(this.publicInputs.leaves[1].reverse())
        ).toString(),
      ];
      let pi_b_0 = this.proofBytes.slice(64, 128).reverse();
      let pi_b_1 = this.proofBytes.slice(128, 192).reverse();
      let proof = {
        pi_a: [
          leBuff2int(
            Buffer.from(this.proofBytes.slice(0, 32).reverse())
          ).toString(),
          leBuff2int(
            Buffer.from(this.proofBytes.slice(32, 64).reverse())
          ).toString(),
          "1",
        ],
        pi_b: [
          [
            leBuff2int(Buffer.from(pi_b_0.slice(0, 32))).toString(),
            leBuff2int(Buffer.from(pi_b_0.slice(32, 64))).toString(),
          ],
          [
            leBuff2int(Buffer.from(pi_b_1.slice(0, 32))).toString(),
            leBuff2int(Buffer.from(pi_b_1.slice(32, 64))).toString(),
          ],
          ["1", "0"],
        ],
        pi_c: [
          leBuff2int(
            Buffer.from(this.proofBytes.slice(192, 224).reverse())
          ).toString(),
          leBuff2int(
            Buffer.from(this.proofBytes.slice(224, 256).reverse())
          ).toString(),
          "1",
        ],
        protocol: "groth16",
        curve: "bn128",
      };
      console.log("backparsed proof: ", proof);
      console.log("backparsed publicSignals: ", publicSignals);
      const vKey = yield snarkjs.zKey.exportVerificationKey(
        `${this.verifier.zkeyPath}.zkey`
      );
      const res = yield snarkjs.groth16.verify(vKey, publicSignals, proof);
      if (res === true) {
        console.log("Verification OK");
      } else {
        console.log("Invalid proof");
        throw new Error("Invalid Proof");
      }
    });
  }
  getPdaAddresses() {
    return __awaiter(this, void 0, void 0, function* () {
      let tx_integrity_hash = this.publicInputs.txIntegrityHash;
      let nullifiers = this.publicInputs.nullifiers;
      let leftLeaves = [this.publicInputs.leaves[0]];
      let merkleTreeProgram = this.merkleTreeProgram;
      let signer = this.payer.publicKey;
      let nullifierPdaPubkeys = [];
      for (var i in nullifiers) {
        console.log("nullifiers[i]: ", nullifiers[i]);
        nullifierPdaPubkeys.push(
          (yield web3_js_1.PublicKey.findProgramAddress(
            [Buffer.from(nullifiers[i]), anchor.utils.bytes.utf8.encode("nf")],
            merkleTreeProgram.programId
          ))[0]
        );
        console.log(nullifierPdaPubkeys[i].toBase58());
      }
      let leavesPdaPubkeys = [];
      for (var i in this.publicInputs.leaves) {
        console.log("123this.publicInputs.leaves ", this.publicInputs.leaves);
        leavesPdaPubkeys.push(
          (yield web3_js_1.PublicKey.findProgramAddress(
            [
              Buffer.from(Array.from(this.publicInputs.leaves[i][0]).reverse()),
              anchor.utils.bytes.utf8.encode("leaves"),
            ],
            merkleTreeProgram.programId
          ))[0]
        );
      }
      console.log(
        "this.verifier.verifierProgram.programId ",
        this.verifier.verifierProgram.programId.toBase58()
      );
      console.log(
        "this.merkleTreeProgram.programId ",
        this.merkleTreeProgram.programId.toBase58()
      );
      console.log(
        "signerAuthorityPubkey ",
        (yield web3_js_1.PublicKey.findProgramAddress(
          [merkleTreeProgram.programId.toBytes()],
          this.verifier.verifierProgram.programId
        ))[0].toBase58()
      );
      let pdas = {
        signerAuthorityPubkey: (yield web3_js_1.PublicKey.findProgramAddress(
          [merkleTreeProgram.programId.toBytes()],
          this.verifier.verifierProgram.programId
        ))[0],
        escrow: (yield web3_js_1.PublicKey.findProgramAddress(
          [anchor.utils.bytes.utf8.encode("escrow")],
          this.verifier.verifierProgram.programId
        ))[0],
        verifierStatePubkey: (yield web3_js_1.PublicKey.findProgramAddress(
          [signer.toBytes(), anchor.utils.bytes.utf8.encode("VERIFIER_STATE")],
          this.verifier.verifierProgram.programId
        ))[0],
        feeEscrowStatePubkey: (yield web3_js_1.PublicKey.findProgramAddress(
          [
            Buffer.from(new Uint8Array(tx_integrity_hash)),
            anchor.utils.bytes.utf8.encode("escrow"),
          ],
          this.verifier.verifierProgram.programId
        ))[0],
        merkleTreeUpdateState: (yield web3_js_1.PublicKey.findProgramAddress(
          [
            Buffer.from(new Uint8Array(leftLeaves[0])),
            anchor.utils.bytes.utf8.encode("storage"),
          ],
          merkleTreeProgram.programId
        ))[0],
        nullifierPdaPubkeys,
        leavesPdaPubkeys,
        tokenAuthority: (yield web3_js_1.PublicKey.findProgramAddress(
          [anchor.utils.bytes.utf8.encode("spl")],
          merkleTreeProgram.programId
        ))[0],
      };
      this.escrow = pdas.escrow;
      this.leavesPdaPubkeys = pdas.leavesPdaPubkeys;
      this.nullifierPdaPubkeys = pdas.nullifierPdaPubkeys;
      this.signerAuthorityPubkey = pdas.signerAuthorityPubkey;
      this.tokenAuthority = pdas.tokenAuthority;
      this.verifierStatePubkey = pdas.verifierStatePubkey;
    });
  }
  checkBalances() {
    return __awaiter(this, void 0, void 0, function* () {
      // Checking that nullifiers were inserted
      this.is_token = true;
      for (var i in this.nullifierPdaPubkeys) {
        var nullifierAccount = yield this.provider.connection.getAccountInfo(
          this.nullifierPdaPubkeys[i],
          {
            commitment: "confirmed",
          }
        );
        yield (0, testChecks_1.checkRentExemption)({
          account: nullifierAccount,
          connection: this.provider.connection,
        });
      }
      let leavesAccount;
      var leavesAccountData;
      // Checking that leaves were inserted
      for (var i in this.leavesPdaPubkeys) {
        leavesAccountData =
          yield this.merkleTreeProgram.account.twoLeavesBytesPda.fetch(
            this.leavesPdaPubkeys[i]
          );
        // try {
        console.log("leavesAccountData ", leavesAccountData);
        console.log("this.publicInputs ", this.publicInputs);
        console.log(
          `nodeLeft ${leavesAccountData.nodeLeft.toString()} != ${this.publicInputs.leaves[
            i
          ][0]
            .reverse()
            .toString()}`
        );
        console.log(
          `nodeLeft ${
            leavesAccountData.nodeLeft.toString() ===
            this.publicInputs.leaves[i][0].reverse().toString()
          }`
        );
        console.log(
          `nodeRight ${leavesAccountData.nodeRight.toString()} !=  ${this.publicInputs.leaves[
            i
          ][1]
            .reverse()
            .toString()}`
        );
        console.log(
          `nodeRight ${
            leavesAccountData.nodeRight.toString() ===
            this.publicInputs.leaves[i][1].reverse().toString()
          }`
        );
        assert(
          leavesAccountData.nodeLeft.toString() ==
            this.publicInputs.leaves[i][0].reverse().toString(),
          "left leaf not inserted correctly"
        );
        console.log("here1");
        assert(
          leavesAccountData.nodeRight.toString() ==
            this.publicInputs.leaves[i][1].reverse().toString(),
          "right leaf not inserted correctly"
        );
        console.log("here2");
        assert(
          leavesAccountData.merkleTreePubkey.toBase58() ==
            this.merkleTreePubkey.toBase58(),
          "merkleTreePubkey not inserted correctly"
        );
        console.log("here3");
        for (var j = 0; j < this.encryptedUtxos.length / 256; j++) {
          console.log(j);
          if (
            leavesAccountData.encryptedUtxos.toString() !==
            this.encryptedUtxos.toString()
          ) {
            console.log(j);
            // throw `encrypted utxo ${i} was not stored correctly`;
          }
          console.log(
            `${leavesAccountData.encryptedUtxos} !== ${this.encryptedUtxos}`
          );
          // assert(leavesAccountData.encryptedUtxos === this.encryptedUtxos, "encryptedUtxos not inserted correctly");
          let decryptedUtxo1 = utxo_1.Utxo.decrypt(
            new Uint8Array(Array.from(this.encryptedUtxos.slice(0, 71))),
            new Uint8Array(Array.from(this.encryptedUtxos.slice(71, 71 + 24))),
            this.encryptionKeypair.PublicKey,
            this.encryptionKeypair,
            this.outputUtxos[0].keypair,
            [constants_1.FEE_ASSET, constants_1.MINT],
            this.poseidon,
            i
          )[1];
          console.log("decryptedUtxo1 ", decryptedUtxo1);
        }
        // } catch(e) {
        //   console.log("leaves: ", e);
        // }
      }
      console.log(`mode ${this.action}, this.is_token ${this.is_token}`);
      try {
        console.log(
          "this.preInsertedLeavesIndex ",
          this.preInsertedLeavesIndex
        );
        var preInsertedLeavesIndexAccount =
          yield this.provider.connection.getAccountInfo(
            this.preInsertedLeavesIndex
          );
        console.log(preInsertedLeavesIndexAccount);
        const preInsertedLeavesIndexAccountAfterUpdate =
          this.merkleTreeProgram.account.preInsertedLeavesIndex._coder.accounts.decode(
            "PreInsertedLeavesIndex",
            preInsertedLeavesIndexAccount.data
          );
        console.log(
          "Number(preInsertedLeavesIndexAccountAfterUpdate.nextIndex) ",
          Number(preInsertedLeavesIndexAccountAfterUpdate.nextIndex)
        );
        console.log(
          `${Number(leavesAccountData.leftLeafIndex)} + ${
            this.leavesPdaPubkeys.length * 2
          }`
        );
        assert(
          Number(preInsertedLeavesIndexAccountAfterUpdate.nextIndex) ==
            Number(leavesAccountData.leftLeafIndex) +
              this.leavesPdaPubkeys.length * 2
        );
      } catch (e) {
        console.log("preInsertedLeavesIndex: ", e);
      }
      if (this.action == "DEPOSIT" && this.is_token == false) {
        var recipientAccount = yield this.provider.connection.getAccountInfo(
          this.recipient
        );
        assert(
          recipientAccount.lamports ==
            I64(this.recipientBalancePriorTx)
              .add(this.externalAmountBigNumber.toString())
              .toString(),
          "amount not transferred correctly"
        );
      } else if (this.action == "DEPOSIT" && this.is_token == true) {
        console.log("DEPOSIT and token");
        console.log("this.recipient: ", this.recipient);
        var recipientAccount = yield (0, spl_token_1.getAccount)(
          this.provider.connection,
          this.recipient,
          spl_token_1.TOKEN_PROGRAM_ID
        );
        var recipientFeeAccountBalance =
          yield this.provider.connection.getBalance(this.recipientFee);
        // console.log(`Balance now ${senderAccount.amount} balance beginning ${senderAccountBalancePriorLastTx}`)
        // assert(senderAccount.lamports == (I64(senderAccountBalancePriorLastTx) - I64.readLE(this.extAmount, 0)).toString(), "amount not transferred correctly");
        console.log(
          `Balance now ${recipientAccount.amount} balance beginning ${this.recipientBalancePriorTx}`
        );
        console.log(
          `Balance now ${recipientAccount.amount} balance beginning ${
            Number(this.recipientBalancePriorTx) +
            Number(this.externalAmountBigNumber)
          }`
        );
        assert(
          recipientAccount.amount ==
            (
              Number(this.recipientBalancePriorTx) +
              Number(this.externalAmountBigNumber)
            ).toString(),
          "amount not transferred correctly"
        );
        console.log(
          `Blanace now ${recipientFeeAccountBalance} ${
            Number(this.recipientFeeBalancePriorTx) + Number(this.feeAmount)
          }`
        );
        console.log("fee amount: ", this.feeAmount);
        console.log(
          "fee amount from inputs. ",
          new anchor.BN(this.publicInputs.feeAmount.slice(24, 32)).toString()
        );
        console.log(
          "pub amount from inputs. ",
          new anchor.BN(this.publicInputs.publicAmount.slice(24, 32)).toString()
        );
        console.log(
          "recipientFeeBalancePriorTx: ",
          this.recipientFeeBalancePriorTx
        );
        var senderFeeAccountBalance = yield this.provider.connection.getBalance(
          this.senderFee
        );
        console.log("senderFeeAccountBalance: ", senderFeeAccountBalance);
        console.log(
          "this.senderFeeBalancePriorTx: ",
          this.senderFeeBalancePriorTx
        );
        assert(
          recipientFeeAccountBalance ==
            Number(this.recipientFeeBalancePriorTx) + Number(this.feeAmount)
        );
        console.log(
          `${Number(this.senderFeeBalancePriorTx)} - ${Number(
            this.feeAmount
          )} == ${senderFeeAccountBalance}`
        );
        assert(
          Number(this.senderFeeBalancePriorTx) -
            Number(this.feeAmount) -
            5000 ==
            Number(senderFeeAccountBalance)
        );
      } else if (this.action == "WITHDRAWAL" && this.is_token == false) {
        var senderAccount = yield this.provider.connection.getAccountInfo(
          this.sender
        );
        var recipientAccount = yield this.provider.connection.getAccountInfo(
          this.recipient
        );
        // console.log("senderAccount.lamports: ", senderAccount.lamports)
        // console.log("I64(senderAccountBalancePriorLastTx): ", I64(senderAccountBalancePriorLastTx).toString())
        // console.log("Sum: ", ((I64(senderAccountBalancePriorLastTx).add(I64.readLE(this.extAmount, 0))).sub(I64(relayerFee))).toString())
        assert(
          senderAccount.lamports ==
            I64(senderAccountBalancePriorLastTx)
              .add(I64.readLE(this.extAmount, 0))
              .sub(I64(relayerFee))
              .toString(),
          "amount not transferred correctly"
        );
        var recipientAccount = yield this.provider.connection.getAccountInfo(
          recipient
        );
        // console.log(`recipientAccount.lamports: ${recipientAccount.lamports} == sum ${((I64(Number(this.recipientBalancePriorTx)).sub(I64.readLE(this.extAmount, 0))).add(I64(relayerFee))).toString()}
        assert(
          recipientAccount.lamports ==
            I64(Number(this.recipientBalancePriorTx))
              .sub(I64.readLE(this.extAmount, 0))
              .toString(),
          "amount not transferred correctly"
        );
      } else if (this.action == "WITHDRAWAL" && this.is_token == true) {
        var senderAccount = yield (0, spl_token_1.getAccount)(
          this.provider.connection,
          this.sender,
          spl_token_1.TOKEN_PROGRAM_ID
        );
        var recipientAccount = yield (0, spl_token_1.getAccount)(
          this.provider.connection,
          this.recipient,
          spl_token_1.TOKEN_PROGRAM_ID
        );
        // assert(senderAccount.amount == ((I64(Number(senderAccountBalancePriorLastTx)).add(I64.readLE(this.extAmount, 0))).sub(I64(relayerFee))).toString(), "amount not transferred correctly");
        console.log(
          `${recipientAccount.amount}, ${new anchor.BN(
            this.recipientBalancePriorTx
          )
            .sub(this.externalAmountBigNumber)
            .toString()}`
        );
        assert(
          recipientAccount.amount.toString() ==
            new anchor.BN(this.recipientBalancePriorTx)
              .sub(this.externalAmountBigNumber)
              .toString(),
          "amount not transferred correctly"
        );
        var relayerAccount = yield this.provider.connection.getBalance(
          this.relayerRecipient
        );
        var recipientFeeAccount = yield this.provider.connection.getBalance(
          this.recipientFee
        );
        console.log("recipientFeeAccount ", recipientFeeAccount);
        console.log("this.feeAmount: ", this.feeAmount);
        console.log(
          "recipientFeeBalancePriorTx ",
          this.recipientFeeBalancePriorTx
        );
        console.log(
          `recipientFeeAccount ${new anchor.BN(recipientFeeAccount)
            .add(new anchor.BN(this.relayerFee.toString()))
            .add(new anchor.BN("5000"))
            .toString()} == ${new anchor.BN(this.recipientFeeBalancePriorTx)
            .sub(new anchor.BN(this.feeAmount))
            .toString()}`
        );
        console.log("relayerAccount ", relayerAccount);
        console.log("this.relayerFee: ", this.relayerFee);
        console.log(
          "relayerRecipientAccountBalancePriorLastTx ",
          this.relayerRecipientAccountBalancePriorLastTx
        );
        console.log(
          `relayerFeeAccount ${new anchor.BN(relayerAccount)
            .sub(new anchor.BN(this.relayerFee.toString()))
            .toString()} == ${new anchor.BN(
            this.relayerRecipientAccountBalancePriorLastTx
          )}`
        );
        console.log(
          `relayerAccount ${new anchor.BN(
            relayerAccount
          ).toString()} == ${new anchor.BN(
            this.relayerRecipientAccountBalancePriorLastTx
          )
            .sub(new anchor.BN(this.relayerFee))
            .toString()}`
        );
        console.log(
          `recipientFeeAccount ${new anchor.BN(recipientFeeAccount)
            .add(new anchor.BN(this.relayerFee.toString()))
            .toString()}  != ${new anchor.BN(this.recipientFeeBalancePriorTx)
            .sub(new anchor.BN(this.feeAmount))
            .toString()}`
        );
        assert(
          new anchor.BN(recipientFeeAccount)
            .add(new anchor.BN(this.relayerFee.toString()))
            .toString() ==
            new anchor.BN(this.recipientFeeBalancePriorTx)
              .sub(new anchor.BN(this.feeAmount))
              .toString()
        );
        assert(
          new anchor.BN(relayerAccount)
            .sub(new anchor.BN(this.relayerFee.toString()))
            .add(new anchor.BN("5000"))
            .toString() ==
            new anchor.BN(
              this.relayerRecipientAccountBalancePriorLastTx
            ).toString()
        );
      } else {
        throw Error("mode not supplied");
      }
    });
  }
}
exports.Transaction = Transaction;
// TODO: use higher entropy rnds
const shuffle = function (utxos) {
  let currentIndex = utxos.length;
  let randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [utxos[currentIndex], utxos[randomIndex]] = [
      utxos[randomIndex],
      utxos[currentIndex],
    ];
  }
  return utxos;
};
// also converts lE to BE
const parseProofToBytesArray = function (data) {
  return __awaiter(this, void 0, void 0, function* () {
    var mydata = JSON.parse(data.toString());
    for (var i in mydata) {
      if (i == "pi_a" || i == "pi_c") {
        for (var j in mydata[i]) {
          mydata[i][j] = Array.from(
            leInt2Buff(unstringifyBigInts(mydata[i][j]), 32)
          ).reverse();
        }
      } else if (i == "pi_b") {
        for (var j in mydata[i]) {
          for (var z in mydata[i][j]) {
            mydata[i][j][z] = Array.from(
              leInt2Buff(unstringifyBigInts(mydata[i][j][z]), 32)
            );
          }
        }
      }
    }
    return [
      mydata.pi_a[0],
      mydata.pi_a[1],
      mydata.pi_b[0].flat().reverse(),
      mydata.pi_b[1].flat().reverse(),
      mydata.pi_c[0],
      mydata.pi_c[1],
    ].flat();
  });
};
exports.parseProofToBytesArray = parseProofToBytesArray;
