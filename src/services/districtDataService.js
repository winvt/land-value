// District Data Service for AI Valuation
// This service provides district-based pricing data and proximity multipliers

// Helper function for simplified currency formatting
function formatCurrency(value) {
  if (value >= 1000000) {
    const millions = (value / 1000000).toFixed(1);
    return `${millions}M`;
  } else if (value >= 1000) {
    const thousands = (value / 1000).toFixed(0);
    return `${thousands}K`;
  } else {
    return new Intl.NumberFormat('en-US').format(value);
  }
}

// District analysis data from CSV
const DISTRICT_DATA = {
  "Lat Phrao": {
    propertyCount: 41,
    avgPrice: 31327485.37,
    medianPrice: 9900000.00,
    minPrice: 2500000.00,
    maxPrice: 238000000.00,
    avgSize: 1159.38,
    avgSizeWah: 289.85,
    avgPricePerSQM: 25440.47,
    avgPricePerWah: 101761.88
  },
  "Watthana": {
    propertyCount: 33,
    avgPrice: 271745515.15,
    medianPrice: 140000000.00,
    minPrice: 19800000.00,
    maxPrice: 1600000000.00,
    avgSize: 701.64,
    avgSizeWah: 175.41,
    avgPricePerSQM: 331484.05,
    avgPricePerWah: 1325936.19
  },
  "Sai Mai": {
    propertyCount: 31,
    avgPrice: 19120177.42,
    medianPrice: 12000000.00,
    minPrice: 1250000.00,
    maxPrice: 108000000.00,
    avgSize: 1243.95,
    avgSizeWah: 310.99,
    avgPricePerSQM: 13763.64,
    avgPricePerWah: 55054.55
  },
  "Bang Khen": {
    propertyCount: 28,
    avgPrice: 23042321.43,
    medianPrice: 10872500.00,
    minPrice: 3200000.00,
    maxPrice: 88000000.00,
    avgSize: 1110.11,
    avgSizeWah: 277.53,
    avgPricePerSQM: 21531.05,
    avgPricePerWah: 86124.19
  },
  "Prawet": {
    propertyCount: 28,
    avgPrice: 98036892.86,
    medianPrice: 17500000.00,
    minPrice: 2420000.00,
    maxPrice: 306000000.00,
    avgSize: 2514.06,
    avgSizeWah: 628.51,
    avgPricePerSQM: 40922.37,
    avgPricePerWah: 163689.47
  },
  "Khlong Sam Wa": {
    propertyCount: 26,
    avgPrice: 60430505.77,
    medianPrice: 14990000.00,
    minPrice: 2560000.00,
    maxPrice: 643918000.00,
    avgSize: 5214.50,
    avgSizeWah: 1303.62,
    avgPricePerSQM: 12258.13,
    avgPricePerWah: 49032.52
  },
  "Phra Khanong": {
    propertyCount: 23,
    avgPrice: 183673043.48,
    medianPrice: 33000000.00,
    minPrice: 4400000.00,
    maxPrice: 1660000000.00,
    avgSize: 2689.88,
    avgSizeWah: 672.47,
    avgPricePerSQM: 76368.95,
    avgPricePerWah: 305475.82
  },
  "Bang Khae": {
    propertyCount: 21,
    avgPrice: 19910552.38,
    medianPrice: 10300000.00,
    minPrice: 2088000.00,
    maxPrice: 90000000.00,
    avgSize: 1833.43,
    avgSizeWah: 458.36,
    avgPricePerSQM: 30530.07,
    avgPricePerWah: 122120.26
  },
  "Suan Luang": {
    propertyCount: 20,
    avgPrice: 234689900.00,
    medianPrice: 94300000.00,
    minPrice: 7000000.00,
    maxPrice: 1800000000.00,
    avgSize: 5036.57,
    avgSizeWah: 1259.14,
    avgPricePerSQM: 55774.17,
    avgPricePerWah: 223096.67
  },
  "Thawi Watthana": {
    propertyCount: 19,
    avgPrice: 52749600.00,
    medianPrice: 6800000.00,
    minPrice: 999900.00,
    maxPrice: 768000000.00,
    avgSize: 4263.47,
    avgSizeWah: 1065.87,
    avgPricePerSQM: 12853.55,
    avgPricePerWah: 51414.20
  },
  "Bang Na": {
    propertyCount: 19,
    avgPrice: 237191242.11,
    medianPrice: 50000000.00,
    minPrice: 6500000.00,
    maxPrice: 1132000000.00,
    avgSize: 8294.25,
    avgSizeWah: 2073.56,
    avgPricePerSQM: 82482.01,
    avgPricePerWah: 329928.04
  },
  "Bang Khun Thian": {
    propertyCount: 19,
    avgPrice: 42349578.95,
    medianPrice: 20829000.00,
    minPrice: 2000000.00,
    maxPrice: 150000000.00,
    avgSize: 2459.67,
    avgSizeWah: 614.92,
    avgPricePerSQM: 18365.87,
    avgPricePerWah: 73463.47
  },
  "Taling Chan": {
    propertyCount: 18,
    avgPrice: 50945444.44,
    medianPrice: 15250000.00,
    minPrice: 3320000.00,
    maxPrice: 400000000.00,
    avgSize: 3187.50,
    avgSizeWah: 796.88,
    avgPricePerSQM: 38674.76,
    avgPricePerWah: 154699.06
  },
  "Chatuchak": {
    propertyCount: 18,
    avgPrice: 105136666.67,
    medianPrice: 31750000.00,
    minPrice: 10560000.00,
    maxPrice: 1131000000.00,
    avgSize: 1201.78,
    avgSizeWah: 300.44,
    avgPricePerSQM: 40711.68,
    avgPricePerWah: 162846.73
  },
  "Huai Khwang": {
    propertyCount: 17,
    avgPrice: 218427336.59,
    medianPrice: 60000000.00,
    minPrice: 7000000.00,
    maxPrice: 788920000.00,
    avgSize: 2092.90,
    avgSizeWah: 523.23,
    avgPricePerSQM: 93749.62,
    avgPricePerWah: 374998.48
  },
  "Nong Chok": {
    propertyCount: 16,
    avgPrice: 23171109.38,
    medianPrice: 3845000.00,
    minPrice: 999000.00,
    maxPrice: 139952500.00,
    avgSize: 12949.82,
    avgSizeWah: 3237.45,
    avgPricePerSQM: 2048.39,
    avgPricePerWah: 8193.56
  },
  "Wang Thonglang": {
    propertyCount: 15,
    avgPrice: 47457733.33,
    medianPrice: 12000000.00,
    minPrice: 3708000.00,
    maxPrice: 440000000.00,
    avgSize: 538.29,
    avgSizeWah: 134.57,
    avgPricePerSQM: 31452385.91,
    avgPricePerWah: 125809543.64
  },
  "Min Buri": {
    propertyCount: 14,
    avgPrice: 59113214.29,
    medianPrice: 9075000.00,
    minPrice: 1300000.00,
    maxPrice: 519000000.00,
    avgSize: 9568.50,
    avgSizeWah: 2392.12,
    avgPricePerSQM: 10442.87,
    avgPricePerWah: 41771.49
  },
  "Din Daeng": {
    propertyCount: 14,
    avgPrice: 82794285.71,
    medianPrice: 21000000.00,
    minPrice: 5000000.00,
    maxPrice: 330000000.00,
    avgSize: 903.00,
    avgSizeWah: 225.75,
    avgPricePerSQM: 72671.39,
    avgPricePerWah: 290685.58
  },
  "Lat Krabang": {
    propertyCount: 13,
    avgPrice: 60517188.46,
    medianPrice: 6300000.00,
    minPrice: 1350000.00,
    maxPrice: 359643750.00,
    avgSize: 3335.00,
    avgSizeWah: 833.75,
    avgPricePerSQM: 414146.50,
    avgPricePerWah: 1656585.98
  },
  "Bueng Kum": {
    propertyCount: 13,
    avgPrice: 126417307.69,
    medianPrice: 24200000.00,
    minPrice: 4650000.00,
    maxPrice: 634500000.00,
    avgSize: 5219.56,
    avgSizeWah: 1304.89,
    avgPricePerSQM: 20986.72,
    avgPricePerWah: 83946.87
  },
  "Don Mueang": {
    propertyCount: 13,
    avgPrice: 41879053.85,
    medianPrice: 26610200.00,
    minPrice: 2900000.00,
    maxPrice: 160000000.00,
    avgSize: 1801.14,
    avgSizeWah: 450.29,
    avgPricePerSQM: 22078.66,
    avgPricePerWah: 88314.63
  },
  "Saphan Sung": {
    propertyCount: 12,
    avgPrice: 70503333.33,
    medianPrice: 31000000.00,
    minPrice: 4700000.00,
    maxPrice: 384000000.00,
    avgSize: 150570.00,
    avgSizeWah: 37642.50,
    avgPricePerSQM: 73173.58,
    avgPricePerWah: 292694.31
  },
  "Bang Kapi": {
    propertyCount: 11,
    avgPrice: 79588636.36,
    medianPrice: 41600000.00,
    minPrice: 11505000.00,
    maxPrice: 260000000.00,
    avgSize: 1255.33,
    avgSizeWah: 313.83,
    avgPricePerSQM: 49385.76,
    avgPricePerWah: 197543.02
  },
  "Phasi Charoen": {
    propertyCount: 11,
    avgPrice: 55324454.55,
    medianPrice: 21900000.00,
    minPrice: 5614500.00,
    maxPrice: 316000000.00,
    avgSize: 3087.00,
    avgSizeWah: 771.75,
    avgPricePerSQM: 22899.68,
    avgPricePerWah: 91598.72
  },
  "Khlong Toei": {
    propertyCount: 9,
    avgPrice: 251496888.89,
    medianPrice: 175000000.00,
    minPrice: 80000000.00,
    maxPrice: 570000000.00,
    avgSize: 830.40,
    avgSizeWah: 207.60,
    avgPricePerSQM: 246715.94,
    avgPricePerWah: 986863.75
  },
  "Khan Na Yao": {
    propertyCount: 8,
    avgPrice: 163993449.88,
    medianPrice: 91876300.00,
    minPrice: 1999999.00,
    maxPrice: 448000000.00,
    avgSize: 9840.80,
    avgSizeWah: 2460.20,
    avgPricePerSQM: 26726.97,
    avgPricePerWah: 106907.89
  },
  "Lak Si": {
    propertyCount: 8,
    avgPrice: 24508634.00,
    medianPrice: 6000000.00,
    minPrice: 969072.00,
    maxPrice: 150000000.00,
    avgSize: 462.67,
    avgSizeWah: 115.67,
    avgPricePerSQM: 13593.21,
    avgPricePerWah: 54372.85
  },
  "Nong Khaem": {
    propertyCount: 8,
    avgPrice: 56953750.00,
    medianPrice: 15540000.00,
    minPrice: 1350000.00,
    maxPrice: 270000000.00,
    avgSize: 13978.00,
    avgSizeWah: 3494.50,
    avgPricePerSQM: 7976.17,
    avgPricePerWah: 31904.68
  },
  "Bang Phlat": {
    propertyCount: 8,
    avgPrice: 96954500.00,
    medianPrice: 83940000.00,
    minPrice: 10816000.00,
    maxPrice: 180000000.00,
    avgSize: 4220.80,
    avgSizeWah: 1055.20,
    avgPricePerSQM: 24115.55,
    avgPricePerWah: 96462.20
  },
  "Phaya Thai": {
    propertyCount: 7,
    avgPrice: 98599857.14,
    medianPrice: 54900000.00,
    minPrice: 10999000.00,
    maxPrice: 357900000.00,
    avgSize: 1804.00,
    avgSizeWah: 451.00,
    avgPricePerSQM: 111419.13,
    avgPricePerWah: 445676.51
  },
  "Sathon": {
    propertyCount: 5,
    avgPrice: 109240000.00,
    medianPrice: 105000000.00,
    minPrice: 63000000.00,
    maxPrice: 165000000.00,
    avgSize: 1253.00,
    avgSizeWah: 313.25,
    avgPricePerSQM: 151261.85,
    avgPricePerWah: 605047.42
  },
  "Bang Bon": {
    propertyCount: 5,
    avgPrice: 15697000.00,
    medianPrice: 15000000.00,
    minPrice: 1000000.00,
    maxPrice: 40000000.00,
    avgSize: 999.00,
    avgSizeWah: 249.75,
    avgPricePerSQM: 11254.19,
    avgPricePerWah: 45016.76
  },
  "Bang Sue": {
    propertyCount: 4,
    avgPrice: 500350000.00,
    medianPrice: 91750000.00,
    minPrice: 17900000.00,
    maxPrice: 1800000000.00,
    avgSize: 1149.33,
    avgSizeWah: 287.33,
    avgPricePerSQM: 45163.17,
    avgPricePerWah: 180652.69
  },
  "Thon Buri": {
    propertyCount: 4,
    avgPrice: 25140000.00,
    medianPrice: 25030000.00,
    minPrice: 7500000.00,
    maxPrice: 43000000.00,
    avgSize: 437.33,
    avgSizeWah: 109.33,
    avgPricePerSQM: 51361.30,
    avgPricePerWah: 205445.18
  },
  "Thung Khru": {
    propertyCount: 3,
    avgPrice: 22791600.00,
    medianPrice: 17974800.00,
    minPrice: 2000000.00,
    maxPrice: 48400000.00,
    avgSize: 8420.00,
    avgSizeWah: 2105.00,
    avgPricePerSQM: 5748.22,
    avgPricePerWah: 22992.87
  },
  "Yan Nawa": {
    propertyCount: 3,
    avgPrice: 186620000.00,
    medianPrice: 230000000.00,
    minPrice: 79860000.00,
    maxPrice: 250000000.00,
    avgSize: 1452.00,
    avgSizeWah: 363.00,
    avgPricePerSQM: 55000.00,
    avgPricePerWah: 220000.00
  }
};

// Enhanced market analysis functions
function calculateMarketStats() {
  const allPrices = Object.values(DISTRICT_DATA).map(d => d.avgPricePerWah);
  const allPricesSorted = allPrices.sort((a, b) => a - b);
  
  return {
    cityAverage: allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length,
    cityMedian: allPricesSorted[Math.floor(allPricesSorted.length / 2)],
    cityMin: Math.min(...allPrices),
    cityMax: Math.max(...allPrices),
    priceQuartiles: {
      q1: allPricesSorted[Math.floor(allPricesSorted.length * 0.25)],
      q2: allPricesSorted[Math.floor(allPricesSorted.length * 0.5)],
      q3: allPricesSorted[Math.floor(allPricesSorted.length * 0.75)]
    }
  };
}

function calculateDistrictRanking(districtName) {
  const allDistricts = Object.entries(DISTRICT_DATA)
    .map(([name, data]) => ({
      name,
      avgPricePerWah: data.avgPricePerWah,
      propertyCount: data.propertyCount
    }))
    .sort((a, b) => b.avgPricePerWah - a.avgPricePerWah);
  
  const districtIndex = allDistricts.findIndex(d => d.name === districtName);
  const ranking = {
    priceRank: districtIndex + 1,
    totalDistricts: allDistricts.length,
    percentile: ((allDistricts.length - districtIndex) / allDistricts.length * 100).toFixed(1)
  };
  
  // Debug logging
  console.log('🏆 District Ranking Debug:', {
    districtName,
    ranking,
    topDistricts: allDistricts.slice(0, 5).map(d => ({ name: d.name, price: d.avgPricePerWah }))
  });
  
  return ranking;
}

function calculateMarketTrends(districtData) {
  const marketStats = calculateMarketStats();
  const districtPrice = districtData.avgPricePerWah;
  
  const vsCityAverage = ((districtPrice - marketStats.cityAverage) / marketStats.cityAverage * 100).toFixed(1);
  const vsCityMedian = ((districtPrice - marketStats.cityMedian) / marketStats.cityMedian * 100).toFixed(1);
  
  // Debug logging
  console.log('📊 Market Trends Debug:', {
    districtPrice,
    cityAverage: marketStats.cityAverage,
    cityMedian: marketStats.cityMedian,
    vsCityAverage,
    vsCityMedian,
    priceQuartiles: marketStats.priceQuartiles
  });
  
  return {
    vsCityAverage,
    vsCityMedian,
    marketPosition: districtPrice > marketStats.cityAverage ? 'Above Average' : 'Below Average',
    priceCategory: districtPrice > marketStats.priceQuartiles.q3 ? 'Premium' :
                   districtPrice > marketStats.priceQuartiles.q2 ? 'Mid-Range' :
                   districtPrice > marketStats.priceQuartiles.q1 ? 'Affordable' : 'Budget'
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
  
  // District center coordinates (approximate)
  const districtCenters = {
    "Lat Phrao": { lat: 13.8133, lng: 100.7324 },
    "Watthana": { lat: 13.7373, lng: 100.5608 },
    "Sai Mai": { lat: 13.9234, lng: 100.3534 },
    "Bang Khen": { lat: 13.8234, lng: 100.6534 },
    "Prawet": { lat: 13.7000, lng: 100.6000 },
    "Khlong Sam Wa": { lat: 13.8133, lng: 100.7324 },
    "Phra Khanong": { lat: 13.7000, lng: 100.6000 },
    "Bang Khae": { lat: 13.7287, lng: 100.5347 },
    "Suan Luang": { lat: 13.7000, lng: 100.6000 },
    "Thawi Watthana": { lat: 13.7287, lng: 100.5347 },
    "Bang Na": { lat: 13.7000, lng: 100.6000 },
    "Bang Khun Thian": { lat: 13.7287, lng: 100.5347 },
    "Taling Chan": { lat: 13.7287, lng: 100.5347 },
    "Chatuchak": { lat: 13.8234, lng: 100.5534 },
    "Huai Khwang": { lat: 13.7287, lng: 100.5608 },
    "Nong Chok": { lat: 13.7000, lng: 100.6000 },
    "Wang Thonglang": { lat: 13.8234, lng: 100.6534 },
    "Min Buri": { lat: 13.8133, lng: 100.7324 },
    "Din Daeng": { lat: 13.7287, lng: 100.5608 },
    "Lat Krabang": { lat: 13.7000, lng: 100.6000 },
    "Bueng Kum": { lat: 13.8234, lng: 100.6534 },
    "Don Mueang": { lat: 13.9234, lng: 100.5534 },
    "Saphan Sung": { lat: 13.7000, lng: 100.6000 },
    "Bang Kapi": { lat: 13.8234, lng: 100.6534 },
    "Phasi Charoen": { lat: 13.7287, lng: 100.5347 },
    "Khlong Toei": { lat: 13.7287, lng: 100.5608 },
    "Khan Na Yao": { lat: 13.8234, lng: 100.6534 },
    "Lak Si": { lat: 13.9234, lng: 100.4534 },
    "Nong Khaem": { lat: 13.7287, lng: 100.5347 },
    "Bang Phlat": { lat: 13.7287, lng: 100.5347 },
    "Phaya Thai": { lat: 13.7287, lng: 100.5608 },
    "Sathon": { lat: 13.7287, lng: 100.5347 },
    "Bang Bon": { lat: 13.7287, lng: 100.5347 },
    "Bang Sue": { lat: 13.8234, lng: 100.5534 },
    "Thon Buri": { lat: 13.7287, lng: 100.5347 },
    "Thung Khru": { lat: 13.7287, lng: 100.5347 },
    "Yan Nawa": { lat: 13.7287, lng: 100.5347 }
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

// Enhanced AI valuation with improved algorithms
function generateAIValuationWithDistrictData(lat, lng, searchQuery = '', properties = []) {
  const districtInfo = findBestDistrict(lat, lng, searchQuery);
  const proximityInfo = getEnhancedProximityMultiplier(lat, lng);
  const marketStats = calculateMarketStats();
  
  // Debug logging
  console.log('🔍 AI Valuation Debug:', {
    searchQuery,
    selectedDistrict: districtInfo?.districtName,
    districtData: districtInfo?.data,
    marketStats: {
      cityAverage: marketStats.cityAverage,
      cityMedian: marketStats.cityMedian,
      totalDistricts: Object.keys(DISTRICT_DATA).length
    }
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
  
  // Enhanced base price calculation
  const basePricePerWah = districtInfo.data.avgPricePerWah;
  const districtMedianPrice = districtInfo.data.medianPrice;
  const districtAvgSize = districtInfo.data.avgSizeWah;
  
  // Apply enhanced proximity multiplier
  const adjustedPricePerWah = basePricePerWah * proximityInfo.multiplier;
  
  // Dynamic price variation based on market volatility
  const priceVolatility = Math.abs((districtInfo.data.maxPrice - districtInfo.data.minPrice) / districtInfo.data.avgPrice);
  const priceVariation = Math.min(0.3, Math.max(0.1, priceVolatility * 0.5)); // 10-30% variation
  
  const lowPrice = adjustedPricePerWah * (1 - priceVariation);
  const highPrice = adjustedPricePerWah * (1 + priceVariation);
  
  // Enhanced confidence calculation
  let confidence = 'Low';
  let confidenceScore = 0;
  
  // Data quality factors
  if (districtInfo.data.propertyCount >= 20) confidenceScore += 3;
  else if (districtInfo.data.propertyCount >= 10) confidenceScore += 2;
  else if (districtInfo.data.propertyCount >= 5) confidenceScore += 1;
  
  // Price consistency
  const priceConsistency = 1 - (districtInfo.data.maxPrice - districtInfo.data.minPrice) / districtInfo.data.avgPrice;
  if (priceConsistency > 0.8) confidenceScore += 2;
  else if (priceConsistency > 0.6) confidenceScore += 1;
  
  // Market activity
  if (properties.length > 0) confidenceScore += 1;
  
  // Proximity data quality
  if (proximityInfo.nearbyLandmarks.length > 0) confidenceScore += 1;
  
  if (confidenceScore >= 5) confidence = 'High';
  else if (confidenceScore >= 3) confidence = 'Medium';
  
  // Market analysis
  const marketTrends = calculateMarketTrends(districtInfo.data);
  const districtRanking = calculateDistrictRanking(districtInfo.districtName);
  
  // Simplified reasoning
  const reasoning = `Analysis of ${districtInfo.data.propertyCount} properties in ${districtInfo.districtName} (${districtRanking.priceRank}/${districtRanking.totalDistricts} by price). ` +
    `Average: ${formatCurrency(basePricePerWah)}/wah (${marketTrends.vsCityAverage}% ${marketTrends.vsCityAverage > 0 ? 'above' : 'below'} city average). ` +
    `Price category: ${marketTrends.priceCategory}. ` +
    (proximityInfo.multiplier > 1.0 ? 
      `Location premium: ${((proximityInfo.multiplier - 1) * 100).toFixed(0)}% due to nearby landmarks.` :
      'Standard district pricing applied.');
  
  // Simplified factors
  const factors = [
    `${districtInfo.data.propertyCount} properties in ${districtInfo.districtName}`,
    `Average: ${formatCurrency(basePricePerWah)}/wah`,
    `Median: ${formatCurrency(districtMedianPrice)}`,
    `Size: ${districtAvgSize.toFixed(0)} sq.wah avg`,
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
  
  return {
    low: Math.round(lowPrice),
    high: Math.round(highPrice),
    confidence,
    reasoning,
    factors,
    districtData: districtInfo,
    proximityData: proximityInfo,
    marketAnalysis: {
      trends: marketTrends,
      ranking: districtRanking,
      stats: marketStats
    }
  };
}

// Export functions
export {
  DISTRICT_DATA,
  calculateDistance,
  getEnhancedProximityMultiplier,
  findBestDistrict,
  generateAIValuationWithDistrictData,
  calculateMarketStats,
  calculateDistrictRanking,
  calculateMarketTrends
}; 