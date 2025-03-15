import { useEffect, useState } from 'react';

type UseFetch<T> = [boolean, T | undefined];

export const useFetch = <T>(dataFetcher: () => Promise<T>): UseFetch<T> => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<T>();

  useEffect(() => {
    dataFetcher().then((tires) => {
      setData(tires);
      setTimeout(() => setLoading(false), 1000);
    });
  }, [dataFetcher]);

  return [loading, data];
};
