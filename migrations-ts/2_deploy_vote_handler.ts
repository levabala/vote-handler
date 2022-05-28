const VoteHandle = artifacts.require("VoteHandler");

const migration: Truffle.Migration = function (deployer) {
  deployer.deploy(VoteHandle);
};

module.exports = migration;

export {};
