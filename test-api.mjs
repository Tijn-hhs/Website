import https from 'https';

// Get token from AWS Cognito
async function getToken() {
  // For now, we'll use the token from the browser
  console.log('Please paste your Authorization token from the browser console:');
  console.log('Run: await fetchAuthSession()');
  console.log('Then copy the idToken.toString() value');
}

// Test API call
async function testApiCall(token, payload) {
  const options = {
    hostname: 'fb1al1mz2f.execute-api.eu-north-1.amazonaws.com',
    port: 443,
    path: '/prod/user/me',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('\n=== Response ===');
        console.log('Status Code:', res.statusCode);
        console.log('Headers:', JSON.stringify(res.headers, null, 2));
        console.log('Body:', data);
        
        try {
          const parsed = JSON.parse(data);
          console.log('\nParsed Body:', JSON.stringify(parsed, null, 2));
        } catch (e) {
          console.log('\nFailed to parse body as JSON');
        }
        
        resolve({ statusCode: res.statusCode, body: data });
      });
    });

    req.on('error', (error) => {
      console.error('\n=== Request Error ===');
      console.error(error);
      reject(error);
    });

    const jsonData = JSON.stringify(payload);
    console.log('\n=== Sending Request ===');
    console.log('URL: https://fb1al1mz2f.execute-api.eu-north-1.amazonaws.com/prod/user/me');
    console.log('Method: PUT');
    console.log('Payload:', jsonData);
    
    req.write(jsonData);
    req.end();
  });
}

// Example payload
const payload = {
  nationality: 'Test',
  destinationCountry: 'Test Country',
  destinationCity: 'Test City',
  studyLevel: 'phd',
  startDate: '2026-09-01',
  flightsBooked: false,
  residencePermitNeeded: false,
  bankAccountNeeded: false,
  legalDocsReady: false,
};

console.log('=== API Test Script ===');
console.log('\nTo run this script with your auth token:');
console.log('1. Open browser console');
console.log('2. Run: import { fetchAuthSession } from "aws-amplify/auth";');
console.log('3. Run: const session = await fetchAuthSession();');
console.log('4. Run: console.log(session.tokens.idToken.toString());');
console.log('5. Copy the token and run: TOKEN="your-token-here" node test-api.mjs');
console.log('\nOr just paste it when prompted...\n');

// Check if token provided via environment variable
const token = process.env.TOKEN;
if (token) {
  testApiCall(token, payload);
} else {
  console.log('\nNo TOKEN environment variable found.');
  console.log('Run: TOKEN="your-token" node test-api.mjs');
}
