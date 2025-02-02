use anchor_lang::prelude::*;

#[error_code]
pub enum VerifierSdkError {
    #[msg("Incompatible Verifying Key with number of public inputs")]
    IncompatibleVerifyingKeyWithNrPublicInputs,
    #[msg("WrongPubAmount")]
    WrongPubAmount,
    #[msg("WrongTxIntegrityHash")]
    WrongTxIntegrityHash,
    #[msg("ProofVerificationFailed")]
    ProofVerificationFailed,
    #[msg("Transaction was not executed completely")]
    TransactionIncomplete,
    #[msg("AppTransaction was not executed completely")]
    AppTransactionIncomplete,
    #[msg("Invalid number of nullifiers")]
    InvalidNrNullifiers,
    #[msg("Invalid number of leaves")]
    InvalidNrLeaves,
    #[msg("Invalid number of remaining accounts")]
    InvalidNrRemainingAccounts,
    #[msg("Invalid address of the new transaction Merkle tree")]
    InvalidTransactionMerkleTreeAddress,
    #[msg("Invalid merkle tree root")]
    InvalidMerkleTreeRoot,
    #[msg("InconsistentMintProofSenderOrRecipient")]
    InconsistentMintProofSenderOrRecipient,
    #[msg("InvalidUtxoSize")]
    InvalidUtxoSize,
    #[msg("CloseAccountFailed")]
    CloseAccountFailed,
    #[msg("InvalidSenderorRecipient")]
    InvalidSenderorRecipient,
    #[msg("Proof not verified")]
    ProofNotVerified,
    #[msg("Message was provided without event Merkle tree account")]
    MessageNoMerkleTreeAccount,
    #[msg("Provided message Merkle tree account has invalid hash function (not SHA256")]
    EventMerkleTreeInvalidHashFunction,
    #[msg("Invalid noop progam key")]
    InvalidNoopPubkey,
}
