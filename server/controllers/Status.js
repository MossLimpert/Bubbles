const models = require('../models');
const mongoose = require('mongoose');

const { Status, Bubble } = models;

const home = async (req, res) => res.render('app');

const getBubbleStatuses = async (req, res) => {

    // array to store user ids in
    const userIds = [];
    const statuses = Map();

    try {
        // get all bubbles with user in them
        const bubbles = await Bubble.find({ users: req.session.account._id }).exec();
        console.log(bubbles);

        // populate userIds array with user ids
        bubbles.forEach((bubble) => {
            bubble.users.forEach((user) => {
                userIds.push(user._id);
            });
        });

        // get users' current statuses 
        const userStatuses = await Status.find({ user: { $in: userIds } }).exec();
        userStatuses.forEach((status) => {
            statuses.set(status.user, status);
        });

        return res.json({ statuses: statuses });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error retrieving statuses!' });
    }
};

const getUserStatuses = async (req, res) => {
    try {
        // find all statuses that have user's id
        const myStatuses = await Status.find({ user: req.session.account._id }).exec();
    
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error retrieving statuses!' });
    }
};

// create new user status
const makeStatus = async (req, res) => {
    if (!req.body.text) {
        return res.status(400).json({ error: 'Status is required!' });
    }

    const statusData = {
        text: req.body.text,
        user: mongoose.Types.ObjectId(req.session.account._id),
    };

    try {
        const newStatus = new Status(statusData);
        await newStatus.save();
        return res.status(201).json({ text: newStatus.text });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'An error occured making status!' });
    }
};

module.exports = {
    home,
    getUserStatuses,
    getBubbleStatuses,
    makeStatus,
};