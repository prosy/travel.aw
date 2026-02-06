/**
 * Media types
 */
export type MediaType = 'image' | 'video' | 'document';

/**
 * Media source types
 */
export type MediaSource = 'wikimedia' | 'unsplash' | 'provider' | 'user' | 'placeholder';

/**
 * Media attribution information
 */
export interface MediaAttribution {
  author?: string | null;
  license?: string | null;
  licenseUrl?: string | null;
  sourceUrl?: string | null;
}

/**
 * Media dimensions
 */
export interface MediaDimensions {
  width: number;
  height: number;
}

/**
 * Media asset (image, video) with source tracking
 */
export interface Media {
  id: string;
  type: MediaType;
  source: MediaSource;
  url: string;
  thumbnailUrl?: string | null;
  title?: string | null;
  alt?: string | null;
  attribution?: MediaAttribution | null;
  dimensions?: MediaDimensions | null;
  mimeType?: string | null;
  cachedAt?: string | null;
}
