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
            previewCaption: "",
            editingCommentAt: -1
        };
        this.loadFromGist = this.loadFromGist.bind(this);
        this.onEditingFinished = this.onEditingFinished.bind(this);
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

    onEditingFinished(comment, change) {
        const idx = this.state.comments.findIndex((item) => comment.time === item.time);
        this.setState({editingCommentAt: -1});
        if (change.text !== undefined) {
            var newComments;
            if (change.text) {
                newComments = update(this.state.comments, {
                    [idx]: {
                        text: { $set: change.text }}
                });
            } else {
                newComments = update(this.state.comments, {
                    $splice: [[idx, 1]]
                });
                console.log(newComments);
            }
            if (newComments)
                this.setState({comments: newComments});
        }
    }

    addNewComment() {
        const time = this.getTime();
        const newComment = {time: time, text: ""};
        const idx = this.state.comments.findIndex((item) => item.time >= time);
        if (this.state.comments[idx].time !== time) {
            const newComments = update(this.state.comments, {
                $splice: [[idx, 0, newComment]] });
            this.setState({comments: newComments});
        }
        this.setState({editingCommentAt: time});
    }

    render() {
        return (
            <Container>
                <h1 className="title">Youtube video review</h1>
                {/* <Box>lol</Box> */}
                <Player
                    videoId={this.state.videoId}
                    previewCaption={this.state.previewCaption}
                    onRef={(child) => {
                            this.getTime = child.getTime;
                            this.setTime = child.setTime;
                        }
                    }
                    comments={this.state.comments}
                />
                <div>
                    <Button isColor="primary" onClick={this.addNewComment}>New comment</Button>
                    <Button>Publish comments</Button>
                    <Button>New review</Button>
                </div>
                <Comments
                    comments={this.state.comments}
                    editingCommentAt={this.state.editingCommentAt}
                    onEditingFinished={this.onEditingFinished}
                    seekTo={(time) => this.setTime(time)}
                    editRequested={(comment) => {
                            this.setTime(comment.time);
                            this.setState({editingCommentAt: comment.time});
                    }}
                    previewRequested={(newText) => this.setState({previewCaption: newText})}
                />
                <Button isColor='warning' isLoading>isLoading={true}</Button>
            </Container>
        );
    }
}

render(<App/>, document.getElementById('app'));
