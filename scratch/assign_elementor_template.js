const auth = 'Basic ' + Buffer.from('Admin:DcuLQnGbj3gRYZRWxiZGHCAf').toString('base64');
const baseUrl = 'https://zapmonei.com.br/wp-json/wp/v2';
const templateId = 46;
const productId = 21;

async function assignTemplate() {
  // Elementor conditions are stored as an array of strings
  // For a specific product, the condition is usually 'include/product_id/21'
  const conditions = ['include/product_id/' + productId];
  
  const payload = {
    meta: {
      _elementor_conditions: JSON.stringify(conditions)
    }
  };

  try {
    const response = await fetch(`${baseUrl}/elementor_library/${templateId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': auth
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log('Template conditions updated:', JSON.stringify(result.meta._elementor_conditions));
  } catch (error) {
    console.error('Error assigning template:', error);
  }
}

assignTemplate();
