import { PublicKey } from "@solana/web3.js";

export function findRewardRuleTimedPDAs(inputs: {
  name: string;
  admin: PublicKey;
  programId: PublicKey;
}) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("rule_timed"),
      inputs.admin.toBuffer(),
      Buffer.from(inputs.name),
    ],
    inputs.programId
  );
}

export function findRewardStatePDAs(inputs: {
  user: PublicKey;
  rule: PublicKey;
  programId: PublicKey;
}) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("rule_timed_state"),
      inputs.rule.toBuffer(),
      inputs.user.toBuffer(),
    ],
    inputs.programId
  );
}
