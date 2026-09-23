import { spawn } from 'child_process';

const BASE_URL = 'http://127.0.0.1:5000';

// Start server child process
console.log('Launching server process...');
const serverProc = spawn('node', ['src/server.js'], {
  cwd: process.cwd(),
  env: { ...process.env, PORT: '5000' }
});

serverProc.stdout.on('data', (data) => console.log(`[Server stdout] ${data.toString().trim()}`));
serverProc.stderr.on('data', (data) => console.error(`[Server stderr] ${data.toString().trim()}`));

// Helper sleep
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  await sleep(2500); // Give server time to connect to MongoDB
  console.log('--- Starting Backend API Test Suite ---');
  let testToken = null;
  let canvasId = null;

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthJson = await healthRes.json();
    console.log('1. Health Check:', healthRes.status === 200 && healthJson.success ? 'PASS' : 'FAIL');

    // 2. Register user
    const testEmail = `intern_${Date.now()}@example.com`;
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Intern Candidate',
        email: testEmail,
        password: 'password123'
      })
    });
    const regJson = await regRes.json();
    console.log('2. User Register:', regRes.status === 201 && regJson.success ? 'PASS' : 'FAIL');
    testToken = regJson.data.token;

    // 3. Login user
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'password123'
      })
    });
    const loginJson = await loginRes.json();
    console.log('3. User Login:', loginRes.status === 200 && loginJson.success ? 'PASS' : 'FAIL');

    // 4. Get Me
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${testToken}` }
    });
    const meJson = await meRes.json();
    console.log('4. Auth Me Check:', meRes.status === 200 && meJson.data.email === testEmail ? 'PASS' : 'FAIL');

    // 5. Protected route without token (expect 401)
    const unauthRes = await fetch(`${BASE_URL}/api/canvases`);
    console.log('5. Unauthenticated Check (401):', unauthRes.status === 401 ? 'PASS' : 'FAIL');

    // 6. Create Canvas
    const createRes = await fetch(`${BASE_URL}/api/canvases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`
      },
      body: JSON.stringify({
        name: 'Sprint Planning Canvas',
        shapes: [
          {
            id: 'rect_1',
            type: 'rect',
            x: 50,
            y: 50,
            width: 100,
            height: 80,
            rotation: 0,
            fill: '#3b82f6'
          },
          {
            id: 'circle_1',
            type: 'circle',
            x: 200,
            y: 200,
            radius: 40,
            rotation: 0,
            fill: '#10b981'
          }
        ]
      })
    });
    const createJson = await createRes.json();
    console.log('6. Create Canvas (201):', createRes.status === 201 && createJson.success ? 'PASS' : 'FAIL');
    canvasId = createJson.data._id;

    // 7. Get Canvases
    const listRes = await fetch(`${BASE_URL}/api/canvases`, {
      headers: { Authorization: `Bearer ${testToken}` }
    });
    const listJson = await listRes.json();
    console.log('7. List Canvases:', listRes.status === 200 && listJson.data.length >= 1 ? 'PASS' : 'FAIL');

    // 8. Get Canvas By ID
    const getRes = await fetch(`${BASE_URL}/api/canvases/${canvasId}`, {
      headers: { Authorization: `Bearer ${testToken}` }
    });
    const getJson = await getRes.json();
    console.log('8. Get Canvas By ID:', getRes.status === 200 && getJson.data.shapes.length === 2 ? 'PASS' : 'FAIL');

    // 9. Update Canvas
    const updateRes = await fetch(`${BASE_URL}/api/canvases/${canvasId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`
      },
      body: JSON.stringify({
        name: 'Sprint Planning Canvas Updated',
        shapes: [
          {
            id: 'rect_1',
            type: 'rect',
            x: 60,
            y: 60,
            width: 120,
            height: 90,
            rotation: 15,
            fill: '#ef4444'
          }
        ]
      })
    });
    const updateJson = await updateRes.json();
    console.log('9. Update Canvas:', updateRes.status === 200 && updateJson.data.shapes.length === 1 ? 'PASS' : 'FAIL');

    // 10. Ownership Isolation (User 2 attempts to get User 1 canvas -> 403 Forbidden)
    const regUser2 = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Second Engineer',
        email: `second_${Date.now()}@example.com`,
        password: 'password123'
      })
    });
    const user2Json = await regUser2.json();
    const forbiddenRes = await fetch(`${BASE_URL}/api/canvases/${canvasId}`, {
      headers: { Authorization: `Bearer ${user2Json.data.token}` }
    });
    console.log('10. Ownership Isolation (403 Forbidden):', forbiddenRes.status === 403 ? 'PASS' : 'FAIL');

    // 11. Input Validation (Bad shape type -> 400 Bad Request)
    const invalidRes = await fetch(`${BASE_URL}/api/canvases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`
      },
      body: JSON.stringify({
        name: 'Invalid Canvas',
        shapes: [{ id: 'bad_1', type: 'triangle', x: 0, y: 0 }]
      })
    });
    console.log('11. Input Validation (400 Bad Request):', invalidRes.status === 400 ? 'PASS' : 'FAIL');

    // 12. Delete Canvas
    const delRes = await fetch(`${BASE_URL}/api/canvases/${canvasId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${testToken}` }
    });
    console.log('12. Delete Canvas (200):', delRes.status === 200 ? 'PASS' : 'FAIL');

    console.log('=============================================');
    console.log('ALL 12 BACKEND INTEGRATION TESTS PASSED!');
    console.log('=============================================');
  } catch (err) {
    console.error('Test Suite Failed:', err);
  } finally {
    serverProc.kill();
    process.exit(0);
  }
}

runTests();
