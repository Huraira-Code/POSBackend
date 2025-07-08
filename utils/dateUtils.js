const axios = require('axios');

/**
 * Fetches the current UTC date from timeapi.io.
 * Falls back to system time if the API fails.
 * @returns {Promise<Date>} A promise that resolves to a Date object (UTC)
 */
async function getTrustedUtcDate() {
  try {
    const response = await axios.get('https://timeapi.io/api/Time/current/zone?timeZone=UTC', {
      timeout: 3000 // 3 second timeout
    });
    if (response.data && response.data.dateTime) {
      return new Date(response.data.dateTime);
    }
    throw new Error('Invalid response from time API');
  } catch (err) {
    // Fallback to system time
    return new Date();
  }
}

module.exports = {
  getTrustedUtcDate
}; 