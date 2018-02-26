import React from 'react';
import {render} from 'react-dom';
import cookie from 'react-cookie';
import update from 'immutability-helper';
import { TextArea, Container, Button, Box  } from 'bloomer';

export default class Comment extends React.Component {
    constructor(props) {
        super(props);
        this.newText = "";
        this.onChange = this.onChange.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.onFocus = this.onFocus.bind(this);
    }

    onChange(e) {
        this.newText = e.target.value;
        this.props.previewRequested(e.target.value);
    }

    onBlur() {
        this.props.onEditingFinished({text: this.newText});
        this.props.previewRequested("");
    }

    onFocus() {
        delete this.newText;
    }

    prettyTime() {
        var secs = this.props.data.time;
        var fmins = Math.floor(secs / 60);
        var fsecs = Math.floor(secs % 60);
        return fmins + ':' + ("00" + fsecs).slice(-2);
    }

    render() {
        return (
            <div>
                { this.props.editingCommentAt === this.props.data.time ?
                  <TextArea
                      placeholder="Type your comment"
                      autoFocus={true}
                      onChange={this.onChange}
                      onBlur={this.onBlur}
                      onFocus={this.onFocus}
                  >{this.props.data.text}</TextArea>
                    :
                  <div>
                      <span
                          onClick={() => this.props.seekTo(this.props.data.time)}
                          style={{
                              cursor: "pointer",
                              color: "green"
                          }}
                      >{this.prettyTime()}</span>
                      <span>{this.props.data.text}</span>
                      <a onClick={() => this.props.editRequested(this.props.data)}>Edit</a>
                  </div>
                }
            </div>
        );
    }
}
