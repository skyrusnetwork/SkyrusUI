import React from "react";
import Ps from "perfect-scrollbar";
import colors from "assets/colors";
import AccountStore from "stores/AccountStore";
import counterpart from "counterpart";
import fire from "../firebase";
const database = fire.database();

class ChatBox extends React.Component {

  constructor() {
    super();
    this.state = {
      messages: [],
    };
    this.onAddMessage = this.onAddMessage.bind(this);
    this.timeConverter = this.timeConverter.bind(this);
    this.scrollToBottom = this.scrollToBottom.bind(this);
    this.isCalledGetProfile = false;
    this.currentAccount = AccountStore.getState().currentAccount;
  }

  componentWillUnmount() {
  }

  componentWillMount() {
    const messagesRef = database.ref('messages')
      .orderByKey()
      .limitToLast(100);

    messagesRef.on('child_added', snapshot => {
      const message = { text: snapshot.val(), id: snapshot.key };
      let messages = this.state.messages;
      messages.push(message);
      this.setState(prevState => ({
        messages: messages,
      }));
    });
  }

  componentDidMount() {
      let chatContainer = this.refs.chatScroll;
      Ps.initialize(chatContainer);
      this.scrollToBottom();
      if(this.state.user == null) {
        this.isCalledGetProfile = false;
        this.getUserProfile();
      }
  }

  componentDidUpdate() {
    let chatContainer = this.refs.chatScroll;
    Ps.update(chatContainer);
    this.scrollToBottom();
    if(this.props.currentAccount !== null && this.props.currentAccount !== undefined) {
      if(this.currentAccount == null && this.props.currentAccount !== null && this.props.currentAccount !== undefined) {
        this.currentAccount = this.props.currentAccount;
        this.isCalledGetProfile = false;
        this.getUserProfile();
      } else if (this.currentAccount !== this.props.currentAccount) {
        this.isCalledGetProfile = false;
        this.currentAccount = this.props.currentAccount;
        this.getUserProfile();
      }
    }
  }

  getUserProfile() {
    if(this.isCalledGetProfile || this.currentAccount == null) {
      return;
    }
    this.isCalledGetProfile = true;
    const userRef = database.ref('users/' + this.currentAccount);
    userRef.on('value', snapshot => {
      const user = snapshot.val();
      if(user == null) {
        userRef.set({
          userImage: '',
          avatarImage: ''
        });
      } else {
        user.id = snapshot.key;
        this.setState({ user: user });
      }
    });
  }

  _getThemeColors() {
      return colors.midnightTheme;
  }

  onAddMessage(event) {
    event.preventDefault();
    if(this.state.user == null || !this.input.value) {
      return;
    }
    let name, image, id;

    if(this.state.user.currentAccount == null && this.state.user.currentAccount == undefined || this.state.user.currentAccount == "" || this.state.user.currentAccount == "user") {
      name = this.state.user.userName != undefined ? this.state.user.userName : "";
      image = this.state.user.userImage != undefined ? this.state.user.userImage : "";
      id = this.state.user.id;
    } else {
      name = this.state.user.avatarName != undefined ? this.state.user.avatarName : "";
      image = this.state.user.avatarImage != undefined ? this.state.user.avatarImage : "";
      id = this.state.user.id;
    }
    var data = {"date": Date.now(), "user": name, "content": this.input.value, "image" : image, id: id};
    database.ref('messages').push(data);
    this.input.value = '';
  }

  timeConverter(UNIX_timestamp){
      var a = new Date(UNIX_timestamp);
      var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      var year = a.getFullYear();
      var month = months[a.getMonth()];
      var date = a.getDate();
      var hour = a.getHours();
      var min = a.getMinutes();
      var sec = a.getSeconds();
      var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min ;
      return time;
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
            {this.state.messages.map(message =>
              <div style={{marginBottom:"20px"}} key={message.id}>
                <div style={{marginBottom:"5px"}}>
                  <img
                    src={message.text.image == null || message.text.image == undefined || message.text.image == '' ? defaultAvatar : message.text.image}
                    style={{borderRadius:"50%", border: "none", width: "30px", height: "30px", backgroundColor: "#777777", marginRight:"3px"}}
                  />
                  <span style={{color: "#777777",  marginRight:"20px"}}>
                      {message.text.user !== null && message.text.user !== undefined && message.text.user !== 'undefined' ? message.text.user : message.text.id}
                  </span>
                  <span style={{color: "#444444", fontSize:"11px"}}>
                      {this.timeConverter(message.text.date)}
                  </span>
                </div>
                <div
                  style={{borderRadius:"5px", padding: "5px", marginLeft:"20px"}}
                >{message.text.content}</div>
              </div>
            )}
          </div>
        </div>

        <form style={{height: 50}} onSubmit={this.onAddMessage}>
          <input
            type="text" ref={node => this.input = node} placeholder={counterpart.translate("community.chatPlaceholder")}
            style={{border:"1px solid #555555"}}
            disabled={
                !this.props.currentAccount || this.props.currentAccount === "1.2.3"
            }
          />
          <input type="submit" style={{display:"none"}}/>
        </form>
      </div>
    );
  }
}

export default ChatBox;
