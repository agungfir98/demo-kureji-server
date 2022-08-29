export const isAdmin = (eventResult, userId) => {
  return eventResult.toString() === userId;
};

export const checkHasVote = (data, userId) => {
  return data.filter((v) => {
    if (v.voter.id === userId) return v;
  })[0].hasVoted;
};
