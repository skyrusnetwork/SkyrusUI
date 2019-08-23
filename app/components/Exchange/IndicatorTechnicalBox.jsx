import React from "react";
import Ps from "perfect-scrollbar";
import colors from "assets/colors";
import AccountStore from "stores/AccountStore";
import counterpart from "counterpart";
import fire from "../firebase";
import IndicatorTechnical from "./IndicatorTechnical";
import IndicatorEmotion from "./IndicatorEmotion";
const database = fire.database();

class IndicatorTechnicalBox extends React.Component {

  constructor() {
    super();
    this.state = {
      messages: [],
    };
    this.scrollToBottom = this.scrollToBottom.bind(this);
    this.isCalledGetProfile = false;
    this.currentAccount = AccountStore.getState().currentAccount;
  }

  componentWillUnmount() {
  }

  componentWillMount() {

  }

  componentDidMount() {
      let chatContainer = this.refs.chatScroll;
      Ps.initialize(chatContainer);
  }

  componentDidUpdate() {
    let chatContainer = this.refs.chatScroll;
    Ps.update(chatContainer);
  }

  _getThemeColors() {
      return colors.midnightTheme;
  }

  scrollToBottom(){
    let chatContainer = this.refs.chatScroll;
    var scrollingElement = (chatContainer);
    scrollingElement.scrollTop = scrollingElement.scrollHeight;
  }

  render() {
    const {
        primaryText,
        callColor,
        settleColor,
        settleFillColor,
        bidColor,
        bidFillColor,
        askColor,
        askFillColor,
        axisLineColor
    } = this._getThemeColors();
    let defaultAvatar = require("assets/icons/default-avatar.png");

    return (
      <div style={{width: "100%", height: '100%', display: 'flex', flexDirection: 'column'}}>
        <div style={{width: "100%", position: 'relative'}} ref="chatScroll">
          <div className="MessagesList">
            <div style={{width: '100%', height: '33.3%', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{}}>
                <IndicatorEmotion
                  indicator={"EMO"}
                />
                <span>Emotion Indicator</span>
              </div>
              <div style={{marginLeft: '20px'}}>
                <IndicatorTechnical
                  base_symbol={"BTC"}
                  quote_symbol={"USDT"}
                />
                <span>BTC/USDT</span>
              </div>
            </div>
            <div style={{width: '100%', height: '33.3%', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{}}>
                <IndicatorTechnical
                  base_symbol={"ETH"}
                  quote_symbol={"USDT"}
                />
                <span>ETH/USDT</span>
              </div>
              <div style={{marginLeft: '20px'}}>
                <IndicatorTechnical
                  base_symbol={"LTC"}
                  quote_symbol={"USDT"}
                />
                <span>LTC/USDT</span>
              </div>
            </div>
            <div style={{width: '100%', height: '33.3%', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{}}>
                <IndicatorTechnical
                  base_symbol={"BCH"}
                  quote_symbol={"USDT"}
                />
                <span>BCH/USDT</span>
              </div>
              <div style={{marginLeft: '20px'}}>
                <IndicatorTechnical
                  base_symbol={"ETH"}
                  quote_symbol={"BTC"}
                />
                <span>ETH/BTC</span>
              </div>
            </div>
            <div style={{width: '100%', height: '33.3%', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{}}>
                <IndicatorTechnical
                  base_symbol={"LTC"}
                  quote_symbol={"BTC"}
                />
                <span>LTC/BTC</span>
              </div>
              <div style={{marginLeft: '20px'}}>
                <IndicatorTechnical
                  base_symbol={"SKX"}
                  quote_symbol={"BTC"}
                />
                <span>SKX/BTC</span>
              </div>
            </div>
            <div style={{width: '100%', height: '33.3%', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{}}>
                <IndicatorTechnical
                  base_symbol={"LTC"}
                  quote_symbol={"ETH"}
                />
                <span>LTC/ETH</span>
              </div>
              <div style={{marginLeft: '20px'}}>
                <IndicatorTechnical
                  base_symbol={"SKX"}
                  quote_symbol={"ETH"}
                />
                <span>SKX/ETH</span>
              </div>
            </div>
            <div style={{width: '100%', height: '33.3%', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{}}>
                <IndicatorTechnical
                  base_symbol={"BCH"}
                  quote_symbol={"ETH"}
                />
                <span>BCH/ETH</span>
              </div>
              <div style={{marginLeft: '20px'}}>
                <IndicatorTechnical
                  base_symbol={"SKX"}
                  quote_symbol={"LTC"}
                />
                <span>SKX/LTC</span>
              </div>
            </div>
            <div style={{width: '100%', height: '33.3%', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{}}>
                <IndicatorTechnical
                  base_symbol={"SKX"}
                  quote_symbol={"USDT"}
                />
                <span>SKX/USDT</span>
              </div>
              <div style={{marginLeft: '20px'}}>
                <IndicatorTechnical
                  base_symbol={"BTC"}
                  quote_symbol={"BCH"}
                />
                <span>BTC/BCH</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default IndicatorTechnicalBox;
