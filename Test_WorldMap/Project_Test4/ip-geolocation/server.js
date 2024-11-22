const axios = require('axios'); // Import Axios for HTTP requests

// Function to get the IP information
const getIPInfo = async (ipAddress = '192.168.1.120') => {  
  try {
    const response = await axios.get(`https://api.findip.net/IP_Address/?token=c8c8313f10c8467fbf476591de4022e9&ip=${ipAddress}`);
    
    const { loc } = response.data;
    if (loc) {
      const [latitude, longitude] = loc.split(',');
      addMarker(parseFloat(latitude), parseFloat(longitude), ipAddress);
    } else {
      console.log('Location data not available.');
    }
  } catch (error) {
    console.error('Error fetching IP info:', error);
  }
};

// Initialize the map and set its view
const map = L.map('map').setView([20, 0], 2);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors',
}).addTo(map);

// Create a LayerGroup to manage markers
const markersLayer = L.layerGroup().addTo(map);

// Add marker to the map
const addMarker = (lat, lng, name) => {
  const marker = L.marker([lat, lng])
    .bindPopup(`<b>IP: ${name}</b><br>Lat: ${lat}, Lng: ${lng}`)
    .addTo(markersLayer);
  marker.openPopup();
  map.setView([lat, lng], 4);
};

// Simulated attack data
const attackData = [
  { ip: "192.168.1.2", country: "USA", lat: 37.0902, lng: -95.7129, attackTime: "2024-11-21T12:05:00Z" },
  { ip: "192.168.1.3", country: "Russia", lat: 55.7558, lng: 37.6173, attackTime: "2024-11-21T12:10:00Z" },
];

// Function to add simulated attack markers
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
    const { latlng } = countryData;
    const countryName = countryData.name.common;
    addMarker(latlng[0], latlng[1], countryName);
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
};

// Example: Fetch information for a specific IP address
getIPInfo('101.1.255.255');
