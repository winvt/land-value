import React, { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';

// API Configuration
const RAPID_HOST = "ddproperty-realtimeapi.p.rapidapi.com";
const RAPID_BASE = `https://${RAPID_HOST}`;

// Auto-complete function
async function getAutocompleteSuggestions(query, headers) {
  try {
    if (!query.trim() || query.length < 2) {
      return [];
    }
    
    // Check if API key is set
    if (!headers["x-rapidapi-key"] || headers["x-rapidapi-key"] === "REPLACE_ME") {
      console.log('⚠️ No RapidAPI key set, using mock suggestions');
      return getMockAutocompleteSuggestions(query);
    }
    
    console.log('🔍 Getting auto-complete suggestions for:', query);
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
    
    if (response.data && response.data.data) {
      console.log('✅ Auto-complete suggestions:', response.data.data);
      return response.data.data.slice(0, 5); // Limit to 5 suggestions
    }
    return [];
  } catch (error) {
    console.error('Error fetching auto-complete suggestions:', error);
    return getMockAutocompleteSuggestions(query);
  }
}

// Mock auto-complete suggestions
function getMockAutocompleteSuggestions(query) {
  console.log('🎭 Getting mock suggestions for query:', query);
  const mockSuggestions = [
    {
      objectId: 'TH1010',
      objectType: 'DISTRICT',
      displayText: 'Min Buri',
      displayType: 'District',
      displayDescription: 'Bangkok',
      latitude: 13.8133,
      longitude: 100.7324
    },
    {
      objectId: 'TH101001',
      objectType: 'AREA',
      displayText: 'Min Buri',
      displayType: 'Area',
      displayDescription: 'Min Buri, Bangkok',
      latitude: 13.8133,
      longitude: 100.7324
    },
    {
      objectId: 'TH101002',
      objectType: 'AREA',
      displayText: 'Saen Sab',
      displayType: 'Area',
      displayDescription: 'Min Buri, Bangkok',
      latitude: 13.8133,
      longitude: 100.7324
    },
    {
      objectId: 'TH101003',
      objectType: 'AREA',
      displayText: 'Khlong Sam Wa',
      displayType: 'Area',
      displayDescription: 'Min Buri, Bangkok',
      latitude: 13.8133,
      longitude: 100.7324
    },
    {
      objectId: 'TH101004',
      objectType: 'AREA',
      displayText: 'Lam Pla Thio',
      displayType: 'Area',
      displayDescription: 'Min Buri, Bangkok',
      latitude: 13.8133,
      longitude: 100.7324
    },
    {
      objectId: 'TH1011',
      objectType: 'DISTRICT',
      displayText: 'Lat Krabang',
      displayType: 'District',
      displayDescription: 'Bangkok',
      latitude: 13.7234,
      longitude: 100.7534
    },
    {
      objectId: 'TH1012',
      objectType: 'DISTRICT',
      displayText: 'Suan Luang',
      displayType: 'District',
      displayDescription: 'Bangkok',
      latitude: 13.7234,
      longitude: 100.7534
    },
    {
      objectId: 'TH1013',
      objectType: 'DISTRICT',
      displayText: 'Prawet',
      displayType: 'District',
      displayDescription: 'Bangkok',
      latitude: 13.7234,
      longitude: 100.7534
    },
    {
      objectId: 'TH1014',
      objectType: 'DISTRICT',
      displayText: 'Bang Kapi',
      displayType: 'District',
      displayDescription: 'Bangkok',
      latitude: 13.7234,
      longitude: 100.7534
    },
    {
      objectId: 'TH1015',
      objectType: 'DISTRICT',
      displayText: 'Huai Khwang',
      displayType: 'District',
      displayDescription: 'Bangkok',
      latitude: 13.7234,
      longitude: 100.7534
    },
    {
      objectId: 'TH1016',
      objectType: 'DISTRICT',
      displayText: 'Bang Khen',
      displayType: 'District',
      displayDescription: 'Bangkok',
      latitude: 13.8234,
      longitude: 100.6534
    },
    {
      objectId: 'TH1017',
      objectType: 'DISTRICT',
      displayText: 'Don Mueang',
      displayType: 'District',
      displayDescription: 'Bangkok',
      latitude: 13.9234,
      longitude: 100.5534
    },
    {
      objectId: 'TH1018',
      objectType: 'DISTRICT',
      displayText: 'Chatuchak',
      displayType: 'District',
      displayDescription: 'Bangkok',
      latitude: 13.8234,
      longitude: 100.5534
    },
    {
      objectId: 'TH1019',
      objectType: 'DISTRICT',
      displayText: 'Lak Si',
      displayType: 'District',
      displayDescription: 'Bangkok',
      latitude: 13.9234,
      longitude: 100.4534
    },
    {
      objectId: 'TH1020',
      objectType: 'DISTRICT',
      displayText: 'Sai Mai',
      displayType: 'District',
      displayDescription: 'Bangkok',
      latitude: 13.9234,
      longitude: 100.3534
    }
  ];
  
  // Filter mock suggestions based on query
  const filtered = mockSuggestions.filter(suggestion => 
    suggestion.displayText.toLowerCase().includes(query.toLowerCase()) ||
    suggestion.displayDescription.toLowerCase().includes(query.toLowerCase()) ||
    suggestion.displayType.toLowerCase().includes(query.toLowerCase())
  );
  
  console.log('🎭 Mock auto-complete suggestions:', filtered);
  return filtered;
}

const AutocompleteInput = ({ 
  placeholder = "Enter location...",
  onLocationSelect = () => {},
  className = "",
  style = {}
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState(process.env.REACT_APP_RAPIDAPI_KEY || "REPLACE_ME");
  
  const timeoutRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Debounced auto-complete search
  const debouncedSearch = useCallback((searchQuery) => {
    console.log('🔍 Debounced search called with:', searchQuery);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(async () => {
      console.log('⚡ Executing search for:', searchQuery);
      if (searchQuery.trim().length >= 2) {
        setIsLoading(true);
        
        const headers = {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": RAPID_HOST,
        };
        
        console.log('🔑 API Key status:', apiKey === "REPLACE_ME" ? "Using mock data" : "Using real API");
        const results = await getAutocompleteSuggestions(searchQuery, headers);
        console.log('📋 Search results:', results);
        setSuggestions(results);
        setShowDropdown(results.length > 0);
        setSelectedIndex(-1);
        setIsLoading(false);
      } else {
        console.log('❌ Query too short, clearing suggestions');
        setSuggestions([]);
        setShowDropdown(false);
        setIsLoading(false);
      }
    }, 300);
  }, [apiKey]);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (showDropdown && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setQuery(suggestion.displayText || suggestion.name || '');
    setShowDropdown(false);
    setSelectedIndex(-1);
    onLocationSelect(suggestion);
  };

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target) &&
          dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="autocomplete-container" style={{ position: 'relative', ...style }}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`autocomplete-input ${className}`}
        autoComplete="off"
        style={{
          width: '100%',
          padding: '12px 16px',
          border: '2px solid #e2e8f0',
          borderRadius: '8px',
          fontSize: '16px',
          outline: 'none',
          transition: 'all 0.2s',
          backgroundColor: '#f8fafc'
        }}
      />
      
      {showDropdown && (
        <div 
          ref={dropdownRef}
          className="autocomplete-dropdown"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '2px solid #3b82f6',
            borderTop: 'none',
            borderRadius: '0 0 8px 8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            maxHeight: '300px',
            overflowY: 'auto'
          }}
        >
          {isLoading ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              color: '#6b7280',
              fontSize: '14px'
            }}>
              <svg className="spinner" style={{ width: '16px', height: '16px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Searching locations...</span>
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <div
                key={suggestion.objectId || index}
                className={`autocomplete-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => handleSuggestionSelect(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  borderBottom: '1px solid #f1f5f9',
                  backgroundColor: index === selectedIndex ? '#f0f9ff' : 'transparent'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '4px'
                }}>
                  <span style={{
                    fontWeight: '600',
                    color: '#1e293b',
                    fontSize: '14px'
                  }}>
                    {suggestion.displayText || suggestion.name}
                  </span>
                  {suggestion.objectType && (
                    <span style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      backgroundColor: '#f3f4f6',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {suggestion.objectType}
                    </span>
                  )}
                </div>
                {suggestion.latitude && suggestion.longitude && (
                  <div style={{
                    fontSize: '12px',
                    color: '#9ca3af',
                    fontFamily: 'monospace'
                  }}>
                    📍 {suggestion.latitude.toFixed(4)}, {suggestion.longitude.toFixed(4)}
                  </div>
                )}
                {suggestion.displayDescription && (
                  <div style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginTop: '2px'
                  }}>
                    {suggestion.displayDescription}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{
              padding: '16px',
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '14px',
              fontStyle: 'italic'
            }}>
              No locations found
            </div>
          )}
        </div>
      )}
      
             <style>{`
         .autocomplete-input:focus {
           border-color: #3b82f6 !important;
           box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
           background-color: white !important;
         }
         
         .spinner {
           animation: spin 1s linear infinite;
         }
         
         @keyframes spin {
           from { transform: rotate(0deg); }
           to { transform: rotate(360deg); }
         }
       `}</style>
    </div>
  );
};

export default AutocompleteInput; 