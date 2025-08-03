import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './App.css';
import AutocompleteDemo from './components/AutocompleteDemo';
import DistrictStats from './components/DistrictStats';
import DataStatus from './components/DataStatus';
import AdvancedFactorAnalysis from './components/AdvancedFactorAnalysis';
import { generateAIValuationWithDistrictData, DISTRICT_DATA, calculateMarketStats, calculateDistrictRanking, calculateMarketTrends } from './services/districtDataService';

// --- API Configuration ---
const GOOGLE_MAPS_API_KEY = "AIzaSyCW9G1CBbrs87Gb9gUbhaYpwB0mnpQUGf4";
const RAPID_HOST = "ddproperty-realtimeapi.p.rapidapi.com";
const RAPID_BASE = `https://${RAPID_HOST}`;

// --- All Bangkok District Names ---
const ALL_BANGKOK_DISTRICTS = [
  "Watthana", "Phra Khanong", "Phaya Thai", "Huai Khwang", "Yan Nawa", 
  "Wang Thonglang", "Bangkok Yai", "Bang Kapi", "Suan Luang", "Chatuchak", 
  "Thon Buri", "Prawet", "Bang Na", "Din Daeng", "Bang Khae", "Chom Thong", 
  "Khan Na Yao", "Bang Phlat", "Phasi Charoen", "Lat Phrao", "Bang Khen", 
  "Don Mueang", "Bueng Kum", "Taling Chan", "Bang Khun Thian", "Lak Si", 
  "Saphan Sung", "Sai Mai", "Khlong Sam Wa", "Thawi Watthana", "Bang Bon", 
  "Min Buri", "Nong Khaem", "Nong Chok", "Lat Krabang"
];

// --- Helper Components ---
const Icon = ({ path, className = "stat-icon" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

// --- Helper function for simplified currency formatting ---
const formatCurrency = (value, showUnit = false) => {
  // Ensure value is a number
  const numValue = Number(value);
  
  // Format as full number with commas
  const formatted = new Intl.NumberFormat('en-US').format(numValue);
  return showUnit ? `${formatted} THB` : formatted;
};

// --- Helper to get DDproperty location object ---
async function getDDPropertyLocationObject(query, headers) {
  try {
    console.log('🔍 Calling DDproperty location_auto_complete with query:', query);
    const response = await axios.get(
      `${RAPID_BASE}/ddproperty/location/auto-complete`,
      {
        headers,
        params: {
          query,
          country: 'TH',
        },
      }
    );
    console.log('✅ Location auto-complete response:', response.data);
    if (response.data && response.data.data && response.data.data.length > 0) {
      return response.data.data[0]; // Use the first result
    }
    return null;
  } catch (error) {
    console.error('Error fetching location_auto_complete:', error);
    console.error('Response data:', error.response?.data);
    return null;
  }
}

// --- Enhanced Auto-complete function for district search ---
async function getAutocompleteSuggestions(query, headers) {
  try {
    if (!query.trim() || query.length < 1) {
      return [];
    }
    
    console.log('🔍 Getting district suggestions for:', query);
    
    // Get district suggestions from our comprehensive list
    const districtResults = getDistrictAutocompleteSuggestions(query);
    console.log('📋 District suggestions:', districtResults.length, 'items');
    
    return districtResults;
  } catch (error) {
    console.error('Error in getAutocompleteSuggestions:', error);
    return [];
  }
}

// --- Enhanced district auto-complete suggestions ---
function getDistrictAutocompleteSuggestions(query) {
  const queryLower = query.toLowerCase().trim();
  
  // Filter districts that match the query
  const matchingDistricts = ALL_BANGKOK_DISTRICTS.filter(district => 
    district.toLowerCase().includes(queryLower)
  );
  
  // Sort by relevance (exact matches first, then partial matches)
  const sortedDistricts = matchingDistricts.sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    
    // Exact match gets highest priority
    if (aLower === queryLower) return -1;
    if (bLower === queryLower) return 1;
    
    // Starts with query gets second priority
    if (aLower.startsWith(queryLower)) return -1;
    if (bLower.startsWith(queryLower)) return 1;
    
    // Otherwise sort alphabetically
    return aLower.localeCompare(bLower);
  });
  
  // Limit to top 10 results
  const limitedResults = sortedDistricts.slice(0, 10);
  
  // Convert to autocomplete format
  return limitedResults.map(districtName => ({
    id: districtName,
    name: districtName,
    type: 'district',
    description: `Bangkok District`,
    coordinates: getDistrictCoordinates(districtName)
  }));
}

// --- Get district coordinates ---
function getDistrictCoordinates(districtName) {
  // District center coordinates (approximate)
  const districtCenters = {
    "Watthana": { lat: 13.7373, lng: 100.5608 },
    "Phra Khanong": { lat: 13.7000, lng: 100.6000 },
    "Huai Khwang": { lat: 13.7287, lng: 100.5608 },
    "Wang Thonglang": { lat: 13.8234, lng: 100.6534 },
    "Prawet": { lat: 13.7000, lng: 100.6000 },
    "Bang Khae": { lat: 13.7287, lng: 100.5347 },
    "Chatuchak": { lat: 13.8234, lng: 100.5534 },
    "Bang Kapi": { lat: 13.8234, lng: 100.6534 },
    "Khan Na Yao": { lat: 13.8234, lng: 100.6534 },
    "Phaya Thai": { lat: 13.7287, lng: 100.5608 },
    "Bang Khun Thian": { lat: 13.7287, lng: 100.5347 },
    "Thon Buri": { lat: 13.7287, lng: 100.5347 },
    "Bang Na": { lat: 13.7000, lng: 100.6000 },
    "Taling Chan": { lat: 13.7287, lng: 100.5347 },
    "Lat Phrao": { lat: 13.8133, lng: 100.7324 },
    "Thawi Watthana": { lat: 13.7287, lng: 100.5347 },
    "Yan Nawa": { lat: 13.7287, lng: 100.5347 },
    "Don Mueang": { lat: 13.9234, lng: 100.5534 },
    "Suan Luang": { lat: 13.7000, lng: 100.6000 },
    "Bang Khen": { lat: 13.8234, lng: 100.6534 },
    "Phasi Charoen": { lat: 13.7287, lng: 100.5347 },
    "Khlong Sam Wa": { lat: 13.8133, lng: 100.7324 },
    "Bueng Kum": { lat: 13.8234, lng: 100.6534 },
    "Din Daeng": { lat: 13.7287, lng: 100.5608 },
    "Sai Mai": { lat: 13.9234, lng: 100.3534 },
    "Bang Phlat": { lat: 13.7287, lng: 100.5347 },
    "Lak Si": { lat: 13.9234, lng: 100.4534 },
    "Min Buri": { lat: 13.8133, lng: 100.7324 },
    "Nong Khaem": { lat: 13.7287, lng: 100.5347 },
    "Nong Chok": { lat: 13.7000, lng: 100.6000 },
    "Bang Bon": { lat: 13.7287, lng: 100.5347 },
    "Chom Thong": { lat: 13.7287, lng: 100.5347 },
    "Bangkok Yai": { lat: 13.7287, lng: 100.5347 },
    "Lat Krabang": { lat: 13.7000, lng: 100.6000 }
  };
  
  return districtCenters[districtName] || { lat: 13.7563, lng: 100.5018 }; // Default to Bangkok center
}

// --- Main App Component ---
export default function LandValuationApp() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [radius, setRadius] = useState(5); // Default 5km
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [aiValuation, setAiValuation] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [marker, setMarker] = useState(null);
  const [circle, setCircle] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [apiTestResults, setApiTestResults] = useState(null);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [autocompleteResults, setAutocompleteResults] = useState([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedAutocompleteIndex, setSelectedAutocompleteIndex] = useState(-1);
  const [isAutocompleteLoading, setIsAutocompleteLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const mapRef = useRef(null);
  const autocompleteTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);

  // Debounced auto-complete search
  const debouncedAutocomplete = useCallback((query) => {
    if (autocompleteTimeoutRef.current) {
      clearTimeout(autocompleteTimeoutRef.current);
    }
    
    autocompleteTimeoutRef.current = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsAutocompleteLoading(true);
        const headers = {
          "x-rapidapi-key": process.env.REACT_APP_RAPIDAPI_KEY || "REPLACE_ME",
          "x-rapidapi-host": RAPID_HOST,
        };
        
        console.log('🔍 Using API key:', process.env.REACT_APP_RAPIDAPI_KEY ? 'SET' : 'NOT SET');
        
        const suggestions = await getAutocompleteSuggestions(query, headers);
        console.log('🔍 Setting auto-complete results:', suggestions);
        console.log('🔍 Results length:', suggestions.length);
        console.log('🔍 Results details:', suggestions.map(s => ({ 
          text: s.name, 
          type: s.type, 
          desc: s.description 
        })));
        
        setAutocompleteResults(suggestions);
        setShowAutocomplete(suggestions.length > 0);
        setSelectedAutocompleteIndex(-1);
        setIsAutocompleteLoading(false);
      } else {
        setAutocompleteResults([]);
        setShowAutocomplete(false);
        setIsAutocompleteLoading(false);
      }
    }, 300); // 300ms delay
  }, []);

  const updateMapMarker = useCallback((lat, lng) => {
    if (!mapInstance) return;

    // Remove existing marker and circle
    if (marker) marker.setMap(null);
    if (circle) circle.setMap(null);

    // Create new marker
    const newMarker = new window.google.maps.Marker({
      position: { lat, lng },
      map: mapInstance,
      title: 'Selected Location',
      animation: window.google.maps.Animation.DROP
    });
    setMarker(newMarker);

    // Create radius circle
    const newCircle = new window.google.maps.Circle({
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      map: mapInstance,
      center: { lat, lng },
      radius: radius * 1000 // Convert km to meters
    });
    setCircle(newCircle);

    // Center map on new location
    mapInstance.panTo({ lat, lng });
  }, [mapInstance, radius]);

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      return new Promise((resolve, reject) => {
        if (window.google && window.google.maps) {
          resolve();
          return;
        }

        // Prevent multiple script loads
        if (document.querySelector('script[src*="maps.googleapis.com"]')) {
          console.log('✅ Google Maps API script already exists');
          // Wait for the existing script to load
          let attempts = 0;
          const maxAttempts = 50; // 10 seconds max
          
          const checkGoogle = () => {
            attempts++;
            if (window.google && window.google.maps && window.google.maps.MapTypeId) {
              console.log('✅ Google Maps API fully loaded');
              resolve();
            } else if (attempts >= maxAttempts) {
              console.error('❌ Google Maps API failed to load after 10 seconds');
              reject(new Error('Google Maps API failed to load'));
            } else {
              console.log(`⏳ Waiting for Google Maps API to load... (attempt ${attempts}/${maxAttempts})`);
              setTimeout(checkGoogle, 200);
            }
          };
          checkGoogle();
          return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&loading=async`;
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const initializeMap = async () => {
      try {
        await loadGoogleMapsScript();
        
        // Wait a bit more to ensure Google Maps is fully loaded
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if Google Maps is properly loaded
        if (!window.google || !window.google.maps) {
          throw new Error('Google Maps API not properly loaded');
        }
        
        // Initialize map centered on Bangkok
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: 13.7563, lng: 100.5018 }, // Bangkok center
          zoom: 12,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        setMapInstance(map);

        // Add click listener to map
        map.addListener('click', (event) => {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          setSelectedLocation({ lat, lng });
          updateMapMarker(lat, lng);
        });

      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initializeMap();
  }, []);

  // Handle clicks outside auto-complete dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowAutocomplete(false);
        setSelectedAutocompleteIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAutocompleteSelect = async (locationObject) => {
    setSearchQuery(locationObject.name || '');
    setSelectedLocation(locationObject);
    setShowAutocomplete(false);
    setAutocompleteResults([]);
    setSelectedAutocompleteIndex(-1);
    
    // Handle district selection
    const districtName = locationObject.name;
    const districtData = DISTRICT_DATA[districtName];
    
    if (districtData) {
      // Use district center coordinates from our data
      const districtCenters = {
        "Watthana": { lat: 13.7373, lng: 100.5608 },
        "Phra Khanong": { lat: 13.7000, lng: 100.6000 },
        "Huai Khwang": { lat: 13.7287, lng: 100.5608 },
        "Wang Thonglang": { lat: 13.8234, lng: 100.6534 },
        "Prawet": { lat: 13.7000, lng: 100.6000 },
        "Bang Khae": { lat: 13.7287, lng: 100.5347 },
        "Chatuchak": { lat: 13.8234, lng: 100.5534 },
        "Bang Kapi": { lat: 13.8234, lng: 100.6534 },
        "Khan Na Yao": { lat: 13.8234, lng: 100.6534 },
        "Phaya Thai": { lat: 13.7287, lng: 100.5608 },
        "Bang Khun Thian": { lat: 13.7287, lng: 100.5347 },
        "Thon Buri": { lat: 13.7287, lng: 100.5347 },
        "Bang Na": { lat: 13.7000, lng: 100.6000 },
        "Taling Chan": { lat: 13.7287, lng: 100.5347 },
        "Lat Phrao": { lat: 13.8133, lng: 100.7324 },
        "Thawi Watthana": { lat: 13.7287, lng: 100.5347 },
        "Yan Nawa": { lat: 13.7287, lng: 100.5347 },
        "Don Mueang": { lat: 13.9234, lng: 100.5534 },
        "Suan Luang": { lat: 13.7000, lng: 100.6000 },
        "Bang Khen": { lat: 13.8234, lng: 100.6534 },
        "Phasi Charoen": { lat: 13.7287, lng: 100.5347 },
        "Khlong Sam Wa": { lat: 13.8133, lng: 100.7324 },
        "Bueng Kum": { lat: 13.8234, lng: 100.6534 },
        "Din Daeng": { lat: 13.7287, lng: 100.5608 },
        "Sai Mai": { lat: 13.9234, lng: 100.3534 },
        "Bang Phlat": { lat: 13.7287, lng: 100.5347 },
        "Lak Si": { lat: 13.9234, lng: 100.4534 },
        "Min Buri": { lat: 13.8133, lng: 100.7324 },
        "Nong Khaem": { lat: 13.7287, lng: 100.5347 },
        "Nong Chok": { lat: 13.7000, lng: 100.6000 },
        "Bang Bon": { lat: 13.7287, lng: 100.5347 },
        "Chom Thong": { lat: 13.7287, lng: 100.5347 },
        "Bangkok Yai": { lat: 13.7287, lng: 100.5347 },
        "Lat Krabang": { lat: 13.7000, lng: 100.6000 }
      };
      
      const districtCenter = districtCenters[districtName];
      if (districtCenter) {
        console.log(`📍 Selected district: ${districtName} with coordinates:`, districtCenter);
        updateMapMarker(districtCenter.lat, districtCenter.lng);
        
        // Create a location object with district data
        const districtLocationObject = {
          ...locationObject,
          latitude: districtCenter.lat,
          longitude: districtCenter.lng,
          districtData: districtData,
          districtName: districtName // Add district name for AI valuation
        };
        
        searchProperties(districtLocationObject);
        return;
      }
    }
    
    // Fallback to original coordinates if available
    if (locationObject.latitude && locationObject.longitude) {
      updateMapMarker(locationObject.latitude, locationObject.longitude);
    }
    
    // Automatically search for properties
    searchProperties(locationObject);
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedAutocomplete(value);
  };

  const handleSearchInputKeyDown = (e) => {
    if (showAutocomplete && autocompleteResults.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedAutocompleteIndex(prev => 
          prev < autocompleteResults.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedAutocompleteIndex(prev => prev > 0 ? prev - 1 : -1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedAutocompleteIndex >= 0) {
          handleAutocompleteSelect(autocompleteResults[selectedAutocompleteIndex]);
        } else {
          handleSearch();
        }
      } else if (e.key === 'Escape') {
        setShowAutocomplete(false);
        setSelectedAutocompleteIndex(-1);
      }
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setSearchResults(null);
    setAiValuation(null);
    setApiError(null);

    try {
      // Use DDproperty location_auto_complete to get location object
      const headers = {
        "x-rapidapi-key": process.env.REACT_APP_RAPIDAPI_KEY || "REPLACE_ME",
        "x-rapidapi-host": RAPID_HOST,
      };
      const locationObject = await getDDPropertyLocationObject(searchQuery, headers);
      if (!locationObject) {
        // Use fallback coordinates and proceed with search
        console.log('⚠️ Location not found via API, using fallback coordinates');
        const fallbackLocation = {
          latitude: 13.7563,
          longitude: 100.5018,
          name: searchQuery,
          districtName: searchQuery
        };
        await searchProperties(fallbackLocation);
        setIsLoading(false);
        return;
      }
      // Optionally, update map marker if lat/lng available
      if (locationObject.latitude && locationObject.longitude) {
        setSelectedLocation({ lat: locationObject.latitude, lng: locationObject.longitude });
        updateMapMarker(locationObject.latitude, locationObject.longitude);
      }
      // Search for properties in the area
      await searchProperties(locationObject);
    } catch (error) {
      console.error('Location autocomplete error:', error);
      alert('Error finding location. Please try again.');
    }
    setIsLoading(false);
  };

  // Update searchProperties to accept locationObject
  const searchProperties = async (locationObject) => {
    // Use DDproperty API for property data
    console.log('🔍 Using DDproperty API for property data...');
    try {
      const headers = {
        "x-rapidapi-key": process.env.REACT_APP_RAPIDAPI_KEY || "REPLACE_ME",
        "x-rapidapi-host": RAPID_HOST,
      };

      // Use the provided locationObject directly
      if (!locationObject) {
        setApiError('No valid location object for DDproperty search.');
        return;
      }

      // Always send the location object as a JSON string
      const searchConfig = {
        property_type: "RESIDENTIAL",
        listing_type: "SALE",
        residential_property_type: "LAND",
        min_price: 0,
        max_price: 999999999,
        page: 1,
        location: JSON.stringify(locationObject)
      };

      console.log('🚀 Sending DDproperty API request for residential land for sale...');
      console.log('📍 Location object (sent as JSON string):', searchConfig.location);
      const url = `${RAPID_BASE}/ddproperty/properties/search`;
      const response = await axios.get(url, { headers, params: searchConfig });
      let allProperties = [];
      if (response.data && response.data.data && response.data.data.length > 0) {
        allProperties = response.data.data.map(property => ({
          ...property,
          searchType: 'RESIDENTIAL_SALE',
          propertyType: 'RESIDENTIAL',
          listingType: 'SALE'
        }));
        console.log(`✅ Found ${allProperties.length} residential land for sale properties`);
      } else {
        console.log('⚠️ No residential land for sale properties found');
      }
      if (allProperties.length > 0) {
        setSearchResults(allProperties);
        // Use lat/lng from locationObject if available
        const lat = locationObject.latitude || 13.7563;
        const lng = locationObject.longitude || 100.5018;
        // Pass district name if available in locationObject
        const districtName = locationObject.districtName || locationObject.name;
        generateAIValuation(allProperties, lat, lng, districtName);
      } else {
        const lat = locationObject.latitude || 13.7563;
        const lng = locationObject.longitude || 100.5018;
        const mockProperties = generateMockProperties(lat, lng);
        setSearchResults(mockProperties);
        // Pass district name if available in locationObject
        const districtName = locationObject.districtName || locationObject.name;
        generateAIValuation(mockProperties, lat, lng, districtName);
      }
    } catch (error) {
      const lat = locationObject.latitude || 13.7563;
      const lng = locationObject.longitude || 100.5018;
      const mockProperties = generateMockProperties(lat, lng);
      setSearchResults(mockProperties);
      // Pass district name if available in locationObject
      const districtName = locationObject.districtName || locationObject.name;
      generateAIValuation(mockProperties, lat, lng, districtName);
    }
  };

  const generateMockProperties = (lat, lng) => {
    // Generate mock properties around the selected location
    const properties = [];
    const basePrice = 150000; // Base price per wah
    
    for (let i = 0; i < 8; i++) {
      const offsetLat = (Math.random() - 0.5) * 0.01; // ~1km radius
      const offsetLng = (Math.random() - 0.5) * 0.01;
      
      properties.push({
        id: `mock-${i}`,
        title: `Land Plot ${i + 1}`,
        price: Math.round(basePrice * (0.8 + Math.random() * 0.4)), // ±20% variation
        land_size_wah: Math.round(50 + Math.random() * 200),
        location: `Near ${searchQuery}`,
        latitude: lat + offsetLat,
        longitude: lng + offsetLng,
        distance_km: Math.round((Math.random() * radius) * 10) / 10
      });
    }
    
    return properties;
  };

  const generateAIValuation = (properties, lat, lng, districtName = null) => {
    // Use the new district-based AI valuation
    // Use the provided district name or fall back to searchQuery
    const queryToUse = districtName || searchQuery;
    console.log('🔍 Generating AI valuation with:', { lat, lng, queryToUse, districtName });
    const valuation = generateAIValuationWithDistrictData(lat, lng, queryToUse, properties);
    setAiValuation(valuation);
  };



  const handleRadiusChange = (newRadius) => {
    setRadius(newRadius);
    if (selectedLocation && circle) {
      circle.setRadius(newRadius * 1000);
    }
  };

  const testAPIs = async () => {
    setIsTestingApi(true);
    setApiTestResults(null);
    
    console.log('🔧 Starting API Tests...');
    
    const results = {
      timestamp: new Date().toISOString(),
      googleMaps: null,
      ddproperty: null,
      environment: {
        rapidApiKey: process.env.REACT_APP_RAPIDAPI_KEY ? 'Set' : 'Not Set',
        googleMapsKey: GOOGLE_MAPS_API_KEY ? 'Set' : 'Not Set'
      }
    };

    // Test Google Maps API
    try {
      console.log('🗺️ Testing Google Maps API...');
      if (window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();
        const testResult = await geocoder.geocode({ address: 'Bangkok, Thailand' });
        
        results.googleMaps = {
          success: true,
          message: 'Google Maps API is working',
          data: {
            resultsCount: testResult.results.length,
            firstResult: testResult.results[0]?.formatted_address
          }
        };
        console.log('✅ Google Maps API: SUCCESS', results.googleMaps);
      } else {
        results.googleMaps = {
          success: false,
          message: 'Google Maps API not loaded'
        };
        console.log('❌ Google Maps API: FAILED - API not loaded');
      }
    } catch (error) {
      results.googleMaps = {
        success: false,
        message: error.message,
        error: error
      };
      console.log('❌ Google Maps API: ERROR', error);
    }



    // Test DDproperty API
    try {
      console.log('🏢 Testing DDproperty API...');
      const headers = {
        "x-rapidapi-key": process.env.REACT_APP_RAPIDAPI_KEY || "REPLACE_ME",
        "x-rapidapi-host": RAPID_HOST,
      };

      // Try a simple search with minimal parameters
      const testParams = {
        property_type: "RESIDENTIAL", // Required parameter
        listing_type: "SALE", // Required parameter
        residential_property_type: "LAND", // Focus on land only
        page: 1
      };

      console.log('📡 Testing DDproperty API with minimal parameters...');
      console.log('Request URL:', `${RAPID_BASE}/ddproperty/properties/search`);
      console.log('Headers:', headers);
      console.log('Params:', testParams);

      console.log('📡 DDproperty API Request:', {
        url: `${RAPID_BASE}/ddproperty/properties/search`,
        headers: { ...headers, "x-rapidapi-key": headers["x-rapidapi-key"] === "REPLACE_ME" ? "NOT_SET" : "SET" },
        params: testParams
      });

      const response = await axios.get(`${RAPID_BASE}/ddproperty/properties/search`, { 
        headers, 
        params: testParams 
      });
      
      results.ddproperty = {
        success: true,
        message: 'DDproperty API is working',
        data: {
          responseStatus: response.status,
          dataLength: response.data?.data?.length || 0,
          sampleData: response.data?.data?.slice(0, 2) || []
        }
      };
      console.log('✅ DDproperty API: SUCCESS', results.ddproperty);
    } catch (error) {
      results.ddproperty = {
        success: false,
        message: error.response?.data?.message || error.message,
        error: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        }
      };
      console.log('❌ DDproperty API: ERROR', error.response?.data || error.message);
      
      // Provide helpful error information
      if (error.response?.status === 403) {
        console.log('🔒 API Access Denied: You need to subscribe to DDproperty API on RapidAPI');
        console.log('📋 Steps to get API access:');
        console.log('1. Visit: https://rapidapi.com/realtimeapi-realtimeapi-default/api/ddproperty-realtimeapi/');
        console.log('2. Click "Subscribe to Test"');
        console.log('3. Choose a plan (Basic is usually free)');
        console.log('4. Get your API key');
        console.log('5. Create a .env file in your project root with:');
        console.log('   REACT_APP_RAPIDAPI_KEY=your_api_key_here');
        console.log('6. Restart the app');
      }
    }

    setApiTestResults(results);
    setIsTestingApi(false);
    
    console.log('📊 API Test Results:', results);
    console.log('🔧 API Testing Complete');
  };

  return (
    <div className="app">
      <div className="container">
        
        {/* --- Header --- */}
        <header className="header">
          <div className="header-content">
            <div>
              <h1>Bangkok Land Valuation AI</h1>
              <p>Search for land and get AI-powered price estimates</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setShowDemo(!showDemo)}
                className="settings-button"
                title="Autocomplete Demo"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
              >
                <Icon path="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </button>
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="settings-button"
                title="Settings & API Test"
              >
                <Icon path="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              </button>
            </div>
          </div>
        </header>

        {/* --- Search Controls --- */}
        <div className="search-controls">
          <div className="search-bar">
            <div className="search-input-container" ref={searchInputRef}>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyDown={handleSearchInputKeyDown}
                placeholder="Search for a Bangkok district (e.g., 'Bang Khen', 'Chatuchak', 'Watthana')"
                className="search-input"
                autoComplete="off"
              />
              {showAutocomplete && (
                <div className="autocomplete-dropdown">
                  {console.log('🔍 Rendering auto-complete dropdown. Loading:', isAutocompleteLoading, 'Results:', autocompleteResults.length, 'Show:', showAutocomplete, 'Results:', autocompleteResults)}
                  {isAutocompleteLoading ? (
                    <div className="autocomplete-loading">
                      <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Searching districts...</span>
                    </div>
                  ) : autocompleteResults.length > 0 ? (
                    autocompleteResults.map((suggestion, index) => (
                                              <div
                          key={suggestion.id || index}
                          className={`autocomplete-item ${index === selectedAutocompleteIndex ? 'selected' : ''}`}
                          onClick={() => handleAutocompleteSelect(suggestion)}
                          onMouseEnter={() => setSelectedAutocompleteIndex(index)}
                        >
                          <div className="autocomplete-text">
                            <span className="autocomplete-main">{suggestion.name}</span>
                            {suggestion.type && (
                              <span className="autocomplete-type">{suggestion.type}</span>
                            )}
                          </div>
                          <div className="autocomplete-description">
                            {suggestion.description}
                          </div>
                          {suggestion.coordinates && (
                            <div className="autocomplete-coords">
                              📍 {suggestion.coordinates.lat.toFixed(4)}, {suggestion.coordinates.lng.toFixed(4)}
                            </div>
                          )}
                        </div>
                    ))
                  ) : (
                    <div className="autocomplete-no-results">
                      <span>No districts found</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="search-button"
            >
              {isLoading ? (
                <>
                  <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </>
              ) : (
                <>
                  <Icon path="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  Search
                </>
              )}
            </button>
            <button
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      const lat = position.coords.latitude;
                      const lng = position.coords.longitude;
                      setSelectedLocation({ lat, lng });
                      updateMapMarker(lat, lng);
                      searchProperties({ latitude: lat, longitude: lng }); // Pass coordinates directly
                    },
                    (error) => {
                      console.error('Geolocation error:', error);
                      alert('Unable to get your location. Please enter an address manually.');
                    }
                  );
                } else {
                  alert('Geolocation is not supported by this browser.');
                }
              }}
              className="geotag-button"
              title="Use my current location"
            >
              <Icon path="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              📍
            </button>
          </div>

          <div className="search-instructions">
            <p><strong>💡 How to search:</strong></p>
            <ul>
              <li><strong>🔍 District Search:</strong> Start typing to see Bangkok district suggestions with real pricing data</li>
              <li><strong>📊 District Data:</strong> Search for Bangkok districts (Bang Khen, Chatuchak, Sukhumvit) to get accurate valuations</li>
              <li><strong>📍 Geotag:</strong> Click the location button to use your current GPS position</li>
              <li><strong>🗺️ Map Click:</strong> Click anywhere on the map to select a location</li>
              <li><strong>⌨️ Keyboard:</strong> Use arrow keys to navigate suggestions, Enter to select, Escape to close</li>
            </ul>
          </div>

          <div className="radius-control">
            <label>Search Radius: {radius}km</label>
            <input
              type="range"
              min="1"
              max="20"
              value={radius}
              onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
              className="radius-slider"
            />
            <div className="radius-labels">
              <span>1km</span>
              <span>10km</span>
              <span>20km</span>
            </div>
          </div>
          
          <div className="api-test-control">
            <button 
              onClick={testAPIs} 
              disabled={isTestingApi} 
              className="api-test-button"
              title="Test API connectivity"
            >
              {isTestingApi ? 'Testing...' : '🔧 Test API'}
            </button>
          </div>
        </div>

        {/* --- Interactive Map --- */}
        <div className="map-container">
          <div ref={mapRef} className="google-map"></div>
          {selectedLocation && selectedLocation.lat && selectedLocation.lng && (
            <div className="map-info">
              <p><strong>Selected Location:</strong></p>
              <p>Lat: {selectedLocation.lat.toFixed(6)}</p>
              <p>Lng: {selectedLocation.lng.toFixed(6)}</p>
              <p>Radius: {radius}km</p>
            </div>
          )}
        </div>

        {/* --- API Error Display --- */}
        {apiError && (
          <div className="api-error">
            <div className="api-error-content">
              <h3>🔒 API Access Required</h3>
              <p>{apiError}</p>
              <div className="api-error-solutions">
                <h4>To enable real property data:</h4>
                <ol>
                  <li>Visit <a href="https://rapidapi.com/realtimeapi-realtimeapi-default/api/ddproperty-realtimeapi/" target="_blank" rel="noopener noreferrer">DDproperty API on RapidAPI</a></li>
                  <li>Subscribe to the API (paid service)</li>
                  <li>Get your RapidAPI key</li>
                  <li>Add it to your <code>.env</code> file as <code>REACT_APP_RAPIDAPI_KEY</code></li>
                  <li>Restart the app</li>
                </ol>
                <p className="api-error-note">
                  <strong>Note:</strong> The app will continue to work with mock data for demonstration purposes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* --- Results Display --- */}
        {searchResults && (
          <div className="results-section">
            {/* AI Valuation */}
            {aiValuation && (
              <div className="ai-valuation">
                <h3>🤖 AI Land Valuation</h3>
                <div className="valuation-grid">
                  <div className="valuation-item">
                    <span className="valuation-label">Low Estimate</span>
                    <span className="valuation-value low">{formatCurrency(aiValuation.low)}/wah</span>
                  </div>
                  <div className="valuation-item">
                    <span className="valuation-label">High Estimate</span>
                    <span className="valuation-value high">{formatCurrency(aiValuation.high)}/wah</span>
                  </div>
                  <div className="valuation-item">
                    <span className="valuation-label">Confidence</span>
                    <span className={`confidence-badge ${aiValuation.confidence.toLowerCase()}`}>
                      {aiValuation.confidence}
                    </span>
                  </div>
                </div>
                <p className="ai-reasoning">{aiValuation.reasoning}</p>
                
                {/* Enhanced District Data Display */}
                {aiValuation.districtData && (
                  <div className="district-data">
                    <h4>📊 Advanced District Analysis</h4>
                    <div className="district-grid">
                      <div className="district-item">
                        <span className="district-label">District:</span>
                        <span className="district-value">{aiValuation.districtData.districtName}</span>
                      </div>
                      <div className="district-item">
                        <span className="district-label">Properties Analyzed:</span>
                        <span className="district-value">{aiValuation.districtData.data.propertyCount}</span>
                      </div>
                      <div className="district-item">
                        <span className="district-label">Avg Price/Wah:</span>
                        <span className="district-value">{formatCurrency(aiValuation.districtData.data.avgPricePerWah)}/wah</span>
                      </div>
                      <div className="district-item">
                        <span className="district-label">Median Price:</span>
                        <span className="district-value">{formatCurrency(aiValuation.districtData.data.medianPrice)}</span>
                      </div>
                      <div className="district-item">
                        <span className="district-label">Price Range:</span>
                        <span className="district-value">{formatCurrency(aiValuation.districtData.data.minPrice)} - {formatCurrency(aiValuation.districtData.data.maxPrice)}</span>
                      </div>
                      <div className="district-item">
                        <span className="district-label">Avg Property Size:</span>
                        <span className="district-value">{aiValuation.districtData.data.avgSizeWah.toFixed(0)} sq.wah ({aiValuation.districtData.data.avgSize.toFixed(0)} sqm)</span>
                      </div>
                    </div>
                    
                    {/* Market Analysis */}
                    {aiValuation.marketAnalysis && (
                      <div className="market-analysis">
                        <h5>🏆 Market Position</h5>
                        <div className="market-stats">
                          <div className="market-stat">
                            <span className="stat-label">Rank:</span>
                            <span className="stat-value">#{aiValuation.marketAnalysis.ranking.priceRank} of {aiValuation.marketAnalysis.ranking.totalDistricts}</span>
                          </div>
                          <div className="market-stat">
                            <span className="stat-label">vs City:</span>
                            <span className={`stat-value ${aiValuation.marketAnalysis.trends.vsCityAverage > 0 ? 'positive' : 'negative'}`}>
                              {aiValuation.marketAnalysis.trends.vsCityAverage > 0 ? '+' : ''}{aiValuation.marketAnalysis.trends.vsCityAverage}%
                            </span>
                          </div>
                          <div className="market-stat">
                            <span className="stat-label">Category:</span>
                            <span className={`stat-value category-${aiValuation.marketAnalysis.trends.priceCategory.toLowerCase()}`}>
                              {aiValuation.marketAnalysis.trends.priceCategory}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Proximity Data Display */}
                {aiValuation.proximityData && aiValuation.proximityData.multiplier > 1.0 && (
                  <div className="proximity-data">
                    <h4>📍 Location Premium</h4>
                    <div className="proximity-info">
                      <p><strong>Premium Applied:</strong> {((aiValuation.proximityData.multiplier - 1) * 100).toFixed(0)}% increase</p>
                      <div className="nearby-landmarks">
                        <h5>Nearby Landmarks:</h5>
                        <ul>
                          {aiValuation.proximityData.nearbyLandmarks.slice(0, 3).map((landmark, index) => (
                            <li key={index}>
                              <strong>{landmark.name}</strong> ({landmark.distance}km) - {((landmark.multiplier - 1) * 100).toFixed(0)}%
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Advanced Factor Analysis */}
                {aiValuation.advancedValuation && (
                  <AdvancedFactorAnalysis advancedValuation={aiValuation.advancedValuation} />
                )}
                
                <div className="ai-factors">
                  <h4>Analysis Factors:</h4>
                  <ul>
                    {aiValuation.factors.map((factor, index) => (
                      <li key={index}>{factor}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Property Listings */}
            <div className="property-listings">
              <h3>🏢 Properties in {radius}km Radius</h3>
              
              {/* Property Type Filters */}
              <div className="property-filters">
                <div className="filter-stats">
                  <span className="filter-stat">
                    <strong>Total:</strong> {searchResults.length} properties
                  </span>
                  <span className="filter-stat">
                    <strong>Residential:</strong> {searchResults.filter(p => p.propertyType === 'RESIDENTIAL').length}
                  </span>
                  <span className="filter-stat">
                    <strong>Commercial:</strong> {searchResults.filter(p => p.propertyType === 'COMMERCIAL').length}
                  </span>
                  <span className="filter-stat">
                    <strong>For Sale:</strong> {searchResults.filter(p => p.listingType === 'SALE').length}
                  </span>
                  <span className="filter-stat">
                    <strong>For Rent:</strong> {searchResults.filter(p => p.listingType === 'RENT').length}
                  </span>
                </div>
              </div>

              <div className="properties-grid">
                {searchResults.map((property, index) => (
                  <div key={property.id || index} className="property-card">
                    <div className="property-header">
                      <h4>{property.title || `Property ${index + 1}`}</h4>
                      <div className="property-badges">
                        <span className={`badge ${property.propertyType?.toLowerCase()}`}>
                          {property.propertyType || 'LAND'}
                        </span>
                        <span className={`badge ${property.listingType?.toLowerCase()}`}>
                          {property.listingType || 'SALE'}
                        </span>
                      </div>
                    </div>
                    <div className="property-details">
                      <p className="property-price">{formatCurrency(property.price, true)}</p>
                      <p className="property-size">{property.land_size_wah || property.size || 'N/A'} sq.wah</p>
                      <p className="property-price-per-wah">
                        {formatCurrency(property.price / (property.land_size_wah || property.size || 1))} THB/wah
                      </p>
                      <p className="property-location">{property.location || property.address || 'Location not specified'}</p>
                      {property.distance_km && (
                        <p className="property-distance">{property.distance_km}km away</p>
                      )}
                      {property.description && (
                        <p className="property-description">{property.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- Instructions --- */}
        {!searchResults && (
          <div className="instructions">
            <h3>How to use:</h3>
            <ol>
              <li>Enter an address or location in Bangkok</li>
              <li>Adjust the search radius using the slider (default: 5km)</li>
              <li>Click on the map to select a specific location</li>
              <li>View AI-powered land valuations and nearby properties</li>
            </ol>
          </div>
        )}

        {/* --- Settings Modal --- */}
        {showSettings && (
          <div className="settings-modal">
            <div className="settings-content">
              <div className="settings-header">
                <h2>🔧 Settings & API Test</h2>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="close-button"
                >
                  <Icon path="M6 18L18 6M6 6l12 12" />
                </button>
              </div>

              <div className="settings-section">
                <h3>🌐 Environment Variables</h3>
                <div className="env-vars">
                  <div className="env-var">
                    <span className="env-label">Google Maps API Key:</span>
                    <span className={`env-value ${GOOGLE_MAPS_API_KEY ? 'set' : 'not-set'}`}>
                      {GOOGLE_MAPS_API_KEY ? '✅ Set' : '❌ Not Set'}
                    </span>
                  </div>
                  <div className="env-var">
                    <span className="env-label">RapidAPI Key:</span>
                    <span className={`env-value ${process.env.REACT_APP_RAPIDAPI_KEY ? 'set' : 'not-set'}`}>
                      {process.env.REACT_APP_RAPIDAPI_KEY ? '✅ Set' : '❌ Not Set'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h3>🧪 API Testing</h3>
                <button 
                  onClick={testAPIs}
                  disabled={isTestingApi}
                  className="test-api-button"
                >
                  {isTestingApi ? (
                    <>
                      <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Testing APIs...
                    </>
                  ) : (
                    <>
                      <Icon path="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 002 2z" />
                      Test All APIs
                    </>
                  )}
                </button>

                {apiTestResults && (
                  <div className="api-test-results">
                    <h4>📊 Test Results ({new Date(apiTestResults.timestamp).toLocaleTimeString()})</h4>
                    
                    {/* Google Maps Test */}
                    <div className={`test-result ${apiTestResults.googleMaps?.success ? 'success' : 'error'}`}>
                      <h5>🗺️ Google Maps API</h5>
                      <p><strong>Status:</strong> {apiTestResults.googleMaps?.success ? '✅ Success' : '❌ Failed'}</p>
                      <p><strong>Message:</strong> {apiTestResults.googleMaps?.message}</p>
                      {apiTestResults.googleMaps?.data && (
                        <div className="test-data">
                          <p><strong>Results:</strong> {apiTestResults.googleMaps.data.resultsCount}</p>
                          <p><strong>Sample:</strong> {apiTestResults.googleMaps.data.firstResult}</p>
                        </div>
                      )}
                    </div>

                    {/* DDproperty Test */}
                    <div className={`test-result ${apiTestResults.ddproperty?.success ? 'success' : 'error'}`}>
                      <h5>🏢 DDproperty API</h5>
                      <p><strong>Status:</strong> {apiTestResults.ddproperty?.success ? '✅ Success' : '❌ Failed'}</p>
                      <p><strong>Message:</strong> {apiTestResults.ddproperty?.message}</p>
                      {apiTestResults.ddproperty?.data && (
                        <div className="test-data">
                          <p><strong>Status Code:</strong> {apiTestResults.ddproperty.data.responseStatus}</p>
                          <p><strong>Data Count:</strong> {apiTestResults.ddproperty.data.dataLength}</p>
                        </div>
                      )}
                      {apiTestResults.ddproperty?.error && (
                        <div className="test-error">
                          <p><strong>Error Status:</strong> {apiTestResults.ddproperty.error.status}</p>
                          <p><strong>Error Message:</strong> {apiTestResults.ddproperty.error.statusText}</p>
                        </div>
                      )}
                    </div>

                    <div className="console-info">
                      <p>💡 Check browser console for detailed debug information</p>
                      <button 
                        onClick={() => console.log('📊 Full API Test Results:', apiTestResults)}
                        className="console-button"
                      >
                        Log Results to Console
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="settings-section">
                <DataStatus />
              </div>
              
              <div className="settings-section">
                <DistrictStats />
              </div>

              <div className="settings-section">
                <h3>📋 Setup Instructions</h3>
                <div className="setup-instructions">
                  <h4>To enable real API data:</h4>
                  <ol>
                    <li>Create a <code>.env</code> file in the project root</li>
                    <li>Add your RapidAPI key: <code>REACT_APP_RAPIDAPI_KEY=your_key_here</code></li>
                    <li>Restart the development server</li>
                    <li>Click "Test All APIs" to verify</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- Demo Modal --- */}
        {showDemo && (
          <div className="settings-modal">
            <div className="settings-content">
              <div className="settings-header">
                <h2>🔍 Autocomplete Demo</h2>
                <button 
                  onClick={() => setShowDemo(false)}
                  className="close-button"
                >
                  <Icon path="M6 18L18 6M6 6l12 12" />
                </button>
              </div>
              <div className="settings-section">
                <AutocompleteDemo />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
