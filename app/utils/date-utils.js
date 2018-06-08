export function calculateAgeFrom(birthday: Date) { // birthday is a date
  const ageDifMs = Date.now() - birthday.getTime();
  const ageDate = new Date(ageDifMs); // miliseconds from epoch
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export function ageWithTextPostfix(age: number, agePostfixes = ['год', 'года', 'лет']) { // склонение именительных рядом с числительным
  const cases = [2, 0, 1, 1, 1, 2];
  return `${age} ${agePostfixes[(age % 100 > 4 && age % 100 < 20) ? 2 : cases[(age % 10 < 5) ? age % 10 : 5]]}`;
}
