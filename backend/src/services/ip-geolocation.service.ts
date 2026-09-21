export interface SessionLocation {
  city: string | null;
  region: string | null;
  country: string | null;
}

const EMPTY_LOCATION: SessionLocation = {
  city: null,
  region: null,
  country: null,
};

const COUNTRY_API_TIMEOUT_MS = 3000;

export const getSessionLocation = async (
  ipAddress: string,
): Promise<SessionLocation> => {
  if (!ipAddress) {
    return { ...EMPTY_LOCATION };
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    COUNTRY_API_TIMEOUT_MS,
  );

  try {
    const response = await fetch(
      `https://api.country.is/${encodeURIComponent(ipAddress)}?fields=city,subdivision`,
      { signal: controller.signal },
    );

    console.log(response)

    if (!response.ok) {
      return { ...EMPTY_LOCATION };
    }

    const data = (await response.json()) as {
      city?: unknown;
      subdivision?: unknown;
      country?: unknown;
    };

    if (
      typeof data.city !== "string" ||
      !data.city.trim() ||
      typeof data.subdivision !== "string" ||
      !data.subdivision.trim() ||
      typeof data.country !== "string" ||
      !data.country.trim()
    ) {
      return { ...EMPTY_LOCATION };
    }

    return {
      city: data.city.trim(),
      region: data.subdivision.trim(),
      country: data.country.trim(),
    };
  } catch {
    return { ...EMPTY_LOCATION };
  } finally {
    clearTimeout(timeout);
  }
};
