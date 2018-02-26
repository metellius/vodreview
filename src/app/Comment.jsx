import React from 'react';
import {render} from 'react-dom';
import cookie from 'react-cookie';
import update from 'immutability-helper';
import { TextArea, Container, Button, Box  } from 'bloomer';

export default class Comment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editing: !this.props.data.text.length
        };
        this.newText = "";
        this.onChange = this.onChange.bind(this);
        this.onBlur = this.onBlur.bind(this);
    }

    onChange(e) {
        this.newText = e.target.value;
        this.props.previewRequested(e.target.value);
    }

    onBlur() {
        this.setState({editing: false})
        this.props.onCommentUpdated({text: this.newText});
        this.props.previewRequested("");
    }

    render() {
        return (
            <div>
                { this.state.editing ?
                  <TextArea
                      placeholder="Type your comment"
                      autoFocus={true}
                      onChange={this.onChange}
                      onBlur={this.onBlur}
                  >{this.props.data.text}</TextArea>
                    :
                  <div>
                      <span>{this.props.data.time}</span>
                      <span>{this.props.data.text}</span>
                      <a onClick={() => this.setState({editing: true})}>Edit</a>
                  </div>
                }
            </div>
        );
        
    }
}
