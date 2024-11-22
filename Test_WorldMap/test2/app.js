// Initialize the map and set its view
const map = L.map('map').setView([20, 0], 2); // Centered globally

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors',
}).addTo(map);

// Attack data (example format)
const attacks = [
  { origin: { lat: 40.7128, lng: -74.0060 }, country: "USA", target: { lat: 51.5074, lng: -0.1278 }, targetCountry: "UK" },
  { origin: { lat: 35.6895, lng: 139.6917 }, country: "Japan", target: { lat: 37.7749, lng: -122.4194 }, targetCountry: "USA" },
  { origin: { lat: 48.8566, lng: 2.3522 }, country: "France", target: { lat: -33.8688, lng: 151.2093 }, targetCountry: "Australia" },
];

// Function to create markers and routes
attacks.forEach((attack) => {
  // Add a marker for the origin
  const originMarker = L.marker([attack.origin.lat, attack.origin.lng])
    .addTo(map)
    .bindPopup(`<b>Origin:</b> ${attack.country}`);
  
  // Add a marker for the target
  const targetMarker = L.marker([attack.target.lat, attack.target.lng])
    .addTo(map)
    .bindPopup(`<b>Target:</b> ${attack.targetCountry}`);
  
  // Draw a line between origin and target
  const attackLine = L.polyline(
    [[attack.origin.lat, attack.origin.lng], [attack.target.lat, attack.target.lng]],
    { color: 'red', weight: 2 }
  ).addTo(map);
  
  // Fit map bounds to include all attacks
  map.fitBounds(attackLine.getBounds());
});
