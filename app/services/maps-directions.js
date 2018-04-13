import Polyline from '@mapbox/polyline';

const mapDirectionsApiKey = 'AIzaSyBAjUD0MpXMlxCOxyUnAlwmLUATXmfNtvQ';
const mapDirectionUrl = 'https://maps.googleapis.com/maps/api/directions/json';
const MapDirections = async (startCoords, destinationCoords) => {
  try {
    const startLoc = `${startCoords.latitude} ${startCoords.longitude}`;
    const destinationLoc = `${destinationCoords.latitude} ${destinationCoords.longitude}`;
    const fetchUrl = `${mapDirectionUrl}?origin=${startLoc}&destination=${destinationLoc}&key=${mapDirectionsApiKey}&mode=walking`; // eslint-disable-line 
    const resp = await fetch(fetchUrl);
    const respJson = await resp.json();
    console.log('Directions: ', respJson);
    const points = Polyline.decode(respJson.routes[0].overview_polyline.points);
    const polyLines = points.map((point) => ({
      latitude: point[0],
      longitude: point[1],
    }));
    const response = {
      polyLines,
      distance: respJson.routes[0].legs[0].distance.value,
      duration: respJson.routes[0].legs[0].duration.value,
      bounds: respJson.routes[0].bounds,
    };
    return response;
  } catch (error) {
    return { error };
  }
};

export default MapDirections;
