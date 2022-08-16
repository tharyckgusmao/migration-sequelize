export const getDateFile = () => {
  const dd = new Date();
  return `${dd.getFullYear()}_${dd.getMonth()}_${dd.getDate()}_${dd.getHours()}_${dd.getMinutes()}`;
};
