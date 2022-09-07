export const isAdmin = (eventResult, userId) => {
  return eventResult.filter((v) => {
    return v._id === userId;
  });
};

export const checkHasVote = (data, userId) => {
  return data.filter((v) => {
    if (v.voter.id === userId) return v;
  })[0].hasVoted;
};
