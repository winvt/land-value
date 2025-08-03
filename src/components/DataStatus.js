import React, { useState, useEffect } from 'react';
import { loadCSVData } from '../services/csvDataProcessor';

const DataStatus = () => {
  const [dataStatus, setDataStatus] = useState({
    loaded: false,
    loading: true,
    error: null,
    stats: null,
    debug: null
  });

  useEffect(() => {
    const checkDataStatus = async () => {
      try {
        setDataStatus(prev => ({ ...prev, loading: true }));
        
        const data = await loadCSVData();
        
        if (data) {
          // Debug: Show sample data
          const sampleDistricts = Object.entries(data.districtData).slice(0, 3);
          const debug = {
            sampleDistricts,
            marketStats: data.marketInsights.marketStats,
            totalDistricts: Object.keys(data.districtData).length,
            totalProperties: Object.values(data.districtData).reduce((sum, d) => sum + d.propertyCount, 0),
            districtsWithDetailedData: Object.values(data.districtData).filter(d => d.hasDetailedData).length,
            districtsWithAverageData: Object.values(data.districtData).filter(d => d.hasAverageData).length
          };
          
          const stats = {
            totalDistricts: Object.keys(data.districtData).length,
            totalProperties: Object.values(data.districtData).reduce((sum, d) => sum + d.propertyCount, 0),
            marketStats: data.marketInsights.marketStats,
            topDistricts: Object.entries(data.districtData)
              .sort(([,a], [,b]) => b.avgPricePerWah - a.avgPricePerWah)
              .slice(0, 5)
              .map(([name, data]) => ({
                name,
                avgPricePerWah: data.avgPricePerWah,
                propertyCount: data.propertyCount,
                dataQuality: data.hasDetailedData ? 'High' : 'Medium'
              }))
          };
          
          setDataStatus({
            loaded: true,
            loading: false,
            error: null,
            stats,
            debug
          });
        } else {
          setDataStatus({
            loaded: false,
            loading: false,
            error: 'Failed to load CSV data',
            stats: null,
            debug: null
          });
        }
      } catch (error) {
        setDataStatus({
          loaded: false,
          loading: false,
          error: error.message,
          stats: null,
          debug: null
        });
      }
    };

    checkDataStatus();
  }, []);

  if (dataStatus.loading) {
    return (
      <div className="data-status">
        <div className="status-loading">
          <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading merged market data...</span>
        </div>
      </div>
    );
  }

  if (dataStatus.error) {
    return (
      <div className="data-status">
        <div className="status-error">
          <span>❌ Error loading data: {dataStatus.error}</span>
        </div>
      </div>
    );
  }

  if (!dataStatus.loaded || !dataStatus.stats) {
    return (
      <div className="data-status">
        <div className="status-error">
          <span>❌ No data available</span>
        </div>
      </div>
    );
  }

  const { stats, debug } = dataStatus;
  const formatCurrency = (value) => {
    // Handle NaN and invalid values
    if (!value || isNaN(value) || value === 0) {
      return 'N/A';
    }
    
    // Format as full number with commas
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <div className="data-status">
      <div className="status-success">
        <h4>✅ Merged Market Data Loaded</h4>
        <div className="data-stats">
          <div className="stat-item">
            <span className="stat-label">Districts:</span>
            <span className="stat-value">{stats.totalDistricts}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Properties:</span>
            <span className="stat-value">{stats.totalProperties}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">City Average:</span>
            <span className="stat-value">{formatCurrency(stats.marketStats.cityAverage)}/wah</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Price Range:</span>
            <span className="stat-value">{formatCurrency(stats.marketStats.cityMin)} - {formatCurrency(stats.marketStats.cityMax)}/wah</span>
          </div>
        </div>
        
        <div className="data-quality">
          <h5>📊 Data Quality:</h5>
          <div className="quality-stats">
            <div className="quality-item">
              <span className="quality-label">High Quality (Detailed):</span>
              <span className="quality-value">{debug.districtsWithDetailedData} districts</span>
            </div>
            <div className="quality-item">
              <span className="quality-label">Medium Quality (Average):</span>
              <span className="quality-value">{debug.districtsWithAverageData} districts</span>
            </div>
          </div>
        </div>
        
        <div className="top-districts">
          <h5>🏆 Top 5 Districts by Price/Wah:</h5>
          <div className="district-list">
            {stats.topDistricts.map((district, index) => (
              <div key={district.name} className="district-item">
                <span className="district-rank">#{index + 1}</span>
                <span className="district-name">{district.name}</span>
                <span className="district-price">{formatCurrency(district.avgPricePerWah)}/wah</span>
                <span className="district-count">({district.propertyCount} properties)</span>
                <span className={`district-quality ${district.dataQuality.toLowerCase()}`}>{district.dataQuality}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Debug Information */}
        {debug && (
          <div className="debug-info">
            <h5>🔍 Debug Information:</h5>
            <div className="debug-stats">
              <div className="debug-item">
                <span className="debug-label">Sample Districts:</span>
                <div className="debug-content">
                  {debug.sampleDistricts.map(([name, data]) => (
                    <div key={name} className="debug-district">
                      <strong>{name}:</strong> {data.propertyCount} properties, 
                      Avg: {formatCurrency(data.avgPricePerWah)}/wah, 
                      Range: {formatCurrency(data.minPricePerWah)}-{formatCurrency(data.maxPricePerWah)}/wah,
                      Quality: {data.hasDetailedData ? 'High' : 'Medium'}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataStatus; 