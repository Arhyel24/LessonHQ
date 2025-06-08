import useSWR from "swr";
import axios from "axios";

const axiosFetcher = async (url: string) => {
  const response = await axios.get(url);
  return response.data;
};

/**
 * Generic Axios-based SWR hook
 * @param url API route to fetch from
 */
export default function useFetcher<T = unknown>(url: string) {
  const { data, error, isLoading, mutate } = useSWR<T>(url, axiosFetcher);

  return {
    data,
    error,
    isLoading,
    isError: !!error,
    mutate,
  };
}
