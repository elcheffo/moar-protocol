use anchor_lang::{prelude::*, system_program::{transfer, Transfer}};

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateVault<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init,
        payer = admin,
        seeds = [
            b"vault_state",
            admin.key().as_ref(),
            name.as_bytes().as_ref(),
        ],
        bump,
        space = VaultState::INIT_SPACE,
    )]
    pub vault_state: Account<'info, VaultState>,
    #[account(
        mut,
        seeds = [b"vault", vault_state.key().as_ref()],
        bump,
    )]
    pub vault: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}

impl<'info> CreateVault<'info> {
    pub fn create_vault(&mut self, name: String, bumps: &CreateVaultBumps) -> Result<()> {
        self.vault_state.set_inner(VaultState {
            name,
            admin: *self.admin.key,
            state_bump: bumps.vault_state,
            vault_bump: bumps.vault,
        });
        
        // Transfer minimum balance to the vault.
        let rent_required = Rent::default().minimum_balance(0);
        transfer(CpiContext::new(
            self.system_program.to_account_info(),
            Transfer {
            from: self.admin.to_account_info(),
            to: self.vault.to_account_info(),
        }), rent_required)?;

        Ok(())
    }
}

#[account]
pub struct VaultState {
    pub name: String,
    pub admin: Pubkey,
    pub vault_bump: u8,
    pub state_bump: u8,
}

impl Space for VaultState {
    const INIT_SPACE: usize = 8 + 24 + 32 + 1 + 1;
}
