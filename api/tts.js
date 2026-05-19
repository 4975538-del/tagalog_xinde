export async function onRequest(context) {
  const { request } = context;
  
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { text } = await request.json();
    
    if (!text) {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const ELEVENLABS_API_KEY = 'sk_ed1ef428e8b6dfc36f4e92099210c29af96ba1d0a806fcf5';

    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/P1hTNpVDMG973fukK9V2', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        language_code: 'fil',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          speed: 0.9
        }
      })
    });

    if (!response.ok) {
      return new Response('TTS error', { status: response.status });
    }

    return new Response(response.body, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response('Server error', { status: 500 });
  }
}
