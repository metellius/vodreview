import React from 'react';
import {render} from 'react-dom';
import cookie from 'react-cookie';
import update from 'immutability-helper';
import Comment from './Comment.jsx';
import { Container, Button, Box  } from 'bloomer';

export default class Comments extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                {this.props.comments.map((comment) =>
                    <Comment
                        key={comment.time}
                        data={comment}
                        editingCommentAt={this.props.editingCommentAt}
                        onEditingFinished={(data) => this.props.onEditingFinished(comment, data)}
                        seekTo={this.props.seekTo}
                        editRequested={this.props.editRequested}
                        previewRequested={this.props.previewRequested}
                    />
                )}
            </div>
        );
    }
}
