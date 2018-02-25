import React from 'react';
import {render} from 'react-dom';
import cookie from 'react-cookie';
import update from 'immutability-helper';
/* import TopBar from './TopBar.jsx';*/
import { Container, Button, Box  } from 'bloomer';
/* import Utils from './Utils.jsx'*/
import Youtube from 'react-youtube';

export default class Player extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            commits: [],
        };
        this.onReady = this.onReady.bind(this);
        this.onStateChange = this.onStateChange.bind(this);
    }

    onReady() {
        console.log("onReady");
    }
    onStateChange() {
        console.log("stateChange")
    }

    render() {
        const opts = {
            width: '800',
            height: 800 * 0.5625,
            playerVars: {
                rel: 0,
                showinfo: 0,
                fs: 0,
                playsinline: 1,
                modestbranding: 0,
            }
        };
        return (
            <div>
                <Youtube
                    videoId={this.props.videoId}
                    opts={opts}
                    onReady={this.onReady}
                    onStateChange={this.onStateChange}
                />
            </div>
        );
    }
}