use anchor_lang::prelude::*;
use light_macros::light_verifier_accounts;
use light_verifier_sdk::light_transaction::{
    Amounts, Message, Proof, Transaction, TransactionInput, VERIFIER_STATE_SEED,
};

use merkle_tree_program::program::MerkleTreeProgram;

pub mod verifying_key;
use verifying_key::VERIFYINGKEY;

declare_id!("DJpbogMSrK94E1zvvJydtkqoE4sknuzmMRoutd6B7TKj");

#[constant]
pub const PROGRAM_ID: &str = "DJpbogMSrK94E1zvvJydtkqoE4sknuzmMRoutd6B7TKj";

/// Size of the transaction message (per one method call).
pub const MESSAGE_PER_CALL_SIZE: usize = 1024;
/// Initial size of the verifier state account (message + discriminator).
pub const VERIFIER_STATE_INITIAL_SIZE: usize = MESSAGE_PER_CALL_SIZE + 8;
/// Maximum size of the transaction message to which we can reallocate.
pub const MESSAGE_MAX_SIZE: usize = 2048;
/// Maximum size of the verifier state account to which we can reallocate
/// (message + discriminator).
pub const VERIFIER_STATE_MAX_SIZE: usize = MESSAGE_MAX_SIZE + 8;

/// Size of the encrypted UTXOs array (including padding).
pub const ENCRYPTED_UTXOS_SIZE: usize = 256;

#[error_code]
pub enum VerifierError {
    #[msg("The provided program is not the noop program.")]
    NoopProgram,
    #[msg("Message too large, the limit per one method call is 1024 bytes.")]
    MessageTooLarge,
    #[msg("Cannot allocate more space for the verifier state account (message too large).")]
    VerifierStateNoSpace,
}

#[program]
pub mod verifier_program_storage {

    use super::*;

    /// Saves the provided message in a temporary PDA.
    pub fn shielded_transfer_first(
        ctx: Context<LightInstructionFirst<'_>>,
        inputs: Vec<u8>,
    ) -> Result<()> {
        let inputs: InstructionDataShieldedTransferFirst =
            InstructionDataShieldedTransferFirst::try_deserialize_unchecked(
                &mut [vec![0u8; 8], inputs].concat().as_slice(),
            )?;
        let message = inputs.message;
        if message.len() > MESSAGE_PER_CALL_SIZE {
            return Err(VerifierError::MessageTooLarge.into());
        }
        let state = &mut ctx.accounts.verifier_state;

        // Reallocate space if needed.
        let cur_acc_size = state.to_account_info().data_len();
        let new_needed_size = state.msg.len() + message.len() + 8;
        if new_needed_size > cur_acc_size {
            let new_acc_size = cur_acc_size + MESSAGE_PER_CALL_SIZE;
            if new_acc_size > VERIFIER_STATE_MAX_SIZE {
                return Err(VerifierError::VerifierStateNoSpace.into());
            }
            state.to_account_info().realloc(new_acc_size, false)?;
            state.reload()?;
        }

        state.msg.extend_from_slice(&message);

        Ok(())
    }

    /// Close the temporary PDA. Should be used when we don't intend to perform
    /// the second transfer and want to reclaim the funds.
    pub fn shielded_transfer_close(_ctx: Context<LightInstructionClose<'_>>) -> Result<()> {
        Ok(())
    }

    /// Stores the provided message in a compressed account, closes the
    /// temporary PDA.
    pub fn shielded_transfer_second<'info>(
        ctx: Context<'_, '_, '_, 'info, LightInstructionSecond<'info>>,
        inputs: Vec<u8>,
    ) -> Result<()> {
        let inputs: InstructionDataShieldedTransferSecond =
            InstructionDataShieldedTransferSecond::try_deserialize_unchecked(
                &mut [vec![0u8; 8], inputs, vec![0u8; 16]].concat().as_slice(),
            )?;
        let message = Message::new(&ctx.accounts.verifier_state.msg);
        let proof = Proof {
            a: inputs.proof_a,
            b: inputs.proof_b,
            c: inputs.proof_c,
        };
        let public_amount = Amounts {
            sol: inputs.public_amount_sol,
            spl: [0u8; 32], // Verifier storage does not support SPL tokens.
        };

        let input = TransactionInput {
            ctx: &ctx,
            message: Some(&message),
            proof: &proof,
            public_amount: &public_amount,
            nullifiers: &inputs.input_nullifier,
            leaves: &[inputs.output_commitment; 1],
            encrypted_utxos: &inputs.encrypted_utxos.to_vec(),
            merkle_root_index: inputs.root_index as usize,
            relayer_fee: inputs.relayer_fee,
            checked_public_inputs: &[],
            pool_type: &[0u8; 32],
            verifyingkey: &VERIFYINGKEY,
        };
        let mut transaction = Transaction::<0, 1, 2, 9, LightInstructionSecond<'info>>::new(input);

        transaction.transact()
    }
}

#[account]
pub struct VerifierState {
    pub msg: Vec<u8>,
}

#[derive(Accounts)]
pub struct LightInstructionFirst<'info> {
    #[account(mut)]
    pub signing_address: Signer<'info>,
    pub system_program: Program<'info, System>,
    #[account(
        init_if_needed,
        seeds = [&signing_address.key().to_bytes(), VERIFIER_STATE_SEED],
        bump,
        space = VERIFIER_STATE_INITIAL_SIZE,
        payer = signing_address
    )]
    pub verifier_state: Account<'info, VerifierState>,
}

#[derive(Debug)]
#[account]
pub struct InstructionDataShieldedTransferFirst {
    message: Vec<u8>,
}

#[derive(Accounts)]
pub struct LightInstructionClose<'info> {
    #[account(mut)]
    pub signing_address: Signer<'info>,
    #[account(mut, close=signing_address)]
    pub verifier_state: Account<'info, VerifierState>,
}

#[light_verifier_accounts(sol)]
#[derive(Accounts)]
pub struct LightInstructionSecond<'info> {
    #[account(
        mut,
        seeds = [&signing_address.key().to_bytes(), VERIFIER_STATE_SEED],
        bump,
        close=signing_address
    )]
    pub verifier_state: Account<'info, VerifierState>,
}

#[derive(Debug)]
#[account]
pub struct InstructionDataShieldedTransferSecond {
    proof_a: [u8; 64],
    proof_b: [u8; 128],
    proof_c: [u8; 64],
    input_nullifier: [[u8; 32]; 2],
    output_commitment: [[u8; 32]; 2],
    public_amount_sol: [u8; 32],
    root_index: u64,
    relayer_fee: u64,
    encrypted_utxos: [u8; 256],
}
