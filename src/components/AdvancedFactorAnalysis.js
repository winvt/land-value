import React from 'react';

const AdvancedFactorAnalysis = ({ advancedValuation }) => {
  if (!advancedValuation) return null;

  const { factors, totalMultiplier, detailedAnalysis } = advancedValuation;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const getFactorIcon = (factorType) => {
    switch (factorType) {
      case 'transport': return '🚇';
      case 'shopping': return '🛍️';
      case 'education': return '🎓';
      case 'flood_risk': return '🌊';
      case 'zoning': return '🏗️';
      default: return '📊';
    }
  };

  const getFactorColor = (multiplier) => {
    if (multiplier > 1.0) return 'text-green-600';
    if (multiplier < 1.0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getFactorImpact = (multiplier) => {
    const impact = ((multiplier - 1) * 100).toFixed(1);
    return impact > 0 ? `+${impact}%` : `${impact}%`;
  };

  return (
    <div className="advanced-factor-analysis">
      <h4 className="analysis-title">🔬 Advanced Factor Analysis</h4>
      
      <div className="factor-grid">
        {/* Transport Factor */}
        <div className="factor-card">
          <div className="factor-header">
            <span className="factor-icon">{getFactorIcon('transport')}</span>
            <span className="factor-name">Transport</span>
            <span className={`factor-impact ${getFactorColor(factors.transport.multiplier)}`}>
              {getFactorImpact(factors.transport.multiplier)}
            </span>
          </div>
          <div className="factor-details">
            <p>{factors.transport.nearbyStations} nearby BTS/MRT stations</p>
            <p className="factor-multiplier">Multiplier: {factors.transport.multiplier.toFixed(3)}</p>
          </div>
        </div>

        {/* Shopping Factor */}
        <div className="factor-card">
          <div className="factor-header">
            <span className="factor-icon">{getFactorIcon('shopping')}</span>
            <span className="factor-name">Shopping</span>
            <span className={`factor-impact ${getFactorColor(factors.shopping.multiplier)}`}>
              {getFactorImpact(factors.shopping.multiplier)}
            </span>
          </div>
          <div className="factor-details">
            <p>{factors.shopping.nearbyCenters} nearby shopping centers</p>
            <p className="factor-multiplier">Multiplier: {factors.shopping.multiplier.toFixed(3)}</p>
          </div>
        </div>

        {/* Education Factor */}
        <div className="factor-card">
          <div className="factor-header">
            <span className="factor-icon">{getFactorIcon('education')}</span>
            <span className="factor-name">Education</span>
            <span className={`factor-impact ${getFactorColor(factors.education.multiplier)}`}>
              {getFactorImpact(factors.education.multiplier)}
            </span>
          </div>
          <div className="factor-details">
            <p>{factors.education.nearbySchools} nearby schools</p>
            <p className="factor-multiplier">Multiplier: {factors.education.multiplier.toFixed(3)}</p>
          </div>
        </div>

        {/* Flood Risk Factor */}
        <div className="factor-card">
          <div className="factor-header">
            <span className="factor-icon">{getFactorIcon('flood_risk')}</span>
            <span className="factor-name">Flood Risk</span>
            <span className={`factor-impact ${getFactorColor(factors.floodRisk.multiplier)}`}>
              {getFactorImpact(factors.floodRisk.multiplier)}
            </span>
          </div>
          <div className="factor-details">
            <p>Risk Level: {factors.floodRisk.riskLevel.toUpperCase()}</p>
            <p className="factor-multiplier">Multiplier: {factors.floodRisk.multiplier.toFixed(3)}</p>
          </div>
        </div>

        {/* Zoning Factor */}
        <div className="factor-card">
          <div className="factor-header">
            <span className="factor-icon">{getFactorIcon('zoning')}</span>
            <span className="factor-name">Zoning</span>
            <span className={`factor-impact ${getFactorColor(factors.zoning.multiplier)}`}>
              {getFactorImpact(factors.zoning.multiplier)}
            </span>
          </div>
          <div className="factor-details">
            <p>Zone: {factors.zoning.zoneType.toUpperCase()}</p>
            <p>Max Height: {factors.zoning.heightRestriction.maxHeight}m</p>
            <p className="factor-multiplier">Multiplier: {factors.zoning.multiplier.toFixed(3)}</p>
          </div>
        </div>
      </div>

      {/* Total Impact Summary */}
      <div className="total-impact">
        <div className="impact-header">
          <h5>📊 Total Factor Impact</h5>
          <span className={`total-multiplier ${getFactorColor(totalMultiplier)}`}>
            {getFactorImpact(totalMultiplier)}
          </span>
        </div>
        <div className="impact-breakdown">
          <p>Combined Multiplier: {totalMultiplier.toFixed(3)}</p>
          <p>Base Price Adjustment: {((totalMultiplier - 1) * 100).toFixed(1)}%</p>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="detailed-analysis">
        <h5>📋 Detailed Analysis</h5>
        <div className="analysis-text">
          {detailedAnalysis.split('\n').map((line, index) => (
            <p key={index} className="analysis-line">{line}</p>
          ))}
        </div>
      </div>

      <style jsx>{`
        .advanced-factor-analysis {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          margin-top: 1rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .analysis-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 1rem;
        }

        .factor-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .factor-card {
          background: #f8fafc;
          border-radius: 8px;
          padding: 1rem;
          border: 1px solid #e2e8f0;
        }

        .factor-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .factor-icon {
          font-size: 1.25rem;
        }

        .factor-name {
          font-weight: 600;
          color: #374151;
          flex: 1;
        }

        .factor-impact {
          font-weight: 700;
          font-size: 0.875rem;
        }

        .factor-details {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .factor-details p {
          margin: 0.25rem 0;
        }

        .factor-multiplier {
          font-weight: 500;
          color: #374151;
        }

        .total-impact {
          background: #f1f5f9;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .impact-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .impact-header h5 {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .total-multiplier {
          font-size: 1.125rem;
          font-weight: 700;
        }

        .impact-breakdown {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .impact-breakdown p {
          margin: 0.25rem 0;
        }

        .detailed-analysis {
          background: #f8fafc;
          border-radius: 8px;
          padding: 1rem;
        }

        .detailed-analysis h5 {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.5rem 0;
        }

        .analysis-text {
          font-size: 0.875rem;
          color: #374151;
          line-height: 1.5;
        }

        .analysis-line {
          margin: 0.25rem 0;
        }

        .text-green-600 {
          color: #059669;
        }

        .text-red-600 {
          color: #dc2626;
        }

        .text-gray-600 {
          color: #4b5563;
        }
      `}</style>
    </div>
  );
};

export default AdvancedFactorAnalysis; 