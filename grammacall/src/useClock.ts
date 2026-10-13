import { useEffect, useState } from 'react';

const DAYS = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];
const MONTHS = [
  'januari', 'februari', 'mars', 'april', 'maj', 'juni',
  'juli', 'augusti', 'september', 'oktober', 'november', 'december',
];

// Formatted by hand: Swedish output must not depend on the phone's locale.
function format(now: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
    date: `${DAYS[now.getDay()]} ${now.getDate()} ${MONTHS[now.getMonth()]}`,
  };
}

export function useClock() {
  const [value, setValue] = useState(() => format(new Date()));

  useEffect(() => {
    const id = setInterval(() => setValue(format(new Date())), 10_000);
    return () => clearInterval(id);
  }, []);

  return value;
}
