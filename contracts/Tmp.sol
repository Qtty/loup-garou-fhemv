// function prepareRolesAssignment() private {
//         euint8 c = TFHE.asEuint8(0);
//         uint8 tmp_c = 0;
//         euint8 current_role;
//         // create an array of roles: [W, H, H, S]
//         for (uint8 i = 0; i < roles.length; i++) {
//             current_role = roles[i];
//             for (uint8 j = 0; j < roles_ratio[current_role]; j++) {
//                 shuffled_roles[c] = TFHE.add(TFHE.asEuint8(0), current_role);
//                 roles_indexes[tmp_c] = c;
//                 c = TFHE.add(TFHE.asEuint8(1), c);
//                 tmp_c += 1;
//             }
//         }
//     }

//    function _shuffleRoles() private returns (uint8) {
//        // shuffle the array
//        euint8 tar;
//        euint8 rand;
//        euint8 tmp;
//        euint8 swappedA;
//        euint8 swappedB;
//        // get a random encrypted integer in range(total_players)
//        rand = TFHE.rem(TFHE.randEuint8(), total_players);
//        for (uint8 j = 0; j < total_players; j++) {
//            swappedA = roles_indexes[j];
//            swappedB = roles_indexes[(j + 1) % total_players];
//            // choose the position to be shuffled
//            tar = TFHE.cmux(TFHE.eq(rand, swappedA), swappedA, swappedB);
//            // swap places between the first element and the chosen random element
//            tmp = shuffled_roles[tar];
//            shuffled_roles[tar] = shuffled_roles[swappedB];
//            shuffled_roles[swappedB] = tmp;
//            // require(TFHE.decrypt(shuffled_roles[tar]) > 0, "shuffle tar");
//            // require(TFHE.decrypt(shuffled_roles[roles_indexes[0]]) > 0, "shuffle tar");
//        }
//
//        g_rand = TFHE.decrypt(rand);
//    }