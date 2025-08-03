// Advanced Valuation Service with Factor Analysis
// Implements machine learning-like algorithms with multiple valuation factors

// Bangkok BTS/MRT station coordinates
const BTS_STATIONS = {
  'Sukhumvit': { lat: 13.7381, lng: 100.5606 },
  'Asok': { lat: 13.7374, lng: 100.5608 },
  'Phrom Phong': { lat: 13.7364, lng: 100.5612 },
  'Thong Lo': { lat: 13.7354, lng: 100.5616 },
  'Ekkamai': { lat: 13.7344, lng: 100.5620 },
  'Phra Khanong': { lat: 13.7334, lng: 100.5624 },
  'On Nut': { lat: 13.7324, lng: 100.5628 },
  'Bang Chak': { lat: 13.7314, lng: 100.5632 },
  'Punnawithi': { lat: 13.7304, lng: 100.5636 },
  'Udom Suk': { lat: 13.7294, lng: 100.5640 },
  'Bang Na': { lat: 13.7284, lng: 100.5644 },
  'Bearing': { lat: 13.7274, lng: 100.5648 },
  'Samrong': { lat: 13.7264, lng: 100.5652 },
  'Pu Chao': { lat: 13.7254, lng: 100.5656 },
  'Chang Erawan': { lat: 13.7244, lng: 100.5660 },
  'Royal Thai Naval Academy': { lat: 13.7234, lng: 100.5664 },
  'Pak Nam': { lat: 13.7224, lng: 100.5668 },
  'Sai Luat': { lat: 13.7214, lng: 100.5672 },
  'Kheha': { lat: 13.7204, lng: 100.5676 }
};

// Major shopping centers and landmarks
const SHOPPING_CENTERS = {
  'Siam Paragon': { lat: 13.7466, lng: 100.5347 },
  'CentralWorld': { lat: 13.7467, lng: 100.5397 },
  'MBK Center': { lat: 13.7457, lng: 100.5347 },
  'Terminal 21': { lat: 13.7374, lng: 100.5608 },
  'EmQuartier': { lat: 13.7364, lng: 100.5612 },
  'Emporium': { lat: 13.7364, lng: 100.5612 },
  'Central Embassy': { lat: 13.7467, lng: 100.5397 },
  'Central Chidlom': { lat: 13.7467, lng: 100.5397 },
  'Central Ladprao': { lat: 13.7563, lng: 100.5018 },
  'Central Pinklao': { lat: 13.7563, lng: 100.5018 },
  'Central Rama 9': { lat: 13.7563, lng: 100.5018 },
  'Central Westgate': { lat: 13.7563, lng: 100.5018 },
  'Central Festival EastVille': { lat: 13.7563, lng: 100.5018 },
  'CentralPlaza Ladprao': { lat: 13.7563, lng: 100.5018 },
  'CentralPlaza Pinklao': { lat: 13.7563, lng: 100.5018 },
  'CentralPlaza Rama 9': { lat: 13.7563, lng: 100.5018 },
  'CentralPlaza Westgate': { lat: 13.7563, lng: 100.5018 },
  'CentralPlaza EastVille': { lat: 13.7563, lng: 100.5018 }
};

// International schools and universities
const SCHOOLS = {
  'Bangkok Patana School': { lat: 13.7466, lng: 100.5347 },
  'International School Bangkok': { lat: 13.7467, lng: 100.5397 },
  'NIST International School': { lat: 13.7457, lng: 100.5347 },
  'Bangkok International Preparatory': { lat: 13.7374, lng: 100.5608 },
  'Shrewsbury International School': { lat: 13.7364, lng: 100.5612 },
  'Harrow International School': { lat: 13.7364, lng: 100.5612 },
  'Ruamrudee International School': { lat: 13.7467, lng: 100.5397 },
  'St. Andrews International School': { lat: 13.7467, lng: 100.5397 },
  'Bangkok Christian College': { lat: 13.7563, lng: 100.5018 },
  'Assumption College': { lat: 13.7563, lng: 100.5018 },
  'Chulalongkorn University': { lat: 13.7563, lng: 100.5018 },
  'Thammasat University': { lat: 13.7563, lng: 100.5018 },
  'Mahidol University': { lat: 13.7563, lng: 100.5018 },
  'Kasetsart University': { lat: 13.7563, lng: 100.5018 },
  'Srinakharinwirot University': { lat: 13.7563, lng: 100.5018 }
};

// Flood risk zones (simplified - in real app, this would be GIS data)
const FLOOD_RISK_ZONES = [
  { lat: 13.7563, lng: 100.5018, radius: 0.02, risk: 'high' }, // Example flood-prone area
  { lat: 13.7466, lng: 100.5347, radius: 0.015, risk: 'medium' },
  { lat: 13.7374, lng: 100.5608, radius: 0.01, risk: 'low' }
];

// Building height restrictions by zone
const HEIGHT_RESTRICTIONS = {
  'airport': { maxHeight: 45, multiplier: 0.8 }, // Near airports
  'historical': { maxHeight: 30, multiplier: 0.9 }, // Historical areas
  'residential': { maxHeight: 60, multiplier: 1.0 }, // Standard residential
  'commercial': { maxHeight: 120, multiplier: 1.2 }, // Commercial zones
  'mixed': { maxHeight: 90, multiplier: 1.1 } // Mixed use
};

// Zoning regulations impact
const ZONING_MULTIPLIERS = {
  'residential': 1.0,
  'commercial': 1.3,
  'mixed': 1.15,
  'industrial': 0.7,
  'agricultural': 0.5,
  'conservation': 0.8
};

// Calculate distance between two points
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Calculate proximity factor for transportation
function calculateTransportFactor(lat, lng) {
  let totalScore = 0;
  let stationCount = 0;
  
  // Check BTS/MRT proximity
  Object.entries(BTS_STATIONS).forEach(([name, station]) => {
    const distance = calculateDistance(lat, lng, station.lat, station.lng);
    if (distance <= 1.0) { // Within 1km
      const score = Math.max(0, 1 - distance);
      totalScore += score;
      stationCount++;
    }
  });
  
  const avgScore = stationCount > 0 ? totalScore / stationCount : 0;
  return {
    score: avgScore,
    multiplier: 1 + (avgScore * 0.3), // Up to 30% premium
    nearbyStations: stationCount,
    factor: 'transport'
  };
}

// Calculate shopping center proximity factor
function calculateShoppingFactor(lat, lng) {
  let totalScore = 0;
  let centerCount = 0;
  
  Object.entries(SHOPPING_CENTERS).forEach(([name, center]) => {
    const distance = calculateDistance(lat, lng, center.lat, center.lng);
    if (distance <= 2.0) { // Within 2km
      const score = Math.max(0, 1 - (distance / 2));
      totalScore += score;
      centerCount++;
    }
  });
  
  const avgScore = centerCount > 0 ? totalScore / centerCount : 0;
  return {
    score: avgScore,
    multiplier: 1 + (avgScore * 0.2), // Up to 20% premium
    nearbyCenters: centerCount,
    factor: 'shopping'
  };
}

// Calculate school proximity factor
function calculateSchoolFactor(lat, lng) {
  let totalScore = 0;
  let schoolCount = 0;
  
  Object.entries(SCHOOLS).forEach(([name, school]) => {
    const distance = calculateDistance(lat, lng, school.lat, school.lng);
    if (distance <= 1.5) { // Within 1.5km
      const score = Math.max(0, 1 - (distance / 1.5));
      totalScore += score;
      schoolCount++;
    }
  });
  
  const avgScore = schoolCount > 0 ? totalScore / schoolCount : 0;
  return {
    score: avgScore,
    multiplier: 1 + (avgScore * 0.25), // Up to 25% premium
    nearbySchools: schoolCount,
    factor: 'education'
  };
}

// Calculate flood risk factor
function calculateFloodRiskFactor(lat, lng) {
  let maxRisk = 0;
  
  FLOOD_RISK_ZONES.forEach(zone => {
    const distance = calculateDistance(lat, lng, zone.lat, zone.lng);
    if (distance <= zone.radius) {
      const riskLevel = zone.risk === 'high' ? 0.85 : zone.risk === 'medium' ? 0.92 : 0.97;
      maxRisk = Math.max(maxRisk, riskLevel);
    }
  });
  
  return {
    riskLevel: maxRisk === 0 ? 'low' : maxRisk === 0.85 ? 'high' : 'medium',
    multiplier: maxRisk === 0 ? 1.0 : maxRisk, // No discount for low risk
    factor: 'flood_risk'
  };
}

// Determine zoning and height restrictions
function calculateZoningFactor(lat, lng) {
  // Simplified zoning determination based on location
  // In real app, this would use GIS data
  const distanceFromCenter = calculateDistance(lat, lng, 13.7563, 100.5018);
  
  let zoneType = 'residential';
  let heightRestriction = HEIGHT_RESTRICTIONS.residential;
  
  if (distanceFromCenter <= 0.5) {
    zoneType = 'commercial';
    heightRestriction = HEIGHT_RESTRICTIONS.commercial;
  } else if (distanceFromCenter <= 1.0) {
    zoneType = 'mixed';
    heightRestriction = HEIGHT_RESTRICTIONS.mixed;
  }
  
  return {
    zoneType,
    heightRestriction,
    multiplier: ZONING_MULTIPLIERS[zoneType],
    factor: 'zoning'
  };
}

// Advanced valuation algorithm with factor analysis
export function calculateAdvancedValuation(lat, lng, basePrice, propertyData = {}) {
  console.log('🔍 Advanced Valuation Analysis:', { lat, lng, basePrice });
  
  // Calculate all factors
  const transportFactor = calculateTransportFactor(lat, lng);
  const shoppingFactor = calculateShoppingFactor(lat, lng);
  const schoolFactor = calculateSchoolFactor(lat, lng);
  const floodRiskFactor = calculateFloodRiskFactor(lat, lng);
  const zoningFactor = calculateZoningFactor(lat, lng);
  
  // Combine all multipliers
  const totalMultiplier = 
    transportFactor.multiplier *
    shoppingFactor.multiplier *
    schoolFactor.multiplier *
    floodRiskFactor.multiplier *
    zoningFactor.multiplier;
  
  // Calculate adjusted price with minimum floor
  const adjustedPrice = Math.max(basePrice * totalMultiplier, basePrice * 0.5); // Minimum 50% of base price
  
  // Calculate confidence score based on data quality
  let confidenceScore = 0;
  let factors = [];
  
  // Transport factor
  if (transportFactor.nearbyStations > 0) {
    confidenceScore += 2;
    factors.push(`Transport: ${transportFactor.nearbyStations} nearby stations`);
  }
  
  // Shopping factor
  if (shoppingFactor.nearbyCenters > 0) {
    confidenceScore += 1;
    factors.push(`Shopping: ${shoppingFactor.nearbyCenters} nearby centers`);
  }
  
  // School factor
  if (schoolFactor.nearbySchools > 0) {
    confidenceScore += 1;
    factors.push(`Education: ${schoolFactor.nearbySchools} nearby schools`);
  }
  
  // Flood risk
  factors.push(`Flood Risk: ${floodRiskFactor.riskLevel}`);
  
  // Zoning
  factors.push(`Zoning: ${zoningFactor.zoneType} (${zoningFactor.heightRestriction.maxHeight}m max height)`);
  
  // Determine confidence level
  let confidence = 'Low';
  if (confidenceScore >= 4) confidence = 'High';
  else if (confidenceScore >= 2) confidence = 'Medium';
  
  // Calculate price range with volatility (reduced volatility for more stable estimates)
  const volatility = 0.10; // 10% base volatility (reduced from 15%)
  const lowPrice = Math.max(adjustedPrice * (1 - volatility), basePrice * 0.4); // Minimum 40% of base
  const highPrice = adjustedPrice * (1 + volatility);
  
  // Generate detailed analysis
  const analysis = {
    basePrice,
    adjustedPrice: Math.round(adjustedPrice),
    lowPrice: Math.round(lowPrice),
    highPrice: Math.round(highPrice),
    confidence,
    totalMultiplier,
    factors: {
      transport: transportFactor,
      shopping: shoppingFactor,
      education: schoolFactor,
      floodRisk: floodRiskFactor,
      zoning: zoningFactor
    },
    factorBreakdown: factors,
    detailedAnalysis: generateDetailedAnalysis({
      transportFactor,
      shoppingFactor,
      schoolFactor,
      floodRiskFactor,
      zoningFactor,
      basePrice,
      adjustedPrice,
      totalMultiplier
    })
  };
  
  console.log('✅ Advanced Valuation Complete:', analysis);
  return analysis;
}

// Generate detailed analysis text
function generateDetailedAnalysis(factors) {
  const { transportFactor, shoppingFactor, schoolFactor, floodRiskFactor, zoningFactor, basePrice, adjustedPrice, totalMultiplier } = factors;
  
  let analysis = `Advanced factor analysis applied to base price of ${basePrice.toLocaleString()}/wah:\n\n`;
  
  // Transport analysis
  if (transportFactor.nearbyStations > 0) {
    const premium = ((transportFactor.multiplier - 1) * 100).toFixed(1);
    analysis += `🚇 Transport Premium: +${premium}% (${transportFactor.nearbyStations} nearby BTS/MRT stations)\n`;
  }
  
  // Shopping analysis
  if (shoppingFactor.nearbyCenters > 0) {
    const premium = ((shoppingFactor.multiplier - 1) * 100).toFixed(1);
    analysis += `🛍️ Shopping Premium: +${premium}% (${shoppingFactor.nearbyCenters} nearby shopping centers)\n`;
  }
  
  // Education analysis
  if (schoolFactor.nearbySchools > 0) {
    const premium = ((schoolFactor.multiplier - 1) * 100).toFixed(1);
    analysis += `🎓 Education Premium: +${premium}% (${schoolFactor.nearbySchools} nearby schools)\n`;
  }
  
  // Flood risk analysis
  const floodDiscount = ((1 - floodRiskFactor.multiplier) * 100).toFixed(1);
  analysis += `🌊 Flood Risk: ${floodRiskFactor.riskLevel.toUpperCase()} risk (${floodDiscount}% discount applied)\n`;
  
  // Zoning analysis
  const zoningImpact = ((zoningFactor.multiplier - 1) * 100).toFixed(1);
  analysis += `🏗️ Zoning: ${zoningFactor.zoneType.toUpperCase()} zone (${zoningImpact}% impact, ${zoningFactor.heightRestriction.maxHeight}m max height)\n`;
  
  // Total impact
  const totalImpact = (((totalMultiplier - 1) * 100)).toFixed(1);
  analysis += `\n📊 Total Factor Impact: ${totalImpact}% adjustment\n`;
  analysis += `💰 Final Adjusted Price: ${adjustedPrice.toLocaleString()}/wah`;
  
  return analysis;
}

// Export for use in other services
export {
  calculateTransportFactor,
  calculateShoppingFactor,
  calculateSchoolFactor,
  calculateFloodRiskFactor,
  calculateZoningFactor
}; 