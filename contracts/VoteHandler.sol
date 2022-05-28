// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract VoteHandler {
  mapping(string => mapping(string => address[])) polls_votes;
  mapping(string => string[]) polls_options;
  mapping(string => bool) polls_names;

  mapping(string => bool) poll_current_options;
  string poll_current_name;
  bool poll_current_active = false;

  constructor() {}

  // internal
  function clearPollCurrentOptions() internal {
    uint256 options_length = polls_options[poll_current_name].length;

    for (uint256 i = 0; i < options_length; i++) {
      poll_current_options[polls_options[poll_current_name][i]] = false;
    }
  }

  function hasOption(string memory option) internal view returns (bool) {
    return poll_current_options[option];
  }

  function stringIsEmpty(string memory value) internal pure returns (bool) {
    return bytes(value).length == 0;
  }

  // external views
  function isPollActive() external view returns (bool) {
    return poll_current_active;
  }

  function getCurrentPollName() external view returns (string memory) {
    return poll_current_name;
  }

  function getStats(string calldata name)
    external
    view
    returns (string[] memory options, uint32[] memory votes)
  {
    require(!stringIsEmpty(poll_current_name), "No poll exists");
    require(polls_names[name], "No such poll exists");

    options = polls_options[name];
    votes = new uint32[](options.length);

    for (uint32 i = 0; i < options.length; i++) {
      // TODO: check if reading from storage directly is more efficient
      string memory option = options[i];
      votes[i] += uint32(polls_votes[name][option].length);
    }
  }

  // external payable
  function pausePoll() external payable {
    require(!stringIsEmpty(poll_current_name), "No active poll");

    poll_current_active = false;
  }

  function resumePoll() external payable {
    require(!stringIsEmpty(poll_current_name), "No active poll");

    poll_current_active = true;
  }

  function startPoll(string calldata name, string[] calldata options)
    external
    payable
  {
    require(poll_current_active == false, "There is an active poll");
    require(polls_names[name] == false, "There is already such poll");

    // clear old poll options so they not to interfere new options
    if (!stringIsEmpty(poll_current_name)) {
      clearPollCurrentOptions();
    }

    // TODO: check what is calldata type and why it can't copied to storage (because calldata relates to js memory in this case?)
    string[] memory options_ = options;

    poll_current_name = name;
    poll_current_active = true;
    polls_options[name] = options_;
    // TODO: write wrapper for bool mapping
    polls_names[name] = true;

    for (uint32 i = 0; i < options.length; i++) {
      poll_current_options[options[i]] = true;
    }
  }

  function vote(string calldata option) external payable {
    require(poll_current_active, "Poll is not opened now");
    require(hasOption(option), "No such option to vote for");

    polls_votes[poll_current_name][option].push(msg.sender);
  }

  function getCurrentOptions() external view returns (string[] memory) {
    require(!stringIsEmpty(poll_current_name), "No poll exists");

    return polls_options[poll_current_name];
  }
}
