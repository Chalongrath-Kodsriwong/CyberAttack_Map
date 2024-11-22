const axios = require('axios'); // Import Axios for HTTP requests
const fs = require('fs'); // Import fs module to write files

// Function to get the IP information
const getIPInfo = async (ipAddress = '192.168.1.120') => {  // Default to 'your_ip_here' for testing
  try {
    // Call the API with the specific IP address
    const response = await axios.get(`https://api.findip.net/IP_Address/?token=c8c8313f10c8467fbf476591de4022e9&ip=${ipAddress}`);
    
    // Log the entire response data to inspect its structure
    console.log(response.data);

    // Extract the necessary location data
    const { loc, time_zone, weather_code } = response.data;

    if (loc) {
      const [latitude, longitude] = loc.split(',');

      const locationData = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        time_zone: time_zone || 'Unknown',
        weather_code: weather_code || 'Unknown'
      };

      // Save the location data to a JSON file
      fs.writeFileSync('locationData.json', JSON.stringify({ location: locationData }, null, 2));

      console.log('Location data saved to locationData.json');
    } else {
      console.log('Location data not found.');
    }
  } catch (error) {
    console.error('Error fetching IP info:', error);
  }
};

// Example: Fetch information for a specific IP address
getIPInfo('8.8.8.8');  // Google's public DNS as an example IP
