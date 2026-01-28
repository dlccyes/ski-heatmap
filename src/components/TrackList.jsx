export function TrackList({ tracks, onRemove }) {
  if (tracks.length === 0) return null;

  const totalPoints = tracks.reduce((sum, track) => sum + track.points.length, 0);

  return (
    <div className="track-list">
      <div className="track-list-header">
        <h3>Loaded Tracks</h3>
        <span className="track-count">{tracks.length} file{tracks.length !== 1 ? 's' : ''} • {totalPoints.toLocaleString()} points</span>
      </div>
      <ul className="track-items">
        {tracks.map((track, index) => (
          <li key={index} className="track-item">
            <span className="track-filename">{track.filename}</span>
            <span className="track-points">{track.points.length.toLocaleString()} points</span>
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


