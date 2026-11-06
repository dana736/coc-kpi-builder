export const json = (data, status=200) => new Response(JSON.stringify(data), {status, headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});

// Kajabi gates the lesson, but not the public Netlify API. Verify a human challenge
// server-side before any Google/OpenAI work. Never expose the secret in client code.
export async function verifyTurnstile(token, request) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) throw new Error('Human verification has not been configured.');
  if (typeof token !== 'string' || token.length < 10 || token.length > 2048) return false;
  const body = new URLSearchParams({secret, response:token});
  const ip = request.headers.get('x-nf-client-connection-ip');
  if (ip) body.set('remoteip',ip);
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'},body,
    signal: AbortSignal.timeout(8000)
  });
  if (!r.ok) return false;
  const result = await r.json();
  return result.success === true;
}

export function clientIp(request) {
  return request.headers.get('x-nf-client-connection-ip') || 'unknown';
}
