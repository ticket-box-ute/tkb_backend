/**
 * Admin Routes
 * All admin API endpoints
 */

const express = require('express');
const router = express.Router();
const adminMiddleware = require('../middlewares/admin.middleware');
const adminController = require('../controllers/admin_controller');

// Apply admin middleware to all routes
router.use(adminMiddleware);

// Dashboard routes
router.get('/verify', adminController.verifyAdmin);
router.get('/dashboard', adminController.getDashboard);
router.get('/dashboard/revenue', adminController.getRevenueChart);

// Movie management routes
router.get('/movies', adminController.getMovies);
router.get('/movies/:id', adminController.getMovieById);
router.post('/movies', adminController.createMovie);
router.put('/movies/:id', adminController.updateMovie);
router.delete('/movies/:id', adminController.deleteMovie);

// Cinema management routes (Phase 3)
router.get('/cinemas', adminController.getCinemas);
router.get('/cinemas/all', adminController.getAllCinemas);
router.post('/cinemas', adminController.createCinema);
router.put('/cinemas/:id', adminController.updateCinema);
router.delete('/cinemas/:id', adminController.deleteCinema);

// Showtime management routes
router.get('/showtimes', adminController.getShowtimes);
router.post('/showtimes', adminController.createShowtime);
router.put('/showtimes/:id', adminController.updateShowtime);
router.delete('/showtimes/:id', adminController.deleteShowtime);

// Ticket management routes
router.get('/tickets', adminController.getTickets);
router.get('/tickets/statistics', adminController.getTicketStatistics);

// User management routes (Phase 3)
router.get('/users', adminController.getUsers);
router.put('/users/:id/status', adminController.updateUserStatus);
router.put('/users/:id/role', adminController.updateUserRole);

// Review moderation routes (Phase 3)
router.get('/reviews', adminController.getReviews);
router.delete('/reviews/:id', adminController.deleteReview);

// Voucher management routes (Phase 4)
router.get('/vouchers', adminController.getVouchers);
router.post('/vouchers', adminController.createVoucher);
router.put('/vouchers/:id', adminController.updateVoucher);
router.delete('/vouchers/:id', adminController.deleteVoucher);

// Food management routes (Phase 4)
router.get('/foods', adminController.getFoods);
router.post('/foods', adminController.createFood);
router.put('/foods/:id', adminController.updateFood);
router.delete('/foods/:id', adminController.deleteFood);

// Banner management routes (Phase 4)
router.get('/banners', adminController.getBanners);
router.post('/banners', adminController.createBanner);
router.put('/banners/:id', adminController.updateBanner);
router.delete('/banners/:id', adminController.deleteBanner);

module.exports = router;

