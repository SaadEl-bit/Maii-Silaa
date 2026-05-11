/**
 * FILAHA Detection Service
 * AI Photo Diagnosis — uploads photo + gets AI analysis
 *
 * Endpoints:
 *   POST /api/detection/analyze  → upload photo, get diagnosis
 *   GET  /api/detection/history → detection history
 */

const Detection = {
  /**
   * Upload plant photo and get AI diagnosis
   * @param {string} base64Image - base64 encoded image (data URL)
   * @param {string} mimeType - e.g. 'image/jpeg'
   */
  async analyze(base64Image, mimeType = 'image/jpeg') {
    const formData = new FormData();
    const blob = this._base64ToBlob(base64Image, mimeType);
    formData.append('image', blob, 'plant.jpg');

    return API.upload(CONFIG.ENDPOINTS.detectionAnalyze, formData);
  },

  /**
   * Get detection history
   */
  async getHistory() {
    return API.get(CONFIG.ENDPOINTS.detectionHistory);
  },

  _base64ToBlob(base64, mimeType) {
    const base64Data = base64.split(',')[1] || base64;
    const binary = atob(base64Data);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }
    return new Blob([array], { type: mimeType });
  },
};

window.FILAHA_DETECTION = Detection;