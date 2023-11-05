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

    mapping(address => euint8) public registered_players;
    address[] public registeredPlayersAddresses;
    euint8[] public roles;
    uint256 public registered_count = 0;

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
        require(registered_count < total_players, "Game is full");

        registeredPlayersAddresses.push(msg.sender);
        registered_count++;
        console.log("player %s registered, count is %d", msg.sender, registered_count);

        //shuffle
        _shuffleRoles();

        if (registered_count == total_players) {
            console.log("assigning roles");
            for (uint8 i = 0; i < total_players; i++) {
                registered_players[registeredPlayersAddresses[i]] = shuffled_roles[i];
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
        return TFHE.reencrypt(registered_players[msg.sender], publicKey, 10);
    }

    function wolves_night(address vote) public returns (address) {
        kill[vote] = TFHE.add(kill[vote], TFHE.cmux(TFHE.eq(registered_players[msg.sender], ROLE_WOLF), TFHE.asEuint(1), TFHE.asEuint(0)))
        return vote; // Placeholder
    }

    struct SorcererAction {
        address kill;
        bool save;
    }

    function sorcerer_night(SorcererAction memory actions) public returns (address, address) {
        TFHE.optReq(TFHE.eq(registered_players[msg.sender], ROLE_SORCERER));

        // TODO: Implement logic to handle the sorcerer's actions
        return (actions.kill, actions.save ? actions.kill : address(0)); // Placeholder
    }

    function get_sorcerer_potions() public view returns (bool, bool) {
        TFHE.optReq(TFHE.eq(registered_players[msg.sender], ROLE_SORCERER));

        // Placeholder values; in a real contract, you'd track the actual potion counts
        bool hasKillPotion = true;
        bool hasSavePotion = true;

        return (hasKillPotion, hasSavePotion);
    }

    function daily_debate(address vote) public returns (address) {
        require(TFHE.decrypt(TFHE.eq(registered_players[msg.sender], ROLE_NONE)), "Only registered players can vote");

        // TODO: Implement voting logic
        return vote; // Placeholder
    }
}
