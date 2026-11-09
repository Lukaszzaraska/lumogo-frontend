import { useEffect, useState } from 'react';
import { getTodayConditions } from '../../../api/conditions';
import { homeConditionsMock } from '../../../mocks/home';
import type { HomeConditionsData } from '../../../types/home';

type UseHomeConditionsResult = {
  data: HomeConditionsData;
  isLoading: boolean;
  error: Error | null;
};

/**
 * Bieżące warunki z backendu (na razie dla domyślnej lokalizacji: Warszawa).
 * Do czasu odpowiedzi i przy błędzie karta pokazuje dane z makiety, żeby ekran
 * nie był pusty; `error` pozwala to później zasygnalizować w UI.
 */
export function useHomeConditions(): UseHomeConditionsResult {
  const [data, setData] = useState<HomeConditionsData>(homeConditionsMock);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;

    getTodayConditions()
      .then((conditions) => {
        if (active) setData(conditions);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason : new Error(String(reason)));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { data, isLoading, error };
}
