const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

const handleStatus = (e) => {
    e.preventDefault();
    helper.hideError();

    const text = e.target.querySelector('#statusText').value;

    if (!text) {
        helper.handleError('All fields are required!');
        return false;
    }

    helper.sendPost(e.target.action, {text}, loadUserStatus);

    return false;
};

// react status form component
const StatusForm = (props) => {
    return (
        <form id="statusForm"
            onSubmit={handleStatus}
            name="statusForm"
            action="/home"
            method="POST"
            className="statusForm"
        >
            <h3>Create Status</h3>
            <label htmlFor="text">Status Text:</label>
            <input id="statusText" type="text" name="text" placeholder="listening to music" />
            <input className="makeStatusSubmit" type="submit" value="Post Status" />
        </form>
    );
};

// react bubble list component
const BubbleList = (props) => {
    // if user is in no bubbles, say so
    if (props.bubbles.length === 0) {
        return (
            <div className="bubblesList">
                <h3 className="emptyBubbles">No Bubbles Yet!</h3>
            </div>
        );
    }

    //console.log(props.bubbles);

    // for each bubble, make a bubble node
    // give it a bubble
    const bubbleNodes = [];

    for (let i = 0; i < props.bubbles.length; i++) {
        // for each user of a bubble, make a node
        const usernameNodes = [];

        for (let j = 0; j < props.bubbles[i].users.length; j++) {
            usernameNodes.push(
                <li>{props.bubbles[i].users[j]}</li>
            );
        };

        //console.log(usernameNodes);
        
        // put it all together
        bubbleNodes.push(
            <div className="bubble">
                <h2 className="bubbleName">Name: {props.bubbles[i].name} </h2>
                <h3>Users: </h3>
                <ul className="bubbleUsers"> 
                    {usernameNodes}
                </ul>
            </div>
        );
    };

    //console.log(bubbleNodes);

    return (
        <div className="bubblesList">
            <h1>Bubbles: </h1>
            {bubbleNodes}
        </div>
    );
};

// react current status component
const CurrentStatus = (props) => {
    return (
        <div className="currentStatus">
            <h3>Current Status: {props.status}</h3>
        </div>
    )
};

// all react components that need to be updated with info
// from the server are filled here
const reloadPage = () => {
    loadBubblesFromServer();
    loadUserStatus();
};

// fill bubble list component
const loadBubblesFromServer = async () => {
    const response = await fetch('/get-bubbles');
    const data = await response.json();
    //console.log(data);
    ReactDOM.render(
        <BubbleList bubbles={data.bubbles} />,
        document.getElementById('bubbles')
    );
};

// fill user status component
const loadUserStatus = async () => {
    const response = await fetch('/get-current-status');
    const data = await response.json();
    ReactDOM.render(
        <CurrentStatus status={data.status} />,
        document.getElementById('currentStatus')
    );
}

const init = () => {
    ReactDOM.render(
        <StatusForm />,
        document.getElementById('makeStatus')
    );

    ReactDOM.render(
        <BubbleList bubbles={[]} />,
        document.getElementById('bubbles')
    );

    reloadPage();
};

window.onload = init;