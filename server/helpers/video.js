/**
 * Shared video helpers
 */

/**
 * Strip pokkit_url from video and replace with stream_url
 */
export function toPublicVideo(video) {
  const { pokkit_url, ...rest } = video
  return {
    ...rest,
    stream_url: `/api/v1/stream/${video.id}`,
  }
}
