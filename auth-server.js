# Authentication Server for Email Document Collector

```javascript
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const validator = require('validator');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/auth', authLimiter);
app.use('/api', generalLimiter);

// MongoDB connection
mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/email-document-collector', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// User Schema
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        minlength: [2, 'First name must be at least 2 characters'],
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        minlength: [2, 'Last name must be at least 2 characters'],
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: Date,
    lastLogin: Date,
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark', 'auto'],
            default: 'light'
        },
        language: {
            type: String,
            default: 'en'
        },
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            desktop: {
                type: Boolean,
                default: true
            }
        }
    }
}, {
    timestamps: true
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    if (this.isLocked) {
        throw new Error('Account is temporarily locked due to too many failed login attempts');
    }
    
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    
    if (!isMatch) {
        this.loginAttempts += 1;
        
        // Lock account after 5 failed attempts for 1 hour
        if (this.loginAttempts >= 5) {
            this.lockUntil = Date.now() + (60 * 60 * 1000); // 1 hour
        }
        
        await this.save();
        throw new Error('Invalid credentials');
    }
    
    // Reset login attempts on successful login
    if (this.loginAttempts > 0) {
        this.loginAttempts = 0;
        this.lockUntil = undefined;
    }
    
    this.lastLogin = new Date();
    await this.save();
    
    return true;
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function() {
    const payload = {
        userId: this._id,
        email: this.email,
        role: this.role
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

const User = mongoose.model('User', userSchema);

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Access token required' 
        });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        if (user.isLocked) {
            return res.status(423).json({ 
                success: false, 
                message: 'Account is temporarily locked' 
            });
        }
        
        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ 
            success: false, 
            message: 'Invalid or expired token' 
        });
    }
};

// Validation middleware
const validateRegistration = (req, res, next) => {
    const { firstName, lastName, email, password, confirmPassword } = req.body;
    const errors = [];
    
    if (!firstName || firstName.trim().length < 2) {
        errors.push('First name must be at least 2 characters');
    }
    
    if (!lastName || lastName.trim().length < 2) {
        errors.push('Last name must be at least 2 characters');
    }
    
    if (!email || !validator.isEmail(email)) {
        errors.push('Please provide a valid email address');
    }
    
    if (!password || password.length < 8) {
        errors.push('Password must be at least 8 characters');
    }
    
    if (password !== confirmPassword) {
        errors.push('Passwords do not match');
    }
    
    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (password && !passwordRegex.test(password)) {
        errors.push('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }
    
    next();
};

// Routes

// Register new user
app.post('/api/auth/register', validateRegistration, async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }
        
        // Create new user
        const user = new User({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.toLowerCase().trim(),
            password
        });
        
        await user.save();
        
        // Generate token
        const token = user.generateAuthToken();
        
        // Return user data without password
        const userData = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            preferences: user.preferences,
            createdAt: user.createdAt
        };
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: userData,
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }
        
        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        // Check password
        await user.comparePassword(password);
        
        // Generate token with different expiry based on rememberMe
        const tokenExpiry = rememberMe ? '30d' : '7d';
        const payload = {
            userId: user._id,
            email: user.email,
            role: user.role
        };
        
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: tokenExpiry
        });
        
        // Return user data without password
        const userData = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            preferences: user.preferences,
            lastLogin: user.lastLogin
        };
        
        res.json({
            success: true,
            message: 'Login successful',
            user: userData,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({
            success: false,
            message: error.message || 'Login failed'
        });
    }
});

// Get current user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const userData = {
            id: req.user._id,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            email: req.user.email,
            role: req.user.role,
            isVerified: req.user.isVerified,
            preferences: req.user.preferences,
            lastLogin: req.user.lastLogin,
            createdAt: req.user.createdAt
        };
        
        res.json({
            success: true,
            user: userData
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile'
        });
    }
});

// Update user profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const { firstName, lastName, preferences } = req.body;
        const updateData = {};
        
        if (firstName) updateData.firstName = firstName.trim();
        if (lastName) updateData.lastName = lastName.trim();
        if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };
        
        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');
        
        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                preferences: user.preferences
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
});

// Change password
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All password fields are required'
            });
        }
        
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'New passwords do not match'
            });
        }
        
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 8 characters'
            });
        }
        
        // Get user with password
        const user = await User.findById(req.user._id);
        
        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }
        
        // Update password
        user.password = newPassword;
        await user.save();
        
        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing password'
        });
    }
});

// Logout (client-side token removal)
app.post('/api/auth/logout', authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

// Delete account
app.delete('/api/auth/account', authenticateToken, async (req, res) => {
    try {
        const { password } = req.body;
        
        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required to delete account'
            });
        }
        
        // Get user with password
        const user = await User.findById(req.user._id);
        
        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Incorrect password'
            });
        }
        
        // Delete user
        await User.findByIdAndDelete(req.user._id);
        
        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        console.error('Account deletion error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting account'
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Authentication server is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Authentication server running on port ${PORT}`);
});

module.exports = app;
```

## Usage Instructions

1. Install dependencies:
```bash
npm install express bcrypt jsonwebtoken mongoose cors express-rate-limit helmet validator dotenv
```

2. Create `.env` file:
```
DATABASE_URL=mongodb://localhost:27017/email-document-collector
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
PORT=3001
```

3. Start the server:
```bash
node auth-server.js
```

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout user
- `DELETE /api/auth/account` - Delete account
- `GET /api/health` - Health check