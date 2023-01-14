export type VerifierProgramTwoIdl = {
  version: "0.1.0";
  name: "verifier_program_two";
  instructions: [
    {
      name: "shieldedTransferInputs";
      accounts: [
        {
          name: "verifierState";
          isMut: false;
          isSigner: false;
        },
        {
          name: "signingAddress";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "programMerkleTree";
          isMut: false;
          isSigner: false;
        },
        {
          name: "merkleTree";
          isMut: false;
          isSigner: false;
        },
        {
          name: "preInsertedLeavesIndex";
          isMut: false;
          isSigner: false;
        },
        {
          name: "authority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "sender";
          isMut: true;
          isSigner: false;
        },
        {
          name: "recipient";
          isMut: true;
          isSigner: false;
        },
        {
          name: "senderFee";
          isMut: true;
          isSigner: false;
        },
        {
          name: "recipientFee";
          isMut: true;
          isSigner: false;
        },
        {
          name: "relayerRecipient";
          isMut: true;
          isSigner: false;
        },
        {
          name: "escrow";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenAuthority";
          isMut: true;
          isSigner: false;
        },
        {
          name: "registeredVerifierPda";
          isMut: false;
          isSigner: false;
        },
        {
          name: "invokingVerifier";
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: "proof";
          type: "bytes";
        },
        {
          name: "appHash";
          type: "bytes";
        },
      ];
    },
  ];
};
export const VerifierProgramTwo: VerifierProgramTwoIdl = {
  version: "0.1.0",
  name: "verifier_program_two",
  instructions: [
    {
      name: "shieldedTransferInputs",
      accounts: [
        {
          name: "verifierState",
          isMut: false,
          isSigner: false,
        },
        {
          name: "signingAddress",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "programMerkleTree",
          isMut: false,
          isSigner: false,
        },
        {
          name: "merkleTree",
          isMut: false,
          isSigner: false,
        },
        {
          name: "preInsertedLeavesIndex",
          isMut: false,
          isSigner: false,
        },
        {
          name: "authority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "sender",
          isMut: true,
          isSigner: false,
        },
        {
          name: "recipient",
          isMut: true,
          isSigner: false,
        },
        {
          name: "senderFee",
          isMut: true,
          isSigner: false,
        },
        {
          name: "recipientFee",
          isMut: true,
          isSigner: false,
        },
        {
          name: "relayerRecipient",
          isMut: true,
          isSigner: false,
        },
        {
          name: "escrow",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenAuthority",
          isMut: true,
          isSigner: false,
        },
        {
          name: "registeredVerifierPda",
          isMut: false,
          isSigner: false,
        },
        {
          name: "invokingVerifier",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "proof",
          type: "bytes",
        },
        {
          name: "appHash",
          type: "bytes",
        },
      ],
    },
  ],
};
export default VerifierProgramTwo;
