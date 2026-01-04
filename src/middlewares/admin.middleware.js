/**
 * Admin Middleware
 * Validates that the user has admin role
 */

const mongoose = require('mongoose');
const UserSchema = require('../models/user');

// Get the User model
const User = mongoose.models.users || mongoose.model('users', UserSchema);

/**
 * Middleware to check if user is authenticated and is admin
 * Expects uid in query params or request body
 */
const adminMiddleware = async (req, res, next) => {
    try {
        // Get uid from query, body, or headers
        const uid = req.query.uid || req.body.uid || req.headers['x-user-uid'];

        if (!uid) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: No user ID provided'
            });
        }

        // Find user and check role
        const user = await User.findOne({ uid: uid });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: User not found'
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Account is deactivated'
            });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Admin access required'
            });
        }

        // Attach user to request for use in controllers
        req.adminUser = user;

        // Update last login
        await User.updateOne({ uid: uid }, { lastLoginAt: new Date() });

        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = adminMiddleware;
