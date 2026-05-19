// /**
//  * Test detectionService with the new Haiku-first (T3) order
//  */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const detectionService = require('../services/detectionService');

const TEST_IMAGE_URL = 'https://stmaaprodfwsite.blob.core.windows.net/assets/sites/1/261017-Disease1-Eyespot-c-no-credit.jpg';

console.log('Testing detectionService.analyze()...\n');
console.time('Detection');

detectionService.analyze(TEST_IMAGE_URL, 'tomato')
  .then(result => {
    console.timeEnd('Detection');
    console.log('\n✅ Result:', JSON.stringify(result, null, 2));
  })
  .catch(err => {
    console.timeEnd('Detection');
    console.error('\n❌ Error:', err.message);
  });

// detectionService.analyze('YOUR_IMAGE_URL', { 
//   crop: 'tomato', 
//   location: 'Oujda', 
//   daysAfterPlanting: 30 
// })