import React, { Component } from "react";
import Captcha from "demos-react-captcha";


export default class MyCaptcha extends Component {
    onChange(value) {
        console.log(value);
    }

    onRefresh(value) {
        console.log(value);
    }

    render() {
        return (
            <div>
                {/*<LoadCanvasTemplate />*/}
                <Captcha onChange={this.onChange} placeholder="Enter captcha"  onRefresh={this.onRefresh}/>
            </div>
        );
    }
}
