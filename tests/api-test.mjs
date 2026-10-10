// Automated Test Suite for EdVyro Production-Ready Capstone API
const BASE_URL = process.env.TEST_URL || 'http://127.0.0.1:3000';

async function runTests() {
  console.log(`\n======================================================`);
  console.log(`🧪 Running EdVyro Capstone Automated Quality Test Suite`);
  console.log(`📍 Target Server: ${BASE_URL}`);
  console.log(`======================================================\n`);

  let passed = 0;
  let failed = 0;
  const results = [];

  async function test(name, fn) {
    const start = Date.now();
    try {
      await fn();
      const duration = Date.now() - start;
      console.log(`  ✅ PASS: ${name} (${duration}ms)`);
      passed++;
      results.push({ name, passed: true, duration });
    } catch (err) {
      const duration = Date.now() - start;
      console.error(`  ❌ FAIL: ${name} (${duration}ms)`);
      console.error(`     Error: ${err.message}`);
      failed++;
      results.push({ name, passed: false, duration, error: err.message });
    }
  }

  function assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  // 1. Health Check Test
  await test('GET /api/health returns 200 with database status connected', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const data = await res.json();
    assert(data.status === 'healthy', `Expected status 'healthy', got ${data.status}`);
    assert(data.database && data.database.status === 'connected', 'Database is not reported connected');
    assert(typeof data.uptimeSeconds === 'number', 'Uptime should be a number');
  });

  // 2. Security Headers Test
  await test('Security headers are injected by Helmet (X-Content-Type-Options)', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    const contentTypeOptions = res.headers.get('x-content-type-options');
    assert(contentTypeOptions === 'nosniff', `Expected nosniff, got ${contentTypeOptions}`);
  });

  // 3. Platform Stats Test
  await test('GET /api/stats returns accurate metrics and categories', async () => {
    const res = await fetch(`${BASE_URL}/api/stats`);
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const data = await res.json();
    assert(data.success === true, 'Success flag should be true');
    assert(data.stats.totalInternships >= 1, `Expected at least 1 internship, got ${data.stats.totalInternships}`);
    assert(Array.isArray(data.stats.categories), 'Categories should be an array');
  });

  // 4. List Internships
  let testInternshipId = 1;
  await test('GET /api/internships returns list of seeded active internships', async () => {
    const res = await fetch(`${BASE_URL}/api/internships`);
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const data = await res.json();
    assert(data.success === true, 'Expected success === true');
    assert(Array.isArray(data.data), 'Expected data to be an array');
    assert(data.data.length > 0, 'Internship array should not be empty');
    assert(data.data[0].title && data.data[0].company, 'Internship item must have title and company');
    assert(Array.isArray(data.data[0].requirements), 'Requirements must be parsed into an array');
    assert(Array.isArray(data.data[0].skills), 'Skills must be parsed into an array');
    testInternshipId = data.data[0].id;
  });

  // 5. Filter Internships by Category
  await test('GET /api/internships?category=Engineering filters by category', async () => {
    const res = await fetch(`${BASE_URL}/api/internships?category=Engineering`);
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const data = await res.json();
    assert(data.data.every(i => i.category === 'Engineering'), 'All filtered items should belong to Engineering');
  });

  // 6. Get Single Internship by ID
  await test(`GET /api/internships/${testInternshipId} returns accurate detail`, async () => {
    const res = await fetch(`${BASE_URL}/api/internships/${testInternshipId}`);
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const data = await res.json();
    assert(data.data.id === testInternshipId, `Expected ID ${testInternshipId}`);
  });

  // 7. Create New Internship
  let createdJobId = null;
  await test('POST /api/internships creates role with validation', async () => {
    const payload = {
      title: 'QA Automation Engineer Intern',
      company: 'TestRig Global',
      location: 'Remote',
      work_type: 'Remote',
      category: 'Engineering',
      stipend: '$35/hr',
      duration: '10 Weeks',
      description: 'Design automated integration tests and regression verification suites for modern web portals.',
      requirements: ['Basic JavaScript/TypeScript knowledge', 'Familiarity with REST APIs'],
      skills: ['Playwright', 'Jest', 'TypeScript', 'CI/CD'],
      deadline: '2026-12-31'
    };

    const res = await fetch(`${BASE_URL}/api/internships`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    assert(res.status === 201, `Expected status 201, got ${res.status}`);
    const data = await res.json();
    assert(data.success === true, 'Expected success === true');
    assert(data.data.title === payload.title, 'Created title mismatch');
    createdJobId = data.data.id;
  });

  // 8. Submit Student Application
  let createdAppId = null;
  const testCandidateEmail = `candidate.${Date.now()}@edvyro-test.edu`;
  await test('POST /api/applications records candidate application to SQLite', async () => {
    const payload = {
      internship_id: testInternshipId,
      full_name: 'Priya Sharma',
      email: testCandidateEmail,
      phone: '+1 (555) 987-6543',
      college: 'Georgia Institute of Technology',
      graduation_year: 2026,
      resume_url: 'https://linkedin.com/in/priyasharma-engineer',
      cover_letter: 'Deep interest in building resilient full stack services with TypeScript and SQLite.'
    };

    const res = await fetch(`${BASE_URL}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    assert(res.status === 201, `Expected 201, got ${res.status}`);
    const data = await res.json();
    assert(data.success === true, 'Application submission failed');
    assert(data.data.email === testCandidateEmail, 'Stored email does not match');
    createdAppId = data.data.id;
  });

  // 9. Server-Side Validation Rejection (Malformed Email)
  await test('POST /api/applications rejects invalid input with 400 Bad Request', async () => {
    const badPayload = {
      internship_id: testInternshipId,
      full_name: 'Bad Input User',
      email: 'not-a-valid-email', // Invalid email
      phone: '123', // Too short
      college: '',
      graduation_year: 1990, // Out of range
      resume_url: ''
    };

    const res = await fetch(`${BASE_URL}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(badPayload)
    });

    assert(res.status === 400, `Expected 400 Bad Request, got ${res.status}`);
    const data = await res.json();
    assert(data.error === 'Application validation failed', 'Validation error title missing');
    assert(Array.isArray(data.details) && data.details.length >= 3, 'Expected multiple validation detail errors');
  });

  // 10. Track Applications by Email
  await test('GET /api/applications/track finds candidate submitted applications', async () => {
    const res = await fetch(`${BASE_URL}/api/applications/track?email=${encodeURIComponent(testCandidateEmail)}`);
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const data = await res.json();
    assert(data.count >= 1, 'Expected at least 1 tracked application');
    assert(data.data[0].email === testCandidateEmail, 'Tracked email does not match');
  });

  // 11. Update Application Status (Recruiter Workflow)
  await test(`PATCH /api/applications/${createdAppId}/status updates status in database`, async () => {
    const res = await fetch(`${BASE_URL}/api/applications/${createdAppId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Interview' })
    });

    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.data.status === 'Interview', 'Status was not updated to Interview');
  });

  // 12. Non-existent Route 404 Handling
  await test('GET /api/nonexistent-route returns structured 404 JSON', async () => {
    const res = await fetch(`${BASE_URL}/api/nonexistent-route`);
    assert(res.status === 404, `Expected 404, got ${res.status}`);
    const data = await res.json();
    assert(data.code === 'NOT_FOUND', 'Expected NOT_FOUND code');
  });

  // Clean up created test job if created
  if (createdJobId) {
    await fetch(`${BASE_URL}/api/internships/${createdJobId}`, { method: 'DELETE' });
  }

  console.log(`\n======================================================`);
  console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed out of ${results.length} Tests`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
