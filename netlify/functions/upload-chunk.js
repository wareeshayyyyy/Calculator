const multiparty = require('multiparty');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse form data
    const form = new multiparty.Form();
    
    return new Promise((resolve, reject) => {
      form.parse(event.body, (err, fields, files) => {
        if (err) {
          resolve({
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Failed to parse form data' })
          });
          return;
        }

        const connectionId = fields.connectionId ? fields.connectionId[0] : 'unknown';
        const timestamp = fields.timestamp ? fields.timestamp[0] : new Date().toISOString();
        const chunkIndex = fields.chunkIndex ? fields.chunkIndex[0] : 0;

        console.log(`🎥 Received chunk ${chunkIndex} for connection ${connectionId}`);

        // In Netlify, we just acknowledge receipt
        // For actual storage, you'd integrate with a service like Cloudinary or AWS S3
        resolve({
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            connectionId,
            timestamp,
            chunkIndex,
            message: 'Chunk received and processed'
          })
        });
      });
    });

  } catch (error) {
    console.error('Error processing upload:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Upload processing failed' })
    };
  }
};
