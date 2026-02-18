export function parseGPX(gpxText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(gpxText, 'text/xml');
  
  const points = [];
  const trackPoints = xmlDoc.querySelectorAll('trkpt, wpt');
  
  trackPoints.forEach(point => {
    const lat = parseFloat(point.getAttribute('lat'));
    const lon = parseFloat(point.getAttribute('lon'));
    
    if (!isNaN(lat) && !isNaN(lon)) {
      const elevation = point.querySelector('ele');
      const elevationValue = elevation ? parseFloat(elevation.textContent) : 0;
      
      points.push({
        lat,
        lon,
        elevation: elevationValue
      });
    }
  });
  
  return points;
}

export async function parseGPXFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const points = parseGPX(event.target.result);
        resolve({
          filename: file.name,
          points
        });
      } catch (error) {
        reject(new Error(`Failed to parse ${file.name}: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error(`Failed to read ${file.name}`));
    };
    
    reader.readAsText(file);
  });
}

export async function parseMultipleGPXFiles(files) {
  const fileArray = Array.from(files);
  const parsePromises = fileArray.map(file => parseGPXFile(file));
  return Promise.all(parsePromises);
}

export function filterDownhillPoints(points) {
  if (points.length < 2) return points;
  
  const filteredPoints = [points[0]];
  const minElevationDrop = 0.5;
  
  for (let i = 1; i < points.length; i++) {
    const prevPoint = points[i - 1];
    const currentPoint = points[i];
    
    if (prevPoint.elevation > 0 && currentPoint.elevation > 0) {
      const elevationChange = prevPoint.elevation - currentPoint.elevation;
      
      if (elevationChange >= minElevationDrop) {
        filteredPoints.push(currentPoint);
      }
    } else if (prevPoint.elevation === 0 || currentPoint.elevation === 0) {
      filteredPoints.push(currentPoint);
    }
  }
  
  return filteredPoints;
}

export function filterUphillPoints(points) {
  if (points.length < 2) return points;
  
  const filteredPoints = [points[0]];
  
  for (let i = 1; i < points.length; i++) {
    const prevPoint = points[i - 1];
    const currentPoint = points[i];
    
    if (prevPoint.elevation > 0 && currentPoint.elevation > 0) {
      const elevationChange = prevPoint.elevation - currentPoint.elevation;
      
      if (elevationChange < 0) {
        filteredPoints.push(currentPoint);
      }
    } else {
      filteredPoints.push(currentPoint);
    }
  }
  
  return filteredPoints;
}


