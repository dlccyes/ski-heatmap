import { calculateTrackStats } from '../utils/trackStats';

function formatMiles(miles) {
  return miles.toFixed(1);
}

function formatFeet(feet) {
  return Math.round(feet).toLocaleString();
}

export function TrackList({ tracks, onRemove }) {
  if (tracks.length === 0) return null;

  const tracksWithStats = tracks.map(track => ({
    track,
    stats: calculateTrackStats(track.points || [])
  }));

  const totalDistanceMiles = tracksWithStats.reduce(
    (sum, entry) => sum + entry.stats.distanceMiles,
    0
  );

  const totalVertFeet = tracksWithStats.reduce(
    (sum, entry) => sum + entry.stats.totalDescentFeet,
    0
  );

  return (
    <div className="track-list">
      <div className="track-list-header">
        <h3>Loaded Tracks</h3>
        <span className="track-count">
          {tracks.length} file{tracks.length !== 1 ? 's' : ''} •{' '}
          {formatMiles(totalDistanceMiles)} mi • {formatFeet(totalVertFeet)} ft vert
        </span>
      </div>
      <ul className="track-items">
        {tracksWithStats.map(({ track, stats }, index) => (
          <li key={index} className="track-item">
            <span className="track-filename">{track.filename}</span>
            <span className="track-points">
              {formatMiles(stats.distanceMiles)} mi • {formatFeet(stats.totalDescentFeet)} ft vert
            </span>
            {onRemove && (
              <button
                className="remove-button"
                onClick={() => onRemove(index)}
                aria-label={`Remove ${track.filename}`}
              >
                ×
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}


