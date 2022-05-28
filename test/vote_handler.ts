import { rejects as assertRejects } from "assert";
import { VoteHandlerInstance } from "../types/truffle-contracts";

const VoteHandler = artifacts.require("VoteHandler");

contract("VoteHandler", function () {
  let instance: VoteHandlerInstance;

  beforeEach(async () => {
    instance = await VoteHandler.new();
  });

  it("should be deployed without errors", async function () {
    await VoteHandler.deployed();
  });

  describe("with no polls", () => {
    it("should start a poll without errors", async function () {
      await instance.startPoll("test", ["A", "B"]);
    });

    it("should throw an error if resume", async function () {
      await assertRejects(() => instance.resumePoll());
    });

    it("should throw an error if pause", async function () {
      await assertRejects(() => instance.pausePoll());
    });

    it("should not accept vote", async function () {
      await assertRejects(() => instance.vote("A"));
    });

    it("should fails to return stats", async function () {
      await assertRejects(() => instance.getStats("test"));
    });

    it("should fails get options", async function () {
      await assertRejects(() => instance.getCurrentOptions());
    });
  });

  describe("with one active poll", () => {
    beforeEach(async () => {
      await instance.startPoll("test", ["A", "B", "C"]);
    });

    it("should have the same options as passed", async () => {
      assert.deepEqual(await instance.getCurrentOptions(), ["A", "B", "C"]);
    });

    it("should not allow to start new poll", async () => {
      await assertRejects(() => instance.startPoll("test2", ["A", "B"]));
    });

    it("should start new poll if active is paused", async () => {
      await instance.pausePoll();
      await instance.startPoll("test2", ["A", "B", "C", "D"]);
    });

    it("should be active", async () => {
      assert.isTrue(await instance.isPollActive());
    });

    it("should pause and resume the poll", async () => {
      await instance.pausePoll();
      assert.isFalse(await instance.isPollActive());

      await instance.resumePoll();
      assert.isTrue(await instance.isPollActive());
    });

    it("should not accept vote for the missing option", async function () {
      await assertRejects(() => instance.vote("D"));
    });

    it("should accept vote", async function () {
      await instance.vote("A");
    });

    it("should return current poll name", async () => {
      assert.equal(await instance.getCurrentPollName(), "test");
    });

    it("should throw an error if stats requested for non-existing poll", async () => {
      await assertRejects(() => instance.getStats("test2"));
    });

    it("should return correct stats", async function () {
      await instance.vote("A");
      await instance.vote("A");
      await instance.vote("B");

      const { "0": options, "1": votes } = await instance.getStats("test");

      assert.deepEqual(options, ["A", "B", "C"]);
      assert.deepEqual(votes, [2, 1, 0].map(web3.utils.toBN));
    });
  });

  describe("with completed poll and active one", () => {
    beforeEach(async () => {
      await instance.startPoll("test", ["A", "B", "C"]);

      await instance.vote("A");
      await instance.vote("A");
      await instance.vote("B");

      await instance.pausePoll();

      await instance.startPoll("test2", ["A", "B", "C", "D"]);
    });

    it("should be able to access old stats", async () => {
      // access first poll's stats
      const { "0": options, "1": votes } = await instance.getStats("test");

      assert.deepEqual(options, ["A", "B", "C"]);
      assert.deepEqual(votes, [2, 1, 0].map(web3.utils.toBN));
    });

    it("should be able to access new stats", async () => {
      // second poll actions
      await instance.vote("B");
      await instance.vote("B");
      await instance.vote("D");

      // access first poll's stats
      const { "0": options, "1": votes } = await instance.getStats("test2");

      assert.deepEqual(options, ["A", "B", "C", "D"]);
      assert.deepEqual(votes, [0, 2, 0, 1].map(web3.utils.toBN));
    });
  });
});
