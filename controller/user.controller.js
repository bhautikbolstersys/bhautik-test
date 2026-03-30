const User = require('../model/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const user = await User.create({ name, email, password: hashedPassword, isVerified: false });

        user.otp = otp;
        await user.save();

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS.replace(/'/g, ""),
            },
        });

        const mailOptions = {
            from: process.env.MAIL_USER,
            to: email,
            subject: 'Your OTP for Registration',
            text: `Hello ${name},\n\nYour OTP for registration is: ${otp}\n\nThank you!`
        };

        await transporter.sendMail(mailOptions);

        const verifyToken = jwt.sign(
            { userId: user._id.toString(), email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '10m' }
        );

        res.status(201).json({
            message: 'User registered successfully. OTP sent to email.',
            token: verifyToken,
            user: { _id: user._id, email: user.email, name: user.name }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.verifyUser = async (req, res) => {
    try {
        const { token, otp } = req.body;
        if (!token || !otp) {
            return res.status(400).json({ message: 'Token and OTP are required' });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const email = decoded.email;
        if (!email) {
            return res.status(400).json({ message: 'Token email missing' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });

        if (user.isVerified) {
            return res.status(400).json({ message: 'User already verified' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        user.isVerified = true;
        user.otp = null;
        await user.save();

        res.status(200).json({ message: 'User verified successfully' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();

        res.status(200).json({ users });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
