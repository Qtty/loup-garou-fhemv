# Werewolf Game Backend Documentation

## Introduction

This repository showcases the backend implementation for the Werewolf Game, a project submitted as part of the Zama Bug
Bounty Program under the theme of FHEVM (Fully Homomorphic Ethereum Virtual Machine). The game is a blockchain
adaptation of the classic social deduction game Werewolf, where players are assigned secret roles with distinct
objectives.

### Challenge in Decentralized Implementation

The primary challenge in adapting Werewolf to a decentralized blockchain environment lies in preserving the secrecy and
integrity of players' roles and actions. Traditional blockchain solutions fall short in this aspect due to the inherent
transparency of transaction records and contract states. However, the integration of Zama's FHEVM provides a unique
solution to these challenges.

### Leveraging Zama FHEVM

Our solution exploits the Fully Homomorphic Encryption capabilities offered by Zama, enabling computations on encrypted
data without the need for decryption. This approach is pivotal for our game for several reasons:

- **Encrypted Role Assignment**: Utilizing Zama's PRNG, we assign random roles to players in an encrypted format. This
  ensures that the roles remain secret throughout the game, inaccessible to other players and the smart contract itself.
- **Secrecy in Actions**: Players' actions, such as voting, are conducted in an encrypted manner. This retains the
  crucial element of mystery and strategy inherent in the Werewolf game.

- **Encrypted Random Integers**: Zama's PRNG is used to generate encrypted random integers, crucial for random role
  assignments and other game mechanics where randomness is key.

### Ensuring Privacy and Fair Play

The use of encrypted states (roles, actions, random integers) provided by Zama's FHEVM is a game-changer. It guarantees
that these sensitive pieces of information are not retrievable by other players or the smart contract, maintaining
fairness and privacy. This technology enables us to implement a game that was previously thought impossible in a
decentralized environment, opening new horizons for secure and private decentralized applications.

For more insights into how these concepts are practically applied, please see the [Game Logic](#game-logic) section.

## Key Features

The Werewolf Game, empowered by Zama's FHEVM, introduces groundbreaking features in the realm of decentralized
applications:

1. **Encrypted Game Mechanics with FHEVM**: Utilizing Fully Homomorphic Encryption, the game secures players' roles and
   actions. This encryption is vital for preserving the game's strategic elements, ensuring that sensitive information
   remains confidential and inaccessible even to the smart contract.

2. **Random Role Assignment with Privacy**: Zama's PRNG is employed for assigning random roles to players in an
   encrypted format. This approach ensures unbiased and unpredictable gameplay while maintaining the secrecy of each
   player's role.

3. **Balancing Transparency with Confidentiality**: The game exemplifies how blockchain's transparency and
   decentralization can be harmoniously combined with privacy and confidentiality. By operating on encrypted states, the
   game demonstrates the feasibility of secure and private interactions on a public blockchain.

4. **Pioneering FHE in Decentralized Gaming**: This implementation illustrates the potential of FHE in enhancing privacy
   and security in decentralized applications.

These features collectively highlight the innovative potential of FHE in reconciling the transparent nature of
blockchain with the need for privacy and confidentiality in gaming and other decentralized applications.

## Installation

### Steps

1. **Clone the Repository**: Start by cloning the repository to your local machine.
   ```bash
   git clone https://github.com/Qtty/loup-garou-fhemv.git
   ```
2. **Install Dependencies**: Navigate to the cloned directory and install the required dependencies.
   ```bash
   pnpm install
   ```
3. Deploy the contract: <deploy>

For instructions on setting up the frontend, which includes details on how to interact with the game through a user
interface, please refer to the following link: [Frontend Documentation](https://github.com/Qtty/loup-garou-frontend)

## Tests

To ensure the integrity of our game logic, comprehensive tests have been written. Follow these steps to run the tests:

1. Start a local Fhevm docker container:
   ```bash
   pnpm fhevm:start
   ```
2. Get some coins for the accounts:
   ```bash
   pnpm fhevm:faucet
   ```
3. Run the test suite:
   ```bash
   pnpm test
   ```

If you want to run the test on Zama devnet, run: npx hardhat test --network zama If you want to see the gas consumption,
add `REPORT_GAS=true`:

```bash
REPORT_GAS=true pnpm test
```

## Game Logic

### Overview of the Game

The Werewolf Game is a blockchain-based adaptation of the classic social deduction game. In this game, players are
assigned secret roles, each with unique goals and abilities. The game unfolds in alternating phases of night and day,
where players perform specific actions based on their roles. The objective is to eliminate the opposing team, with
villagers trying to identify and eliminate werewolves, and werewolves aiming to eliminate villagers without being
caught.

### Components of the Game

#### Roles

- **Werewolf**: A player with this role aims to eliminate villagers without revealing their identity.
- **Villager**: Regular players who try to figure out who the werewolves are and eliminate them.
- **Sorcerer**: A special role with unique abilities, adding complexity to the game.

#### Phases

Each phase of the Werewolf Game plays a pivotal role in its progression, and is backed by specific functions in the
`LoupGarou.sol` smart contract. Here is an overview of each phase, along with the associated functions:

1. **Contract Creation Phase**:

   - _Function_: `setGameEnv`
   - This initial phase involves creating the smart contract for the game. The contract creator uses the `setGameEnv`
     function to set up the game environment, which includes initializing encrypted roles and other necessary game
     parameters.

2. **Registration Phase**:

   - _Function_: `registerForGame`
   - Players register for the game during this phase. The `registerForGame` function is used to add players to the game
     until the maximum number of players is reached.

3. **Role Assignment Phase**:

   - _Functions_: `prepareRolesAssignment`, `_shuffleRoles`
   - After registration, roles are assigned to each player. The `prepareRolesAssignment` function gets the roles ready
     for distribution, while `_shuffleRoles` ensures these roles are randomly distributed, maintaining fairness and
     unpredictability.

4. **Night Phase**:

   - _Functions_: `wolvesNight`, `pop_dead_person`
   - In this phase, werewolves choose a player to eliminate. `wolvesNight` enables this process, `pop_dead_person`
     removes the eliminated player.

5. **Village Debate Phase**:

   - _Functions_: `gotKilled`, `dailyDebate`
   - During the Village Debate, players discover who was killed by the wolves (using `gotKilled`) and discuss to form
     suspicions. No voting occurs in this phase.

6. **Village Vote Phase**:

   - _Functions_: `dailyDebate`, `indexOfMaxValue`, `gotKilled`
   - This phase involves the actual voting process where players vote on who they suspect to be a werewolf.
     `dailyDebate` handles the voting, while `indexOfMaxValue` determines the player with the majority of votes. the
     players can then discover who was killed by using `gotKilled`.

7. **Endgame Check**:
   - _Functions_: Embedded within `dailyDebate`
   - Following each elimination, the game checks if the end conditions have been met. This check is integrated within
     the `dailyDebate` function, determining if the game concludes or continues.

These phases, along with their corresponding functions, orchestrate the flow of the game, ensuring that each player
action is accurately processed and reflected in the game's ongoing state.

#### Goals

- **For Villagers**: Identify and eliminate all the werewolves to win the game.
- **For Werewolves**: Eliminate enough villagers so that their numbers are equal to or greater than the number of
  villagers remaining.

### Function Explanation

Below is a detailed technical analysis of each function in the `LoupGarou.sol` smart contract:

1. **setGameEnv(bytes calldata wolfCT, bytes calldata villagerCT, bytes calldata sorcererCT)**

   - _Purpose_: Initializes the game environment.
   - _Inputs_: `wolfCT` (encrypted ciphertext for werewolf), `villagerCT` (encrypted ciphertext for villager),
     `sorcererCT` (encrypted ciphertext for sorcerer).
   - _Outputs_: None (state-changing function).
   - _Logic_: Each role (wolf, villager, sorcerer) is initialized using TFHE to encrypt their respective values, thus
     ensuring confidentiality in role assignments.

2. **registerForGame()**

   - _Purpose_: Registers a player for the game.
   - _Inputs_: None (implicit input: `msg.sender`, the address of the player calling the function).
   - _Outputs_: None (state-changing function).
   - _Logic_: Adds the player's address to the `registeredPlayers` array. Once the required number of players is
     reached, triggers role shuffling by calling `_shuffleRoles`.

3. **getPlayersLeftToRegister()**

   - _Purpose_: Provides the number of players still needed.
   - _Inputs_: None.
   - _Outputs_: `uint256` (the number of players left to register).
   - _Logic_: Subtracts the length of `registeredPlayers` from `total_players` and returns the result.

4. **prepareRolesAssignment()**

   - _Purpose_: Prepares roles for assignment.
   - _Inputs_: None (internal function).
   - _Outputs_: None (state-changing function).
   - _Logic_: Fills the `shuffled_roles` array based on the roles ratio, ensuring a balanced distribution of roles.

5. **\_shuffleRoles()**

   - _Purpose_: Shuffles roles securely.
   - _Inputs_: None (internal function).
   - _Outputs_: None (state-changing function).
   - _Logic_: Uses Zama's TFHE-based PRNG to generate encrypted random integers, which are then used to shuffle the
     `shuffled_roles` array. This maintains unpredictability and fairness in role distribution.

6. **getRole(bytes32 publicKey, bytes calldata signature)**

   - _Purpose_: Retrieves a player's encrypted role.
   - _Inputs_: `publicKey` (player's public key), `signature` (signature for verification).
   - _Outputs_: `bytes` (re-encrypted role data).
   - _Logic_: Re-encrypts the player's role using their public key and the TFHE library, ensuring that only the player
     can decrypt and discover their role.

7. **gotKilled()**

   - _Purpose_: Informs who was eliminated in the last phase.
   - _Inputs_: None.
   - _Outputs_: `address` (address of the eliminated player).
   - _Logic_: Returns the address corresponding to `killedPerson`, which is updated after each elimination.

8. **wolvesNight(bytes calldata \_vote)**

   - _Purpose_: Manages the werewolves' voting process.
   - _Inputs_: `_vote` (encrypted vote from a werewolf).
   - _Outputs_: None (state-changing function).
   - _Logic_: Werewolf votes are aggregated using TFHE operations. The function checks if each voter is a werewolf and
     tallies the votes, ultimately determining the player to be eliminated.

9. **pop_dead_person(uint8 \_killedPerson)**

   - _Purpose_: Removes an eliminated player.
   - _Inputs_: `_killedPerson` (ID of the killed player).
   - _Outputs_: None (state-changing function).
   - _Logic_: Updates the `registeredPlayers` array to remove the player with the given ID.

10. **get_max()**

    - _Purpose_: Finds the player with the most votes.
    - _Inputs_: None (internal function).
    - _Outputs_: `uint8` (ID of the player with the most votes).
    - _Logic_: Iterates through the `wolvesVoteCount` mapping to find the player ID with the highest count. Uses TFHE
      decryption to compare encrypted vote counts.

11. **getRegisteredPlayers()**

    - _Purpose_: Lists registered players.
    - _Inputs_: None.
    - _Outputs_: `address[]` (array of player addresses).
    - _Logic_: Returns the `registeredPlayers` array.

12. **dailyDebate(uint8 \_vote)**

    - _Purpose_: Facilitates the daytime voting process.
    - _Inputs_: `_vote` (ID of the player being voted for).
    - _Outputs_: None (state-changing function).
    - _Logic_: Each player's vote is counted in `dailyVoteCount`. The function then checks if all players have voted and
      proceeds to determine the player with the most votes for elimination.

13. **indexOfMaxValue()**
    - _Purpose_: Identifies the player with the highest votes.
    - _Inputs_: None (internal function).
    - _Outputs_: `uint8` (ID of the player with the highest votes).
    - _Logic_: Searches through `dailyVoteCount` to find the player ID with the maximum vote count.

This structured approach provides a clear and comprehensive understanding of the game's logic, components, and
individual functions of the smart contract.

### In-Depth Explanation of TFHE Feature Implementations

The `LoupGarou.sol` smart contract leverages the Fully Homomorphic Encryption (FHE) capabilities of Zama's TFHE library
in several key functions. Here's an in-depth look at how these functions utilize TFHE:

#### `prepareRolesAssignment()`

##### Purpose

This function is designed to populate the `shuffled_roles` array with player roles based on pre-defined ratios. It
prepares the groundwork for assigning these roles to the players in the game.

##### Technical Breakdown

- **Initialization**:

  - `uint8 c = 0;`: Initializes a counter variable `c` to 0. This counter will be used to index into the
    `shuffled_roles` array.
  - `euint8 current_role;`: Declares a variable `current_role` of type `euint8` (presumably an encrypted uint8, suitable
    for TFHE operations).

- **Role Assignment Loop**:

  - The function enters a for-loop: `for (uint8 i = 0; i < roles.length; i++)`. This loop iterates over the `roles`
    array, which contains the different roles available in the game (like Werewolf, Villager, Sorcerer).

  - Within this loop:

    - `current_role = roles[i];`: Assigns the current role from the `roles` array to the `current_role` variable.
    - Another for-loop is initiated: `for (uint8 j = 0; j < roles_ratio[current_role]; j++)`. This loop runs as many
      times as specified in the `roles_ratio` for the current role. The `roles_ratio` is a mapping that defines how many
      players should be assigned each role.

    - Inside the inner loop:
      - `shuffled_roles[c] = current_role;`: Assigns the current role to the `shuffled_roles` array at index `c`.
      - `c += 1;`: Increments the counter `c`, moving to the next index in the `shuffled_roles` array.

##### Logic Overview

- The `prepareRolesAssignment` function systematically fills the `shuffled_roles` array with roles according to the
  predefined ratio in `roles_ratio`.
- It ensures that each role is represented the correct number of times in the `shuffled_roles` array before any
  shuffling occurs.
- The outcome is a `shuffled_roles` array that has a sequence of roles ready for shuffling but is still in a predictable
  order following the initial setup.

#### `_shuffleRoles()`

##### Purpose

This function is responsible for shuffling the `shuffled_roles` array in a secure and encrypted manner. It ensures that
the assignment of roles to players is random and unpredictable.

##### Technical and Logical Breakdown

- **Initializations**:

  - `euint8 tar;`: Initializes a variable `tar` to hold the temporary value during the swap.
  - `euint8 rand;`: Declares `rand` for storing the encrypted random number.
  - `ebool tmpBool;`: A temporary boolean value for conditional operations.

- **Generating Encrypted Random Number**:

  - `rand = TFHE.rem(TFHE.randEuint8(), total_players);`: Generates an encrypted random integer `rand` within the range
    of `total_players`. This is achieved by taking a random encrypted uint8 and applying the modulo operation
    (`TFHE.rem()`) to limit its range.

- **Shuffling Loop**:

  - The loop `for (uint8 j = 0; j < total_players; j++)` iterates over each player position.

    - **Conditional Shuffle Logic**:

      - `tmpBool = TFHE.eq(rand, TFHE.asEuint8(j));`: Determines whether the randomly chosen position `rand` matches the
        current loop index `j`. The equality check is done in an encrypted form using `TFHE.eq()`.
      - `tar = TFHE.cmux(tmpBool, TFHE.xor(shuffled_roles[0], shuffled_roles[j]), TFHE.asEuint8(0));`: Uses the
        conditional multiplexer (`TFHE.cmux()`) to select an encrypted value. If `tmpBool` is true (indicating a match),
        it selects the XOR of the first role and the j-th role (`shuffled_roles[0]` and `shuffled_roles[j]`). If false,
        it selects an encrypted zero.

    - **Executing the Swap**:
      - `shuffled_roles[j] = TFHE.xor(shuffled_roles[j], tar);`: Swaps the role at index `j` with the role at the first
        position, if `rand` equals `j`.
      - `shuffled_roles[0] = TFHE.xor(shuffled_roles[0], tar);`: Completes the swap by changing the role at the first
        position.

##### Logic Overview

- The `_shuffleRoles` function uses encrypted random numbers and TFHE operations to shuffle the roles within
  `shuffled_roles`. The loop ensures that each position has a chance to be swapped with the first position.
- The use of TFHE's `xor`, `eq`, and `cmux` functions ensures that all operations on roles remain encrypted throughout
  the process, preserving the confidentiality and integrity of the role assignment.
- This shuffling method ensures that the final role distribution is random and secure, crucial for the unpredictability
  and fairness of the Werewolf game.

#### `getRole(bytes32 publicKey, bytes calldata signature)`

##### Purpose

This function allows players to retrieve their assigned role in an encrypted form. The role remains confidential and
secure as it is encrypted with the player's own public key.

##### Technical and Logical Breakdown

- **Inputs**:

  - `publicKey`: The public key of the player requesting their role. This key is used to re-encrypt the role data.
  - `signature`: A signature for verification purposes. (Note: In the current function, `signature` is not actively
    used, but it could serve as a mechanism for authenticating the request.)

- **Role Retrieval and Re-encryption**:

  - The function first retrieves the role assigned to the player who invoked the function (`msg.sender`). This is done
    by accessing `shuffled_roles[playersIds[msg.sender]]`, where `playersIds` maps player addresses to their
    corresponding IDs, and `shuffled_roles` holds the encrypted roles.

  - **Re-encryption Process**:
    - `return TFHE.reencrypt(shuffled_roles[playersIds[msg.sender]], publicKey, 0);`: This line re-encrypts the player's
      role with their public key. The `TFHE.reencrypt` function takes the original encrypted role, the player's public
      key, and an additional parameter which is the default value in case `shuffled_roles[playersIds[msg.sender]]`
      doesn't exist (set to 0 in this case).

##### Logic Overview

- The `getRole` function is pivotal for maintaining the privacy and confidentiality of each player's role. By
  re-encrypting the role with the player's public key, it ensures that only the specific player can decrypt and discover
  their role.
- This approach leverages the security features of TFHE, allowing for confidential data (player roles) to be transmitted
  and known only to the intended recipient, despite the public nature of blockchain transactions.
- The function's simplicity and direct use of `TFHE.reencrypt` highlight the efficiency of using FHE in blockchain
  applications where data privacy is crucial.

#### `wolvesNight(bytes calldata _vote)`

##### Purpose

This function facilitates the voting process during the night phase of the game, designed for both werewolves and
villagers. It ensures that all players (regardless of their roles) submit a transaction, thus preventing external
observers from deducing the roles based on transaction patterns.

##### Technical and Logical Breakdown

- **Vote Encryption and Verification**:

  - `euint8 tmpVote = TFHE.asEuint8(_vote);`: Converts the incoming vote to an encrypted uint8 format.
  - `ebool isWolf = TFHE.eq(shuffled_roles[playersIds[msg.sender]], ROLE_WOLF);`: Encrypted check to determine if the
    voting player is a werewolf.
  - `euint8 vote = TFHE.cmux(isWolf, tmpVote, TFHE.asEuint8(total_players));`: If the player is a werewolf, their vote
    is counted. Otherwise, a dummy vote (representing an invalid vote) is recorded.

- **Vote Aggregation**:

  - `wolvesVoteCounter += 1;`: Tracks the number of votes received.
  - Iterates over all registered players to tally votes: `for (uint8 i = 0; i < registeredPlayers.length; i++)`.
    - `id = playersIds[registeredPlayers[i]];`: Retrieves each player's ID.
    - `wolvesVoteCount[id] = TFHE.add(...)`: Increments the vote count for a player if they receive a vote, utilizing
      encrypted arithmetic to maintain vote confidentiality.

- **Completion of Voting and Action**:
  - Checks if all players have voted: `if (wolvesVoteCounter == registeredPlayers.length)`.
    - Finds the player with the most votes using `get_max()`.
    - `killedPerson = id;`: Updates the `killedPerson` variable.
    - `pop_dead_person(killedPerson);`: Removes the player with the most votes from the game.
    - Resets the `wolvesVoteCounter`.

##### Logic Overview

- The `wolvesNight` function is critical for the night phase, where werewolves choose a player to eliminate. However, to
  mask the werewolves' identities, all players—werewolves and villagers alike—are required to send a transaction.
- This strategy of having all players participate in the voting process (even if only werewolf votes are valid) adds a
  layer of anonymity, preventing the inference of roles based on transaction activity.
- The use of TFHE ensures that the voting process remains encrypted, preserving the game's integrity by keeping
  individual votes confidential. The conditional processing of votes based on the player's role (werewolf or not)
  further enhances the strategic depth of the game.

#### `get_max()`

##### Purpose

This function identifies the player with the maximum number of votes from the night phase voting. It is crucial for
determining which player, if any, is eliminated based on the votes.

##### Technical and Logical Breakdown

- **Initialization**:

  - `uint8 max_id = playersIds[registeredPlayers[0]];`: Initializes `max_id` with the ID of the first registered player.
    This serves as a starting point for comparing vote counts.

- **Iterating and Comparing Votes**:

  - The function iterates over all registered players, starting from the second player:
    `for (uint i = 1; i < registeredPlayers.length; i++)`.
    - `id = playersIds[registeredPlayers[i]];`: Retrieves the ID of the current player in the iteration.
    - **Vote Comparison**:
      - The comparison `TFHE.decrypt(TFHE.le(wolvesVoteCount[max_id], wolvesVoteCount[id]))` checks if the vote count
        for `max_id` is less than or equal to the vote count for `id`. This is done using TFHE's encrypted comparison
        functions (`TFHE.le`) and then decrypting the result.
      - If the condition is true, `max_id` is updated to `id`, indicating that the current player has more votes than
        the previous maximum.

- **Resetting Vote Counts**:

  - After determining the player with the most votes, the function resets the vote counts for the next round:
    - `for (uint i = 0; i < registeredPlayers.length; i++) { ... wolvesVoteCount[id] = TFHE.asEuint8(0); }`: This loop
      sets all players' vote counts to an encrypted zero using `TFHE.asEuint8(0)`.

- **Returning the Result**:
  - `return max_id;`: The function returns the ID of the player who received the maximum number of votes, effectively
    identifying the player to be eliminated.

##### Logic Overview

- `get_max` is essential for concluding the night phase by identifying the player with the most votes. The function
  intricately balances the need for accurate vote tallying with the confidentiality of the voting process.
- The function's use of TFHE functions for encrypted comparisons (`TFHE.le`) and subsequent decryption (`TFHE.decrypt`)
  is a critical aspect. Notably, the decryption of vote comparisons doesn't compromise the confidentiality of the game
  state. This is because the temporary states generated during the execution of a transaction in a smart contract are
  not preserved after the transaction completes. As a result, the decrypted values used for comparison within the
  `get_max` function are not exposed or stored on the blockchain, ensuring that the voting process remains confidential.
- By resetting vote counts at the end of the function, `get_max` prepares the system for the next voting round. This
  reset is crucial for maintaining the integrity and fairness of subsequent game phases, ensuring that each new voting
  round starts with a clean slate.

#### `dailyDebate(uint8 _vote)`

##### Purpose

This function manages the voting process during the day phase of the game. Each player casts a vote on who they suspect
to be a werewolf, and this function tallies those votes.

##### Technical and Logical Breakdown

- **Vote Tallying**:

  - `dailyVoteCount[_vote] += 1;`: Increments the vote count for the player ID that is being voted for. `_vote` is the
    ID of the player each participant suspects to be a werewolf.
  - `dailyVoteCounter += 1;`: Increments the counter for the total number of votes cast. This ensures that the function
    keeps track of how many players have voted.

- **Completion of Voting**:
  - `if (dailyVoteCounter == registeredPlayers.length) { ... }`: This check determines if all players have cast their
    votes. It compares the total vote count with the number of registered players.
- **Determining Elimination**:

  - `killedPerson = indexOfMaxValue();`: Calls the `indexOfMaxValue` function to find out which player received the most
    votes.
  - The subsequent condition checks if `killedPerson` is not an invalid ID (a case that might occur in the event of a
    tie or other specific game rules) before proceeding to eliminate the player.
  - `pop_dead_person(killedPerson);`: Removes the player who received the most votes from the game.

- **Resetting Vote Counts**:

  - After determining the player to be eliminated, the function resets the vote counts for the next day phase.
  - The for-loop iterates over all registered players, resetting their individual vote counts in `dailyVoteCount` to
    zero.

- **Counting Remaining Werewolves**:

  - This part of the function counts the number of werewolves still in the game, which is crucial for determining the
    game's progress and potentially triggering the endgame conditions.
  - It iterates over all players, checking if each one is a werewolf (`TFHE.eq`) and incrementing `wolves_count`
    accordingly.

- **Endgame Conditions**:
  - The function checks if the number of remaining werewolves is greater than or equal to half of the remaining players.
    If so, the werewolves win.
  - Similarly, it checks if there are no werewolves left, indicating a win for the villagers.
  - These conditions are evaluated using TFHE's encrypted operations, ensuring the confidentiality of players' roles.

##### Logic Overview

- `dailyDebate` is a critical function for the day phase, handling the core mechanics of voting and elimination. By
  tallying votes and determining which player is eliminated, it drives the game's progression.
- The use of encrypted operations for vote tallying and endgame condition checks ensures the integrity and
  confidentiality of the game's state. This approach aligns with the strategic nature of the Werewolf game, where player
  roles and choices need to remain hidden to maintain gameplay dynamics.

## How This is Impossible Without FHEVM of Zama

The `LoupGarou.sol` smart contract leverages the Fully Homomorphic Encryption (FHE) capabilities provided by Zama's TFHE
library, making certain features of our Werewolf game possible that would otherwise be impractical or insecure. Here's
how the TFHE from Zama plays a crucial role:

### Encrypted Role Assignment and Actions

- **Secure Role Assignment**: The roles of players (Werewolf, Villager, Sorcerer) are encrypted using FHE. This ensures
  that the role assignment is confidential and even the smart contract cannot see the roles, preventing any form of
  cheating or bias during the game.

- **Encrypted Voting and Actions**: Votes during the night (by werewolves) phase are encrypted. This ensures that no one
  can see who voted for whom, preserving the strategy and mystery integral to the Werewolf game. The use of TFHE in
  functions like `dailyDebate` and `wolvesNight` ensures that all vote counting and role checks remain confidential,
  further enhancing the game's integrity.

### Privacy and Fair Play

- **Player Anonymity**: Players' actions and roles are encrypted, preserving anonymity and fairness. The functions like
  `getRole` and `_shuffleRoles` utilize TFHE to maintain role secrecy and fair shuffling, ensuring that players cannot
  deduce each other's roles or manipulate the role assignment.

- **Confidential Game Progression**: The game's progression, including the tallying of votes and the determination of
  game outcomes, is handled through TFHE-encrypted operations. This approach, demonstrated in functions like `get_max`,
  keeps the game state confidential and secure from external observers and even the players themselves, until the
  results are intended to be revealed.

### Conclusion

This document provides a basic overview of the Werewolf Game's backend implementation, showcasing how the integration of
Zama's TFHE with smart contract technology enables a new realm of secure and private gaming experiences on blockchain
platforms. For more detailed information, please refer to the code comments within the `LoupGarou.sol` file.
