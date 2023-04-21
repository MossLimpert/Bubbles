const models = require('../models');
const mongoose = require('mongoose');

const { Bubble } = models;

// directs user to join / create bubble page
const joinPage = (req, res) => res.render('join-bubble');

// allows a user to join an already existing bubble
const joinBubble = async (req, res) => {
    const bubblename = `${req.body.name}`;
    const pass = `${req.body.pass}`;

    if (!bubblename || !pass) {
        return res.status(400).json({ error: 'All fields are required!' });
    }

    return await Bubble.authenticate(bubblename, pass, (err, bubble) => {
        if (err || !bubble) {
            return res.status(401).json({ error: 'Wrong bubble name or password!' });
        }

        // add user to bubble
        bubble.users.push(new mongoose.Types.ObjectId(req.session.account._id));
        bubble.save();

        // session variables
        req.session.bubble = Bubble.toAPI(bubble);

        return res.json({ redirect: '/home' });
    });
}

// allows a user to create a new bubble
const createBubble = async (req, res) => {
    const bubblename = `${req.body.name}`;
    const pass = `${req.body.pass}`;
    const pass2 = `${req.body.pass2}`;

    if (!bubblename || !pass || !pass2) {
        return res.status(400).json({ error: 'All fields are required!' });
    }

    if (pass !== pass2) {
        return res.status(400).json({ error: 'Passwords do not match!' });
    }

    try {
        const hash = await Bubble.generateHash(pass);
        // CHECK TO MAKE SURE THIS WORKS
        const newBubble = new Bubble({ name: bubblename, password: hash, users: [new mongoose.Types.ObjectId(req.session.account._id)] });
        await newBubble.save();

        // session variables
        req.session.bubble = Bubble.toAPI(newBubble);

        return res.json({ redirect: '/home' });

    } catch (err) {
        console.log(err);
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Bubble name already in use!' });
        }
        return res.status(500).json({ error: 'An error occured!' });
    }
}

const getBubbles = async (req, res) => {
    try {
        const bubbles = await Bubble.find({ users: new mongoose.Types.ObjectId(req.session.account._id) });
        return res.json({ bubbles: bubbles });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'An error occured!' });
    }
};

const getUsernamesInBubble = async (req, res) => {
    try {
        const bubble = await Bubble.find({ name: req.body.bubble }).populate('users').exec();
        // bubble.users.forEach((userid) => {
            
        //     //usernames.push( await userid.find({ _id: userid}).populate('account').exec()));
        // });

        return res.json({ usernames: usernames });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'An error occured!' });
    }
};

module.exports = {
    joinPage,
    joinBubble,
    createBubble,
    getBubbles,
}