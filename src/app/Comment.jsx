import React from 'react';
import {render} from 'react-dom';
import cookie from 'react-cookie';
import update from 'immutability-helper';
import { TextArea, Container, Button, Box  } from 'bloomer';

export default class Comment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editing: this.props.data.time === 2
        };
    }
    render() {
        return (
            <div>
                { this.state.editing ?
                  <TextArea
                      placeholder="Type your comment"
                  >{this.props.data.text}</TextArea>
                    :
                  <div>
                      <span>{this.props.data.time}</span>
                      <span>{this.props.data.text}</span>
                  </div>
                }
            </div>
        );
        
    }
}
