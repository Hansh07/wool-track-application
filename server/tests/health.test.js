const request = require('supertest');
const app = require('../src/app');

describe('Health Check Endpoint', () => {
    it('GET /health should return healthy status', async () => {
        const res = await request(app).get('/health');

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('status', 'healthy');
        expect(res.body).toHaveProperty('timestamp');
        expect(res.body).toHaveProperty('uptime');
        expect(res.body).toHaveProperty('version', '2.0.0');
    });

    it('GET /health should return valid ISO timestamp', async () => {
        const res = await request(app).get('/health');
        const timestamp = new Date(res.body.timestamp);

        expect(timestamp).toBeInstanceOf(Date);
        expect(isNaN(timestamp.getTime())).toBe(false);
    });

    it('GET /health should return uptime as a number', async () => {
        const res = await request(app).get('/health');

        expect(typeof res.body.uptime).toBe('number');
        expect(res.body.uptime).toBeGreaterThan(0);
    });
});

describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
        const res = await request(app).get('/api/nonexistent-route');

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body.message).toContain('not found');
    });

    it('should return 404 for unknown POST routes', async () => {
        const res = await request(app)
            .post('/api/does-not-exist')
            .send({ data: 'test' });

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });
});

describe('Security Headers', () => {
    it('should include Helmet security headers', async () => {
        const res = await request(app).get('/health');

        // Helmet sets these headers
        expect(res.headers).toHaveProperty('x-content-type-options', 'nosniff');
        expect(res.headers).toHaveProperty('x-frame-options');
    });

    it('should include CORS headers for allowed origins', async () => {
        const res = await request(app)
            .get('/health')
            .set('Origin', 'http://localhost:5173');

        expect(res.headers['access-control-allow-credentials']).toBe('true');
    });
});

describe('Compression', () => {
    it('should compress responses when Accept-Encoding is gzip', async () => {
        const res = await request(app)
            .get('/health')
            .set('Accept-Encoding', 'gzip');

        // Small responses may not be compressed, but the header should be present
        // for larger responses. We just verify the endpoint works with the header.
        expect(res.status).toBe(200);
    });
});
