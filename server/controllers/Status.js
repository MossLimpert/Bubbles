const models = require('../models');
//const mongoose = require('mongoose');

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

// get all statuses that belong to the user
const getUserStatuses = async (req, res) => {
    const statuses = [];
    try {
        // find all statuses that have user's id
        const myStatuses = await Status.find({ userid: req.session.account._id }).exec();

        for (let i = 0; i < myStatuses.length; i++) {
            statuses.push(myStatuses[i].text);
        }

        //console.log(statuses);
        return res.json({ statuses: statuses });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error retrieving statuses!' });
    }
};
// get user's current status
const getCurrentUserStatus = async (req, res) => {
    try {
        const user = await Account.findById(req.session.account._id).exec();
        const status = await Status.findById(user.currentStatus).exec();

        if (!status) {
            return res.json({ status: 'No status yet' });
        }
        return res.json({ status: status.text });
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

    // construct status object
    const statusData = {
        text: req.body.text,
        userid: req.session.account._id,
    };

    try {
        // add status to server
        const newStatus = new Status(statusData);
        await newStatus.save();

        // add to account's current status field
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