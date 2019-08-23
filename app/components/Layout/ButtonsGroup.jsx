import React from "react";
import counterpart from "counterpart";
import BackgroundCommunity from '../../assets/pngs/icon_community.png';
import ButtonClose from '../../assets/pngs/icon_close.png';

class ButtonsGroup extends React.Component {

  constructor(props) {
    super();
    this.state = {
      title1: props.title1,
      title2: props.title2,
      title3: props.title3,
      button1: props.button1,
      button2: props.button2,
      button3: props.button3,
      button4: props.button4
    };
  }

  componentWillUnmount() {
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  componentDidUpdate() {
  }

  render() {
    return (
      <div style={{display: 'flex', alignItems: 'center'}}>
        <img style={{margin: 0, height: 30}} src={this.state.button1} />
        <div
          onClick={() => {this.props.onClickButton1();}}
          title={this.state.title1}
          className = "circle-button"
          style = {{
            marginLeft: 10,
            backgroundImage: "url(" + this.state.button2 + ")",
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundColor: "transparent"}}>
        </div>
        <div
          onClick={() => {this.props.onClickButton2()}}
          title={this.state.title2}
          className = "circle-button"
          style = {{
            marginLeft: 10,
            backgroundImage: "url(" + this.state.button3 + ")",
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundColor: "transparent"}}>
        </div>
        <div
          onClick={() => {this.props.onClickButton3()}}
          title={this.state.title3}
          className = "circle-button"
          style = {{
            marginLeft: 10,
            backgroundImage: "url(" + this.state.button4 + ")",
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundColor: "transparent"}}>
        </div>
        <div
          className = "circle-button"
          style = {{
            marginLeft: 10,
            backgroundImage: "url(" + ButtonClose + ")",
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundColor: "transparent"}}>
        </div>
      </div>
    );
  }
}

export default ButtonsGroup;
