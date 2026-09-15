const request = require('supertest');
const app = require('../src/app');

describe('Auth API — Input Validation', () => {
    // These tests verify the Express Validator rules on auth routes
    // They DON'T hit MongoDB — they get rejected by validation BEFORE the controller

    describe('POST /api/auth/register — Validation', () => {
        it('should reject registration with missing fields', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Validation failed');
            expect(res.body.errors).toBeInstanceOf(Array);
            expect(res.body.errors.length).toBeGreaterThan(0);
        });

        it('should reject registration with invalid email', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'not-an-email',
                    password: 'Password123',
                });

            expect(res.status).toBe(400);
            expect(res.body.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ field: 'email' }),
                ])
            );
        });

        it('should reject registration with weak password', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: '123',  // Too short, no uppercase
                });

            expect(res.status).toBe(400);
            expect(res.body.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ field: 'password' }),
                ])
            );
        });

        it('should reject registration with short name', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'A',  // Too short (min 2)
                    email: 'test@example.com',
                    password: 'Password123',
                });

            expect(res.status).toBe(400);
            expect(res.body.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ field: 'name' }),
                ])
            );
        });

        it('should reject registration with invalid role', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'Password123',
                    role: 'SUPER_ADMIN',  // Not in allowed list
                });

            expect(res.status).toBe(400);
            expect(res.body.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ field: 'role' }),
                ])
            );
        });
    });

    describe('POST /api/auth/login — Validation', () => {
        it('should reject login with missing email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ password: 'Password123' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should reject login with missing password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should reject login with invalid email format', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'invalid', password: 'Password123' });

            expect(res.status).toBe(400);
        });
    });

    describe('Protected Routes — No Token', () => {
        it('GET /api/auth/me should return 401 without token', async () => {
            const res = await request(app).get('/api/auth/me');

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Not authorized');
        });

        it('GET /api/batches should return 401 without token', async () => {
            const res = await request(app).get('/api/batches');

            // Should be 401 (no token) — verifies auth middleware is applied
            expect([401, 403]).toContain(res.status);
            expect(res.body.success).toBe(false);
        });
    });
});
