// Quick test script to verify TERRA LINK backend is working
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Probando TERRA LINK API...\n');

  try {
    // Test geo validation
    console.log('1. Probando validación geoespacial...');
    const geoResponse = await axios.post(`${BASE_URL}/geo/validate`, {
      geoJson: {
        type: 'Polygon',
        coordinates: [[[ -79.4, -2.1 ], [ -79.3, -2.1 ], [ -79.3, -2.0 ], [ -79.4, -2.0 ], [ -79.4, -2.1 ]]]
      }
    });
    console.log('✅ Geo validation:', geoResponse.data.message);

    // Test NFT creation
    console.log('\n2. Probando creación de NFT...');
    const nftResponse = await axios.post(`${BASE_URL}/nfts`, {
      plotId: 1,
      metadata: {
        geolocation: 'POINT(-79.35 -2.05)',
        certifications: ['EUDR', 'orgánico'],
        productionHistoryUri: 'ipfs://test',
        valuation: 450000,
        riskScore: 12,
        tokenFractionCount: 10,
        status: 'active'
      }
    });
    console.log('✅ NFT creation:', nftResponse.data.message);

    const tokenId = nftResponse.data.tokenId;

    // Test NFT collateral
    console.log('\n3. Probando collateralización de NFT...');
    const collateralResponse = await axios.patch(`${BASE_URL}/nfts/${tokenId}/collateralize`);
    console.log('✅ NFT collateral:', collateralResponse.data.message);

    // Test credit proposal
    console.log('\n4. Probando propuesta de crédito...');
    const creditResponse = await axios.post(`${BASE_URL}/credit/proposal`, {
      tokenId,
      borrowerId: 1,
      requestedAmount: 300000,
      durationMonths: 12,
      interestRate: 7.5
    });
    console.log('✅ Credit proposal:', creditResponse.data.message);

    console.log('\n🎉 Todas las pruebas pasaron exitosamente!');
    console.log('🌐 API funcionando correctamente en', BASE_URL);

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.response?.data || error.message);
    process.exit(1);
  }
}

testAPI();
