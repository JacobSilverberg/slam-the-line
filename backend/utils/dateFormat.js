export default function dateFormat(unformatted_date) {
  const interim_date = new Date(unformatted_date);
  if (isNaN(interim_date.getTime())) {
    throw new Error(`Invalid date value: ${unformatted_date}`);
  }
  return interim_date.toISOString().slice(0, 19).replace('T', ' ');
}
