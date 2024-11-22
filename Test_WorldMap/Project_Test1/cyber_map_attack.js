// Initialize the map and set its view
const map = L.map('map', {
  worldCopyJump: false,
  minZoom: 2,
  maxZoom: 19,
}).setView([20, 0], 2);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors',
}).addTo(map);

// Define bounds for the map (covering the entire world)
const worldBounds = L.latLngBounds(
  L.latLng(-90, -180), // Southwest corner
  L.latLng(90, 180) // Northeast corner
);

// Restrict map bounds to prevent infinite horizontal panning
map.setMaxBounds(worldBounds);
map.on('drag', function () {
  map.panInsideBounds(worldBounds, { animate: false });
});

// Create a LayerGroup to manage markers
const markersLayer = L.layerGroup().addTo(map);

// Event listener for adding countries
document.getElementById('addCountry').addEventListener('click', () => {
  const countryName = document.getElementById('countryInput').value.trim();
  if (countryName) {
    getCountryCoordinates(countryName);
  } else {
    alert('Please enter a country name.');
  }
});

// Fetch country coordinates from REST Countries API
const getCountryCoordinates = async (country) => {
  try {
    const response = await fetch(`https://restcountries.com/v3.1/name/${country}`);
    if (!response.ok) throw new Error('Country not found!');
    const data = await response.json();

    const countryData = data[0];
    const { latlng } = countryData; // Extract latitude and longitude
    const countryName = countryData.name.common;

    // Add marker to map only if it doesn't exist
    addMarker(latlng[0], latlng[1], countryName);
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
};

// Add a marker to the map if it doesn't exist
const addMarker = (lat, lng, name) => {
  // Check if a marker at the same location already exists
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

    // Open the popup for the newly added marker
    marker.openPopup();

    // Center the map to the new marker
    map.setView([lat, lng], 4);
  } else {
    alert(`A marker for "${name}" already exists on the map.`);
  }
};

// Simulated attack data (could be replaced by dynamic API or database)
const attackData = [
  // { ip: "192.168.1.1", country: "Thailand", lat: 15, lng: 100, attackTime: "2024-11-21T12:00:00Z" },
  { ip: "192.168.1.2", country: "USA", lat: 37.0902, lng: -95.7129, attackTime: "2024-11-21T12:05:00Z" },
  { ip: "192.168.1.3", country: "Russia", lat: 55.7558, lng: 37.6173, attackTime: "2024-11-21T12:10:00Z" },
];

// Function to add simulated attack markers on the map
const addAttackMarkers = () => {
  attackData.forEach((attack) => {
    const { lat, lng, country, ip, attackTime } = attack;

    L.marker([lat, lng])
      .bindPopup(`<b>Attack from ${country}</b><br>IP: ${ip}<br>Time: ${attackTime}`)
      .addTo(markersLayer);
  });
};

// Call the function to add attack markers
addAttackMarkers();
