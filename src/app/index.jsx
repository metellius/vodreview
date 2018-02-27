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

        this.state = {
            comments: [],
            videoId: "",
            previewCaption: "",
            editingCommentAt: -1
        };
        this.loadFromGist = this.loadFromGist.bind(this);
        this.onEditingFinished = this.onEditingFinished.bind(this);
        this.addNewComment = this.addNewComment.bind(this);
        this.newReview = this.newReview.bind(this);
        this.stateToJson = this.stateToJson.bind(this);
        this.autoSave = this.autoSave.bind(this);
        this.publishComments = this.publishComments.bind(this);
        this.save = this.save.bind(this);
        /* setInterval(this.autoSave, 3 * 1000);*/
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.changed && prevState.comments !== this.state.comments)
            this.autoSave();
    }

    componentDidMount() {
        function getUrlParameter(sParam) {
            var sPageURL = decodeURIComponent(window.location.search.substring(1)),
                sURLVariables = sPageURL.split('&'),
                sParameterName,
                i;

            for (i = 0; i < sURLVariables.length; i++) {
                sParameterName = sURLVariables[i].split('=');

                if (sParameterName[0] === sParam) {
                    return sParameterName[1] === undefined ? true : sParameterName[1];
                }
            }
        }
        var autoSave = cookie.load('autosave-state');
        var id = getUrlParameter('id');

        if (autoSave && !id)
            this.load(autoSave);
        else if (id)
            this.loadFromGist(id, (obj) => {
                if (obj) {
                    if (autoSave && obj.videoId === autoSave.videoId) {
                        if (window.confirm("Would you like to load from autosave (from " +
                                           autoSave.now + ")?"))
                            this.load(autoSave);
                        else
                            this.load(obj);
                    } else {
                        this.load(obj);
                    }
                }
                else if (autoSave) {
                    this.load(autoSave);
                }
            });
        else if (autoSave) {
            this.load(autoSave);
        }
    }

    stateToJson() {
        return {
            videoId: this.state.videoId,
            comments: this.state.comments,
            now: Date().toString()
        };
    }
    autoSave() {
        var state = this.stateToJson();
        if (!state.comments.length || !state.videoId.length)
            return;
        console.log("now autosaving")
        cookie.save('autosave-state', state);
        this.changed = false;
        /* $('#autosaveTime').text('Autosaved at ' + state.now);*/
    }

    load(json) {
        console.log(json);
        if (!json.comments)
            json.comments = [];
        this.setState({
            comments: json.comments,
            videoId: json.videoId
        })
    }

    loadFromGist(gist, callback) {
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
                    success: (e) => callback(JSON.parse(e)),
                    error: () => callback(null)
                });
            },
            error: (e) => callback(null)
        });
    }

    save(json, callback) {
        var gist = {
            "description": "Video review",
            "public": true,
            "files": {
                "datafile": {
                    "content": JSON.stringify(json)
                }
            }
        };
        var app = this;

        jquery.ajax({
            url: 'https://api.github.com/gists',
            type: 'POST',
            dataType: 'json',
            data: JSON.stringify(gist),
            success: () => callback(true),
            error: () => callback(false)
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
            this.changed = true;
        }
    }

    addNewComment() {
        const time = this.getTime();
        const newComment = {time: time, text: ""};
        const idx = this.state.comments.findIndex((item) => item.time >= time);
        if (idx === -1) {
            const newComments = update(this.state.comments, {
                $push: [newComment] });
            this.setState({comments: newComments});
        }
        else if (this.state.comments[idx].time !== time) {
            const newComments = update(this.state.comments, {
                $splice: [[idx, 0, newComment]] });
            this.setState({comments: newComments});
        }
        this.setState({editingCommentAt: time});
    }

    newReview() {
        function ytVidId(url) {
            var p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
            return (url.match(p)) ? RegExp.$1 : false;
        }

        var input = prompt("Enter youtube url");
        var id = ytVidId(input);
        if (id) {
            this.load({videoId: id})
        }
        else if (input.trim().length) {
            alert("Did not recognize url: " + input);
        }
    }

    publishComments() {
        this.setState({publishing: true})
        this.save(this.stateToJson(), () => app.setState({publishing: false}) ); 
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
                    <Button isColor='warning' isLoading={this.state.publishing} onClick={this.publishComments}>Publish comments</Button>
                    <Button onClick={this.newReview}>New review</Button>
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
            </Container>
        );
    }
}

render(<App/>, document.getElementById('app'));
