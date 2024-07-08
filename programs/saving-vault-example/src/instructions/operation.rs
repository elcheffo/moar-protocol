use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer},
};
use incentive::{
    cpi::{accounts::StartRewardRule, start_reward},
    program::Incentive,
    states::RewardRuleTimed,
    StartRewardRuleArgs,
};

use crate::VaultState;

#[derive(Accounts)]
pub struct VaultUserOperation<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        seeds = [
            b"vault_state",
            vault_state.admin.key().as_ref(),
            vault_state.name.as_bytes().as_ref(),
        ],
        bump = vault_state.state_bump,
    )]
    pub vault_state: Account<'info, VaultState>,
    #[account(
        mut,
        seeds = [
            b"vault",
            vault_state.key().as_ref(),
        ],
        bump = vault_state.vault_bump,
    )]
    pub vault: SystemAccount<'info>,

    pub system_program: Program<'info, System>,

    // Incentive program integration
    pub rule: Account<'info, RewardRuleTimed>,

    #[account(mut)]
    /// CHECK: Stuff
    pub reward_state: UncheckedAccount<'info>,

    pub incentive_program: Program<'info, Incentive>,
}

impl<'info> VaultUserOperation<'info> {
    pub fn deposit(&mut self, amount: u64) -> Result<()> {
        // Transfer the amount from the user to the vault.
        transfer(
            CpiContext::new(
                self.system_program.to_account_info(),
                Transfer {
                    from: self.payer.to_account_info(),
                    to: self.vault.to_account_info(),
                },
            ),
            amount,
        )?;
        // Start measuring the reward.
        start_reward(
            CpiContext::new(
                self.incentive_program.to_account_info(),
                StartRewardRule {
                    user: self.payer.to_account_info(),
                    rule: self.rule.to_account_info(),
                    reward_state: self.reward_state.to_account_info(),
                    system_program: self.system_program.to_account_info(),
                },
            ),
            StartRewardRuleArgs {
                deposit_amount: amount,
            },
        )?;
        Ok(())
    }

    pub fn withdraw(&mut self, amount: u64) -> Result<()> {
        // Transfer the amount from the user to the vault.

        // Seeds used to derive Vault PDA. The seeds sign on behalf of the vault PDA
        let seeds = &[
            b"vault",
            self.vault_state.to_account_info().key.as_ref(),
            &[self.vault_state.vault_bump],
        ];

        let signer_seeds = &[&seeds[..]];

        transfer(
            CpiContext::new_with_signer(
                self.system_program.to_account_info(),
                Transfer {
                    from: self.vault.to_account_info(),
                    to: self.payer.to_account_info(),
                },
                signer_seeds,
            ),
            amount,
        )?;
        Ok(())
    }
}

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct VaultUserOperationArgs {
    pub amount: u64,
}
