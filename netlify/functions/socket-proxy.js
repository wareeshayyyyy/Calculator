// Simple WebSocket proxy for Netlify
exports.handler = async (event, context) => {
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

  try {
    // Handle socket.io requests
    const { path } = event;
    const body = event.body ? JSON.parse(event.body) : {};

    console.log('Socket request:', path, body);

    // For demo purposes, just acknowledge
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Socket request processed',
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Socket proxy error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Socket processing failed' })
    };
  }
};
