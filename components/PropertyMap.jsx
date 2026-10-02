import { FaMapMarker } from 'react-icons/fa';
import { geocodeAddress } from '@/utils/geocodeAddress';
import PropertyMapView from './PropertyMapView';

const PropertyMap = async ({ property }) => {
  const coords = await geocodeAddress(property.location);

  if (!coords) {
    // Fall back to the address text when the location can't be geocoded
    const { street, city, state, zipcode } = property.location;
    const address = [street, city, [state, zipcode].filter(Boolean).join(' ')]
      .filter(Boolean)
      .join(', ');

    return (
      <div className="flex items-center text-gray-700">
        <FaMapMarker className="text-orange-700 mr-2" />
        <p>{address}</p>
      </div>
    );
  }

  return <PropertyMapView lat={coords.lat} lng={coords.lng} />;
};

export default PropertyMap;
