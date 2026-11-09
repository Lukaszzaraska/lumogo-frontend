import { useApproxLocation } from '../../../location/approxLocation';
import { useSession } from '../../../session/SessionContext';
import type { HomeHeaderData } from '../../../types/home';

type UseHomeHeaderResult = {
  data: HomeHeaderData;
  isLoading: boolean;
  error: Error | null;
};

export function useHomeHeader(): UseHomeHeaderResult {
  const { user } = useSession();
  const location = useApproxLocation();

  return {
    data: {
      user: { firstName: user?.firstName ?? '', avatarUrl: null, initials: null },
      location: { city: location?.city ?? '', region: location?.region ?? '' },
    },
    isLoading: location === null,
    error: null,
  };
}
