const models = require('../models');
const mongoose = require('mongoose');

const { Bubble, Account, Status } = models;

// directs user to join / create bubble page
const joinPage = (req, res) => res.render('join-bubble');

// allows a user to join an already existing bubble
const joinBubble = async (req, res) => {
    const bubblename = `${req.body.bubbleName}`;
    const pass = `${req.body.pass}`;

    if (!bubblename || !pass) {
        return res.status(400).json({ error: 'All fields are required!' });
    }

    const user = await Account.findById(req.session.account._id);
    if (!user.premiumMembership) {
        // check if user is already in 5 bubbles
        const userBubbles = await Bubble.find({ users: req.session.account._id }).exec();
        console.log(userBubbles);
        if (userBubbles.length >= 5) {
            return res.status(402).json({error: 'You have already joined/created 5 bubbles. Please purchase premium membership to join more.'});
        }
    }


    return Bubble.authenticate(bubblename, pass, (err, bubble) => {
        if (err || !bubble) {
            console.log(bubble);
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

    // check if not premium
    const user = await Account.findById(req.session.account._id);
    if (!user.premiumMembership) {
        // check if user is already in 5 bubbles
        const userBubbles = await Bubble.find({ users: req.session.account._id }).exec();
        console.log(userBubbles);
        if (userBubbles.length >= 5) {
            return res.status(402).json({error: 'You have already joined/created 5 bubbles. Please purchase premium membership to join more.'});
        }
    }
    

    try {
        const hash = await Bubble.generateHash(pass);
        // CHECK TO MAKE SURE THIS WORKS
        const newBubble = new Bubble({ 
            name: bubblename, 
            password: hash, 
            users: [new mongoose.Types.ObjectId(req.session.account._id)] 
        });
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
    // get all of the bubbles this user is a member of
    const doc = await Bubble.find({ users:  { $in: [ req.session.account._id ]}});
    
    //https://stackoverflow.com/questions/48957022/unexpected-await-inside-a-loop-no-await-in-loop#48957222

    if (!doc) {
        return res.status(404).json({ error: 'No bubbles found!' });
    }

    const userids = [];

    for (let i = 0; i < doc.length; i++) {
        // remove our name
        let index = doc[i].users.indexOf(req.session.account._id);
        if (index !== -1) {
            doc[i].users.splice(index, 1);
        }
        
        userids.push(doc[i].users);
    }

    const promises = [];
    const usernames = [];
    const statuses = [];

    userids.forEach(bubbleUsers => {
        const promise = Account.find({'_id': {$in: bubbleUsers}}).select('username currentStatus').exec();

        promise.then(names => {
            usernames.push(names);
        });

        promise.catch(err => {
            console.log(err);
            return res.status(500).json({ error: 'An error occured!' });
        });

        promises.push(promise);
    });

    userids.forEach(bubbleUsers => {
        const promise = Status.find({ 'userid': {$in: bubbleUsers}}).select('text').exec();

        promise.then(s => {
            statuses.push(s);
        });

        promise.catch(err => {
            console.log(err);
            return res.status(500).json({ error: 'Error retrieving status of user in bubble'});
        })

        promises.push(promise);
    });

    return Promise.all(promises).then(() => {
        const bubbles = [];   // all of user's bubbles
        for (let i = 0; i < doc.length; i++) {
            let newBubble = {};    // bubble we are creating
            
            // construct the bubble with only the data the user needs
            newBubble = {
                name: doc[i].name,
                users: usernames[i],
                statuses: statuses[i],
            };

            bubbles.push(newBubble);
        }

        //console.log(bubbles);

        return res.json({ bubbles: bubbles });
    }).catch(err => {
        console.log(err);
        return res.status(500).json({ error: 'An error occured!' });
    });
};

module.exports = {
    joinPage,
    joinBubble,
    createBubble,
    getBubbles,
}