import { useRef } from 'react';

export function FileUpload({ onFilesSelected, isLoading }) {
  const fileInputRef = useRef(null);

  const handleFileChange = async (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      await onFilesSelected(files);
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    const gpxFiles = Array.from(files).filter(file => 
      file.name.toLowerCase().endsWith('.gpx')
    );
    
    if (gpxFiles.length > 0) {
      await onFilesSelected(gpxFiles);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="file-upload-container">
      <div
        className="drop-zone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".gpx"
          multiple
          onChange={handleFileChange}
          className="file-input"
          id="gpx-file-input"
          disabled={isLoading}
        />
        <label htmlFor="gpx-file-input" className="file-input-label">
          {isLoading ? (
            <span>Processing files...</span>
          ) : (
            <>
              <span className="upload-icon">📁</span>
              <span>Drop GPX files here or click to browse</span>
              <span className="upload-hint">Select multiple files to combine tracks</span>
            </>
          )}
        </label>
      </div>
    </div>
  );
}


