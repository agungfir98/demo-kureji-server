export const isAdmin = (eventResult, userId) => {
  return eventResult.toString() === userId;
};
