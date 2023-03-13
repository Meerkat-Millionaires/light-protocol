use std::str::FromStr;

use anchor_lang::{
    prelude::*,
    solana_program::{instruction::Instruction, program::invoke},
};
use light_verifier_sdk::light_transaction::VERIFIER_STATE_SEED;

declare_id!("DJpbogMSrK94E1zvvJydtkqoE4sknuzmMRoutd6B7TKj");

pub const NOOP_PROGRAM_ID: &str = "noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV";

/// Size of the transaction message (per one method call).
pub const MSG_PER_CALL_SIZE: usize = 1024;
/// Initial size of the verifier state account (message + discriminator).
pub const VERIFIER_STATE_INITIAL_SIZE: usize = MSG_PER_CALL_SIZE + 8;
/// Maximum size of the transaction message to which we can reallocate.
pub const MSG_MAX_SIZE: usize = 2048;
/// Maximum size of the verifier state account to which we can reallocate
/// (message + discriminator).
pub const VERIFIER_STATE_MAX_SIZE: usize = MSG_MAX_SIZE + 8;

#[error_code]
pub enum VerifierError {
    #[msg("The provided program is not the noop program.")]
    NoopProgram,
    #[msg("Message too large, the limit per one method call is 1024 bytes.")]
    MsgTooLarge,
    #[msg("Cannot allocate more space for the verifier state account (message too large).")]
    VerifierStateNoSpace,
}

pub fn wrap_event<'info>(
    msg: Vec<u8>,
    noop_program: &AccountInfo<'info>,
    signer: &AccountInfo<'info>,
) -> Result<()> {
    if noop_program.key() != Pubkey::from_str(NOOP_PROGRAM_ID).unwrap() {
        return Err(VerifierError::NoopProgram.into());
    }
    let instruction = Instruction {
        program_id: noop_program.key(),
        accounts: vec![],
        data: msg,
    };
    invoke(
        &instruction,
        &[noop_program.to_account_info(), signer.to_account_info()],
    )?;
    Ok(())
}

#[program]
pub mod verifier_program_storage {
    use super::*;

    /// Saves the provided message in a temporary PDA.
    pub fn shielded_transfer_first<'info>(
        ctx: Context<LightInstructionFirst<'info>>,
        msg: Vec<u8>,
    ) -> Result<()> {
        if msg.len() > MSG_PER_CALL_SIZE {
            return Err(VerifierError::MsgTooLarge.into());
        }
        let state = &mut ctx.accounts.verifier_state;

        // Reallocate space if needed.
        let cur_acc_size = state.to_account_info().data_len();
        let new_needed_size = state.msg.len() + msg.len() + 8;
        if new_needed_size > cur_acc_size {
            let new_acc_size = cur_acc_size + MSG_PER_CALL_SIZE;
            if new_acc_size > VERIFIER_STATE_MAX_SIZE {
                return Err(VerifierError::VerifierStateNoSpace.into());
            }
            state.to_account_info().realloc(new_acc_size, false)?;
            state.reload()?;
        }

        state.msg.extend_from_slice(&msg);

        Ok(())
    }

    /// Close the temporary PDA. Should be used when we don't intend to perform
    /// the second transfer and want to reclaim the funds.
    pub fn shielded_transfer_close<'info>(
        _ctx: Context<LightInstructionClose<'info>>,
    ) -> Result<()> {
        Ok(())
    }

    /// Stores the provided message in a compressed account, closes the
    /// temporary PDA.
    pub fn shielded_transfer_second<'info>(
        ctx: Context<LightInstructionSecond<'info>>,
    ) -> Result<()> {
        let state = &mut ctx.accounts.verifier_state;

        wrap_event(
            state.msg.clone(),
            &ctx.accounts.log_wrapper,
            &ctx.accounts.signing_address,
        )?;

        Ok(())
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

#[derive(Accounts)]
pub struct LightInstructionClose<'info> {
    #[account(mut)]
    pub signing_address: Signer<'info>,
    #[account(mut, close=signing_address)]
    pub verifier_state: Account<'info, VerifierState>,
}

#[derive(Accounts)]
pub struct LightInstructionSecond<'info> {
    #[account(mut)]
    pub signing_address: Signer<'info>,
    pub system_program: Program<'info, System>,
    #[account(
        mut,
        seeds = [&signing_address.key().to_bytes(), VERIFIER_STATE_SEED],
        bump,
        close=signing_address
    )]
    pub verifier_state: Account<'info, VerifierState>,
    /// CHECK: Checking manually in the `wrap_event` function.
    pub log_wrapper: UncheckedAccount<'info>,
}