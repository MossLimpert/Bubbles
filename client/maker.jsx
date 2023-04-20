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
    if (props.bubbles.length === 0) {
        return (
            <div className="bubblesList">
                <h3 className="emptyBubbles">No Bubbles Yet!</h3>
            </div>
        );
    }

    const domoNodes = props.bubbles.map(bubble => {
        return (
            <div key={bubble._id} className="bubble">
                <h3 className="bubbleName">Name: {bubble.name} </h3>
                <h3 className="bubbleUsers">Users: {bubble.users}</h3>
            </div>
        );
    });

    return (
        <div className="bubblesList">
            {domoNodes}
        </div>
    );
};
// react current status component
const CurrentStatus = (props) => {
    return (
        <h3>Current Status: {props.status}</h3>
    )
};

const reloadPage = async () => {
    await loadBubblesFromServer();
    await loadUserStatus();
};

const loadBubblesFromServer = async () => {
    const response = await fetch('/get-bubbles');
    const data = await response.json();
    ReactDOM.render(
        <BubbleList bubbles={data.bubbles} />,
        document.getElementById('bubbles')
    );
};

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

    loadBubblesFromServer();
    loadUserStatus();
};

window.onload = init;