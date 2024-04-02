import React, { useState, useMemo } from 'react';

import Mapbox, { Layer, Source, Marker } from 'react-map-gl';

import countries from '../assets/countries.json';
import borders from '../assets/borders.json';

const countryToCoords = (countryName) => {
  return countries.data.find(({ country }) => country.toLowerCase() === countryName.toLowerCase());
};

export const Map = () => {
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(3);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [markers, setMarkers] = useState([]);

  const addMarker = ({ lat, lng }, map) => {
    setMarkers([...markers, { id: markers.length, lat, lng }]);
  };

  const selectCountry = (map, features) => {
    const countryName = features[0].properties.name;

    const coords = countryToCoords(countryName);
    map.flyTo({
      center: { lat: coords.lat, lng: coords.lng },
      zoom: 4,
    });

    setSelectedCountry(countryName);

    map.removeLayer('cf');
    map.removeLayer('cb');
    map.removeLayer('cfh');
    map.removeSource('cbs');

    const allOtherBorders = borders.features.filter(({ properties }) => properties.name !== countryName);

    map.addSource('cbs', {
      'type': 'geojson',
      'data': { ...borders, features: allOtherBorders },
    });

    map.addLayer({
      "id": "cf",  // country-fills
      "type": "fill",
      "source": "cbs",
      "layout": {},
      "paint": {
        "fill-color": "#627BC1",
        "fill-opacity": 0.5
      }
    });

    map.addLayer({
      "id": "cb",  // country borders
      "type": "line",
      "source": "cbs",
      "layout": {},
      "paint": {
        "line-color": 'rgb(179, 79, 207)',
        "line-width": 2
      }
    });

    map.addLayer({
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
  };

  const onMapMouseMove = ({ target: map, point }) => {
    if (map.getLayer('cf')) {
      const features = map.queryRenderedFeatures(point, { layers: ["cf"] });

      if (features.length) {
        map.getCanvas().style.cursor = 'pointer';
        map.setFilter("cfh", ["==", "name", features[0].properties.name]);
      } else {
        map.setFilter("cfh", ["==", "name", ""]);
        map.getCanvas().style.cursor = '';
      }
    }
  }

  const onMapMouseOut = ({ target: map }) => {
    map.getCanvas().style.cursor = 'auto';
    map.setFilter("cfh", ["==", "name", ""]);
  }

  const onMapClick = (event) => {
    const { target: map, point, lngLat } = event;
    if (map.getLayer('cf')) {
      const features = map.queryRenderedFeatures(point, { layers: ["cf"] });
      if (features.length) {
        selectCountry(map, features);
      } else {
        addMarker(lngLat, map);
      }
    }
  };

  const removeMarker = id => {
    setMarkers(markers.filter(marker => marker.id !== id))
  };

  const moveMarker = (id, { lat, lng }) => {
    setMarkers(markers.map(marker => marker.id === id ? { ...marker, lat, lng } : marker));
  };

  return <Mapbox
    onMouseMove={onMapMouseMove}
    onMouseOut={onMapMouseOut}
    onClick={onMapClick}
    mapboxAccessToken={import.meta.env.VITE_MAPBOX_API}
    initialViewState={{
      longitude: lng,
      latitude: lat,
      zoom
    }}
    style={{ width: '100vw', height: '100vh' }}
    mapStyle="mapbox://styles/mapbox/streets-v12"
  >
    <Source id="cbs" type="geojson" data={borders}>
      <Layer id="cf" type="fill" source="cbs" layout={{}} paint={{
        "fill-color": "#627BC1",
        "fill-opacity": 0.5
      }} />
      <Layer id="cb" type="line" source="cbs" layout={{}} paint={{
        "line-color": 'rgb(179, 79, 207)',
        "line-width": 2
      }} />
      <Layer id="cfh" type="fill" source="cbs" layout={{}} paint={{
        "fill-color": "#FFFFFF",
        "fill-opacity": 0.1,
      }} filter={["==", "name", ""]} />
    </Source>
    {markers.map(({ lat, lng, id }) => (
      <Marker draggable key={id} longitude={lng} latitude={lat} anchor="bottom" onDragEnd={({ lngLat }) => moveMarker(id, lngLat)}>
        <img width={50} height={50} src="https://cdn4.iconfinder.com/data/icons/small-n-flat/24/map-marker-512.png" />
      </Marker>
    ))}
  </Mapbox>;
};
