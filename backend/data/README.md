# Crop Data - Phase 3.5

## Overview
Unified crop registry with Morocco-primary + Africa-secondary crop sets.

## Base ID Pattern
Single lowercase identifier per crop family:
- `wheat`, `barley`, `maize`, `potato`, `tomato`, `onion`, etc.

## Files
| File | Description |
|------|-------------|
| `cropRegistry.js` | Single source of truth (44 crops) |
| `cropCoefficients.js` | FAO-56 Kc values (121 crops) |
| `shelfLifeTables.js` | Storage conditions (42 entries) |
| `priceSeedData.js` | Price data (92 entries, 19 countries) |
| `csv/crops_registry.csv` | Registry export |
| `csv/crops_irrigation.csv` | Irrigation defaults |
| `csv/crops_storage.csv` | Storage conditions |
| `csv/crops_prices.csv` | Normalized prices |

## CSV Format
- Delimiter: semicolon (`;`)
- Encoding: UTF-8 with BOM (Excel-compatible for Arabic)
- Field names in header row

## API
```javascript
const CropRegistry = require('./cropRegistry');

CropRegistry.resolveBaseId('corn')         // → 'maize'
CropRegistry.resolveBaseId('irish_potato') // → 'potato'
CropRegistry.getDatasetKey('wheat', 'storage') // → 'Wheat'
CropRegistry.listMoroccanPriority()        // → ['wheat', 'barley', ...]
```

## Sources
- FAO-56 (irrigation coefficients)
- FAOSTAT (prices)
- ONCA/HCP (Morocco specific)
- AGRA/WFP (Africa prices)

## Validation
```bash
node scripts/validateCropData.js
```

## Exports
```bash
node scripts/exportCsv.js
```