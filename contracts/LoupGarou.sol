// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.19;

import "fhevm/abstracts/EIP712WithModifier.sol";
import "fhevm/lib/TFHE.sol";
import "hardhat/console.sol";

contract LoupGarou {
    uint8 public constant total_players = 4;

    // Using integers instead of enum for roles
    euint8 ROLE_NONE;
    euint8 ROLE_WOLF;
    euint8 ROLE_VILLAGER;
    euint8 ROLE_SORCERER;

    // shuffled roles
    euint8[total_players] shuffled_roles;

    mapping(address => uint8) public playersIds;
    mapping(uint8 => address) public playerAddresses;
    mapping(uint8 => euint8) private wolvesVoteCount;
    mapping(uint8 => uint8) private dailyVoteCount;
    address[] public registeredPlayers;
    euint8[] private roles;
    uint256 public registeredCount = 0;
    uint8 private wolvesVoteCounter = 0;
    uint8 private dailyVoteCounter = 0;
    uint8 public killedPerson;

    // Note: The IPFS link for villagers chat is just a placeholder in this example
    string public villagers_chat = "ipfs://sample_link_here";

    mapping(euint8 => uint256) public roles_ratio;

    function setGameEnv(bytes calldata wolfCT, bytes calldata villagerCT, bytes calldata sorcererCT) public {
        ROLE_WOLF = TFHE.asEuint8(wolfCT);
        ROLE_VILLAGER = TFHE.asEuint8(villagerCT);
        ROLE_SORCERER = TFHE.asEuint8(sorcererCT);

        roles.push(ROLE_WOLF);
        roles.push(ROLE_VILLAGER);
        roles.push(ROLE_SORCERER);

        roles_ratio[ROLE_WOLF] = 1;
        roles_ratio[ROLE_VILLAGER] = 2;
        roles_ratio[ROLE_SORCERER] = 1;

        prepareRolesAssignment();

        console.log("game env set");
    }

    function registerForGame() public {
        require(registeredCount < total_players, "Game is full");

        registeredPlayers.push(msg.sender);
        registeredCount++;
        console.log("player %s registered, count is %d", msg.sender, registeredCount);

        //shuffle
        _shuffleRoles();

        if (registeredCount == total_players) {
            console.log("assigning roles");
            for (uint8 i = 0; i < total_players; i++) {
                playersIds[registeredPlayers[i]] = i;
                playerAddresses[i] = registeredPlayers[i];
            }
        }
    }

    function prepareRolesAssignment() private {
        uint8 c = 0;
        euint8 current_role;
        // create an array of roles: [W, H, H, S]
        for (uint8 i = 0; i < roles.length; i++) {
            current_role = roles[i];
            for (uint8 j = 0; j < roles_ratio[current_role]; j++) {
                shuffled_roles[c] = current_role;
                c += 1;
            }
        }
    }

    function _shuffleRoles() private {
        // shuffle the array
        euint8 tar;
        euint8 rand;
        ebool tmpBool;

        // get a random encrypted integer in range(total_players)
        rand = TFHE.rem(TFHE.randEuint8(), total_players);
        for (uint8 j = 0; j < total_players; j++) {
            // choose the position to be shuffled
            tmpBool = TFHE.eq(rand, TFHE.asEuint8(j));
            tar = TFHE.cmux(tmpBool, TFHE.xor(shuffled_roles[0], shuffled_roles[j]), TFHE.asEuint8(0));

            // swap places between the first element and the chosen random element
            shuffled_roles[j] = TFHE.xor(shuffled_roles[j], tar);
            shuffled_roles[0] = TFHE.xor(shuffled_roles[0], tar);
        }
    }

    function getRole(bytes32 publicKey, bytes calldata signature) public view returns (bytes memory) {
        return TFHE.reencrypt(shuffled_roles[playersIds[msg.sender]], publicKey, 0);
    }

    function gotKilled() public view returns (address) {
        return playerAddresses[killedPerson];
    }

    // TODO: check for the case of two persons having same number of votes
    function wolvesNight(bytes calldata _vote) public {
        euint8 tmpVote = TFHE.asEuint8(_vote);
        ebool isWolf = TFHE.eq(shuffled_roles[playersIds[msg.sender]], ROLE_WOLF);
        ebool notSuicide = TFHE.ne(tmpVote, playersIds[msg.sender]);
        euint8 vote = TFHE.cmux(isWolf, tmpVote, TFHE.asEuint8(total_players));
        euint8 tmpKilled;
        uint8 id;

        wolvesVoteCounter += 1;

        for (uint8 i = 0; i < registeredPlayers.length; i++) {
            id = playersIds[registeredPlayers[i]];
            wolvesVoteCount[id] = TFHE.add(
                wolvesVoteCount[id],
                TFHE.cmux(TFHE.eq(vote, id), TFHE.asEuint8(1), TFHE.asEuint8(0))
            );
        }

        if (wolvesVoteCounter == registeredPlayers.length) {
            id = get_max();
            killedPerson = id;
            pop_dead_person(killedPerson);
            wolvesVoteCounter = 0;
        }
    }

    function pop_dead_person(uint8 _killedPerson) internal {
        address tmpAddress;
        // remove dead person from players
        for (uint8 i = 0; i < registeredPlayers.length; i++) {
            if (playersIds[registeredPlayers[i]] == _killedPerson) {
                tmpAddress = registeredPlayers[registeredPlayers.length - 1];
                registeredPlayers[registeredPlayers.length - 1] = registeredPlayers[i];
                registeredPlayers[i] = tmpAddress;
                break;
            }
        }

        registeredPlayers.pop();
    }

    function get_max() internal returns (uint8) {
        euint8 max = wolvesVoteCount[playersIds[registeredPlayers[0]]];
        euint8 max_id = TFHE.asEuint8(playersIds[registeredPlayers[0]]);
        uint8 id;

        // Iterate over the array, starting from the second element
        for (uint i = 1; i < registeredPlayers.length; i++) {
            id = playersIds[registeredPlayers[i]];
            // Update max if the current element is greater
            max = TFHE.max(max, wolvesVoteCount[id]);
            max_id = TFHE.cmux(TFHE.eq(max, wolvesVoteCount[id]), TFHE.asEuint8(id), max_id);
        }

        // reset the count mapping for the next round
        for (uint i = 0; i < registeredPlayers.length; i++) {
            id = playersIds[registeredPlayers[i]];

            wolvesVoteCount[id] = TFHE.asEuint8(0);
        }

        // Return the maximum value
        return TFHE.decrypt(max_id);
    }

    function getRegisteredPlayers() public view returns (address[] memory) {
        return registeredPlayers;
    }

    struct SorcererAction {
        address kill;
        bool save;
    }

    function sorcerer_night(SorcererAction memory actions) public returns (address, address) {
        TFHE.optReq(TFHE.eq(playersIds[msg.sender], ROLE_SORCERER));

        // TODO: Implement logic to handle the sorcerer's actions
        return (actions.kill, actions.save ? actions.kill : address(0)); // Placeholder
    }

    function get_sorcerer_potions() public view returns (bool, bool) {
        TFHE.optReq(TFHE.eq(playersIds[msg.sender], ROLE_SORCERER));

        // Placeholder values; in a real contract, you'd track the actual potion counts
        bool hasKillPotion = true;
        bool hasSavePotion = true;

        return (hasKillPotion, hasSavePotion);
    }

    // TODO: the voter also sends an auto text when he votes from the UI, that way everyone knows the votes
    function dailyDebate(uint8 _vote) public {
        dailyVoteCount[_vote] += 1;
        dailyVoteCounter += 1;

        if (dailyVoteCounter == registeredPlayers.length) {
            killedPerson = indexOfMaxValue();
            pop_dead_person(killedPerson);
            dailyVoteCounter = 0;
        }
    }

    function indexOfMaxValue() public returns (uint8) {
        uint8 maxIndex = playersIds[registeredPlayers[0]];
        uint8 maxValue = dailyVoteCount[playersIds[registeredPlayers[0]]];
        uint8 id;

        for (uint8 i = 1; i < registeredPlayers.length; i++) {
            id = playersIds[registeredPlayers[i]];
            if (dailyVoteCount[id] > maxValue) {
                maxValue = dailyVoteCount[id];
                maxIndex = id;
            }
        }

        for (uint8 i = 1; i < registeredPlayers.length; i++) {
            id = playersIds[registeredPlayers[i]];
            dailyVoteCount[id] = 0;
        }

        return maxIndex;
    }
}
