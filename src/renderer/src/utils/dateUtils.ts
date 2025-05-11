import dayjs from 'dayjs';

export const formatDate = (date: Date): string =>
  dayjs(date).calendar(null, {
    sameDay: '[Today at] HH:mm',
    lastDay: '[Yesterday at] HH:mm',
    lastWeek: 'dddd [at] HH:mm',
    sameElse: 'MMM D, YYYY [at] HH:mm'
  });
