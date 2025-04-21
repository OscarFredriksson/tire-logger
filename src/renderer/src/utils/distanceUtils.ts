export const formatDistance = (distanceInMeters: number): string => {
  if (distanceInMeters >= 1000) {
    return `${(distanceInMeters / 1000).toFixed(1)} km`;
  }
  return `${distanceInMeters} m`;
};
