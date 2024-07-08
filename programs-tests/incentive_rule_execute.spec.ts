import { expect, assert } from "chai";
import { BN } from "bn.js";
import * as anchor from "@coral-xyz/anchor";

import { bootstrap } from "./utils/bootstrap";
import {
  MockRuleExample1,
  findMockRulePDAs,
} from "./__mocks__/mock_rule_example_1";

describe("incentive", () => {
  // Bootstrap the test
  const { incentive, admin, confirm, provider, generateUsers } = bootstrap();

  const users: anchor.web3.Keypair[] = [];

  const { mockRuleName, mockRulePDA, mockRewardStatePDA } = findMockRulePDAs({
    name: "timed_rule_v2",
    admin: admin.payer.publicKey,
    programId: incentive.programId,
  });

  before(async () => {
    const generated = await generateUsers({ count: 1 });
    users.push(...generated.users);
    expect(users.length).to.equal(1);
  });

  describe("timed rule execute", () => {
    before(async () => {
      const createSignature = await incentive.methods
        .createRewardRule(mockRuleName)
        .signers([admin.payer])
        .rpc()
        .then(confirm);

      expect(createSignature, "Mock rule creation").to.exist;

      const updateSignature = await incentive.methods
        .updateRewardRule(MockRuleExample1.mockRuleValues)
        .accountsPartial({
          rule: mockRulePDA,
        })
        .signers([admin.payer])
        .rpc()
        .then(confirm);
      expect(updateSignature, "Mock rule update").to.exist;
    });

    it("can start a rule w/ points multiplier", async () => {
      const signature = await incentive.methods
        .startReward({
          depositAmount: MockRuleExample1.mockDepositAmount,
        })
        .accountsPartial({
          rule: mockRulePDA,
        })
        .signers([admin.payer])
        .rpc()
        .then(confirm);

      expect(signature).to.exist;

      // Fetch the latest block time
      const clock = await provider.connection.getSlot();
      const state = await incentive.account.ruleTimedState.fetch(
        mockRewardStatePDA
      );

      expect(state.lastDepositSlot.toNumber()).to.equal(clock);
      expect(state.lastDepositAmount.toNumber()).to.equal(
        MockRuleExample1.mockDepositAmount.toNumber()
      );
      expect(state.points.toNumber()).to.equal(
        MockRuleExample1.mockDepositAmount
          .mul(MockRuleExample1.mockRuleValues.pointsMultiplier)
          .toNumber()
      );
    });

    it("can end a rule w/ penalty multiplier", async () => {
      const diff = MockRuleExample1.mockDepositAmount.sub(
        MockRuleExample1.mockWithdrawAmount
      );
      const remainingPoints = diff.mul(
        MockRuleExample1.mockRuleValues.penaltyMultiplier
      );

      const signature = await incentive.methods
        .stopReward({
          withdrawAmount: MockRuleExample1.mockWithdrawAmount,
        })
        .accountsPartial({
          rewardState: mockRewardStatePDA,
          rule: mockRulePDA,
        })
        .signers([admin.payer])
        .rpc()
        .then(confirm);

      expect(signature).to.exist;

      const state = await incentive.account.ruleTimedState.fetch(
        mockRewardStatePDA
      );
      expect(state.lastDepositAmount.toNumber()).to.equal(
        MockRuleExample1.mockDepositAmount.toNumber()
      );
      expect(state.lastWithdrawAmount.toNumber()).to.equal(
        MockRuleExample1.mockWithdrawAmount.toNumber()
      );
      expect(state.points.toNumber()).to.equal(remainingPoints.toNumber());
    });
  });

  describe("errors", async () => {
    it("can throw minimum amount unmet error", async () => {
      const user = users.at(0);
      const { mockRewardStatePDA: userRewardStatePDA } = findMockRulePDAs({
        name: mockRuleName,
        user: user.publicKey,
        admin: admin.payer.publicKey,
        programId: incentive.programId,
      });
      try {
        await incentive.methods
          .startReward({
            depositAmount: new BN(0),
          })
          .accountsPartial({
            user: user.publicKey,
            rewardState: userRewardStatePDA,
            rule: mockRulePDA,
          })
          .signers([user])
          .rpc()
          .then(confirm);
        assert.fail("Expected an error be thrown");
      } catch (error) {
        expect(error).to.be.an.instanceOf(anchor.AnchorError);
        expect((error as anchor.AnchorError).error.errorMessage).to.be.equal(
          "Minimum amount required is not met"
        );
      }
    });
  });
});
