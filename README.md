# Bangkok Land Evaluator MVP

A React-based web application that provides instant land valuation and AI-powered insights for properties in Bangkok, Thailand.

## 🏗️ Features

### Core Functionality
- **Land Valuation**: Get instant property valuations with government appraisal data
- **Market Analysis**: Compare listing prices with government appraised values
- **Property Details**: View comprehensive property information including:
  - Land size (in sq.wah and sq.meters)
  - Listing price and price per sq.wah
  - Government appraisal rates
  - Zoning information
  - Chanote (title deed) verification links

### AI-Powered Insights
- **Investment Score**: AI-generated investment assessment (1-10 scale)
- **Risk Analysis**: Property risk level evaluation
- **Market Trends**: District growth rates and recent sales data
- **Smart Recommendations**: AI-generated investment advice
- **Important Alerts**: Critical verification requirements

### User Experience
- **Clean, Modern UI**: Simple CSS styling with responsive design
- **Real-time Search**: Instant property lookup by address, district, or chanote number
- **Interactive Maps**: Property location display with Google Maps integration
- **Mobile Responsive**: Optimized for all device sizes

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bangkok-land2
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 🏛️ Architecture

### Frontend Components
- **LandValuationApp**: Main application component
- **AIInsights**: AI-powered analysis and recommendations
- **PropertyMap**: Property location display
- **StatItem**: Reusable statistics display component

### Data Structure
The app uses mock data that simulates:
- Property information (address, size, coordinates)
- Government appraisal data
- Market predictions
- Zoning information
- Transportation data (BTS proximity)

### Styling
- **Simple CSS**: Custom CSS classes without heavy frameworks
- **Responsive Design**: Mobile-first approach
- **Modern UI**: Clean, professional interface

## 🔧 Development

### Available Scripts
- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects from Create React App

### Project Structure
```
src/
├── components/
│   ├── AIInsights.js      # AI analysis component
│   └── PropertyMap.js     # Map display component
├── App.js                 # Main application
├── App.css               # Styles
└── index.js              # Entry point
```

## 🎯 Future Enhancements

### Backend Integration
- Real API endpoints for property data
- Government data integration
- Machine learning models for valuation
- User authentication and saved searches

### Advanced Features
- Property comparison tools
- Investment portfolio tracking
- Market trend analysis
- Document verification system
- Multi-language support (Thai/English)

### AI Capabilities
- Predictive analytics for property values
- Market trend forecasting
- Risk assessment algorithms
- Investment recommendation engine

## 📊 Data Sources

### Current (Mock Data)
- Property listings
- Government appraisal rates
- Zoning information
- Transportation data

### Planned Integration
- Department of Lands API
- Real estate databases
- Government valuation systems
- Market transaction data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with React and ❤️ for Bangkok's real estate market**
