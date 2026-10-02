import 'server-only';

const GEOCODING_URL = 'https://api.mapbox.com/search/geocode/v6/forward';
const ALLOWED_COUNTRIES = ['us', 'ca'];

// Geocode a property location with Mapbox Geocoding v6 (structured input).
// Uses temporary geocoding, so the result must not be cached or stored.
// Returns { lat, lng } or null if the address can't be resolved reliably.
export async function geocodeAddress(location) {
  const token = process.env.MAPBOX_GEOCODING_TOKEN;

  if (!token) {
    console.error('MAPBOX_GEOCODING_TOKEN is not set');
    return null;
  }

  // Map schema fields to structured input params, skipping empty values
  const fields = {
    address_line1: location?.street,
    place: location?.city,
    region: location?.state,
    postcode: location?.zipcode,
  };

  const params = new URLSearchParams({
    autocomplete: 'false',
    limit: '1',
    access_token: token,
  });

  for (const [key, value] of Object.entries(fields)) {
    if (value && value.trim()) params.set(key, value.trim());
  }

  // `country` is intentionally not sent: in structured input it accepts a
  // single code only, and a hard filter returns a wrong match instead of none.
  // Countries are checked on the response instead.

  try {
    const res = await fetch(`${GEOCODING_URL}?${params}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      console.error(`Mapbox geocoding failed with status ${res.status}`);
      return null;
    }

    const data = await res.json();
    const feature = data.features?.[0];

    if (!feature) return null;

    const countryCode =
      feature.properties.context?.country?.country_code?.toLowerCase();

    if (!ALLOWED_COUNTRIES.includes(countryCode)) return null;

    // match_code is only present on address features
    if (feature.properties.match_code?.confidence === 'low') return null;

    const [lng, lat] = feature.geometry.coordinates;

    return { lat, lng };
  } catch (err) {
    console.error('Mapbox geocoding error:', err);
    return null;
  }
}
