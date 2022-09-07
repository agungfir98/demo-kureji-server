export const isAdmin = (eventResult, userId) => {
  const array = eventResult.map((v) => {
    return v.id;
  });
  return array.includes(userId);
};

export const checkHasVote = (data, userId) => {
  return data.filter((v) => {
    if (v.voter.id === userId) return v;
  })[0].hasVoted;
};
