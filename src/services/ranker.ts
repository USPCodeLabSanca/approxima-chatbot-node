
export const rank = (
  myInterests: string[], otherUsersIdInterests: { [userId: number]: string[] }, log = false
) => {

  if (Object.keys(otherUsersIdInterests).length === 0) {
    return;
  }

  const scores = Object.keys(otherUsersIdInterests).map(() => ({ id: 0, score: 0 }));

  let i = 0;
  for (const userId of Object.keys(otherUsersIdInterests)) {
    const theirInterests = otherUsersIdInterests[+userId];
    let theirScore = 0;

    // For each of my interest, if the other user has it too, +1 score
    myInterests.forEach(myInterest => {
      if (theirInterests.includes(myInterest)) {
        theirScore++;
      }
    });

    scores[i++] = {
      id: +userId,
      score: theirScore
    };
  }

  if (log) {
    console.log('\nPositional scores:\n', scores);
  }

  // sort by score in decreasing order
  const ranking = scores.sort((scoreA, scoreB) => scoreB.score - scoreA.score);

  if (ranking[0].score === 0) {
    // O maior score que o usuario conseguiu foi 0...
    return;
  }

  const mostSimilarUser = ranking[0].id;

  if (log) {
    console.log('\nRanking:\n', ranking);
    // Most Similar User interests
    const msuInterests = otherUsersIdInterests[mostSimilarUser];
    console.log(`\nMost similar: (userId: ${mostSimilarUser}, interests: ${msuInterests})`);
  }

  return mostSimilarUser;

};
