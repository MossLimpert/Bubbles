const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

// color helper function
const randomPaletteColor = () => {
    let colors = ["rgb(165,76,173)", "rgb(69,67,114)", "rgb(47,41,99)"];
    let index = Math.floor(Math.random() * 3);
    return colors[index];
}

// status form
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

    // for each bubble, make a bubble node
    // give it a bubble
    const bubbleNodes = [];

    // go through statuses, make a map with 0 redundancies
    const allBubbleStatuses = new Map();
    for (let i = 0; i < props.bubbles.length; i++) {
        for (let j = 0; j < props.bubbles[i].statuses.length; j++) {
            let keyValues = Object.entries(props.bubbles[i].statuses[j]);
            allBubbleStatuses.set(
                keyValues[0][1],
                keyValues[1][1]
            );
        }
    }
    //console.log(allBubbleStatuses);

    // for each bubble, make user circles w statuses
    const usernameNodes = [];
    for (let i = 0; i < props.bubbles.length; i++) {
        const bubblesUsers = [];
        // match users to their current statuses by going through data
        const usersStatuses = new Map();

        // go thru users, get their current status id
        for (let k = 0; k < props.bubbles[i].users.length; k++) {
            // user we are currently on , their current status
            let statusID = props.bubbles[i].users[k].currentStatus;

            // find this user's current status by its id
            //console.log(allBubbleStatuses.get(statusID));
            if (allBubbleStatuses.get(statusID)) {
                usersStatuses.set(
                    props.bubbles[i].users[k].username,
                    allBubbleStatuses.get(statusID)
                );
            }
        }

        //console.log(usersStatuses);

        // for each user, make the circles
        for (let j = 0; j < props.bubbles[i].users.length; j++) {
            let c = randomPaletteColor();               // color
            let n = props.bubbles[i].users[j].username; // username
            let t = usersStatuses.get(n);               // text
            let l;                                      // speech bubble length
            if (!t) {
                l = 1;               
            } else l = t.length * 10;       
            let w = 100 + l / 2;                        // svg width
            
            bubblesUsers.push(
                <CircleWithSpeechBubble 
                    color={c}
                    length={l}
                    username={n}
                    text={t}
                    width={w}
                    />
            );
        }

        usernameNodes.push(bubblesUsers);
    }

    // put it all together
    for (let i = 0; i < props.bubbles.length; i++) {
        bubbleNodes.push(
            <div className="bubble"
                style={{
                    backgroundColor: props.color,
                    width: props.radius * 2,
                    height: props.radius * 2,
                    borderRadius: '50%',
                    padding: '20px'
                }}
            >
                <h2 className="bubbleName">{props.bubbles[i].name} </h2>
                <ul className="bubbleUsers"> 
                    {usernameNodes[i]}
                </ul>
            </div>
        );
    };
    //console.log(usernameNodes);
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

// react svg circle bubble component

const CircleWithSpeechBubble = (props) => {
    // color
    // speech bubble length
    // text
    // username

    // speech bubble offset
    // rework this l8r
    let offset = `translate(-${props.length/8},0)`;

    // const speechBubble = (props) => {
    //     return (
    //         <div>
    //             <rect x="10" y="20" width={props.length} transform={offset} height="30" rx="10" fill={props.color} />
    //             <text x="50" y="40" textAnchor="middle" fill="white" fontSize="16">{props.text}</text>
    //         </div>
    //     );
    // }


    if (props.length < 10) {
        return (
            <svg width={props.width} height="150">
              <circle cx="50" cy="100" r="40" fill={props.color} />
      
              <text x="50" y="100" textAnchor="middle" fill="white" fontSize="16">{props.username}</text>
            </svg>
          );
    }
    return (
        <svg width={props.width} height="150">
          <circle cx="50" cy="100" r="40" fill={props.color} />
          <path d="M50 20 l20 -20 h-40 l20 20 z" fill={props.color} transform="translate(0,40)" />
          <rect x="10" y="20" width={props.length} transform={offset} height="30" rx="10" fill={props.color} />
          <text x="50" y="40" textAnchor="middle" fill="white" fontSize="16">{props.text}</text>
          <text x="50" y="100" textAnchor="middle" fill="white" fontSize="16">{props.username}</text>
        </svg>
      );
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
        <BubbleList bubbles={data.bubbles} color="rgb(137, 161, 239)" radius={200}/>,
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