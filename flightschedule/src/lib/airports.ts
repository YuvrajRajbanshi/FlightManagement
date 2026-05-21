export const AIRPORTS = [
  // Indian Cities
  { code: "DEL", city: "Delhi", country: "India" },
  { code: "BOM", city: "Mumbai", country: "India" },
  { code: "BLR", city: "Bangalore", country: "India" },
  { code: "HYD", city: "Hyderabad", country: "India" },
  { code: "CCU", city: "Kolkata", country: "India" },
  { code: "MAA", city: "Chennai", country: "India" },
  { code: "COK", city: "Kochi", country: "India" },
  { code: "PNQ", city: "Pune", country: "India" },
  { code: "AMD", city: "Ahmedabad", country: "India" },
  { code: "JAI", city: "Jaipur", country: "India" },
  { code: "LKO", city: "Lucknow", country: "India" },
  { code: "VTZ", city: "Visakhapatnam", country: "India" },

  // International (USA)
  { code: "NYC", city: "New York", country: "USA" },
  { code: "LAX", city: "Los Angeles", country: "USA" },
  { code: "ORD", city: "Chicago", country: "USA" },
  { code: "DFW", city: "Dallas", country: "USA" },
  { code: "DEN", city: "Denver", country: "USA" },

  // International (Europe)
  { code: "LHR", city: "London", country: "UK" },
  { code: "CDG", city: "Paris", country: "France" },
  { code: "FRA", city: "Frankfurt", country: "Germany" },
  { code: "AMS", city: "Amsterdam", country: "Netherlands" },

  // International (Asia)
  { code: "SIN", city: "Singapore", country: "Singapore" },
  { code: "HKG", city: "Hong Kong", country: "Hong Kong" },
  { code: "BKK", city: "Bangkok", country: "Thailand" },
  { code: "DXB", city: "Dubai", country: "UAE" },
];

export function getAirportSuggestions(query: string) {
  if (!query) return [];
  const lowerQuery = query.toLowerCase();
  return AIRPORTS.filter(
    (airport) =>
      airport.code.toLowerCase().includes(lowerQuery) ||
      airport.city.toLowerCase().includes(lowerQuery),
  ).slice(0, 8);
}
