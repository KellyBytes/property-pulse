'use client';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import Image from 'next/image';
import pin from '@/assets/images/pin.svg';

const PropertyMapView = ({ lat, lng }) => {
  return (
    <Map
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      initialViewState={{
        longitude: lng,
        latitude: lat,
        zoom: 15,
      }}
      style={{ width: '100%', height: 500 }}
      mapStyle="mapbox://styles/mapbox/streets-v9"
    >
      <Marker longitude={lng} latitude={lat} anchor="bottom">
        <Image src={pin} alt="location" width={40} height={40} />
      </Marker>
    </Map>
  );
};

export default PropertyMapView;
