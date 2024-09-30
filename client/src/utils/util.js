export const formatWordsSpace = (name, limit) => {
  if (name.length > limit) {
    return name.substring(0, limit) + " ...";
  }

  return name;
};
