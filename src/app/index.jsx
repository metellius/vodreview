import React from 'react';
import {render} from 'react-dom';
import cookie from 'react-cookie';
import update from 'immutability-helper';
import jquery from 'jquery';
import Player from './Player.jsx';
import Comments from './Comments.jsx';
import { Container, Button, Box  } from 'bloomer';
/* import Utils from './Utils.jsx'*/

class App extends React.Component {
    constructor(props) {
        super(props);
        /* this.updatePreferences = this.updatePreferences.bind(this);*/
        /* this.setState_and_store_cookie = this.setState_and_store_cookie.bind(this);*/
        /* this.jobSummaryUid = 0;*/

        /* var query = URI.parseQuery(location.search);*/
        //set_commitnum_from_query(query);
        //update_selects();

        this.state = {
            comments: [],
            videoId: "",
            gist: "c72ef0a94d66c02c0d39fcebe91d13eb",
            previewCaption: ""
        };
        this.loadFromGist = this.loadFromGist.bind(this);
        this.onCommentUpdated = this.onCommentUpdated.bind(this);
        this.addNewComment = this.addNewComment.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        /* if (prevState.repo !== this.state.repo ||
         *     prevState.repos !== this.state.repos ||
         *     prevState.commitnum !== this.state.commitnum ||
         *     prevState.branch !== this.state.branch ||
         *     prevState.branches !== this.state.branches) {
         *     this.get_commits();
         * }
         * if (prevState.repo !== this.state.repo ||
         *     prevState.repos !== this.state.repos) {
         *     this.get_branches();
         * }*/
    }

    componentDidMount() {
        this.loadFromGist(this.state.gist);
    }

    load(json) {
        console.log(json);
        this.setState({
            comments: json.comments,
            videoId: json.videoId
        })
        /* var autoSave = Cookies.get('autosave-state');
         * if (autoSave)
         *     autoSave = JSON.parse(autoSave);
         * if (autoSave && autoSave.videoId == json.videoId)
         *     comments = autoSave.comments;
         * else if (json.comments)
         *     comments = json.comments;
         * else
         *     comments = [];
         * player.loadVideoById(json.videoId);
         * updateComments();*/
    }

    loadFromGist(gist) {
        var root = this;
        jquery.ajax({
            url: 'https://api.github.com/gists/' + gist,
            type: 'GET',
            success: function(e) {
                var dataUrl = e.files["datafile"].raw_url;
                console.log("Fetching data from", dataUrl);
                jquery.ajax({
                    url: dataUrl,
                    type: 'GET',
                    success: function(e) {
                        root.load(JSON.parse(e));
                    },
                    error: function(e) {
                        console.warn("gist fetch file error", e);
                    }
                });
            },
            error: function(e) {
                console.warn("gist fetch gist error", e);
            }
        });
    }

    onCommentUpdated(comment, change) {
        const idx = this.state.comments.findIndex((item) => comment.time === item.time);
        if (change.text) {
            const newComments = update(this.state.comments, {
                [idx]: {
                    text: { $set: change.text }
                }});
            this.setState({comments: newComments});
        }
    }

    addNewComment() {
        const time = this.getTime();
        const newComment = {time: time, text: ""};
        const idx = this.state.comments.findIndex((item) => item.time > time);
        const newComments = update(this.state.comments, {
            $splice: [[idx, 0, newComment]] });
        this.setState({comments: newComments});
    }

    render() {
        return (
            <Container>
                <h1 className="title">Youtube video review</h1>
                {/* <Box>lol</Box> */}
                <Player
                    videoId={this.state.videoId}
                    previewCaption={this.state.previewCaption}
                    onRef={(child) => this.getTime = child.getTime }
                    comments={this.state.comments}
                />
                <div>
                    <Button isColor="primary" onClick={this.addNewComment}>New comment</Button>
                    <Button>Publish comments</Button>
                    <Button>New review</Button>
                </div>
                <Comments
                    comments={this.state.comments}
                    onCommentUpdated={this.onCommentUpdated}
                    previewRequested={(newText) => this.setState({previewCaption: newText})}
                />
                <Button isColor='warning' isLoading>isLoading={true}</Button>
            </Container>
        );
    }
}

render(<App/>, document.getElementById('app'));
