const Migrations = artifacts.require("Migrations");

const migration: Truffle.Migration = function (deployer) {
  deployer.deploy(Migrations);
};

module.exports = migration;

export {};
