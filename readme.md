# Incentive Capstone project

- Incentive program
- Saving vault example program

## Incentives program

Incentives are created and managed by Incentives program

### Creating Incentive

As an admin I should be able to create an incentive with the following fields

- name
- minimum_lamports
- points_multiplier
- minimum_duration
- penalty_multiplier


## Saving vaults

A saving vault is a shared multiple users can deposit into and withdraw out of.

**Use LP tokens to represent the % user deposited into the vault**

```
Think how do we track the event for incentives

- CPI
  - Calling the incentive program via CPI with specific struct
- Instructions
  - Interacting with program using composable instructions
  - [Introspection](https://medium.com/@LeoOnSol/unleashing-the-power-of-instruction-chaining-with-instruction-introspection-f47ca8f5eab6) 
```

### Creating Vaults

As an admin, I should be able to create new Vaults

### Depositing into vault

As a user I should be able to deposit into the Vault.

**Mint LP tokens based on the proportion of the deposit amount compare to the amount in vault**

Accounts:
Rule (Time based reward rule)
Reward state

A "incentive" program where I can:
- Create a unique rule (time based)
- PDA seed is derived from: rule name and rule admin pubkey
- Configure / Update rule (e.g its point / penalty multiplier, minimum duration etc)
- Start a rule
- Edit reward state (derived from user's pubkey and rule pda)
- Track deposit details and calculate points based on rule points multiplier field
- Stop a rule
- Update reward state
- Track withdraw details and calculate points based on rule penalty multiplier field

Next steps 
- [x] Integrate into a saving vault example
- Claim rewards as tokens
- Improve contraints
- Investigate introspection
- Investigate token extension hook integration

### UI concepts

- [Idea 1](https://www.devdifferent.io/#contact)
- [Magic UI](https://magicui.design/docs/components/cool-mode)
- [Responsive UI](https://github.com/redpangilinan/credenza)
- [Dynamic island](https://www.cult-ui.com/docs/components/dynamic-island)