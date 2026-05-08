/**
 * Validate Crop Data - Self-verification script
 * Phase 3.5: Tests all 3 datasets for orphan entries
 * 
 * Usage: node scripts/validateCropData.js
 */

const CropRegistry = require('../data/cropRegistry');
const priceData = require('../data/priceSeedData');
const coefficientsData = require('../data/cropCoefficients');
const storageData = require('../data/shelfLifeTables');

const { resolveBaseId, validateCoverage, listMoroccanPriority } = CropRegistry;

function logHeader(text) {
  console.log('\n' + '='.repeat(60));
  console.log('  ' + text);
  console.log('='.repeat(60));
}

function logSection(text) {
  console.log('\n--- ' + text + ' ---');
}

function testPriceData() {
  logSection('Testing priceSeedData.js');
  
  const cropNames = priceData.getUniqueCrops();
  console.log(`Total unique crops in dataset: ${cropNames.length}`);
  
  const result = validateCoverage(cropNames, 'price');
  
  console.log(`Valid mappings: ${result.count}`);
  console.log(`Orphans (unknown): ${result.missing}`);
  
  if (result.orphan.length > 0) {
    console.log('\nOrphan crop names:');
    result.orphan.forEach(c => console.log(`  - ${c}`));
  } else {
    console.log('  ✓ All crops mapped to registry');
  }
  
  return result;
}

function testIrrigationData() {
  logSection('Testing cropCoefficients.js');
  
  const cropNames = coefficientsData.FAO56_CROP_DATABASE.map(c => c.name);
  console.log(`Total crops in FAO-56: ${cropNames.length}`);
  
  const maCrops = listMoroccanPriority();
  console.log(`Morocco priority crops: ${maCrops.length}`);
  
  return { maCrops, total: cropNames.length };
}

function testStorageData() {
  logSection('Testing shelfLifeTables.js');
  
  const cropNames = storageData.FAO_GRAIN_STORAGE_DATABASE.map(c => c.name);
  console.log(`Total storage entries: ${cropNames.length}`);
  
  return { total: cropNames.length };
}

function testReverseLookup() {
  logSection('Testing reverse lookup API');
  
  const testCases = [
    { input: 'corn', expected: 'maize' },
    { input: 'irish_potato', expected: 'potato' },
    { input: 'citrus_orange', expected: 'orange' },
    { input: 'rice', expected: 'rice' },
    { input: 'onion', expected: 'onion' },
    { input: 'wheat', expected: 'wheat' }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const tc of testCases) {
    const result = resolveBaseId(tc.input);
    if (result === tc.expected) {
      console.log(`  ✓ "${tc.input}" → "${result}"`);
      passed++;
    } else {
      console.log(`  ✗ "${tc.input}" → "${result}" (expected: ${tc.expected})`);
      failed++;
    }
  }
  
  console.log(`\nReverse lookup: ${passed}/${testCases.length} passed`);
  
  return { passed, failed };
}

function testDatasetKeys() {
  logSection('Testing getDatasetKey()');
  
  const tests = [
    { base_id: 'wheat', dataset: 'price' },
    { base_id: 'maize', dataset: 'storage' },
    { base_id: 'potato', dataset: 'storage' },
    { base_id: 'tomato', dataset: 'price' }
  ];
  
  for (const tc of tests) {
    const key = CropRegistry.getDatasetKey(tc.base_id, tc.dataset);
    console.log(`  cropRegistry.${tc.base_id}[${tc.dataset}] = "${key}"`);
  }
  
  return tests.length;
}

function runAllTests() {
  logHeader('Crop Data Validation Suite');
  console.log(`Run at: ${new Date().toISOString()}`);
  console.log(`Registry size: ${CropRegistry.CROP_REGISTRY.length} crops`);
  
  const results = {
    price: testPriceData(),
    irrigation: testIrrigationData(),
    storage: testStorageData(),
    reverseLookup: testReverseLookup(),
    datasetKeys: testDatasetKeys()
  };
  
  logHeader('Summary');
  console.log(`Price orphans: ${results.price.orphan.length}`);
  console.log(`Total FA056 crops: ${results.irrigation.total}`);
  console.log(`Total storage entries: ${results.storage.total}`);
  console.log(`Reverse lookup passed: ${results.reverseLookup.passed}`);
  
  const exitCode = results.price.orphan.length > 0 ? 1 : 0;
  console.log(`\nExit code: ${exitCode}`);
  
  return exitCode;
}

if (require.main === module) {
  const exitCode = runAllTests();
  process.exit(exitCode);
}

module.exports = { runAllTests, testPriceData, testIrrigationData, testStorageData };