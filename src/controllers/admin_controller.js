/**
 * Admin Controller
 * Handles all admin-related operations
 */

const mongoose = require('mongoose');
const UserSchema = require('../models/user');
const TicketSchema = require('../models/ticket');
const MovieSchema = require('../models/movie');
const ReviewSchema = require('../models/review');
const CinemaSchema = require('../models/cinema');
const VoucherSchema = require('../models/voucher');
const FoodSchema = require('../models/food');
const Banner = require('../models/banner');

// Get models
const User = mongoose.models.users || mongoose.model('users', UserSchema);
const Ticket = mongoose.models.tickets || mongoose.model('tickets', TicketSchema);
const Movie = mongoose.models.movies || mongoose.model('movies', MovieSchema);
const NowShowing = mongoose.models.now_showings || mongoose.model('now_showings', MovieSchema);
const ComingSoon = mongoose.models.coming_soons || mongoose.model('coming_soons', MovieSchema);
const Review = mongoose.models.reviews || mongoose.model('reviews', ReviewSchema);
const Cinema = mongoose.models.cinemas || mongoose.model('cinemas', CinemaSchema);
const Voucher = mongoose.models.vouchers || mongoose.model('vouchers', VoucherSchema);
const Food = mongoose.models.foods || mongoose.model('foods', FoodSchema);

/**
 * Verify admin access
 * GET /api/admin/verify
 */
const verifyAdmin = async (req, res) => {
    try {
        // If middleware passed, user is admin
        res.json({
            success: true,
            message: 'Admin access verified',
            data: {
                uid: req.adminUser.uid,
                displayName: req.adminUser.displayName,
                email: req.adminUser.email,
                role: req.adminUser.role
            }
        });
    } catch (error) {
        console.error('Verify admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Get dashboard statistics
 * GET /api/admin/dashboard
 */
const getDashboard = async (req, res) => {
    try {
        // Get current date info
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);

        // Count statistics
        const [
            totalUsers,
            totalMovies,
            totalNowShowing,
            totalComingSoon,
            totalCinemas,
            totalTickets,
            totalReviews,
            totalVouchers,
            recentTickets
        ] = await Promise.all([
            User.countDocuments(),
            Movie.countDocuments(),
            NowShowing.countDocuments(),
            ComingSoon.countDocuments(),
            Cinema.countDocuments(),
            Ticket.countDocuments(),
            Review.countDocuments(),
            Voucher.countDocuments(),
            Ticket.find().sort({ timestamp: -1 }).limit(10)
        ]);

        // Calculate revenue from tickets
        let totalRevenue = 0;
        let todayRevenue = 0;
        let weekRevenue = 0;
        let monthRevenue = 0;
        let todayTickets = 0;
        let weekTickets = 0;

        const allTickets = await Ticket.find();
        allTickets.forEach(ticket => {
            const ticketDate = new Date(ticket.timestamp);
            const price = ticket.price || 0;

            totalRevenue += price;

            if (ticketDate >= startOfToday) {
                todayRevenue += price;
                todayTickets++;
            }
            if (ticketDate >= startOfWeek) {
                weekRevenue += price;
                weekTickets++;
            }
            if (ticketDate >= startOfMonth) {
                monthRevenue += price;
            }
        });

        // Get top movies by purchases
        const topMovies = await Movie.find()
            .sort({ totalPurchases: -1 })
            .limit(5)
            .select('name thumbnail totalPurchases rating');

        res.json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    totalMovies,
                    totalNowShowing,
                    totalComingSoon,
                    totalCinemas,
                    totalTickets,
                    totalReviews,
                    totalVouchers
                },
                revenue: {
                    total: totalRevenue,
                    today: todayRevenue,
                    week: weekRevenue,
                    month: monthRevenue
                },
                tickets: {
                    today: todayTickets,
                    week: weekTickets,
                    total: totalTickets
                },
                topMovies,
                recentTickets: recentTickets.map(t => ({
                    ticketId: t.ticketId,
                    movieName: t.movie?.name,
                    quantity: t.quantity,
                    price: t.price,
                    date: t.date,
                    timestamp: t.timestamp
                }))
            }
        });
    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get revenue chart data (last 7 days)
 * GET /api/admin/dashboard/revenue
 */
const getRevenueChart = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const now = new Date();
        const chartData = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

            const dayTickets = await Ticket.find({
                timestamp: {
                    $gte: startOfDay.getTime(),
                    $lt: endOfDay.getTime()
                }
            });

            const dayRevenue = dayTickets.reduce((sum, t) => sum + (t.price || 0), 0);
            const dayCount = dayTickets.length;

            chartData.push({
                date: startOfDay.toISOString().split('T')[0],
                revenue: dayRevenue,
                tickets: dayCount
            });
        }

        res.json({
            success: true,
            data: chartData
        });
    } catch (error) {
        console.error('Get revenue chart error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// ============================================
// CINEMA MANAGEMENT (Phase 3)
// ============================================

/**
 * Get all cinemas with pagination and search
 * GET /api/admin/cinemas
 */
const getCinemas = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const type = req.query.type || '';
        const cityName = req.query.cityName || '';

        let query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { address: { $regex: search, $options: 'i' } }
            ];
        }

        if (type) {
            query.type = type;
        }

        if (cityName) {
            query.cityName = { $regex: cityName, $options: 'i' };
        }

        const [cinemas, total] = await Promise.all([
            Cinema.find(query)
                .skip(skip)
                .limit(limit)
                .sort({ name: 1 }),
            Cinema.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: {
                cinemas,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get cinemas error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Get all cinemas (no filter - for dropdowns)
 * GET /api/admin/cinemas/all
 */
const getAllCinemas = async (req, res) => {
    try {
        const cinemas = await Cinema.find({}).select('name address cityName type').sort({ name: 1 });

        res.json({
            success: true,
            data: {
                cinemas
            }
        });
    } catch (error) {
        console.error('Get all cinemas error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Create a new cinema
 * POST /api/admin/cinemas
 */
const createCinema = async (req, res) => {
    try {
        const { name, type, cityName, address, thumbnail, lat, long, rooms } = req.body;

        if (!name || !type || !cityName) {
            return res.status(400).json({
                success: false,
                message: 'Name, type, and cityName are required'
            });
        }

        const cinema = new Cinema({
            _id: new mongoose.Types.ObjectId(),
            name,
            type,
            cityName,
            address: address || '',
            thumbnail: thumbnail || '',
            lat: lat || 0,
            long: long || 0,
            rooms: rooms || []
        });

        await cinema.save();

        res.status(201).json({
            success: true,
            message: 'Cinema created successfully',
            data: cinema
        });
    } catch (error) {
        console.error('Create cinema error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Update a cinema
 * PUT /api/admin/cinemas/:id
 */
const updateCinema = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, cityName, address, thumbnail, lat, long, rooms } = req.body;

        const cinema = await Cinema.findByIdAndUpdate(
            id,
            {
                name,
                type,
                cityName,
                address,
                thumbnail,
                lat,
                long,
                rooms
            },
            { new: true }
        );

        if (!cinema) {
            return res.status(404).json({
                success: false,
                message: 'Cinema not found'
            });
        }

        res.json({
            success: true,
            message: 'Cinema updated successfully',
            data: cinema
        });
    } catch (error) {
        console.error('Update cinema error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Delete a cinema
 * DELETE /api/admin/cinemas/:id
 */
const deleteCinema = async (req, res) => {
    try {
        const { id } = req.params;

        const cinema = await Cinema.findByIdAndDelete(id);

        if (!cinema) {
            return res.status(404).json({
                success: false,
                message: 'Cinema not found'
            });
        }

        res.json({
            success: true,
            message: 'Cinema deleted successfully'
        });
    } catch (error) {
        console.error('Delete cinema error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// ============================================
// MOVIE MANAGEMENT
// ============================================

/**
 * Get all movies with pagination and filter
 * GET /api/admin/movies
 */
const getMovies = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const category = req.query.category || '';
        const collection = req.query.collection || 'movies'; // movies, now_showings, coming_soons

        let Model;
        switch (collection) {
            case 'now_showings':
                Model = NowShowing;
                break;
            case 'coming_soons':
                Model = ComingSoon;
                break;
            default:
                Model = Movie;
        }

        let query = {};
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        if (category) {
            query.categories = category;
        }

        const [movies, total] = await Promise.all([
            Model.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
            Model.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: {
                movies,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get movies error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get single movie by ID
 * GET /api/admin/movies/:id
 */
const getMovieById = async (req, res) => {
    try {
        const { id } = req.params;
        const collection = req.query.collection || 'movies';

        let Model;
        switch (collection) {
            case 'now_showings':
                Model = NowShowing;
                break;
            case 'coming_soons':
                Model = ComingSoon;
                break;
            default:
                Model = Movie;
        }

        const movie = await Model.findById(id);
        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found'
            });
        }

        res.json({
            success: true,
            data: movie
        });
    } catch (error) {
        console.error('Get movie by id error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Create new movie
 * POST /api/admin/movies
 */
const createMovie = async (req, res) => {
    try {
        const collection = req.body.collection || 'movies';
        const movieData = { ...req.body };
        delete movieData.collection;

        let Model;
        switch (collection) {
            case 'now_showings':
                Model = NowShowing;
                break;
            case 'coming_soons':
                Model = ComingSoon;
                break;
            default:
                Model = Movie;
        }

        const movie = new Model(movieData);
        await movie.save();

        res.status(201).json({
            success: true,
            message: 'Movie created successfully',
            data: movie
        });
    } catch (error) {
        console.error('Create movie error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Update movie
 * PUT /api/admin/movies/:id
 */
const updateMovie = async (req, res) => {
    try {
        const { id } = req.params;
        const collection = req.body.collection || 'movies';
        const updateData = { ...req.body };
        delete updateData.collection;

        let Model;
        switch (collection) {
            case 'now_showings':
                Model = NowShowing;
                break;
            case 'coming_soons':
                Model = ComingSoon;
                break;
            default:
                Model = Movie;
        }

        const movie = await Model.findByIdAndUpdate(id, updateData, { new: true });
        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found'
            });
        }

        res.json({
            success: true,
            message: 'Movie updated successfully',
            data: movie
        });
    } catch (error) {
        console.error('Update movie error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Delete movie
 * DELETE /api/admin/movies/:id
 */
const deleteMovie = async (req, res) => {
    try {
        const { id } = req.params;
        const collection = req.query.collection || 'movies';

        let Model;
        switch (collection) {
            case 'now_showings':
                Model = NowShowing;
                break;
            case 'coming_soons':
                Model = ComingSoon;
                break;
            default:
                Model = Movie;
        }

        const movie = await Model.findByIdAndDelete(id);
        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found'
            });
        }

        res.json({
            success: true,
            message: 'Movie deleted successfully'
        });
    } catch (error) {
        console.error('Delete movie error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// ============================================
// SHOWTIME MANAGEMENT
// ============================================

// Get Showtime model
const ShowtimeSchema = require('../models/showtime');
const Showtime = mongoose.models.showtimes || mongoose.model('showtimes', ShowtimeSchema);

/**
 * Get all showtimes
 * GET /api/admin/showtimes
 */
const getShowtimes = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const movieId = req.query.movieId || '';
        const cinemaId = req.query.cinemaId || '';
        const date = req.query.date || '';

        let query = {};
        if (movieId) query.movieId = movieId;
        if (cinemaId) query.cinemaId = cinemaId;
        if (date) query.date = date;

        const [showtimes, total] = await Promise.all([
            Showtime.find(query).skip(skip).limit(limit).sort({ date: -1 }),
            Showtime.countDocuments(query)
        ]);

        // Populate movie and cinema info if not already embedded
        const populatedShowtimes = await Promise.all(showtimes.map(async (st) => {
            const showtime = st.toObject();

            // If movie object not present, try to fetch from collection
            if (!showtime.movie || !showtime.movie.name) {
                if (showtime.movieId) {
                    const movie = await NowShowing.findById(showtime.movieId).select('name thumbnail');
                    if (movie) {
                        showtime.movie = movie.toObject();
                    }
                }
            }

            // If cinema object not present, try to fetch from collection
            if (!showtime.cinema || !showtime.cinema.name) {
                if (showtime.cinemaId) {
                    const cinema = await Cinema.findById(showtime.cinemaId).select('name address');
                    if (cinema) {
                        showtime.cinema = cinema.toObject();
                    }
                }
            }

            return showtime;
        }));

        res.json({
            success: true,
            data: {
                showtimes: populatedShowtimes,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get showtimes error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Create showtime
 * POST /api/admin/showtimes
 */
const createShowtime = async (req, res) => {
    try {
        const showtime = new Showtime(req.body);
        await showtime.save();

        res.status(201).json({
            success: true,
            message: 'Showtime created successfully',
            data: showtime
        });
    } catch (error) {
        console.error('Create showtime error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Update showtime
 * PUT /api/admin/showtimes/:id
 */
const updateShowtime = async (req, res) => {
    try {
        const { id } = req.params;
        const showtime = await Showtime.findByIdAndUpdate(id, req.body, { new: true });

        if (!showtime) {
            return res.status(404).json({
                success: false,
                message: 'Showtime not found'
            });
        }

        res.json({
            success: true,
            message: 'Showtime updated successfully',
            data: showtime
        });
    } catch (error) {
        console.error('Update showtime error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Delete showtime
 * DELETE /api/admin/showtimes/:id
 */
const deleteShowtime = async (req, res) => {
    try {
        const { id } = req.params;
        const showtime = await Showtime.findByIdAndDelete(id);

        if (!showtime) {
            return res.status(404).json({
                success: false,
                message: 'Showtime not found'
            });
        }

        res.json({
            success: true,
            message: 'Showtime deleted successfully'
        });
    } catch (error) {
        console.error('Delete showtime error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// ============================================
// TICKET MANAGEMENT
// ============================================

/**
 * Get all tickets with filters
 * GET /api/admin/tickets
 */
const getTickets = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [tickets, total] = await Promise.all([
            Ticket.find().skip(skip).limit(limit).sort({ timestamp: -1 }),
            Ticket.countDocuments()
        ]);

        res.json({
            success: true,
            data: {
                tickets,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get tickets error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Get detailed ticket statistics
 * GET /api/admin/tickets/statistics
 */
const getTicketStatistics = async (req, res) => {
    try {
        const period = req.query.period || '7'; // Days
        const days = parseInt(period);

        const now = new Date();
        const startDate = new Date(now);
        startDate.setDate(now.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        // Get all tickets in period
        const allTickets = await Ticket.find({
            timestamp: { $gte: startDate.getTime() }
        });

        // Calculate daily revenue for chart
        const dailyRevenue = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setDate(date.getDate() + 1);

            const dayTickets = allTickets.filter(t => {
                const ticketDate = new Date(t.timestamp);
                return ticketDate >= date && ticketDate < nextDate;
            });

            const revenue = dayTickets.reduce((sum, t) => sum + (t.price || 0), 0);
            const ticketCount = dayTickets.length;

            dailyRevenue.push({
                date: date.toISOString().split('T')[0],
                label: `${date.getDate()}/${date.getMonth() + 1}`,
                revenue,
                ticketCount
            });
        }

        // Stats by cinema type
        const byCinema = {};
        allTickets.forEach(t => {
            const cinemaType = t.cinema?.type || 'Unknown';
            if (!byCinema[cinemaType]) {
                byCinema[cinemaType] = { ticketCount: 0, revenue: 0 };
            }
            byCinema[cinemaType].ticketCount++;
            byCinema[cinemaType].revenue += t.price || 0;
        });

        // Stats by movie
        const byMovie = {};
        allTickets.forEach(t => {
            const movieName = t.movie?.name || 'Unknown';
            if (!byMovie[movieName]) {
                byMovie[movieName] = {
                    ticketCount: 0,
                    revenue: 0,
                    thumbnail: t.movie?.thumbnail
                };
            }
            byMovie[movieName].ticketCount++;
            byMovie[movieName].revenue += t.price || 0;
        });

        // Convert to array and sort by revenue
        const topMovies = Object.entries(byMovie)
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);

        const cinemaStats = Object.entries(byCinema)
            .map(([type, stats]) => ({ type, ...stats }))
            .sort((a, b) => b.revenue - a.revenue);

        // Summary
        const totalRevenue = allTickets.reduce((sum, t) => sum + (t.price || 0), 0);
        const totalTickets = allTickets.length;
        const avgTicketPrice = totalTickets > 0 ? Math.round(totalRevenue / totalTickets) : 0;

        res.json({
            success: true,
            data: {
                period: days,
                summary: {
                    totalRevenue,
                    totalTickets,
                    avgTicketPrice
                },
                dailyRevenue,
                topMovies,
                cinemaStats
            }
        });
    } catch (error) {
        console.error('Get ticket statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// ============================================
// USER MANAGEMENT (Phase 3)
// ============================================

/**
 * Get all users with pagination
 * GET /api/admin/users
 */
const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const role = req.query.role || '';
        const status = req.query.status || ''; // 'active' or 'inactive'

        let query = {};

        if (search) {
            query.$or = [
                { displayName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (role) {
            query.role = role;
        }

        if (status === 'active') {
            query.isActive = true;
        } else if (status === 'inactive') {
            query.isActive = false;
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-paymentCards')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            User.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Update user status (active/inactive)
 * PUT /api/admin/users/:id/status
 */
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const user = await User.findOneAndUpdate(
            { uid: id },
            { isActive: isActive },
            { new: true }
        ).select('-paymentCards');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Update user role
 * PUT /api/admin/users/:id/role
 */
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be user or admin'
            });
        }

        const user = await User.findOneAndUpdate(
            { uid: id },
            { role: role },
            { new: true }
        ).select('-paymentCards');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// ============================================
// REVIEW MODERATION (Phase 3)
// ============================================

/**
 * Get all reviews with pagination
 * GET /api/admin/reviews
 */
const getReviews = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const movieId = req.query.movieId || '';

        let query = {};
        if (movieId) {
            query.movieId = movieId;
        }

        const [reviews, total] = await Promise.all([
            Review.find(query)
                .skip(skip)
                .limit(limit)
                .sort({ timestamp: -1 }),
            Review.countDocuments(query)
        ]);

        // Fetch movie info for each review
        const reviewsWithMovie = await Promise.all(reviews.map(async (review) => {
            const reviewObj = review.toObject();
            // Try to get movie name
            const movie = await NowShowing.findById(review.movieId).select('name thumbnail');
            if (movie) {
                reviewObj.movieName = movie.name;
                reviewObj.movieThumbnail = movie.thumbnail;
            }
            return reviewObj;
        }));

        res.json({
            success: true,
            data: {
                reviews: reviewsWithMovie,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Delete a review
 * DELETE /api/admin/reviews/:id
 */
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findByIdAndDelete(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        res.json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// =============================================
// VOUCHER MANAGEMENT
// =============================================

/**
 * Get vouchers with pagination and search
 * GET /api/admin/vouchers
 */
const getVouchers = async (req, res) => {
    console.log("👉 [DEBUG] getVouchers HIT. Query:", req.query);
    try {
        const count = await Voucher.countDocuments();
        console.log(`👉 [DEBUG] Total Vouchers in DB: ${count}`);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;

        let query = {};
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const [vouchers, total] = await Promise.all([
            Voucher.find(query).skip(skip).limit(limit).sort({ expiredTime: -1 }),
            Voucher.countDocuments(query)
        ]);

        res.json({
            success: true,
            vouchers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get vouchers error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Create voucher
 * POST /api/admin/vouchers
 */
const createVoucher = async (req, res) => {
    try {
        const { title, expiredTime, discountAmount, applicableForBill, description } = req.body;

        if (!title || !expiredTime || !discountAmount || !applicableForBill || !description) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        const voucher = new Voucher({
            _id: new mongoose.Types.ObjectId(),
            title,
            expiredTime,
            discountAmount,
            applicableForBill,
            description,
            listUidUsed: []
        });

        await voucher.save();

        res.status(201).json({
            success: true,
            message: 'Voucher created successfully',
            data: voucher
        });
    } catch (error) {
        console.error('Create voucher error:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};

/**
 * Update voucher
 * PUT /api/admin/vouchers/:id
 */
const updateVoucher = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, expiredTime, discountAmount, applicableForBill, description } = req.body;

        const voucher = await Voucher.findByIdAndUpdate(
            id,
            { title, expiredTime, discountAmount, applicableForBill, description },
            { new: true }
        );

        if (!voucher) {
            return res.status(404).json({ success: false, message: 'Voucher not found' });
        }

        res.json({
            success: true,
            message: 'Voucher updated successfully',
            data: voucher
        });
    } catch (error) {
        console.error('Update voucher error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Delete voucher
 * DELETE /api/admin/vouchers/:id
 */
const deleteVoucher = async (req, res) => {
    try {
        const { id } = req.params;
        const voucher = await Voucher.findByIdAndDelete(id);

        if (!voucher) {
            return res.status(404).json({ success: false, message: 'Voucher not found' });
        }

        res.json({
            success: true,
            message: 'Voucher deleted successfully'
        });
    } catch (error) {
        console.error('Delete voucher error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// =============================================
// FOOD MANAGEMENT
// =============================================

/**
 * Get all foods grouped by type
 * GET /api/admin/foods
 */
const getFoods = async (req, res) => {
    console.log("👉 [DEBUG] getFoods HIT");
    try {
        const count = await Food.countDocuments();
        console.log(`👉 [DEBUG] Total Foods in DB: ${count}`);
        const foods = await Food.find({});
        console.log(`👉 [DEBUG] Found ${foods.length} foods`);
        res.json({
            success: true,
            foods
        });
    } catch (error) {
        console.error('Get foods error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Create food item
 * POST /api/admin/foods
 */
const createFood = async (req, res) => {
    try {
        const { type, name, price, thumbnail, description } = req.body;

        if (!type || !name || !price) {
            return res.status(400).json({
                success: false,
                message: 'Type, name, and price are required'
            });
        }

        // Find or create the food category
        let foodCategory = await Food.findOne({ type });

        if (!foodCategory) {
            foodCategory = new Food({
                _id: new mongoose.Types.ObjectId(),
                type,
                data: []
            });
        }

        // Add new item to data array
        foodCategory.data.push({
            _id: new mongoose.Types.ObjectId(),
            name,
            price,
            thumbnail: thumbnail || '',
            description: description || ''
        });

        await foodCategory.save();

        res.status(201).json({
            success: true,
            message: 'Food item created successfully',
            data: foodCategory
        });
    } catch (error) {
        console.error('Create food error:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};

/**
 * Update food item
 * PUT /api/admin/foods/:id
 */
const updateFood = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, name, price, thumbnail, description } = req.body;

        const result = await Food.findOneAndUpdate(
            { 'data._id': id },
            {
                $set: {
                    'data.$.name': name,
                    'data.$.price': price,
                    'data.$.thumbnail': thumbnail,
                    'data.$.description': description
                }
            },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ success: false, message: 'Food item not found' });
        }

        res.json({
            success: true,
            message: 'Food item updated successfully',
            data: result
        });
    } catch (error) {
        console.error('Update food error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Delete food item
 * DELETE /api/admin/foods/:id
 */
const deleteFood = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await Food.findOneAndUpdate(
            { 'data._id': id },
            { $pull: { data: { _id: id } } },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ success: false, message: 'Food item not found' });
        }

        res.json({
            success: true,
            message: 'Food item deleted successfully'
        });
    } catch (error) {
        console.error('Delete food error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// =============================================
// BANNER MANAGEMENT
// =============================================

/**
 * Get all banners
 * GET /api/admin/banners
 */
const getBanners = async (req, res) => {
    console.log("👉 [DEBUG] getBanners HIT");
    try {
        const count = await Banner.countDocuments();
        console.log(`👉 [DEBUG] Total Banners in DB: ${count}`);
        const banners = await Banner.find({}).sort({ type: 1 });
        console.log(`👉 [DEBUG] Found ${banners.length} banners`);
        res.json({
            success: true,
            banners
        });
    } catch (error) {
        console.error('Get banners error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Create banner
 * POST /api/admin/banners
 */
const createBanner = async (req, res) => {
    try {
        const { type, thumbnail, movieId } = req.body;

        if (!type || !thumbnail || !movieId) {
            return res.status(400).json({
                success: false,
                message: 'Type, thumbnail, and movieId are required'
            });
        }

        const banner = new Banner({
            _id: new mongoose.Types.ObjectId(),
            type,
            thumbnail,
            movieId
        });

        await banner.save();

        res.status(201).json({
            success: true,
            message: 'Banner created successfully',
            data: banner
        });
    } catch (error) {
        console.error('Create banner error:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};

/**
 * Update banner
 * PUT /api/admin/banners/:id
 */
const updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, thumbnail, movieId } = req.body;

        const banner = await Banner.findByIdAndUpdate(
            id,
            { type, thumbnail, movieId },
            { new: true }
        );

        if (!banner) {
            return res.status(404).json({ success: false, message: 'Banner not found' });
        }

        res.json({
            success: true,
            message: 'Banner updated successfully',
            data: banner
        });
    } catch (error) {
        console.error('Update banner error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Delete banner
 * DELETE /api/admin/banners/:id
 */
const deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await Banner.findByIdAndDelete(id);

        if (!banner) {
            return res.status(404).json({ success: false, message: 'Banner not found' });
        }

        res.json({
            success: true,
            message: 'Banner deleted successfully'
        });
    } catch (error) {
        console.error('Delete banner error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    verifyAdmin,
    getDashboard,
    getRevenueChart,
    // Movie management
    getMovies,
    getMovieById,
    createMovie,
    updateMovie,
    deleteMovie,
    // Cinema management
    getCinemas,
    getAllCinemas,
    createCinema,
    updateCinema,
    deleteCinema,
    // Showtime management
    getShowtimes,
    createShowtime,
    updateShowtime,
    deleteShowtime,
    // Ticket management
    getTickets,
    getTicketStatistics,
    // User management
    getUsers,
    updateUserStatus,
    updateUserRole,
    // Review moderation
    getReviews,
    deleteReview,
    // Voucher management
    getVouchers,
    createVoucher,
    updateVoucher,
    deleteVoucher,
    // Food management
    getFoods,
    createFood,
    updateFood,
    deleteFood,
    // Banner management
    getBanners,
    createBanner,
    updateBanner,
    deleteBanner
};

