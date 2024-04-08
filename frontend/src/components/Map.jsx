import React, { useState, useEffect } from 'react';

import Mapbox, {
  Layer, Source, Marker, GeolocateControl,
  FullscreenControl,
  NavigationControl,
  ScaleControl,
  Popup,
} from 'react-map-gl';
import axios from 'axios';
import { v4 } from "uuid";

import countries from '../assets/countries.json';
import borders from '../assets/borders.json';

import { Button } from '@mui/material';

import { Pin } from './Pin';
import { ControlPanel } from './ControlPanel';
import { PopupContent } from './PopupContent';
import { usePrevious } from '../usePrevious';

const countryToCoords = (countryName) => {
  return countries.data.find(({ country }) => country.toLowerCase() === countryName.toLowerCase());
};

export const Map = () => {
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(3);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [markers, setMarkers] = useState([]);
  const previousMarkers = usePrevious(markers);

  const addMarker = async ({ lat, lng }) => {
    const id = v4();
    try {
      const newMarker = { id, lat, lng };
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/markers`;
      setSelectedMarker(null);

      const { data } = await axios.post(url, newMarker);

      setMarkers([...markers, data]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const getMarkers = async () => {
      try {
        const url = `${import.meta.env.VITE_BACKEND_URL}/api/markers`;
        const { data } = await axios.get(url);

        setMarkers(data)
      } catch (error) {
        console.log(error);
      }
    };

    getMarkers();
  }, []);

  useEffect(() => {
    if (previousMarkers?.length !== 0 && markers.length > 0 && markers.length > previousMarkers?.length) {
      setSelectedMarker(markers[markers.length - 1]);
    }
  }, [previousMarkers, markers]);

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

  const moveMarker = (id, { lat, lng }) => {
    setSelectedMarker({ id, lat, lng });
    setMarkers(markers.map(marker => marker.id === id ? { ...marker, lat, lng } : marker));
  };

  const onClick = (event, marker) => {
    event.originalEvent.stopPropagation();
    setSelectedMarker(marker);
  };

  const removeMarker = async id => {
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/markers/${id}`;
      await axios.delete(url);
      setMarkers(markers.filter(marker => marker.id !== id))
      setSelectedMarker(null);
    } catch (error) {
      console.log(error);
    }
  };

  const uploadImage = (image, marker) => {
    const reader = new FileReader();

    reader.onload = async function () {
      const base64String = reader.result.replace("data:", "")
        .replace(/^.+,/, "");

      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/markers/${marker.id}/image`, {
        base64String
      });
    }
    reader.readAsDataURL(image);
  };

  return (
    <>
      <Mapbox
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
        <GeolocateControl position="top-left" />
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" />
        <ScaleControl />
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
        {markers.map((marker) => (
          <Marker draggable key={marker.id} longitude={marker.lng} latitude={marker.lat} anchor="bottom" onDragEnd={({ lngLat }) => moveMarker(marker.id, lngLat)} onClick={(event) => onClick(event, marker)}>
            <Pin />
          </Marker>
        ))}
        {selectedMarker && (
          <Popup
            anchor="top"
            longitude={Number(selectedMarker.lng)}
            latitude={Number(selectedMarker.lat)}
            onClose={() => setSelectedMarker(null)}
          >
            <PopupContent uploadImage={(image) => uploadImage(image, selectedMarker)} />
            <Button onClick={() => removeMarker(selectedMarker.id)}>Remove marker</Button>
          </Popup>
        )}
      </Mapbox>
      {selectedCountry && (
        <ControlPanel selectedCountry={selectedCountry} />
      )}
    </>
  );
};
