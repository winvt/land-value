// Enhanced CSV Data Processor for Real Bangkok Land Data
// This service processes both clean_land1.csv and avgprice_perwah.csv files

// Helper function to parse price strings (remove commas and convert to number)
function parsePrice(priceStr) {
  if (!priceStr) return 0;
  // Remove quotes, commas, and convert to number
  const cleanStr = priceStr.replace(/[,"]/g, '');
  return parseFloat(cleanStr);
}

// Helper function to parse size strings (remove commas and convert to number)
function parseSize(sizeStr) {
  if (!sizeStr) return 0;
  // Remove quotes, commas, and convert to number
  const cleanStr = sizeStr.replace(/[,"]/g, '');
  return parseFloat(cleanStr);
}

// Helper function to parse price per sqm strings
function parsePricePerSQM(pricePerSQMStr) {
  if (!pricePerSQMStr) return 0;
  // Remove quotes, commas, and convert to number
  const cleanStr = pricePerSQMStr.replace(/[,"]/g, '');
  return parseFloat(cleanStr);
}

// Process the detailed property data from clean_land1.csv
function processDetailedPropertyData(csvData) {
  const districtStats = {};
  
  // Skip header row
  const dataRows = csvData.split('\n').slice(1);
  
  dataRows.forEach(row => {
    if (!row.trim()) return;
    
    const columns = row.split(',');
    if (columns.length < 4) return;
    
    const location = columns[0]?.trim();
    const priceStr = columns[1];
    const sizeStr = columns[2];
    const pricePerSQMStr = columns[3];
    
    if (!location || !priceStr || !sizeStr) return;
    
    const price = parsePrice(priceStr);
    const size = parseSize(sizeStr);
    const pricePerSQM = parsePricePerSQM(pricePerSQMStr);
    
    // Skip invalid data
    if (price <= 0 || size <= 0) return;
    
    // Convert size from sqm to sq.wah (1 wah = 4 sqm)
    const sizeWah = size / 4;
    const pricePerWah = price / sizeWah;
    
    // Initialize district if not exists
    if (!districtStats[location]) {
      districtStats[location] = {
        propertyCount: 0,
        prices: [],
        sizes: [],
        sizesWah: [],
        pricesPerWah: [],
        pricesPerSQM: [],
        minPrice: Infinity,
        maxPrice: 0,
        minSize: Infinity,
        maxSize: 0,
        minPricePerWah: Infinity,
        maxPricePerWah: 0
      };
    }
    
    // Add data to district
    const district = districtStats[location];
    district.propertyCount++;
    district.prices.push(price);
    district.sizes.push(size);
    district.sizesWah.push(sizeWah);
    district.pricesPerWah.push(pricePerWah);
    district.pricesPerSQM.push(pricePerSQM);
    
    // Update min/max values
    district.minPrice = Math.min(district.minPrice, price);
    district.maxPrice = Math.max(district.maxPrice, price);
    district.minSize = Math.min(district.minSize, size);
    district.maxSize = Math.max(district.maxSize, size);
    district.minPricePerWah = Math.min(district.minPricePerWah, pricePerWah);
    district.maxPricePerWah = Math.max(district.maxPricePerWah, pricePerWah);
  });
  
  return districtStats;
}

// Process the pre-calculated averages from avgprice_perwah.csv
function processAveragePriceData(csvData) {
  const averagePrices = {};
  
  // Skip header row
  const dataRows = csvData.split('\n').slice(1);
  
  dataRows.forEach(row => {
    if (!row.trim()) return;
    
    const columns = row.split(',');
    if (columns.length < 2) return;
    
    const district = columns[0]?.trim();
    const avgPriceStr = columns[1];
    
    if (!district || !avgPriceStr) return;
    
    const avgPricePerWah = parsePrice(avgPriceStr);
    
    if (avgPricePerWah > 0) {
      averagePrices[district] = avgPricePerWah;
      console.log(`📊 Parsed ${district}: ${avgPriceStr} -> ${avgPricePerWah}`);
    }
  });
  
  return averagePrices;
}

// Merge detailed data with pre-calculated averages
function mergeDataWithAverages(detailedStats, averagePrices) {
  const mergedDistricts = {};
  
  // Process districts from detailed data
  Object.entries(detailedStats).forEach(([districtName, data]) => {
    if (data.propertyCount === 0) return;
    
    // Calculate averages from detailed data
    const avgPrice = data.prices.reduce((sum, price) => sum + price, 0) / data.prices.length;
    const avgSize = data.sizes.reduce((sum, size) => sum + size, 0) / data.sizes.length;
    const avgSizeWah = data.sizesWah.reduce((sum, size) => sum + size, 0) / data.sizesWah.length;
    const avgPricePerWah = data.pricesPerWah.reduce((sum, price) => sum + price, 0) / data.pricesPerWah.length;
    const avgPricePerSQM = data.pricesPerSQM.reduce((sum, price) => sum + price, 0) / data.pricesPerSQM.length;
    
    // Calculate median
    const sortedPrices = [...data.prices].sort((a, b) => a - b);
    const medianPrice = sortedPrices[Math.floor(sortedPrices.length / 2)];
    
    // Use pre-calculated average if available, otherwise use calculated average
    const finalAvgPricePerWah = averagePrices[districtName] || avgPricePerWah;
    
    mergedDistricts[districtName] = {
      propertyCount: data.propertyCount,
      avgPrice,
      medianPrice,
      minPrice: data.minPrice,
      maxPrice: data.maxPrice,
      avgSize,
      avgSizeWah,
      minSize: data.minSize,
      maxSize: data.maxSize,
      avgPricePerSQM,
      avgPricePerWah: finalAvgPricePerWah, // Use merged average
      minPricePerWah: data.minPricePerWah,
      maxPricePerWah: data.maxPricePerWah,
      // Additional statistics
      priceRange: data.maxPrice - data.minPrice,
      sizeRange: data.maxSize - data.minSize,
      pricePerWahRange: data.maxPricePerWah - data.minPricePerWah,
      // Market indicators
      priceVolatility: (data.maxPrice - data.minPrice) / avgPrice,
      sizeVariation: (data.maxSize - data.minSize) / avgSize,
      pricePerWahVariation: (data.maxPricePerWah - data.minPricePerWah) / finalAvgPricePerWah,
      // Data source indicator
      hasDetailedData: true,
      hasAverageData: !!averagePrices[districtName]
    };
  });
  
  // Add districts that only exist in average data
  Object.entries(averagePrices).forEach(([districtName, avgPricePerWah]) => {
    if (!mergedDistricts[districtName]) {
      mergedDistricts[districtName] = {
        propertyCount: 1, // Estimate
        avgPrice: avgPricePerWah * 100, // Rough estimate
        medianPrice: avgPricePerWah * 100,
        minPrice: avgPricePerWah * 80, // Estimate
        maxPrice: avgPricePerWah * 120, // Estimate
        avgSize: 400, // Default estimate
        avgSizeWah: 100,
        minSize: 200,
        maxSize: 800,
        avgPricePerSQM: avgPricePerWah * 4, // Convert from wah to sqm
        avgPricePerWah,
        minPricePerWah: avgPricePerWah * 0.8,
        maxPricePerWah: avgPricePerWah * 1.2,
        priceRange: avgPricePerWah * 40,
        sizeRange: 600,
        pricePerWahRange: avgPricePerWah * 0.4,
        priceVolatility: 0.2, // Default estimate
        sizeVariation: 0.3,
        pricePerWahVariation: 0.2,
        hasDetailedData: false,
        hasAverageData: true
      };
    }
  });
  
  return mergedDistricts;
}

// Generate market insights from the merged data
function generateMarketInsights(districtData) {
  const allPricesPerWah = Object.values(districtData).map(d => d.avgPricePerWah);
  const allPricesPerWahSorted = allPricesPerWah.sort((a, b) => a - b);
  
  const marketStats = {
    cityAverage: allPricesPerWah.reduce((sum, price) => sum + price, 0) / allPricesPerWah.length,
    cityMedian: allPricesPerWahSorted[Math.floor(allPricesPerWahSorted.length / 2)],
    cityMin: Math.min(...allPricesPerWah),
    cityMax: Math.max(...allPricesPerWah),
    totalDistricts: Object.keys(districtData).length,
    totalProperties: Object.values(districtData).reduce((sum, d) => sum + d.propertyCount, 0),
    priceQuartiles: {
      q1: allPricesPerWahSorted[Math.floor(allPricesPerWahSorted.length * 0.25)],
      q2: allPricesPerWahSorted[Math.floor(allPricesPerWahSorted.length * 0.5)],
      q3: allPricesPerWahSorted[Math.floor(allPricesPerWahSorted.length * 0.75)]
    }
  };
  
  // Calculate district rankings
  const districtRankings = {};
  Object.entries(districtData).forEach(([districtName, data]) => {
    const priceRank = allPricesPerWahSorted.indexOf(data.avgPricePerWah) + 1;
    const percentile = ((marketStats.totalDistricts - priceRank + 1) / marketStats.totalDistricts * 100).toFixed(1);
    
    districtRankings[districtName] = {
      priceRank,
      totalDistricts: marketStats.totalDistricts,
      percentile,
      vsCityAverage: ((data.avgPricePerWah - marketStats.cityAverage) / marketStats.cityAverage * 100).toFixed(1),
      vsCityMedian: ((data.avgPricePerWah - marketStats.cityMedian) / marketStats.cityMedian * 100).toFixed(1),
      priceCategory: data.avgPricePerWah > marketStats.priceQuartiles.q3 ? 'Premium' :
                    data.avgPricePerWah > marketStats.priceQuartiles.q2 ? 'Mid-Range' :
                    data.avgPricePerWah > marketStats.priceQuartiles.q1 ? 'Affordable' : 'Budget',
      dataQuality: data.hasDetailedData ? 'High' : 'Medium'
    };
  });
  
  return {
    marketStats,
    districtRankings
  };
}

// Load and process both CSV files
async function loadCSVData() {
  try {
    // Load detailed property data
    const detailedResponse = await fetch('/clean_land1.csv');
    const detailedCSV = await detailedResponse.text();
    
    // Load average price data
    const averageResponse = await fetch('/avgprice_perwah.csv');
    const averageCSV = await averageResponse.text();
    
    console.log('📊 Loading CSV files...');
    console.log('📊 Detailed data (first 3 lines):', detailedCSV.split('\n').slice(0, 3));
    console.log('📊 Average data (first 3 lines):', averageCSV.split('\n').slice(0, 3));
    
    // Process both datasets
    const detailedStats = processDetailedPropertyData(detailedCSV);
    const averagePrices = processAveragePriceData(averageCSV);
    
    // Merge the data
    const mergedDistrictData = mergeDataWithAverages(detailedStats, averagePrices);
    const marketInsights = generateMarketInsights(mergedDistrictData);
    
    console.log('📊 Processed Data Summary:', {
      totalDistricts: Object.keys(mergedDistrictData).length,
      totalProperties: Object.values(mergedDistrictData).reduce((sum, d) => sum + d.propertyCount, 0),
      districtsWithDetailedData: Object.values(mergedDistrictData).filter(d => d.hasDetailedData).length,
      districtsWithAverageData: Object.values(mergedDistrictData).filter(d => d.hasAverageData).length,
      marketStats: marketInsights.marketStats
    });
    
    console.log('📊 Top 5 Districts:', Object.entries(mergedDistrictData)
      .sort(([,a], [,b]) => b.avgPricePerWah - a.avgPricePerWah)
      .slice(0, 5)
      .map(([name, data]) => ({
        name,
        avgPricePerWah: data.avgPricePerWah,
        propertyCount: data.propertyCount,
        dataQuality: data.hasDetailedData ? 'High' : 'Medium'
      }))
    );
    
    return {
      districtData: mergedDistrictData,
      marketInsights
    };
  } catch (error) {
    console.error('Error loading CSV data:', error);
    return null;
  }
}

// Export functions
export {
  processDetailedPropertyData,
  processAveragePriceData,
  mergeDataWithAverages,
  generateMarketInsights,
  loadCSVData
}; 