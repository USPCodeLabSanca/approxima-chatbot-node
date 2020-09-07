import { rank } from '../services/ranker';

export const execute = () => {
  console.log('===== TESTE RANK =====');

  const myInterests = ['0', '1', '3', '6,2', '7,3'];

  const usersInterests = {
    1111: ['0', '5', '6,0', '7,2'], // 3rd tier(score 1)
    2222: ['3', '6,1', '6,2'], // 2nd tier(score 2)
    3333: ['5', '7,3'], // 3rd tier(score 1)
    4444: ['3', '4', '7,3', '7,4'], // 2nd tier(score 2)
    5555: ['0', '1', '4', '7,4', '6,1'], // 2nd tier(score 2)
    6666: ['1', '2', '6,2', '7,3'], // 1st tier(score 3)
    7777: ['1', '2', '3', '4', '6,3'], // 2nd tier(score 2)
    8888: ['2', '5'], // 4th tier(score 0)
  };

  console.log(rank(myInterests, usersInterests, true));
};

execute();
