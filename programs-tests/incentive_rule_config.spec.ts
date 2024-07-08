import { expect } from "chai";
import {
  MockRuleExample1,
  findMockRulePDAs,
} from "./__mocks__/mock_rule_example_1";
import { bootstrap } from "./utils/bootstrap";

describe("incentive", () => {
  // Bootstrap the test
  const { incentive, admin, confirm } = bootstrap();

  const { mockRuleName, mockRulePDA } = findMockRulePDAs({
    admin: admin.payer.publicKey,
    programId: incentive.programId
  });

  describe("timed rule config", () => {
    before(async () => {
      const createSignature = await incentive.methods
        .createRewardRule(mockRuleName)
        .signers([admin.payer])
        .rpc()
        .then(confirm);

      expect(createSignature, "Mock rule creation").to.exist;
    });

    it("can be created with default values", async () => {
      const rules = await incentive.account.rewardRuleTimed.all();
      const rule = rules[0];
      expect(rule).to.exist;
      expect(rule.account.name).to.equal(mockRuleName);
      expect(rule.account.minimumAmount.toNumber()).to.equal(0);
      expect(rule.account.minimumDuration.toNumber()).to.equal(0);
      expect(rule.account.pointsMultiplier.toNumber()).to.equal(0);
      expect(rule.account.penaltyMultiplier.toNumber()).to.equal(0);
    });

    it("can update", async () => {
      const signature = await incentive.methods
        .updateRewardRule(MockRuleExample1.mockRuleValues)
        .accountsPartial({
          rule: mockRulePDA,
        })
        .signers([admin.payer])
        .rpc()
        .then(confirm);
      expect(signature).to.exist;

      const events = await incentive.account.rewardRuleTimed.all();
      const event = events.find((e) => e.account.name === mockRuleName);
      expect(event.account.name).to.equal(mockRuleName);
      expect(event.account.minimumAmount.toNumber()).to.equal(
        MockRuleExample1.mockRuleValues.minimumAmount.toNumber()
      );
      expect(event.account.minimumDuration.toNumber()).to.equal(
        MockRuleExample1.mockRuleValues.minimumDuration.toNumber()
      );
      expect(event.account.pointsMultiplier.toNumber()).to.equal(
        MockRuleExample1.mockRuleValues.pointsMultiplier.toNumber()
      );
      expect(event.account.penaltyMultiplier.toNumber()).to.equal(
        MockRuleExample1.mockRuleValues.penaltyMultiplier.toNumber()
      );
    });
  });
});
