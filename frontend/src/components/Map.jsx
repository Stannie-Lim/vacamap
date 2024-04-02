import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

import countries from '../assets/countries.json';

import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API;

const countryToCoords = (countryName) => {
  return countries.data.find(({ country }) => country.toLowerCase() === countryName.toLowerCase());
};

export const Map = () => {
  const map = useRef(null);

  const mapContainer = useRef(null);

  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(3);
  const [selectedCountry, setSelectedCountry] = useState(null);

  useEffect(() => {
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom,
    });
  }, [map, lat, lng]);

  useEffect(() => {
    map.current.on('load', () => {
      map.current.addSource('cbs', {  // country-boundaries-simplified
        'type': 'geojson',
        'data': 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson'
      });

      map.current.addLayer({
        "id": "cf",  // country-fills
        "type": "fill",
        "source": "cbs",
        "layout": {},
        "paint": {
          "fill-color": "#627BC1",
          "fill-opacity": 0.5
        }
      });

      map.current.addLayer({
        "id": "cb",  // country borders
        "type": "line",
        "source": "cbs",
        "layout": {},
        "paint": {
          "line-color": 'rgb(179, 79, 207)',
          "line-width": 2
        }
      });

      map.current.addLayer({
        "id": "cfh",  // country-fills-hover",
        "type": "fill",
        "source": "cbs",
        "layout": {},
        "paint": {
          "fill-color": "#FFFFFF",
          "fill-opacity": 0.1,
        },
        "filter": ["==", "name", ""]
      });

      map.current.on("mousemove", function (e) {
        if (map.current.getLayer('cf')) {
          const features = map.current.queryRenderedFeatures(e.point, { layers: ["cf"] });

          if (features.length) {
            map.current.getCanvas().style.cursor = 'pointer';
            map.current.setFilter("cfh", ["==", "name", features[0].properties.name]);
          } else {
            map.current.setFilter("cfh", ["==", "name", ""]);
            map.current.getCanvas().style.cursor = '';
          }
        }
      });

      map.current.on("mouseout", function () {
        map.current.getCanvas().style.cursor = 'auto';
        map.current.setFilter("cfh", ["==", "name", ""]);
      });

      map.current.on("click", function (e) {
        if (map.current.getLayer('cf')) {
          const features = map.current.queryRenderedFeatures(e.point, { layers: ["cf"] });
          if (features.length) {
            const coords = countryToCoords(features[0].properties.name);
            map.current.flyTo({
              center: { lat: coords.lat, lng: coords.lng },
              zoom: 4,
            });

            // map.current.removeLayer('cf');

            // map.current.addLayer({
            //   "id": "selected-country-fill",  // country-fills
            //   "type": "fill",
            //   "source": "cbs",
            //   "layout": {},
            //   "paint": {
            //     "fill-color": "blue",
            //     "fill-opacity": 0.5
            //   }
            // });
          }
        }
      });
    });
  }, []);

  return <div ref={mapContainer} style={{ height: '100vh', width: '100vw' }} />
};
