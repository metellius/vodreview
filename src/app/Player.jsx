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
            caption: this.props.previewCaption,
            hasCurrentCaption: false,
            playing: false
        };
        this.onReady = this.onReady.bind(this);
        this.onStateChange = this.onStateChange.bind(this);
        this.timerTick = this.timerTick.bind(this);
        this.setTime = this.setTime.bind(this);
        this.getTime = this.getTime.bind(this);
    }

    onReady(e) {
        this.player = e.target;
        console.log("onReady");
    }
    onStateChange() {
        this.setState({playing: (this.player && this.player.getPlayerState() == YT.PlayerState.PLAYING)})
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.previewCaption.length > 0)
            this.setState({caption: nextProps.previewCaption})
    }

    componentWillUnmount() {
        clearInterval(this.timer);
        this.props.onRef(null);
    }

    componentDidMount() {
        this.timer = setInterval(this.timerTick, 250);
        this.setTime(0);
        this.props.onRef(this);
    }

    getTime() {
        if (this.state.playing)
            this.manualTime = this.player.getCurrentTime();
        return this.manualTime;
    }
    setTime(time) {
        if (this.player)
            this.player.seekTo(time);
        this.manualTime = time;
    }

    timerTick() {
        const time = this.getTime();
        if (this.state.playing) {
            const firstCaption = this.props.comments.findIndex((item) =>
                 time > item.time && time - item.time < 3);
            if (firstCaption != -1) {
                const comment = this.props.comments[firstCaption];
                /* console.log(comment, time - comment.time > 3);*/
                /* if (time > comment.time && time - comment.time < 3)*/
                this.setState({caption: comment.text, hasCurrentCaption: true})
            }
            else
                this.setState({hasCurrentCaption: false})
        }
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
            <div className="player-container">
                <Youtube
                    videoId={this.props.videoId}
                    opts={opts}
                    onReady={this.onReady}
                    onStateChange={this.onStateChange}
                >
                </Youtube>
                <div
                    className="video-overlay"
                    style={{
                        opacity: this.state.hasCurrentCaption || this.props.previewCaption.length ? 1 : 0
                    }}
                >{!this.state.playing && this.props.previewCaption.length ?
                    this.props.previewCaption :
                    this.state.caption}</div>
            </div>
        );
    }
}