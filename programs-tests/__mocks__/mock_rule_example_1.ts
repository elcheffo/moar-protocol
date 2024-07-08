import * as anchor from "@coral-xyz/anchor";
import PDAUtils from "../utils/pda-utils";

export const MockRuleExample1 = {
  mockRuleValues: {
    minimumAmount: new anchor.BN(111),
    minimumDuration: new anchor.BN(222),
    pointsMultiplier: new anchor.BN(3),
    penaltyMultiplier: new anchor.BN(3),
  },
  mockDepositAmount: new anchor.BN(120),
  mockWithdrawAmount: new anchor.BN(100),
};

export const findMockRulePDAs = (inputs: {
  name?: string;
  user?: anchor.web3.PublicKey;
  admin: anchor.web3.PublicKey;
  programId: anchor.web3.PublicKey;
}) => {
  // Rule name
  const mockRuleName = inputs.name ?? "random_timed_rule";
  const user = inputs.user ?? inputs.admin;

  // Rule PDA (derived from rule name)
  const [mockRulePDA] = PDAUtils.findRewardRuleTimedPDAs({
    name: mockRuleName,
    admin: inputs.admin,
    programId: inputs.programId,
  });

    // Rule state PDA (derived from rule and user)
    const [mockRewardStatePDA] = PDAUtils.findRewardStatePDAs({
      user,
      rule: mockRulePDA,
      programId: inputs.programId,
    });

  return {
    mockRuleName,
    mockRulePDA,
    mockRewardStatePDA,
  };
};
