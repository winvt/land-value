import React, { useState, useMemo } from 'react';
import { DISTRICT_DATA, calculateMarketStats, calculateDistrictRanking, calculateMarketTrends } from '../services/districtDataService';

// Helper function for simplified currency formatting
const formatCurrency = (value) => {
  if (value >= 1000000) {
    const millions = (value / 1000000).toFixed(1);
    return `${millions}M`;
  } else if (value >= 1000) {
    const thousands = (value / 1000).toFixed(0);
    return `${thousands}K`;
  } else {
    return new Intl.NumberFormat('en-US').format(value);
  }
};

const DistrictStats = () => {
  const [sortBy, setSortBy] = useState('avgPricePerWah');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const marketStats = useMemo(() => calculateMarketStats(), []);

  const allDistricts = useMemo(() => {
    return Object.entries(DISTRICT_DATA).map(([name, data]) => {
      const ranking = calculateDistrictRanking(name);
      const trends = calculateMarketTrends(data);
      
      return {
        name,
        ...data,
        ranking,
        trends,
        priceCategory: trends.priceCategory
      };
    });
  }, []);

  const filteredAndSortedDistricts = useMemo(() => {
    let filtered = allDistricts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(district => 
        district.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(district => district.priceCategory === filterCategory);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'propertyCount':
          aValue = a.propertyCount;
          bValue = b.propertyCount;
          break;
        case 'avgPricePerWah':
          aValue = a.avgPricePerWah;
          bValue = b.avgPricePerWah;
          break;
        case 'medianPrice':
          aValue = a.medianPrice;
          bValue = b.medianPrice;
          break;
        case 'avgSizeWah':
          aValue = a.avgSizeWah;
          bValue = b.avgSizeWah;
          break;
        case 'ranking':
          aValue = a.ranking.priceRank;
          bValue = b.ranking.priceRank;
          break;
        case 'vsCityAverage':
          aValue = parseFloat(a.trends.vsCityAverage);
          bValue = parseFloat(b.trends.vsCityAverage);
          break;
        default:
          aValue = a.avgPricePerWah;
          bValue = b.avgPricePerWah;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [allDistricts, sortBy, sortOrder, filterCategory, searchTerm]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Premium': return '#ff6b6b';
      case 'Mid-Range': return '#4ecdc4';
      case 'Affordable': return '#45b7d1';
      case 'Budget': return '#96ceb4';
      default: return '#ddd';
    }
  };

  const getVsCityColor = (value) => {
    const numValue = parseFloat(value);
    if (numValue > 50) return '#ff6b6b';
    if (numValue > 0) return '#4ecdc4';
    if (numValue > -50) return '#45b7d1';
    return '#96ceb4';
  };

  return (
    <div className="district-stats-container">
      <h2>📊 All Bangkok Districts Analysis</h2>
      
      {/* Summary Stats */}
      <div className="summary-stats">
        <div className="stat-card">
          <h3>Total Districts</h3>
          <span className="stat-value">{allDistricts.length}</span>
        </div>
        <div className="stat-card">
          <h3>City Average</h3>
          <span className="stat-value">{formatCurrency(marketStats.cityAverage)}/wah</span>
        </div>
        <div className="stat-card">
          <h3>City Median</h3>
          <span className="stat-value">{formatCurrency(marketStats.cityMedian)}/wah</span>
        </div>
        <div className="stat-card">
          <h3>Price Range</h3>
          <span className="stat-value">{formatCurrency(marketStats.cityMin)} - {formatCurrency(marketStats.cityMax)}/wah</span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search districts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterCategory === 'all' ? 'active' : ''}`}
            onClick={() => setFilterCategory('all')}
          >
            All ({allDistricts.length})
          </button>
          <button
            className={`filter-btn ${filterCategory === 'Premium' ? 'active' : ''}`}
            onClick={() => setFilterCategory('Premium')}
          >
            Premium ({allDistricts.filter(d => d.priceCategory === 'Premium').length})
          </button>
          <button
            className={`filter-btn ${filterCategory === 'Mid-Range' ? 'active' : ''}`}
            onClick={() => setFilterCategory('Mid-Range')}
          >
            Mid-Range ({allDistricts.filter(d => d.priceCategory === 'Mid-Range').length})
          </button>
          <button
            className={`filter-btn ${filterCategory === 'Affordable' ? 'active' : ''}`}
            onClick={() => setFilterCategory('Affordable')}
          >
            Affordable ({allDistricts.filter(d => d.priceCategory === 'Affordable').length})
          </button>
          <button
            className={`filter-btn ${filterCategory === 'Budget' ? 'active' : ''}`}
            onClick={() => setFilterCategory('Budget')}
          >
            Budget ({allDistricts.filter(d => d.priceCategory === 'Budget').length})
          </button>
        </div>
      </div>

      {/* Districts Table */}
      <div className="table-container">
        <table className="districts-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} className="sortable">
                District {getSortIcon('name')}
              </th>
              <th onClick={() => handleSort('propertyCount')} className="sortable">
                Properties {getSortIcon('propertyCount')}
              </th>
              <th onClick={() => handleSort('avgPricePerWah')} className="sortable">
                Avg Price/Wah {getSortIcon('avgPricePerWah')}
              </th>
              <th onClick={() => handleSort('medianPrice')} className="sortable">
                Median Price {getSortIcon('medianPrice')}
              </th>
              <th onClick={() => handleSort('avgSizeWah')} className="sortable">
                Avg Size (sq.wah) {getSortIcon('avgSizeWah')}
              </th>
              <th onClick={() => handleSort('ranking')} className="sortable">
                Price Rank {getSortIcon('ranking')}
              </th>
              <th onClick={() => handleSort('vsCityAverage')} className="sortable">
                vs City Avg {getSortIcon('vsCityAverage')}
              </th>
              <th>Category</th>
              <th>Price Range</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedDistricts.map((district) => (
              <tr key={district.name}>
                <td className="district-name">{district.name}</td>
                <td className="property-count">{district.propertyCount}</td>
                <td className="avg-price">
                  <strong>{formatCurrency(district.avgPricePerWah)}/wah</strong>
                </td>
                <td className="median-price">{formatCurrency(district.medianPrice)}</td>
                <td className="avg-size">{district.avgSizeWah.toFixed(0)}</td>
                <td className="price-rank">
                  #{district.ranking.priceRank} of {district.ranking.totalDistricts}
                </td>
                <td 
                  className="vs-city"
                  style={{ color: getVsCityColor(district.trends.vsCityAverage) }}
                >
                  {district.trends.vsCityAverage > 0 ? '+' : ''}{district.trends.vsCityAverage}%
                </td>
                <td>
                  <span 
                    className="category-badge"
                    style={{ backgroundColor: getCategoryColor(district.priceCategory) }}
                  >
                    {district.priceCategory}
                  </span>
                </td>
                <td className="price-range">
                  {formatCurrency(district.minPrice)} - {formatCurrency(district.maxPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Category Breakdown */}
      <div className="category-breakdown">
        <h3>📈 Market Category Breakdown</h3>
        <div className="category-stats">
          {['Premium', 'Mid-Range', 'Affordable', 'Budget'].map(category => {
            const districts = allDistricts.filter(d => d.priceCategory === category);
            const avgPrice = districts.reduce((sum, d) => sum + d.avgPricePerWah, 0) / districts.length;
            
            return (
              <div key={category} className="category-stat">
                <h4 style={{ color: getCategoryColor(category) }}>{category}</h4>
                <p>{districts.length} districts</p>
                <p>Avg: {formatCurrency(avgPrice)}/wah</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DistrictStats; 