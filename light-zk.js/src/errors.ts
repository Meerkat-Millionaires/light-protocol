export enum UtxoErrorCode {
  APP_DATA_IDL_UNDEFINED = "APP_DATA_IDL_UNDEFINED",
  INVALID_ASSET_OR_AMOUNTS_LENGTH = "INVALID_ASSET_OR_AMOUNTS_LENGTH",
  EXCEEDED_MAX_ASSETS = "EXCEEDED_MAX_ASSETS",
  NEGATIVE_AMOUNT = "NEGATIVE_AMOUNT",
  NON_ZERO_AMOUNT = "NON_ZERO_AMOUNT",
  POSITIVE_AMOUNT = "POSITIVE_AMOUNT",
  NOT_U64 = "NOT_U64",
  BLINDING_EXCEEDS_FIELD_SIZE = "BLINDING_EXCEEDS_FIELD_SIZE",
  INDEX_NOT_PROVIDED = "INDEX_NOT_PROVIDED",
  ACCOUNT_HAS_NO_PRIVKEY = "ACCOUNT_HAS_NO_PRIVKEY",
  ASSET_NOT_FOUND = "ASSET_NOT_FOUND",
  APP_DATA_UNDEFINED = "APP_DATA_UNDEFINED",
  APP_DATA_IDL_DOES_NOT_HAVE_ACCOUNTS = "APP_DATA_IDL_DOES_NOT_HAVE_ACCOUNTS",
  UTXO_APP_DATA_NOT_FOUND_IN_IDL = "UTXO_APP_DATA_NOT_FOUND_IN_IDL",
  AES_SECRET_UNDEFINED = "AES_SECRET_UNDEFINED",
  INVALID_NONCE_LENGHT = "INVALID_NONCE_LENGHT",
  MERKLE_TREE_PDA_PUBLICKEY_UNDEFINED = "MERKLE_TREE_PDA_PUBLICKEY_UNDEFINED",
  TRANSACTION_INDEX_UNDEFINED = "TRANSACTION_INDEX_UNDEFINED",
  INVALID_APP_DATA = "INVALID_APP_DATA",
  VERIFIER_INDEX_NOT_FOUND = "VERIFIER_INDEX_NOT_FOUND",
  ASSET_UNDEFINED = "ASSET_UNDEFINED",
  INVALID_APP_DATA_IDL = "INVALID_APP_DATA_IDL",
  INVALID_IV = "INVALID_IV",
}

export enum UserErrorCode {
  NO_WALLET_PROVIDED = "NO_WALLET_PROVIDED",
  LOAD_ERROR = "LOAD_ERROR",
  PROVIDER_NOT_INITIALIZED = "PROVIDER_NOT_INITIALIZED",
  UTXOS_NOT_INITIALIZED = "UTXOS_NOT_INITIALIZED",
  USER_ACCOUNT_NOT_INITIALIZED = "USER_ACCOUNT_NOT_INITIALIZED",
  TOKEN_NOT_FOUND = "TOKEN_NOT_FOUND",
  NO_AMOUNTS_PROVIDED = "NO_AMOUNTS_PROVIDED",
  APPROVE_ERROR = "APPROVE_ERROR",
  INSUFFICIENT_BAlANCE = "INSUFFICIENT_BAlANCE",
  ASSOCIATED_TOKEN_ACCOUNT_DOESNT_EXIST = "ASSOCIATED_TOKEN_ACCOUNT_DOESNT_EXIST",
  TOKEN_ACCOUNT_DEFINED = "TOKEN_ACCOUNT_DEFINED",
  SHIELDED_RECIPIENT_UNDEFINED = "SHIELDED_RECIPIENT_UNDEFINED",
  TOKEN_UNDEFINED = "TOKEN_UNDEFINED",
  INVALID_TOKEN = "INVALID_TOKEN",
  TRANSACTION_PARAMTERS_UNDEFINED = "TRANSACTION_PARAMTERS_UNDEFINED",
  SPL_FUNDS_NOT_APPROVED = "SPL_FUNDS_NOT_APPROVED",
  TRANSACTION_UNDEFINED = "TRANSACTION_UNDEFINED",
  VERIFIER_IS_NOT_APP_ENABLED = "VERIFIER_IS_NOT_APP_ENABLED",
  EMPTY_INBOX = "EMPTY_INBOX",
  COMMITMENT_NOT_FOUND = "COMMITMENT_NOT_FOUND",
  NO_COMMITMENTS_PROVIDED = "NO_COMMITMENTS_PROVIDED",
  TOO_MANY_COMMITMENTS = "TOO_MANY_COMMITMENTS",
  MAX_STORAGE_MESSAGE_SIZE_EXCEEDED = "MAX_STORAGE_MESSAGE_SIZE_EXCEEDED",
  APP_UTXO_UNDEFINED = "APP_UTXO_UNDEFINED",
  ENCRYPTION_FAILED = "ENCRYPTION_FAILED",
  ADD_IN_UTXOS_FALSE = "ADD_IN_UTXOS_FALSE",
}

export enum SelectInUtxosErrorCode {
  INVALID_NUMER_OF_MINTS = "INVALID_NUMER_OF_MINTS",
  FAILED_TO_SELECT_SOL_UTXO = "FAILED_TO_SELECT_SOL_UTXO",
  FAILED_TO_FIND_UTXO_COMBINATION = "FAILED_TO_FIND_UTXO_COMBINATION",
  INVALID_NUMBER_OF_IN_UTXOS = "INVALID_NUMBER_OF_IN_UTXOS",
}

export enum TokenUtxoBalanceErrorCode {
  UTXO_UNDEFINED = "UTXO_UNDEFINED",
}

export enum RelayerErrorCode {
  RELAYER_FEE_UNDEFINED = "RELAYER_FEE_UNDEFINED",
  RELAYER_PUBKEY_UNDEFINED = "RELAYER_PUBKEY_UNDEFINED",
  LOOK_UP_TABLE_UNDEFINED = "LOOK_UP_TABLE_UNDEFINED",
  RELAYER_RECIPIENT_UNDEFINED = "RELAYER_RECIPIENT_UNDEFINED",
}

export enum CreateUtxoErrorCode {
  INVALID_NUMER_OF_RECIPIENTS = "INVALID_NUMER_OF_RECIPIENTS",
  INVALID_RECIPIENT_MINT = "INVALID_RECIPIENT_MINT",
  RECIPIENTS_SUM_AMOUNT_MISSMATCH = "RECIPIENTS_SUM_AMOUNT_MISSMATCH",
  NO_PUBLIC_AMOUNTS_PROVIDED = "NO_PUBLIC_AMOUNTS_PROVIDED",
  NO_PUBLIC_MINT_PROVIDED = "NO_PUBLIC_MINT_PROVIDED",
  MINT_UNDEFINED = "MINT_UNDEFINED",
  SPL_AMOUNT_UNDEFINED = "SPL_AMOUNT_UNDEFINED",
  ACCOUNT_UNDEFINED = "ACCOUNT_UNDEFINED",
  INVALID_OUTPUT_UTXO_LENGTH = "INVALID_OUTPUT_UTXO_LENGTH",
  RELAYER_FEE_DEFINED = "RELAYER_FEE_DEFINED",
  PUBLIC_SOL_AMOUNT_UNDEFINED = "PUBLIC_SOL_AMOUNT_UNDEFINED",
  PUBLIC_SPL_AMOUNT_UNDEFINED = "PUBLIC_SPL_AMOUNT_UNDEFINED",
}
export enum AccountErrorCode {
  INVALID_SEED_SIZE = "INVALID_SEED_SIZE",
  SEED_UNDEFINED = "SEED_UNDEFINED",
  SEED_DEFINED = "SEED_DEFINED",
  ENCRYPTION_PRIVATE_KEY_UNDEFINED = "ENCRYPTION_PRIVATE_KEY_UNDEFINED",
  PRIVATE_KEY_UNDEFINED = "PRIVATE_KEY_UNDEFINED",
  POSEIDON_EDDSA_KEYPAIR_UNDEFINED = "POSEIDON_EDDSA_KEYPAIR_UNDEFINED",
  POSEIDON_EDDSA_GET_PUBKEY_FAILED = "POSEIDON_EDDSA_GET_PUBKEY_FAILED",
  PUBLIC_KEY_UNDEFINED = "PUBLIC_KEY_UNDEFINED",
  AES_SECRET_UNDEFINED = "AES_SECRET_UNDEFINED",
  INVALID_PUBLIC_KEY_SIZE = "INVALID_PUBLIC_KEY_SIZE",
}

export enum ProviderErrorCode {
  SOL_MERKLE_TREE_UNDEFINED = "SOL_MERKLE_TREE_UNDEFINED",
  ANCHOR_PROVIDER_UNDEFINED = "ANCHOR_PROVIDER_UNDEFINED",
  PROVIDER_UNDEFINED = "PROVIDER_UNDEFINED",
  WALLET_UNDEFINED = "WALLET_UNDEFINED",
  NODE_WALLET_UNDEFINED = "NODE_WALLET_UNDEFINED",
  URL_UNDEFINED = "URL_UNDEFINED",
  CONNECTION_UNDEFINED = "CONNECTION_UNDEFINED",
  CONNECTION_DEFINED = "CONNECTION_DEFINED",
  KEYPAIR_UNDEFINED = "KEYPAIR_UNDEFINED",
  WALLET_DEFINED = "WALLET_DEFINED",
  MERKLE_TREE_NOT_INITIALIZED = "MERKLE_TREE_NOT_INITIALIZED",
  LOOK_UP_TABLE_NOT_INITIALIZED = "LOOK_UP_TABLE_NOT_INITIALIZED",
}

export enum SolMerkleTreeErrorCode {
  MERKLE_TREE_UNDEFINED = "MERKLE_TREE_UNDEFINED",
}

export enum TransactionParametersErrorCode {
  NO_VERIFIER_IDL_PROVIDED = "NO_VERIFIER_IDL_PROVIDED",
  NO_POSEIDON_HASHER_PROVIDED = "NO_POSEIDON_HASHER_PROVIDED",
  NO_ACTION_PROVIDED = "NO_ACTION_PROVIDED",
  PUBLIC_AMOUNT_NEGATIVE = "PUBLIC_AMOUNT_NEGATIVE",
  SOL_RECIPIENT_DEFINED = "SOL_RECIPIENT_DEFINED",
  SPL_RECIPIENT_DEFINED = "SPL_RECIPIENT_DEFINED",
  PUBLIC_AMOUNT_NOT_U64 = "PUBLIC_AMOUNT_NOT_U64",
  RELAYER_DEFINED = "RELAYER_DEFINED",
  INVALID_PUBLIC_AMOUNT = "INVALID_PUBLIC_AMOUNT",
  SOL_SENDER_DEFINED = "SOL_SENDER_DEFINED",
  SPL_SENDER_DEFINED = "SPL_SENDER_DEFINED",
  PUBLIC_AMOUNT_SPL_NOT_ZERO = "PUBLIC_AMOUNT_SPL_NOT_ZERO",
  PUBLIC_AMOUNT_SOL_NOT_ZERO = "PUBLIC_AMOUNT_SOL_NOT_ZERO",
  LOOK_UP_TABLE_UNDEFINED = "LOOK_UP_TABLE_UNDEFINED",
  INVALID_NUMBER_OF_NONCES = "INVALID_NUMBER_OF_NONCES",
  VERIFIER_IDL_UNDEFINED = "VERIFIER_IDL_UNDEFINED",
  RELAYER_INVALID = "RELAYER_INVALID",
  UTXO_IDLS_UNDEFINED = "UTXO_IDLS_UNDEFINED",
  EVENT_MERKLE_TREE_UNDEFINED = "EVENT_MERKLE_TREE_UNDEFINED",
  MESSAGE_UNDEFINED = "MESSAGE_UNDEFINED",
  PROGRAM_ID_CONSTANT_UNDEFINED = "PROGRAM_ID_CONSTANT_UNDEFINED",
  ENCRYPTED_UTXOS_TOO_LONG = "ENCRYPTED_UTXOS_TOO_LONG",
}

export enum TransactionErrorCode {
  PROVIDER_UNDEFINED = "PROVIDER_UNDEFINED",
  ROOT_INDEX_NOT_FETCHED = "ROOT_INDEX_NOT_FETCHED",
  REMAINING_ACCOUNTS_NOT_CREATED = "REMAINING_ACCOUNTS_NOT_CREATED",
  TRANSACTION_INPUTS_UNDEFINED = "TRANSACTION_INPUTS_UNDEFINED",
  WALLET_RELAYER_INCONSISTENT = "WALLET_RELAYER_INCONSISTENT",
  TX_PARAMETERS_UNDEFINED = "TX_PARAMETERS_UNDEFINED",
  APP_PARAMETERS_UNDEFINED = "APP_PARAMETERS_UNDEFINED",
  RELAYER_UNDEFINED = "TransactionParameters.relayer is undefined",
  WALLET_UNDEFINED = "WALLET_UNDEFINED",
  NO_UTXOS_PROVIDED = "NO_UTXOS_PROVIDED",
  EXCEEDED_MAX_ASSETS = "EXCEEDED_MAX_ASSETS",
  VERIFIER_PROGRAM_UNDEFINED = "VERIFIER_PROGRAM_UNDEFINED",
  SPL_RECIPIENT_UNDEFINED = "SPL_RECIPIENT_UNDEFINED",
  SOL_RECIPIENT_UNDEFINED = "SOL_RECIPIENT_UNDEFINED",
  SPL_SENDER_UNDEFINED = "SPL_SENDER_UNDEFINED",
  SOL_SENDER_UNDEFINED = "SOL_SENDER_UNDEFINED",
  ASSET_PUBKEYS_UNDEFINED = "ASSET_PUBKEYS_UNDEFINED",
  ACTION_IS_NO_WITHDRAWAL = "ACTION_IS_NO_WITHDRAWAL",
  ACTION_IS_NO_DEPOSIT = "ACTION_IS_NO_DEPOSIT",
  INPUT_UTXOS_UNDEFINED = "INPUT_UTXOS_UNDEFINED",
  OUTPUT_UTXOS_UNDEFINED = "OUTPUT_UTXOS_UNDEFINED",
  GET_MINT_FAILED = "GET_MINT_FAILED",
  VERIFIER_IDL_UNDEFINED = "VERIFIER_UNDEFINED",
  PROOF_INPUT_UNDEFINED = "PROOF_INPUT_UNDEFINED",
  NO_PARAMETERS_PROVIDED = "NO_PARAMETERS_PROVIDED",
  ROOT_NOT_FOUND = "ROOT_NOT_FOUND",
  VERIFIER_CONFIG_UNDEFINED = "VERIFIER_CONFIG_UNDEFINED",
  RELAYER_FEE_UNDEFINED = "RELAYER_FEE_UNDEFINED",
  ENCRYPTING_UTXOS_FAILED = "ENCRYPTING_UTXOS_FAILED",
  GET_INSTRUCTIONS_FAILED = "GET_INSTRUCTIONS_FAILED",
  SEND_TRANSACTION_FAILED = "SEND_TRANSACTION_FAILED",
  PUBLIC_INPUTS_UNDEFINED = "PUBLIC_INPUTS_UNDEFINED",
  MERKLE_TREE_PROGRAM_UNDEFINED = "MERKLE_TREE_PROGRAM_UNDEFINED",
  INPUT_UTXO_NOT_INSERTED_IN_MERKLE_TREE = "INPUT_UTXO_NOT_INSERTED_IN_MERKLE_TREE",
  INVALID_PROOF = "INVALID_PROOF",
  POSEIDON_HASHER_UNDEFINED = "POSEIDON_HASHER_UNDEFINED",
  PROOF_GENERATION_FAILED = "PROOF_GENERATION_FAILED",
  INVALID_VERIFIER_SELECTED = "INVALID_VERIFIER_SELECTED",
  MESSAGE_UNDEFINED = "MESSAGE_UNDEFINED",
  UNIMPLEMENTED = "UNIMPLEMENTED",
  TX_INTEGRITY_HASH_UNDEFINED = "TX_INTEGRITY_HASH_UNDEFINED",
  GET_USER_TRANSACTION_HISTORY_FAILED = "GET_USER_TRANSACTION_HISTORY_FAILED",
  FIRST_PATH_APP_UNDEFINED = "FIRST_PATH_APP_UNDEFINED",
}

export enum UtilsErrorCode {
  ACCOUNT_NAME_UNDEFINED_IN_IDL = "ACCOUNT_NAME_UNDEFINED_IN_IDL",
  PROPERTY_UNDEFINED = "PROPERTY_UNDEFINED",
}
export enum ProgramUtxoBalanceErrorCode {
  INVALID_PROGRAM_ADDRESS = "INVALID_PROGRAM_ADDRESS",
  TOKEN_DATA_NOT_FOUND = "TOKEN_DATA_NOT_FOUND",
}

export class MetaError extends Error {
  code: string;
  codeMessage?: string;
  functionName: string;

  constructor(code: string, functionName: string, codeMessage?: string) {
    super(`${code}: ${codeMessage}`);

    this.codeMessage = codeMessage;
    this.code = code;
    this.functionName = functionName;
  }
}

/**
 * @description Thrown when something fails in the Transaction class.
 **/
export class TransactionError extends MetaError {}

export class TransactionParametersError extends MetaError {}

/**
 * @description Thrown when something fails in the Utxo class.
 **/
export class UtxoError extends MetaError {}

export class AccountError extends MetaError {}

export class RelayerError extends MetaError {}

export class CreateUtxoError extends MetaError {}

export class ProviderError extends MetaError {}

export class SelectInUtxosError extends MetaError {}

export class UserError extends MetaError {}

export class UtilsError extends MetaError {}

export class TokenUtxoBalanceError extends MetaError {}

export class ProgramUtxoBalanceError extends MetaError {}
