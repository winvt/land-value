// District Data Service for AI Valuation with Real CSV Data
// This service provides district-based pricing data and proximity multipliers using real market data

import { loadCSVData } from './csvDataProcessor.js';
import { calculateAdvancedValuation } from './advancedValuationService.js';

// Helper function for simplified currency formatting
function formatCurrency(value) {
  // Ensure value is a number
  const numValue = Number(value);
  
  // Debug the formatting
  console.log('🔍 FormatCurrency Debug:', { value, numValue, type: typeof numValue });
  
  // Format as full number with commas
  return new Intl.NumberFormat('en-US').format(numValue);
}

// Global variables to store processed data
let DISTRICT_DATA = {};
let MARKET_INSIGHTS = null;
let CSV_DATA_LOADED = false;

// Load CSV data on module initialization
async function initializeData() {
  if (CSV_DATA_LOADED) return;
  
  try {
    const data = await loadCSVData();
    if (data) {
      DISTRICT_DATA = data.districtData;
      MARKET_INSIGHTS = data.marketInsights;
      CSV_DATA_LOADED = true;
      
      console.log('✅ CSV Data loaded successfully:', {
        districts: Object.keys(DISTRICT_DATA).length,
        totalProperties: Object.values(DISTRICT_DATA).reduce((sum, d) => sum + d.propertyCount, 0),
        marketStats: MARKET_INSIGHTS.marketStats
      });
    }
  } catch (error) {
    console.error('❌ Error loading CSV data:', error);
    // Fallback to placeholder data if CSV loading fails
    loadPlaceholderData();
  }
}

// Fallback placeholder data (simplified version)
function loadPlaceholderData() {
  DISTRICT_DATA = {
    "Watthana": {
      propertyCount: 5,
      avgPrice: 200000000,
      medianPrice: 140000000,
      minPrice: 19800000,
      maxPrice: 405000000,
      avgSize: 864,
      avgSizeWah: 216,
      avgPricePerSQM: 231413,
      avgPricePerWah: 925652
    },
    "Phra Khanong": {
      propertyCount: 8,
      avgPrice: 200000000,
      medianPrice: 33000000,
      minPrice: 4400000,
      maxPrice: 990000000,
      avgSize: 2000,
      avgSizeWah: 500,
      avgPricePerSQM: 100000,
      avgPricePerWah: 400000
    }
  };
  
  MARKET_INSIGHTS = {
    marketStats: {
      cityAverage: 662826,
      cityMedian: 662826,
      cityMin: 400000,
      cityMax: 925652,
      totalDistricts: 2,
      totalProperties: 13
    },
    districtRankings: {
      "Watthana": {
        priceRank: 1,
        totalDistricts: 2,
        percentile: "100.0",
        vsCityAverage: "39.6",
        vsCityMedian: "39.6",
        priceCategory: "Premium"
      },
      "Phra Khanong": {
        priceRank: 2,
        totalDistricts: 2,
        percentile: "50.0",
        vsCityAverage: "-39.6",
        vsCityMedian: "-39.6",
        priceCategory: "Affordable"
      }
    }
  };
}

// Enhanced market analysis functions using real data
function calculateMarketStats() {
  if (!MARKET_INSIGHTS) return null;
  return MARKET_INSIGHTS.marketStats;
}

function calculateDistrictRanking(districtName) {
  if (!MARKET_INSIGHTS || !MARKET_INSIGHTS.districtRankings[districtName]) {
    return {
      priceRank: 1,
      totalDistricts: 1,
      percentile: "100.0"
    };
  }
  
  return MARKET_INSIGHTS.districtRankings[districtName];
}

function calculateMarketTrends(districtData) {
  if (!MARKET_INSIGHTS || !MARKET_INSIGHTS.districtRankings[districtData.districtName]) {
    return {
      vsCityAverage: "0.0",
      vsCityMedian: "0.0",
      marketPosition: 'Average',
      priceCategory: 'Mid-Range'
    };
  }
  
  const ranking = MARKET_INSIGHTS.districtRankings[districtData.districtName];
  
  return {
    vsCityAverage: ranking.vsCityAverage,
    vsCityMedian: ranking.vsCityMedian,
    marketPosition: parseFloat(ranking.vsCityAverage) > 0 ? 'Above Average' : 'Below Average',
    priceCategory: ranking.priceCategory
  };
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Enhanced proximity analysis with weighted scoring
function getEnhancedProximityMultiplier(lat, lng) {
  let totalScore = 0;
  let nearbyLandmarks = [];
  let maxMultiplier = 1.0;
  
  // Enhanced landmark categories with different weights
  const landmarkCategories = {
    'transportation': { weight: 0.3, maxMultiplier: 1.25 },
    'shopping': { weight: 0.2, maxMultiplier: 1.15 },
    'tourism': { weight: 0.15, maxMultiplier: 1.10 },
    'business': { weight: 0.25, maxMultiplier: 1.20 },
    'education': { weight: 0.1, maxMultiplier: 1.05 }
  };
  
  // Categorized landmarks
  const categorizedLandmarks = {
    "Suvarnabhumi Airport": { lat: 13.6900, lng: 100.7501, category: 'transportation' },
    "Don Mueang Airport": { lat: 13.9126, lng: 100.6068, category: 'transportation' },
    "BTS Siam": { lat: 13.7456, lng: 100.5347, category: 'transportation' },
    "BTS Asok": { lat: 13.7373, lng: 100.5608, category: 'transportation' },
    "CentralWorld": { lat: 13.7466, lng: 100.5397, category: 'shopping' },
    "Terminal 21": { lat: 13.7373, lng: 100.5608, category: 'shopping' },
    "Chatuchak Weekend Market": { lat: 13.8234, lng: 100.5534, category: 'shopping' },
    "Grand Palace": { lat: 13.7500, lng: 100.4913, category: 'tourism' },
    "Lumphini Park": { lat: 13.7311, lng: 100.5444, category: 'tourism' },
    "Siam Paragon": { lat: 13.7466, lng: 100.5347, category: 'shopping' },
    "MBK Center": { lat: 13.7456, lng: 100.5347, category: 'shopping' },
    "Silom Road": { lat: 13.7287, lng: 100.5347, category: 'business' },
    "Sukhumvit Road": { lat: 13.7373, lng: 100.5608, category: 'business' },
    "ICONSIAM": { lat: 13.7439, lng: 100.4888, category: 'shopping' },
    "Central Embassy": { lat: 13.7373, lng: 100.5608, category: 'shopping' }
  };
  
  Object.entries(categorizedLandmarks).forEach(([landmarkName, landmark]) => {
    const distance = calculateDistance(lat, lng, landmark.lat, landmark.lng);
    const category = landmarkCategories[landmark.category];
    
    // Calculate weighted multiplier based on distance and category
    let multiplier = 1.0;
    if (distance <= 0.5) {
      multiplier = category.maxMultiplier;
    } else if (distance <= 1.0) {
      multiplier = 1 + (category.maxMultiplier - 1) * 0.7;
    } else if (distance <= 2.0) {
      multiplier = 1 + (category.maxMultiplier - 1) * 0.4;
    } else if (distance <= 5.0) {
      multiplier = 1 + (category.maxMultiplier - 1) * 0.1;
    }
    
    if (multiplier > 1.0) {
      nearbyLandmarks.push({
        name: landmarkName,
        category: landmark.category,
        distance: distance.toFixed(2),
        multiplier: multiplier,
        weight: category.weight
      });
      
      // Use weighted scoring for overall multiplier
      totalScore += (multiplier - 1) * category.weight;
      if (multiplier > maxMultiplier) {
        maxMultiplier = multiplier;
      }
    }
  });
  
  // Calculate final multiplier using weighted average
  const finalMultiplier = 1 + totalScore;
  
  return {
    multiplier: Math.min(finalMultiplier, 1.5), // Cap at 50% premium
    nearbyLandmarks: nearbyLandmarks.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance)),
    categoryBreakdown: nearbyLandmarks.reduce((acc, landmark) => {
      acc[landmark.category] = (acc[landmark.category] || 0) + 1;
      return acc;
    }, {})
  };
}

// Find the best matching district for a location
function findBestDistrict(lat, lng, searchQuery = '') {
  // First try to match by search query
  if (searchQuery) {
    const queryLower = searchQuery.toLowerCase();
    for (const [districtName, data] of Object.entries(DISTRICT_DATA)) {
      if (districtName.toLowerCase().includes(queryLower) || 
          queryLower.includes(districtName.toLowerCase())) {
        return {
          districtName,
          data,
          matchType: 'query'
        };
      }
    }
  }
  
  // If no query match, find closest district by coordinates
  let closestDistrict = null;
  let minDistance = Infinity;
  
  // District center coordinates (approximate) - updated with real districts
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
    "Saphan Sung": { lat: 13.7287, lng: 100.5347 },
    "Chom Thong": { lat: 13.7287, lng: 100.5347 },
    "Bangkok Yai": { lat: 13.7287, lng: 100.5347 },
    "Lat Krabang": { lat: 13.7000, lng: 100.6000 }
  };
  
  for (const [districtName, center] of Object.entries(districtCenters)) {
    const distance = calculateDistance(lat, lng, center.lat, center.lng);
    if (distance < minDistance) {
      minDistance = distance;
      closestDistrict = {
        districtName,
        data: DISTRICT_DATA[districtName],
        distance: distance,
        matchType: 'proximity'
      };
    }
  }
  
  return closestDistrict;
}

// Enhanced AI valuation with improved algorithms using real data
function generateAIValuationWithDistrictData(lat, lng, searchQuery = '', properties = []) {
  // Ensure data is loaded
  if (!CSV_DATA_LOADED) {
    initializeData();
  }
  
  const districtInfo = findBestDistrict(lat, lng, searchQuery);
  const proximityInfo = getEnhancedProximityMultiplier(lat, lng);
  const marketStats = calculateMarketStats();
  
  // Debug logging
  console.log('🔍 AI Valuation Debug:', {
    searchQuery,
    selectedDistrict: districtInfo?.districtName,
    districtData: districtInfo?.data,
    marketStats: marketStats
  });
  
  if (!districtInfo) {
    return {
      low: 120000,
      high: 180000,
      confidence: 'Low',
      reasoning: 'No district data available. Using estimated market rates.',
      factors: ['Estimated market rates', 'Location analysis', 'General area pricing'],
      districtData: null,
      proximityData: null,
      marketAnalysis: null
    };
  }
  
  // Enhanced base price calculation using real data
  const basePricePerWah = districtInfo.data.avgPricePerWah || 50000; // Fallback to 50k if no data
  const districtMedianPrice = districtInfo.data.medianPrice || basePricePerWah;
  const districtAvgSize = districtInfo.data.avgSizeWah || 100;
  
  // Debug logging
  console.log('🔍 AI Valuation Debug:', {
    districtName: districtInfo.districtName,
    basePricePerWah,
    districtMedianPrice,
    districtAvgSize,
    propertyCount: districtInfo.data.propertyCount,
    priceVolatility: districtInfo.data.priceVolatility,
    districtData: districtInfo.data
  });
  
  // Apply ADVANCED VALUATION ALGORITHM with factor analysis
  const advancedValuation = calculateAdvancedValuation(lat, lng, basePricePerWah, {
    districtData: districtInfo.data,
    properties: properties,
    proximityInfo: proximityInfo
  });
  
  // Use advanced valuation results
  const adjustedPricePerWah = advancedValuation.adjustedPrice;
  const lowPrice = advancedValuation.lowPrice;
  const highPrice = advancedValuation.highPrice;
  
  // Enhanced confidence calculation using real data quality
  let confidenceScore = 0;
  let confidence = 'Low'; // Initialize confidence variable
  
  // Data quality factors
  if (districtInfo.data.propertyCount >= 10) confidenceScore += 3;
  else if (districtInfo.data.propertyCount >= 5) confidenceScore += 2;
  else if (districtInfo.data.propertyCount >= 2) confidenceScore += 1;
  
  // Price consistency from real data
  const priceConsistency = 1 - (districtInfo.data.priceVolatility || 0.5);
  if (priceConsistency > 0.8) confidenceScore += 2;
  else if (priceConsistency > 0.6) confidenceScore += 1;
  
  // Market activity
  if (properties.length > 0) confidenceScore += 1;
  
  // Proximity data quality
  if (proximityInfo.nearbyLandmarks.length > 0) confidenceScore += 1;
  
  if (confidenceScore >= 5) confidence = 'High';
  else if (confidenceScore >= 3) confidence = 'Medium';
  
  // Market analysis using real data
  const marketTrends = calculateMarketTrends(districtInfo);
  const districtRanking = calculateDistrictRanking(districtInfo.districtName);
  
  // Enhanced reasoning with advanced factor analysis
  const reasoning = `Advanced factor analysis applied to ${districtInfo.data.propertyCount} real properties in ${districtInfo.districtName} (${districtRanking.priceRank}/${districtRanking.totalDistricts} by price). ` +
    `Base price: ${formatCurrency(basePricePerWah)}/wah (${marketTrends.vsCityAverage}% ${marketTrends.vsCityAverage > 0 ? 'above' : 'below'} city average). ` +
    `Price category: ${marketTrends.priceCategory}. ` +
    `Advanced factors: Transport (${advancedValuation.factors.transport.nearbyStations} stations), ` +
    `Shopping (${advancedValuation.factors.shopping.nearbyCenters} centers), ` +
    `Education (${advancedValuation.factors.education.nearbySchools} schools), ` +
    `Flood risk (${advancedValuation.factors.floodRisk.riskLevel}), ` +
    `Zoning (${advancedValuation.factors.zoning.zoneType}). ` +
    `Total adjustment: ${((advancedValuation.totalMultiplier - 1) * 100).toFixed(1)}%.`;
  
  // Enhanced factors with advanced analysis
  const factors = [
    `${districtInfo.data.propertyCount} real properties in ${districtInfo.districtName}`,
    `Base price: ${formatCurrency(basePricePerWah)}/wah`,
    `Advanced adjustment: ${((advancedValuation.totalMultiplier - 1) * 100).toFixed(1)}%`,
    `Transport: ${advancedValuation.factors.transport.nearbyStations} nearby stations`,
    `Shopping: ${advancedValuation.factors.shopping.nearbyCenters} nearby centers`,
    `Education: ${advancedValuation.factors.education.nearbySchools} nearby schools`,
    `Flood risk: ${advancedValuation.factors.floodRisk.riskLevel}`,
    `Zoning: ${advancedValuation.factors.zoning.zoneType} (${advancedValuation.factors.zoning.heightRestriction.maxHeight}m max)`,
    `Market: ${marketTrends.marketPosition} (${marketTrends.vsCityAverage}% vs city)`,
    `Rank: #${districtRanking.priceRank} of ${districtRanking.totalDistricts}`
  ];
  
  if (proximityInfo.nearbyLandmarks.length > 0) {
    const categoryBreakdown = Object.entries(proximityInfo.categoryBreakdown)
      .map(([category, count]) => `${count} ${category}`)
      .join(', ');
    factors.push(`Location premium: ${proximityInfo.nearbyLandmarks.slice(0, 3).map(l => `${l.name} (${l.distance}km)`).join(', ')}`);
    factors.push(`Nearby amenities: ${categoryBreakdown}`);
  }
  
  if (properties.length > 0) {
    factors.push(`Recent market activity: ${properties.length} comparable sales`);
  }
  
  // Debug the final values
  console.log('🔍 Final AI Valuation Values:', {
    basePricePerWah,
    adjustedPricePerWah,
    lowPrice,
    highPrice,
    roundedLow: Math.round(lowPrice),
    roundedHigh: Math.round(highPrice),
    proximityMultiplier: proximityInfo.multiplier,
    advancedMultiplier: advancedValuation.totalMultiplier
  });

  return {
    low: Math.round(lowPrice),
    high: Math.round(highPrice),
    confidence: advancedValuation.confidence,
    reasoning,
    factors,
    districtData: districtInfo,
    proximityData: proximityInfo,
    advancedValuation: advancedValuation,
    marketAnalysis: {
      trends: marketTrends,
      ranking: districtRanking,
      stats: marketStats
    }
  };
}

// Initialize data on module load
initializeData();

// Export functions
export {
  DISTRICT_DATA,
  calculateDistance,
  getEnhancedProximityMultiplier,
  findBestDistrict,
  generateAIValuationWithDistrictData,
  calculateMarketStats,
  calculateDistrictRanking,
  calculateMarketTrends,
  initializeData
}; 