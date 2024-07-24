/**
 * Loads a VegaLite specification from the provided object and sends it to the backend.
 * @param {Object} vegaLiteInfo - Object containing VegaLite specification data.
 * @param {string} vegaLiteInfo.contents - The VegaLite specification in JSON format.
 */
export function loadVGandSendToBackend(vegaLiteInfo) {
    if (vegaLiteInfo) {
      const vegaLiteSpec = vegaLiteInfo.contents;
      const dataToSend = {
        vgSpec: vegaLiteSpec,
      };
  
      fetch("/api/process-vega-lite-spec", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })
        .then(response => {
          if (response.ok) {
            console.log('VegaLite spec sent successfully!');
          } else {
            console.error('Failed to send VegaLite spec.');
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  }
  
  /**
   * Fetches a VegaLite specification file from the backend.
   * @returns {Promise<Object>} A promise that resolves to the contents of the VegaLite spec file.
   * @throws {Error} Throws an error if the fetch operation fails or the response is not valid JSON.
   */
  export async function getVegaLiteSpec() {
    const filePath = "./spec/vega-lite-spec.vg";
    
    try {
      const response = await fetch(`/api/get-backend-file?file_path=${encodeURIComponent(filePath)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch VegaLite spec from backend.');
      }
      
      const data = await response.json();
      return data.contents;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  