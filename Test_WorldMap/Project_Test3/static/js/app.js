// Initialize the map
const map = L.map('map', {
  worldCopyJump: false,
  minZoom: 2,
  maxZoom: 19,
}).setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors',
}).addTo(map);

// Restrict map bounds
const worldBounds = L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180));
map.setMaxBounds(worldBounds);
map.on('drag', function () {
  map.panInsideBounds(worldBounds, { animate: false });
});

// Layer group for markers
const markersLayer = L.layerGroup().addTo(map);

// Event listeners
document.getElementById('addCountry').addEventListener('click', () => {
  const countryName = document.getElementById('countryInput').value.trim();
  if (countryName) {
    getCountryCoordinates(countryName);
  } else {
    alert('Please enter a country name.');
  }
});

document.getElementById('getIPDetails').addEventListener('click', () => {
  const ipAddress = document.getElementById('ipInput').value.trim();
  if (ipAddress) {
    getIPDetails(ipAddress);
  } else {
    alert('Please enter an IP address.');
  }
});

// Fetch country coordinates
const getCountryCoordinates = async (country) => {
  try {
    const response = await fetch(`https://restcountries.com/v3.1/name/${country}`);
    if (!response.ok) throw new Error('Country not found!');
    const data = await response.json();
    const { latlng } = data[0];
    const countryName = data[0].name.common;
    addMarker(latlng[0], latlng[1], countryName);
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
};

// Fetch IP details
const getIPDetails = async (ip) => {
  try {
    const response = await fetch(`/get_ip_details?ip=${ip}`);
    if (!response.ok) throw new Error('Failed to fetch data from the server.');
    const data = await response.json();
    
    if (data.country) {
      getCountryCoordinatesByCode(data.country);
    } else {
      throw new Error('Country not found in IP data.');
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
};

// Fetch country coordinates by code
const getCountryCoordinatesByCode = async (countryCode) => {
  try {
    const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
    if (!response.ok) throw new Error('Country not found!');
    const data = await response.json();
    const { latlng } = data[0];
    const countryName = data[0].name.common;
    alert(`Country: ${countryName}\nLatitude: ${latlng[0]}\nLongitude: ${latlng[1]}`);
    addMarker(latlng[0], latlng[1], countryName);
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
};

// Add marker
const addMarker = (lat, lng, name) => {
  let markerExists = false;
  markersLayer.eachLayer((layer) => {
    const { lat: existingLat, lng: existingLng } = layer.getLatLng();
    if (existingLat === lat && existingLng === lng) {
      markerExists = true;
    }
  });

  if (!markerExists) {
    const marker = L.marker([lat, lng])
      .bindPopup(`<b>${name}</b><br>Lat: ${lat}, Lng: ${lng}`)
      .addTo(markersLayer);
    marker.openPopup();
    map.setView([lat, lng], 4);
  } else {
    alert(`A marker for "${name}" already exists on the map.`);
  }
};
