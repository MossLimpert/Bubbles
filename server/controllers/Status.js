const models = require('../models');
const mongoose = require('mongoose');

const { Status, Bubble, Account } = models;

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
        return res.json({ statuses: myStatuses });
    
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error retrieving statuses!' });
    }
};

const getCurrentUserStatus = async (req, res) => {
    try {
        const user = await Account.findById(req.session.account._id).exec();
        const status = await Status.findById(user.currentStatus).exec();
        return res.json({ status: status });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error retrieving status!' });
    }
};

// create new user status
const makeStatus = async (req, res) => {
    if (!req.body.text) {
        return res.status(400).json({ error: 'Status is required!' });
    }

    const statusData = {
        text: req.body.text,
        userid: new mongoose.Types.ObjectId(req.session.account._id),
    };

    try {
        const newStatus = new Status(statusData);
        await newStatus.save();

        // add to account's current status
        return await Account.pushStatus(req.session.account._id, newStatus._id, (acknowledged) => {
            if (!acknowledged) {
                return res.status(500).json({ error: 'Error updating account!' });
            }
            
            return res.status(201).json({ text: newStatus.text });
        });

       
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
    getCurrentUserStatus,
};