import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { HeatMap } from './components/HeatMap';
import { TrackList } from './components/TrackList';
import { parseMultipleGPXFiles } from './utils/gpxParser';
import './App.css';

function App() {
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFilesSelected = async (files) => {
    setIsLoading(true);
    setError(null);

    try {
      const parsedTracks = await parseMultipleGPXFiles(files);
      setTracks(prevTracks => [...prevTracks, ...parsedTracks]);
    } catch (err) {
      setError(err.message || 'Failed to process GPX files');
      console.error('Error parsing GPX files:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveTrack = (index) => {
    setTracks(prevTracks => prevTracks.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setTracks([]);
    setError(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>⛷️ Ski Track Heatmap</h1>
        <p>Upload your GPX files to visualize your skiing tracks</p>
      </header>

      <main className="app-main">
        <div className="controls-panel">
          <FileUpload onFilesSelected={handleFilesSelected} isLoading={isLoading} />
          
          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          {tracks.length > 0 && (
            <>
              <TrackList tracks={tracks} onRemove={handleRemoveTrack} />
              <button className="clear-button" onClick={handleClearAll}>
                Clear All Tracks
              </button>
            </>
          )}
        </div>

        <div className="map-panel">
          <HeatMap trackData={tracks} />
        </div>
      </main>
    </div>
  );
}

export default App;


