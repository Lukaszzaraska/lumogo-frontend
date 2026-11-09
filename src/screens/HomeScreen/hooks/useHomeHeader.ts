import { homeHeaderMock } from '../../../mocks/home';
import { useSession } from '../../../session/SessionContext';
import type { HomeHeaderData } from '../../../types/home';

type UseHomeHeaderResult = {
  data: HomeHeaderData;
  isLoading: boolean;
  error: Error | null;
};

/**
 * Imię z zalogowanej sesji. Lokalizacja nadal z makiety: backend zwraca tylko
 * współrzędne, bez nazwy miasta. Bez sesji (skrót "Continue with Google") makieta.
 */
export function useHomeHeader(): UseHomeHeaderResult {
  const { user } = useSession();

  return {
    data: {
      ...homeHeaderMock,
      user: { ...homeHeaderMock.user, firstName: user?.firstName ?? homeHeaderMock.user.firstName },
    },
    isLoading: false,
    error: null,
  };
}
