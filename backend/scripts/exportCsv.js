/**
 * Export Crop Data to CSV Files
 * Phase 3.5: Semicolon-separated, UTF-8 with BOM
 * 
 * Usage: node scripts/exportCsv.js
 */

const fs = require('fs');
const path = require('path');
const CropRegistry = require('../data/cropRegistry');
const priceData = require('../data/priceSeedData');
const coefficientsData = require('../data/cropCoefficients');
const storageData = require('../data/shelfLifeTables');

const UTF8_BOM = '\uFEFF';
const CSV_DIR = path.join(__dirname, '..', 'data', 'csv');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function escapeCSV(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(';') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function writeCSV(filename, headers, rows) {
  const lines = [headers.join(';')];
  for (const row of rows) {
    lines.push(row.map(escapeCSV).join(';'));
  }
  const content = UTF8_BOM + lines.join('\n');
  const filepath = path.join(CSV_DIR, filename);
  fs.writeFileSync(filepath, content, 'utf8');
  console.log(`Written: ${filename} (${rows.length} rows)`);
}

function exportRegistry() {
  const headers = ['base_id', 'price_aliases', 'storage_id', 'irrigation_default', 'category', 'source', 'notes'];
  const rows = CropRegistry.CROP_REGISTRY.map(c => [
    c.base_id,
    c.price_aliases.join(','),
    c.storage_id,
    c.irrigation_default,
    c.category,
    c.source,
    c.notes
  ]);
  writeCSV('crops_registry.csv', headers, rows);
}

function exportIrrigation() {
  const headers = ['base_id', 'irrigation_default', 'irrigation_tadla', 'irrigation_souss', 'irrigation_gharb', 'source'];
  const rows = CropRegistry.CROP_REGISTRY.map(c => [
    c.base_id,
    c.irrigation_default,
    c.irrigation_variants.tadla || c.irrigation_default,
    c.irrigation_variants.souss || c.irrigation_default,
    c.irrigation_variants.gharb || c.irrigation_default,
    c.source
  ]);
  writeCSV('crops_irrigation.csv', headers, rows);
}

function exportStorage() {
  const headers = ['crop_name', 'storage_temp_c', 'relative_humidity_pct', 'max_moisture_pct', 'typical_duration_months', 'category'];
  const rows = storageData.FAO_GRAIN_STORAGE_DATABASE.map(c => [
    c.name,
    c.storage_temp_c,
    c.relative_humidity_pct,
    c.max_moisture_pct,
    c.typical_duration_months,
    c.category
  ]);
  writeCSV('crops_storage.csv', headers, rows);
}

function exportPrices() {
  const headers = ['country_code', 'crop_name', 'price_per_kg', 'currency', 'market_name', 'date', 'source_name'];
  const rows = priceData.cropPrices.map(p => [
    p.country_code,
    CropRegistry.resolveBaseId(p.crop_name) || p.crop_name,
    p.price_per_kg,
    p.currency,
    p.market_name,
    p.date,
    p.source_name
  ]);
  writeCSV('crops_prices.csv', headers, rows);
}

function runExport() {
  ensureDir(CSV_DIR);
  
  console.log('Exporting CSV files...');
  console.log(`Output directory: ${CSV_DIR}`);
  console.log(`Format: semicolon-separated, UTF-8 with BOM\n`);
  
  exportRegistry();
  exportIrrigation();
  exportStorage();
  exportPrices();
  
  console.log('\nDone.');
}

if (require.main === module) {
  runExport();
}

module.exports = { runExport, exportRegistry, exportIrrigation, exportStorage, exportPrices };