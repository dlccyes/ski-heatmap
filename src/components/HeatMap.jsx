import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export function HeatMap({ trackData }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const heatLayerRef = useRef(null);
  const baseLayersRef = useRef({});
  const overlayLayersRef = useRef({});
  const skiOverlayRef = useRef(null);
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.7);
  const [pointIntensity, setPointIntensity] = useState(0.2);
  const previousTrackDataLengthRef = useRef(0);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstanceRef.current) {
      const allPoints = trackData.flatMap(track => track.points);
      
      let center = [46.5197, 6.6323];
      let zoom = 10;

      if (allPoints.length > 0) {
        const bounds = allPoints.reduce((acc, point) => {
          return [
            [Math.min(acc[0][0], point.lat), Math.min(acc[0][1], point.lon)],
            [Math.max(acc[1][0], point.lat), Math.max(acc[1][1], point.lon)]
          ];
        }, [[allPoints[0].lat, allPoints[0].lon], [allPoints[0].lat, allPoints[0].lon]]);

        center = [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2];
      }

      mapInstanceRef.current = L.map(mapRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: true
      });

      const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
        maxZoom: 17,
        subdomains: ['a', 'b', 'c']
      });

      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      });

      const skiOverlayLayer = L.tileLayer('https://tiles.opensnowmap.org/pistes/{z}/{x}/{y}.png', {
        attribution: '© OpenSnowMap contributors',
        maxZoom: 18,
        minZoom: 1,
        opacity: 0.8
      });

      baseLayersRef.current = {
        'Topographic (Ski Runs)': topoLayer,
        'OpenStreetMap': osmLayer
      };

      overlayLayersRef.current = {
        'Ski Runs Overlay': skiOverlayLayer
      };

      topoLayer.addTo(mapInstanceRef.current);
      skiOverlayLayer.addTo(mapInstanceRef.current);
      skiOverlayRef.current = skiOverlayLayer;

      L.control.layers(baseLayersRef.current, overlayLayersRef.current, {
        collapsed: false
      }).addTo(mapInstanceRef.current);

      if (allPoints.length > 0) {
        const bounds = allPoints.reduce((acc, point) => {
          return [
            [Math.min(acc[0][0], point.lat), Math.min(acc[0][1], point.lon)],
            [Math.max(acc[1][0], point.lat), Math.max(acc[1][1], point.lon)]
          ];
        }, [[allPoints[0].lat, allPoints[0].lon], [allPoints[0].lat, allPoints[0].lon]]);
        
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
      }

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 100);
    }

    const allPoints = trackData.flatMap(track => track.points);
    const trackDataChanged = allPoints.length !== previousTrackDataLengthRef.current;
    
    if (allPoints.length > 0 && mapInstanceRef.current) {
      const heatPoints = allPoints.map(point => [point.lat, point.lon, pointIntensity]);
      const maxIntensity = Math.max(10, Math.ceil(allPoints.length / 100));

      if (heatLayerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }

      heatLayerRef.current = L.heatLayer(heatPoints, {
        radius: 25,
        blur: 20,
        maxZoom: 17,
        max: maxIntensity,
        gradient: {
          0.0: 'blue',
          0.2: 'cyan',
          0.4: 'lime',
          0.6: 'yellow',
          0.8: 'orange',
          1.0: 'red'
        }
      }).addTo(mapInstanceRef.current);

      if (trackDataChanged) {
        const bounds = allPoints.reduce((acc, point) => {
          return [
            [Math.min(acc[0][0], point.lat), Math.min(acc[0][1], point.lon)],
            [Math.max(acc[1][0], point.lat), Math.max(acc[1][1], point.lon)]
          ];
        }, [[allPoints[0].lat, allPoints[0].lon], [allPoints[0].lat, allPoints[0].lon]]);
        
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
        previousTrackDataLengthRef.current = allPoints.length;
      }
    }

    return () => {
      if (heatLayerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
    };
  }, [trackData, pointIntensity]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (heatLayerRef.current && mapInstanceRef.current) {
      const canvas = mapInstanceRef.current.getPane('overlayPane').querySelector('canvas');
      if (canvas) {
        canvas.style.opacity = heatmapOpacity;
      }
    }
  }, [heatmapOpacity]);

  return (
    <div className="heatmap-wrapper">
      {trackData.length === 0 && (
        <div className="map-overlay">
          <p>Upload GPX files to see your ski track heatmap</p>
        </div>
      )}
      {trackData.length > 0 && (
        <div className="heatmap-controls">
          <div className="control-group">
            <label htmlFor="opacity-slider" className="control-label">
              Heatmap Opacity
            </label>
            <div className="control-input">
              <input
                id="opacity-slider"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={heatmapOpacity}
                onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
                className="control-slider"
              />
              <span className="control-value">{Math.round(heatmapOpacity * 100)}%</span>
            </div>
          </div>
          <div className="control-group">
            <label htmlFor="intensity-slider" className="control-label">
              Point Intensity
            </label>
            <div className="control-input">
              <input
                id="intensity-slider"
                type="range"
                min="0.05"
                max="10"
                step="0.05"
                value={pointIntensity}
                onChange={(e) => setPointIntensity(parseFloat(e.target.value))}
                className="control-slider"
              />
              <span className="control-value">{pointIntensity.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
      <div ref={mapRef} className="heatmap-container" />
    </div>
  );
}

