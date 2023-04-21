const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

// to do later, have it so it doesn't do this every window relosd 
// wait maybe i do want that

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

// username span in bubble node
const UsernameSpan = (props) => {
    return (
        <li>
            {props.username}
        </li>
    )
};

//bubble node in bubble list
const BubbleNode = async (props) => {
    const users = {};

    for (let i = 0; i < props.bubble.usernames.length; i++) {
        users.push(props.bubble.usernames[i]);
    };

    const usernameNodes = {};
    
    for (let i = 0; i < users.length; i++) {
        usernameNodes.push(<UsernameSpan username={users[i]} />);
    }

    return (
        <div key={props.bubble._id} className="bubble">
            <h2 className="bubbleName">Name: {props.bubble.name} </h2>
            <h3>Users: </h3>
            <ul className="bubbleUsers"> 
                {usernameNodes}
            </ul>
        </div>
    );
    
};
// react bubble list component
const BubbleList = async (props) => {
    // if user is in no bubbles, say so
    if (props.bubbles.length === 0) {
        return (
            <div className="bubblesList">
                <h3 className="emptyBubbles">No Bubbles Yet!</h3>
            </div>
        );
    }

    // for each bubble, make a bubble node
    // give it a bubble
    const bubbleNodes = {}

    for (let i = 0; i < props.bubbles.length; i++) {
        bubbleNodes.push( <BubbleNode bubbles={props.bubbles[i]}/>);
    };

    return (
        <div className="bubblesList">
            <h2>Bubbles: </h2>
            { bubbleNodes }
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



const reloadPage = () => {
    loadBubblesFromServer();
    loadUserStatus();
};


const loadBubblesFromServer = async () => {
    //const response = await fetch('/get-bubbles');
    //const data = await response.json();
    // ReactDOM.render(
    //     <BubbleList bubbles={data.bubbles} />,
    //     document.getElementById('bubbles')
    // );
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
    // ReactDOM.render(
    //     <StatusForm />,
    //     document.getElementById('makeStatus')
    // );

    // ReactDOM.render(
    //     <BubbleList bubbles={[]} />,
    //     document.getElementById('bubbles')
    // );

    //loadBubblesFromServer();
    fetch('/get-bubbles');
    //loadUserStatus();
};

window.onload = init;