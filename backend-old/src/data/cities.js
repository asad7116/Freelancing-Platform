// Static cities data - same for all users
export const cities = [
  // Pakistani cities
  { id: 'karachi', name: 'Karachi', country: 'Pakistan' },
  { id: 'lahore', name: 'Lahore', country: 'Pakistan' },
  { id: 'islamabad', name: 'Islamabad', country: 'Pakistan' },
  { id: 'rawalpindi', name: 'Rawalpindi', country: 'Pakistan' },
  { id: 'faisalabad', name: 'Faisalabad', country: 'Pakistan' },
  { id: 'multan', name: 'Multan', country: 'Pakistan' },
  { id: 'peshawar', name: 'Peshawar', country: 'Pakistan' },
  { id: 'quetta', name: 'Quetta', country: 'Pakistan' },
  
  // International cities
  { id: 'new-york', name: 'New York', country: 'USA' },
  { id: 'los-angeles', name: 'Los Angeles', country: 'USA' },
  { id: 'london', name: 'London', country: 'UK' },
  { id: 'paris', name: 'Paris', country: 'France' },
  { id: 'berlin', name: 'Berlin', country: 'Germany' },
  { id: 'toronto', name: 'Toronto', country: 'Canada' },
  { id: 'sydney', name: 'Sydney', country: 'Australia' },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan' },
  { id: 'mumbai', name: 'Mumbai', country: 'India' },
  { id: 'dubai', name: 'Dubai', country: 'UAE' },
  { id: 'singapore', name: 'Singapore', country: 'Singapore' },
  { id: 'sao-paulo', name: 'São Paulo', country: 'Brazil' }
];

// Helper function to get city by ID
export const getCityById = (id) => {
  return cities.find(city => city.id === id);
};

// Helper function to get cities by country
export const getCitiesByCountry = (country) => {
  return cities.filter(city => city.country === country);
};

// Helper function to get all countries
export const getCountries = () => {
  return [...new Set(cities.map(city => city.country))].sort();
};
