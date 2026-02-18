const EARTH_RADIUS_METERS = 6371000;

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function calculateSegmentDistanceMeters(pointA, pointB) {
  const lat1 = toRadians(pointA.lat);
  const lon1 = toRadians(pointA.lon);
  const lat2 = toRadians(pointB.lat);
  const lon2 = toRadians(pointB.lon);

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const sinHalfDLat = Math.sin(dLat / 2);
  const sinHalfDLon = Math.sin(dLon / 2);

  const a =
    sinHalfDLat * sinHalfDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinHalfDLon * sinHalfDLon;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

export function calculateTrackStats(points) {
  if (!Array.isArray(points) || points.length < 2) {
    return {
      distanceMeters: 0,
      distanceMiles: 0,
      totalAscentMeters: 0,
      totalDescentMeters: 0,
      totalAscentFeet: 0,
      totalDescentFeet: 0
    };
  }

  let distanceMeters = 0;
  let totalAscentMeters = 0;
  let totalDescentMeters = 0;

  for (let i = 1; i < points.length; i++) {
    const previous = points[i - 1];
    const current = points[i];

    if (
      typeof previous.lat === 'number' &&
      typeof previous.lon === 'number' &&
      typeof current.lat === 'number' &&
      typeof current.lon === 'number'
    ) {
      distanceMeters += calculateSegmentDistanceMeters(previous, current);
    }

    if (
      typeof previous.elevation === 'number' &&
      typeof current.elevation === 'number' &&
      previous.elevation > 0 &&
      current.elevation > 0
    ) {
      const elevationChange = current.elevation - previous.elevation;
      if (elevationChange > 0) {
        totalAscentMeters += elevationChange;
      } else if (elevationChange < 0) {
        totalDescentMeters += -elevationChange;
      }
    }
  }

  const distanceMiles = distanceMeters / 1609.344;
  const totalAscentFeet = totalAscentMeters * 3.28084;
  const totalDescentFeet = totalDescentMeters * 3.28084;

  return {
    distanceMeters,
    distanceMiles,
    totalAscentMeters,
    totalDescentMeters,
    totalAscentFeet,
    totalDescentFeet
  };
}

