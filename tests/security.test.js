const request = require('supertest');
const app = require('../src/app');

test('should escape HTML in /hello', async () => {
  const payload = '<script>alert(1)</script>';
  const res = await request(app).get('/hello').query({ name: payload });

  expect(res.status).toBe(200);
  expect(res.text).not.toContain(payload);
  expect(res.text).toContain('&lt;script&gt;');
});

test('should reject shell commands in /ping host', async () => {
  const host = '127.0.0.1; echo injected';
  const res = await request(app).get('/ping').query({ host });

  expect(res.status).toBe(400);
});

test('should ignore unknown preference keys', async () => {
  const res = await request(app).get('/prefs?constructor[prototype][admin]=true');

  expect(res.status).toBe(200);
  expect(res.body).toEqual({ theme: 'light', lang: 'fr' });
  expect({}.admin).toBeUndefined();
});
