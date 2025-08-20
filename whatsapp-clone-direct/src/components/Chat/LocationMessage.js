import React, { useState } from 'react';
import styled from 'styled-components';
import { FaMapMarkerAlt, FaDirections, FaExternalLinkAlt } from 'react-icons/fa';

const LocationContainer = styled.div`
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 5px;
  width: 300px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
`;

const MapPreview = styled.div`
  height: 180px;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  position: relative;
  cursor: pointer;
`;

const LocationPin = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #E74C3C;
  font-size: 30px;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.3));
`;

const LocationInfo = styled.div`
  padding: 10px;
  background-color: white;
`;

const LocationName = styled.div`
  font-weight: 500;
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const LocationAddress = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
`;

const LocationActions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
`;

const ActionButton = styled.a`
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 16px;
  background-color: #f0f0f0;
  color: var(--text-primary);
  text-decoration: none;
  font-size: 12px;
  
  &:hover {
    background-color: #e0e0e0;
  }
  
  svg {
    margin-right: 4px;
  }
`;

const LiveBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #E74C3C;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    background-color: white;
    border-radius: 50%;
    margin-right: 4px;
    animation: pulse 1.5s infinite;
  }
  
  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }
`;

const LocationMessage = ({ location }) => {
  const [mapLoaded, setMapLoaded] = useState(true);
  
  // In a real app, we would use the Google Maps API or similar
  // For this demo, we'll use a static map image
  const getMapImageUrl = (latitude, longitude) => {
    // This would typically be a call to Google Maps Static API or similar
    // For demo purposes, we'll use a placeholder
    return `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=600x300&maptype=roadmap&markers=color:red%7C${latitude},${longitude}&key=YOUR_API_KEY`;
    
    // Since we don't have an actual API key, we'll use a placeholder image
    // return 'https://via.placeholder.com/600x300/e0e0e0/808080?text=Map+Preview';
  };
  
  const getGoogleMapsUrl = (latitude, longitude, name) => {
    const encodedName = encodeURIComponent(name || 'Shared Location');
    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${encodedName}`;
  };
  
  const getDirectionsUrl = (latitude, longitude) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  };
  
  // Use placeholder values if not provided
  const latitude = location.latitude || 37.7749;
  const longitude = location.longitude || -122.4194;
  const name = location.name || 'Shared Location';
  const address = location.address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  const isLive = location.isLive || false;
  
  // For demo purposes, we'll use a placeholder image
  const mapImageUrl = 'https://via.placeholder.com/600x300/e0e0e0/808080?text=Map+Preview';
  // In a real app, we would use:
  // const mapImageUrl = getMapImageUrl(latitude, longitude);
  
  const googleMapsUrl = getGoogleMapsUrl(latitude, longitude, name);
  const directionsUrl = getDirectionsUrl(latitude, longitude);
  
  return (
    <LocationContainer>
      <MapPreview 
        src={mapImageUrl}
        onClick={() => window.open(googleMapsUrl, '_blank')}
      >
        <LocationPin>
          <FaMapMarkerAlt />
        </LocationPin>
        {isLive && (
          <LiveBadge>LIVE</LiveBadge>
        )}
      </MapPreview>
      <LocationInfo>
        <LocationName>{name}</LocationName>
        <LocationAddress>{address}</LocationAddress>
        <LocationActions>
          <ActionButton href={directionsUrl} target="_blank" rel="noopener noreferrer">
            <FaDirections /> Directions
          </ActionButton>
          <ActionButton href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
            <FaExternalLinkAlt /> Open in Maps
          </ActionButton>
        </LocationActions>
      </LocationInfo>
    </LocationContainer>
  );
};

export default LocationMessage;

