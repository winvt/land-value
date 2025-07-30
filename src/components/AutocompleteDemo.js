import React, { useState } from 'react';
import AutocompleteInput from './AutocompleteInput';

const AutocompleteDemo = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    console.log('📍 Selected location:', location);
  };

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '50px auto', 
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        color: '#1e293b',
        marginBottom: '30px'
      }}>
        🗺️ Location Autocomplete Demo
      </h1>
      
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#374151', marginBottom: '10px' }}>
          Try typing a location in Bangkok:
        </h3>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
          Examples: "Min Buri", "Lat Krabang", "Suan Luang", "Prawet", "Bang Kapi"
        </p>
        
        <AutocompleteInput
          placeholder="Enter a location in Bangkok..."
          onLocationSelect={handleLocationSelect}
          style={{ marginBottom: '20px' }}
        />
      </div>

      {selectedLocation && (
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '20px',
          marginTop: '20px'
        }}>
          <h3 style={{ color: '#1e293b', marginBottom: '15px' }}>
            ✅ Selected Location
          </h3>
          
          <div style={{ display: 'grid', gap: '10px' }}>
            <div>
              <strong style={{ color: '#374151' }}>Name:</strong>
              <span style={{ marginLeft: '10px', color: '#6b7280' }}>
                {selectedLocation.displayText || selectedLocation.name}
              </span>
            </div>
            
            <div>
              <strong style={{ color: '#374151' }}>Type:</strong>
              <span style={{ 
                marginLeft: '10px', 
                backgroundColor: '#f3f4f6',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                textTransform: 'uppercase',
                color: '#6b7280'
              }}>
                {selectedLocation.objectType}
              </span>
            </div>
            
            {selectedLocation.displayDescription && (
              <div>
                <strong style={{ color: '#374151' }}>Description:</strong>
                <span style={{ marginLeft: '10px', color: '#6b7280' }}>
                  {selectedLocation.displayDescription}
                </span>
              </div>
            )}
            
            {selectedLocation.latitude && selectedLocation.longitude && (
              <div>
                <strong style={{ color: '#374151' }}>Coordinates:</strong>
                <span style={{ 
                  marginLeft: '10px', 
                  color: '#9ca3af',
                  fontFamily: 'monospace',
                  fontSize: '14px'
                }}>
                  📍 {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                </span>
              </div>
            )}
            
            <div>
              <strong style={{ color: '#374151' }}>Object ID:</strong>
              <span style={{ marginLeft: '10px', color: '#6b7280', fontFamily: 'monospace' }}>
                {selectedLocation.objectId}
              </span>
            </div>
          </div>
        </div>
      )}

      <div style={{
        background: '#f0f9ff',
        border: '1px solid #bae6fd',
        borderRadius: '8px',
        padding: '20px',
        marginTop: '30px'
      }}>
        <h3 style={{ color: '#0369a1', marginBottom: '15px' }}>
          💡 Features
        </h3>
        <ul style={{ color: '#0369a1', fontSize: '14px', lineHeight: '1.6' }}>
          <li>🔍 <strong>Real-time search:</strong> Type to see location suggestions</li>
          <li>⌨️ <strong>Keyboard navigation:</strong> Use arrow keys, Enter, Escape</li>
          <li>🖱️ <strong>Mouse interaction:</strong> Hover and click to select</li>
          <li>📱 <strong>Responsive design:</strong> Works on mobile and desktop</li>
          <li>🎭 <strong>Fallback data:</strong> Works without API key using mock data</li>
          <li>⚡ <strong>Debounced search:</strong> 300ms delay to avoid excessive API calls</li>
        </ul>
      </div>

      <div style={{
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        padding: '20px',
        marginTop: '20px'
      }}>
        <h3 style={{ color: '#991b1b', marginBottom: '15px' }}>
          🔧 Setup Instructions
        </h3>
        <ol style={{ color: '#991b1b', fontSize: '14px', lineHeight: '1.6' }}>
          <li>Create a <code style={{ background: '#f1f5f9', padding: '2px 4px', borderRadius: '3px' }}>.env</code> file in your project root</li>
          <li>Add your RapidAPI key: <code style={{ background: '#f1f5f9', padding: '2px 4px', borderRadius: '3px' }}>REACT_APP_RAPIDAPI_KEY=your_key_here</code></li>
          <li>Get your API key from <a href="https://rapidapi.com/realtimeapi-realtimeapi-default/api/ddproperty-realtimeapi/" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>DDproperty API on RapidAPI</a></li>
          <li>Restart your development server</li>
        </ol>
      </div>
    </div>
  );
};

export default AutocompleteDemo; 