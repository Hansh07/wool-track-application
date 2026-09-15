const jwt = require('jsonwebtoken');
const { requireRole, checkPermission } = require('../src/middleware/auth');

// Helper to create mock Express req/res/next
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext = () => jest.fn();

describe('requireRole Middleware', () => {
    it('should call next() when user has the required role', () => {
        const req = { user: { role: 'FARMER' } };
        const res = mockResponse();
        const next = mockNext();

        requireRole('FARMER', 'ADMIN')(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it('should return 403 when user has wrong role', () => {
        const req = { user: { role: 'BUYER' } };
        const res = mockResponse();
        const next = mockNext();

        requireRole('FARMER', 'ADMIN')(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: false })
        );
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 when no user is present', () => {
        const req = {};
        const res = mockResponse();
        const next = mockNext();

        requireRole('FARMER')(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });
});

describe('checkPermission Middleware', () => {
    it('should allow ADMIN regardless of permissions', () => {
        const req = { user: { role: 'ADMIN', permissions: [] } };
        const res = mockResponse();
        const next = mockNext();

        checkPermission('manage_batches')(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it('should allow user with correct permission', () => {
        const req = { user: { role: 'FARMER', permissions: ['create_batch', 'view_batches'] } };
        const res = mockResponse();
        const next = mockNext();

        checkPermission('create_batch')(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it('should deny user without required permission', () => {
        const req = { user: { role: 'BUYER', permissions: ['view_products'] } };
        const res = mockResponse();
        const next = mockNext();

        checkPermission('create_batch')(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    it('should handle array of permissions (any match)', () => {
        const req = { user: { role: 'FARMER', permissions: ['view_batches'] } };
        const res = mockResponse();
        const next = mockNext();

        checkPermission(['create_batch', 'view_batches'])(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it('should deny when no user is present', () => {
        const req = {};
        const res = mockResponse();
        const next = mockNext();

        checkPermission('create_batch')(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });
});

describe('JWT Token Validation', () => {
    const secret = process.env.JWT_SECRET;

    it('should generate a valid JWT token', () => {
        const payload = { id: '12345', role: 'FARMER' };
        const token = jwt.sign(payload, secret, { expiresIn: '15m' });

        const decoded = jwt.verify(token, secret);
        expect(decoded.id).toBe('12345');
        expect(decoded.role).toBe('FARMER');
    });

    it('should reject an expired token', () => {
        const token = jwt.sign({ id: '12345' }, secret, { expiresIn: '0s' });

        expect(() => jwt.verify(token, secret)).toThrow('jwt expired');
    });

    it('should reject a token with wrong secret', () => {
        const token = jwt.sign({ id: '12345' }, 'wrong-secret');

        expect(() => jwt.verify(token, secret)).toThrow('invalid signature');
    });

    it('should reject a malformed token', () => {
        expect(() => jwt.verify('not.a.valid.token', secret)).toThrow();
    });
});
