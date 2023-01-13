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
exports.VerifierTwo = void 0;
const verifier_program_two_1 = require("../idls/verifier_program_two");
const anchor_1 = require("@coral-xyz/anchor");
const index_1 = require("../index");
class VerifierTwo {
  constructor() {
    this.verifierProgram = new anchor_1.Program(
      verifier_program_two_1.VerifierProgramTwo,
      index_1.verifierProgramTwoProgramId
    );
    this.wtnsGenPath = "./build-circuits/transactionMasp2_js/transactionMasp2";
    this.zkeyPath = "./build-circuits/transactionMasp2";
    this.calculateWtns = require("../../build-circuits/transactionMasp2_js/witness_calculator.js");
    this.registeredVerifierPda = index_1.REGISTERED_VERIFIER_TWO_PDA;
    this.nrPublicInputs = 17;
    console.log("TODO Change paths to 4 ins 4 outs circuit");
    console.log("REGISTERED_VERIFIER_TWO_PDA: is ONE");
  }
  parsePublicInputsFromArray(transaction) {
    if (transaction.publicInputsBytes.length == this.nrPublicInputs) {
      return {
        root: transaction.publicInputsBytes[0],
        publicAmount: transaction.publicInputsBytes[1],
        extDataHash: transaction.publicInputsBytes[2],
        feeAmount: transaction.publicInputsBytes[3],
        mintPubkey: transaction.publicInputsBytes[4],
        checkedParams: Array.from(transaction.publicInputsBytes.slice(5, 9)),
        nullifiers: Array.from(transaction.publicInputsBytes.slice(9, 13)),
        leaves: Array.from(
          transaction.publicInputsBytes.slice(13, this.nrPublicInputs)
        ),
      };
    } else {
      throw `publicInputsBytes.length invalid ${transaction.publicInputsBytes.length} != ${this.nrPublicInputs}`;
    }
  }
  initVerifierProgram() {
    this.verifierProgram = new anchor_1.Program(
      verifier_program_two_1.VerifierProgramTwo,
      index_1.verifierProgramTwoProgramId
    );
  }
  // Do I need a getData fn?
  // I should be able to fetch everything from the object
  sendTransaction(transaction) {
    return __awaiter(this, void 0, void 0, function* () {
      console.log("empty is cpi");
    });
  }
}
exports.VerifierTwo = VerifierTwo;
