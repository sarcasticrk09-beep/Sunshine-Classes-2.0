/**
 * Client service for fetching live Google Maps Place Reviews for Sunshine Classes
 * via our CORS-safe server-side Places API (New) proxy (/api/google-maps/reviews).
 */

export const SUNSHINE_GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/GFnMMNa9S2F5Vw7A6';

export interface GoogleMapsPlaceReview {
  id: string;
  authorName: string;
  authorUri: string;
  authorPhotoUri?: string;
  rating: number;
  text: string;
  relativePublishTimeDescription: string;
  publishTime?: string;
  googleMapsUri: string;
}

export interface GoogleMapsReviewsResponse {
  configured: boolean;
  source: 'google_maps';
  placeId?: string;
  displayName?: string;
  formattedAddress?: string;
  rating?: number | null;
  userRatingCount?: number | null;
  googleMapsUrl: string;
  reviewsUri?: string;
  writeAReviewUri?: string;
  reviews: GoogleMapsPlaceReview[];
  quotaExceeded?: boolean;
  unavailable?: boolean;
}

export async function fetchSunshineGoogleMapsReviews(
  signal?: AbortSignal
): Promise<GoogleMapsReviewsResponse> {
  const fallback: GoogleMapsReviewsResponse = {
    configured: false,
    source: 'google_maps',
    googleMapsUrl: SUNSHINE_GOOGLE_MAPS_URL,
    reviewsUri: SUNSHINE_GOOGLE_MAPS_URL,
    writeAReviewUri: SUNSHINE_GOOGLE_MAPS_URL,
    reviews: []
  };

  try {
    const res = await fetch('/api/google-maps/reviews', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal
    });

    const data = (await res.json().catch(() => ({}))) as Partial<GoogleMapsReviewsResponse> & {
      error?: { status?: string } | string;
    };

    const errorObjStatus =
      typeof data.error === 'object' && data.error !== null ? data.error.status : undefined;

    if (res.status === 429 || data.quotaExceeded || errorObjStatus === 'RESOURCE_EXHAUSTED') {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
      }
      return {
        ...fallback,
        configured: true,
        quotaExceeded: true
      };
    }

    if (!res.ok) {
      return fallback;
    }

    return {
      configured: Boolean(data.configured),
      source: 'google_maps',
      placeId: data.placeId,
      displayName: data.displayName,
      formattedAddress: data.formattedAddress,
      rating: typeof data.rating === 'number' ? data.rating : null,
      userRatingCount: typeof data.userRatingCount === 'number' ? data.userRatingCount : null,
      googleMapsUrl: data.googleMapsUrl || SUNSHINE_GOOGLE_MAPS_URL,
      reviewsUri: data.reviewsUri || data.googleMapsUrl || SUNSHINE_GOOGLE_MAPS_URL,
      writeAReviewUri: data.writeAReviewUri || data.googleMapsUrl || SUNSHINE_GOOGLE_MAPS_URL,
      reviews: Array.isArray(data.reviews) ? data.reviews : [],
      unavailable: Boolean(data.unavailable)
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return fallback;
    }
    return fallback;
  }
}
