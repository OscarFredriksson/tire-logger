import { useEffect, useState } from 'react';

type UseFetch<T> = [boolean, T | undefined];

// TODO: reconsider this cache pattern
// const cache = {} as Record<string, any>;

// const getOrCreate = async <T>(name: string, dataFetcher: () => Promise<T>): Promise<T> => {
//   if (cache[name]) return cache[name];

//   const data = await dataFetcher();
//   cache[name] = data;
//   return data;
// };

export const useFetch = <T>(dataFetcher: () => Promise<T>): UseFetch<T> => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<T>();

  // console.log('cache', cache);

  useEffect(() => {
    dataFetcher().then((data) => {
      setData(data);
      setLoading(false);
    });
  }, [dataFetcher]);

  return [loading, data];
};
