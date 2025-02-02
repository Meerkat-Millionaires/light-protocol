use anchor_lang::prelude::*;

use light_macros::{light_verifier_accounts, pubkey};
use light_verifier_sdk::light_transaction::{
    Config, Transaction, TransactionInput, VERIFIER_STATE_SEED,
};
use light_verifier_sdk::state::VerifierState10Ins;
use merkle_tree_program::program::MerkleTreeProgram;

pub mod verifying_key;
use verifying_key::VERIFYINGKEY;

#[cfg(not(feature = "no-entrypoint"))]
solana_security_txt::security_txt! {
    name: "light_protocol_verifier_program_one",
    project_url: "lightprotocol.com",
    contacts: "email:security@lightprotocol.com",
    policy: "https://github.com/Lightprotocol/light-protocol-onchain/blob/main/SECURITY.md",
    source_code: "https://github.com/Lightprotocol/light-protocol-onchain"
}

declare_id!("J85SuNBBsba7FQS66BiBCQjiQrQTif7v249zL2ffmRZc");

#[constant]
pub const PROGRAM_ID: &str = "J85SuNBBsba7FQS66BiBCQjiQrQTif7v249zL2ffmRZc";

#[derive(Clone)]
pub struct TransactionConfig;
impl Config for TransactionConfig {
    /// ProgramId.
    const ID: Pubkey = pubkey!("J85SuNBBsba7FQS66BiBCQjiQrQTif7v249zL2ffmRZc");
}

#[program]
pub mod verifier_program_one {
    use std::marker::PhantomData;

    use light_verifier_sdk::light_transaction::{Amounts, Proof};

    use super::*;

    /// This instruction is the first step of a shielded transaction with 10 inputs and 2 outputs.
    /// It creates and initializes a verifier state account which stores public inputs and other data
    /// such as leaves, amounts, recipients, nullifiers, etc. to execute the verification and
    /// protocol logicin the second transaction.
    pub fn shielded_transfer_first<'info>(
        ctx: Context<'_, '_, '_, 'info, LightInstructionFirst<'info, 0>>,
        inputs: Vec<u8>,
    ) -> Result<()> {
        let inputs: InstructionDataShieldedTransferFirst =
            InstructionDataShieldedTransferFirst::try_deserialize_unchecked(
                &mut [vec![0u8; 8], inputs].concat().as_slice(),
            )?;
        let len_missing_bytes = 256 - inputs.encrypted_utxos.len();
        let mut enc_utxos = inputs.encrypted_utxos;
        enc_utxos.append(&mut vec![0u8; len_missing_bytes]);

        let state = VerifierState10Ins {
            merkle_root_index: inputs.root_index,
            signer: Pubkey::from([0u8; 32]),
            nullifiers: inputs.input_nullifier.to_vec(),
            leaves: vec![inputs.output_commitment[0], inputs.output_commitment[1]],
            public_amount_spl: inputs.public_amount_spl,
            public_amount_sol: inputs.public_amount_sol,
            mint_pubkey: [0u8; 32],
            merkle_root: [0u8; 32],
            tx_integrity_hash: [0u8; 32],
            relayer_fee: inputs.relayer_fee,
            encrypted_utxos: enc_utxos,
            checked_public_inputs: [],
            proof_a: [0u8; 64],
            proof_b: [0u8; 128],
            proof_c: [0u8; 64],
            transaction_hash: [0u8; 32],
            e_phantom: PhantomData,
        };
        ctx.accounts.verifier_state.set_inner(state);
        ctx.accounts.verifier_state.signer = *ctx.accounts.signing_address.key;

        Ok(())
    }

    /// This instruction is the second step of a shieled transaction.
    /// The proof is verified with the parameters saved in the first transaction.
    /// At successful verification protocol logic is executed.
    pub fn shielded_transfer_second<'info>(
        ctx: Context<'_, '_, '_, 'info, LightInstructionSecond<'info, 0>>,
        inputs: Vec<u8>,
    ) -> Result<()> {
        let inputs: InstructionDataShieldedTransferSecond =
            InstructionDataShieldedTransferSecond::try_deserialize_unchecked(
                &mut [vec![0u8; 8], inputs].concat().as_slice(),
            )?;
        let proof = Proof {
            a: inputs.proof_a,
            b: inputs.proof_b,
            c: inputs.proof_c,
        };

        let public_amount = Amounts {
            sol: ctx.accounts.verifier_state.public_amount_sol,
            spl: ctx.accounts.verifier_state.public_amount_spl,
        };

        let leaves = [[
            ctx.accounts.verifier_state.leaves[0],
            ctx.accounts.verifier_state.leaves[1],
        ]; 1];
        let nullifier: [[u8; 32]; 10] = ctx
            .accounts
            .verifier_state
            .nullifiers
            .to_vec()
            .try_into()
            .unwrap();

        let input = TransactionInput {
            ctx: &ctx,
            message: None,
            proof: &proof,
            public_amount: &public_amount,
            nullifiers: &nullifier,
            leaves: &leaves,
            encrypted_utxos: &ctx.accounts.verifier_state.encrypted_utxos,
            relayer_fee: ctx.accounts.verifier_state.relayer_fee,
            merkle_root_index: ctx
                .accounts
                .verifier_state
                .merkle_root_index
                .try_into()
                .unwrap(),
            pool_type: &[0u8; 32],
            checked_public_inputs: &[],
            verifyingkey: &VERIFYINGKEY,
        };
        let mut tx = Transaction::<0, 1, 10, 17, LightInstructionSecond<'info, 0>>::new(input);
        tx.transact()
    }

    /// Close the verifier state to reclaim rent in case the proofdata is wrong and does not verify.
    pub fn close_verifier_state<'info>(
        _ctx: Context<'_, '_, '_, 'info, CloseVerifierState<'info, 0>>,
    ) -> Result<()> {
        Ok(())
    }
}

/// Send and stores data.
#[derive(Accounts)]
pub struct LightInstructionFirst<'info, const NR_CHECKED_INPUTS: usize> {
    /// First transaction, therefore the signing address is not checked but saved to be checked in future instructions.
    #[account(mut)]
    pub signing_address: Signer<'info>,
    pub system_program: Program<'info, System>,
    #[account(
        init,
        seeds = [
            &signing_address.key().to_bytes(),
            VERIFIER_STATE_SEED
        ],
        bump,
        space = 3000 /*8 + 32 * 6 + 10 * 32 + 2 * 32 + 512 + 16 + 128*/,
        payer = signing_address
    )]
    pub verifier_state: Account<'info, VerifierState10Ins<NR_CHECKED_INPUTS, TransactionConfig>>,
}

#[derive(Debug)]
#[account]
pub struct InstructionDataShieldedTransferFirst {
    public_amount_spl: [u8; 32],
    input_nullifier: [[u8; 32]; 10],
    output_commitment: [[u8; 32]; 2],
    public_amount_sol: [u8; 32],
    root_index: u64,
    relayer_fee: u64,
    encrypted_utxos: Vec<u8>,
}

/// Executes light transaction with state created in the first instruction.
#[light_verifier_accounts(
    sol,
    spl,
    signing_address=verifier_state.signer
)]
#[derive(Accounts)]
pub struct LightInstructionSecond<'info, const NR_CHECKED_INPUTS: usize> {
    #[account(
        mut,
        seeds = [
            &signing_address.key().to_bytes(),
            VERIFIER_STATE_SEED
        ],
        bump,
        close=signing_address
    )]
    pub verifier_state: Account<'info, VerifierState10Ins<NR_CHECKED_INPUTS, TransactionConfig>>,
}

#[derive(Debug)]
#[account]
pub struct InstructionDataShieldedTransferSecond {
    proof_a: [u8; 64],
    proof_b: [u8; 128],
    proof_c: [u8; 64],
}

#[derive(Accounts)]
pub struct CloseVerifierState<'info, const NR_CHECKED_INPUTS: usize> {
    #[account(mut, address=verifier_state.signer)]
    pub signing_address: Signer<'info>,
    #[account(mut, seeds = [&signing_address.key().to_bytes(), VERIFIER_STATE_SEED], bump, close=signing_address )]
    pub verifier_state: Account<'info, VerifierState10Ins<NR_CHECKED_INPUTS, TransactionConfig>>,
}
