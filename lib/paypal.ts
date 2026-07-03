export async function getPayPalAccessToken() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;

  if (!clientId || !secret) {
    throw new Error('PayPal credentials are not set in environment variables.');
  }

  const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');

  // Change to https://api-m.paypal.com for production
  const url = 'https://api-m.sandbox.paypal.com/v1/oauth2/token';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}
