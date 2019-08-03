import React from "react";
import Ps from "perfect-scrollbar";
import colors from "assets/colors";
import Icon from "../Icon/Icon";
import fire from "../firebase";
import FileUploader from "react-firebase-file-uploader";
const database = fire.database();
const storage = fire.storage();

class Message extends React.Component {

  constructor() {
    super();
    this.isPSInitiated = false;
    this.state = {
      users: [],
      invites: [],
      user: null,
      selectedUser: null,
      messages: []
    };
    this.onAddMessage = this.onAddMessage.bind(this);
    this.timeConverter = this.timeConverter.bind(this);
    this.scrollToBottom = this.scrollToBottom.bind(this);
  }

  componentWillUpdate(nextProps, nextState) {
  }

  componentWillMount() {
  }

  componentDidMount() {
    this.initPS();
    let chatContainer = this.refs.privateChatScroll;
    if(chatContainer !== undefined) {
      Ps.update(chatContainer);
    }
    this.currentAccount = this.props.currentAccount;
    if(this.props.user !== null && this.props.user !== undefined) {
      if(this.state.user == null || this.state.user == undefined || JSON.stringify(this.state.user) !== JSON.stringify(this.props.user)) {
        this.setState({user: this.props.user},
        function() {
          this.getInvites(this.props.user);
          this.getUsers();
        });
      }
    }
  }

  componentDidUpdate(prevProps) {
    let chatContainer = this.refs.privateChatScroll;
    if(chatContainer !== undefined) {
      Ps.update(chatContainer);
    }
    this.currentAccount = this.props.currentAccount;
    if(this.props.user !== null && this.props.user !== undefined) {
      if(this.state.user == null || this.state.user == undefined || JSON.stringify(this.state.user) !== JSON.stringify(this.props.user)) {
        this.setState({user: this.props.user},
        function() {
          this.getInvites(this.props.user);
          this.getUsers();
        });
      }
    }
  }

  initPS() {
    let chatContainer = this.refs.privateChatScroll;
    if(chatContainer !== undefined && this.isPSInitiated == false) {
      Ps.initialize(chatContainer);
      this.isPSInitiated = true;
    }
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

  getMessages(user) {
    this.setState({messages: []},
    function() {
      if(this.state.user == null || this.state.user == undefined || user == null || user == undefined) {
        return;
      }
      const messagesRef = database.ref('private_messages/' + this.currentAccount + '/' + user.id)
        .orderByKey()
        .limitToLast(100);

      messagesRef.on('child_added', snapshot => {
        const message = { text: snapshot.val(), id: snapshot.key };

        if((message.text.id === this.state.selectedUser.id && message.text.to === this.state.user.id) || (message.text.id === this.state.user.id && message.text.to === this.state.selectedUser.id)) {
          console.log(this.state.selectedUser.id);
          let messages = this.state.messages;
          messages.push(message);
          this.setState(prevState => ({
            messages: messages,
          }));
          this.scrollToBottom();
        }
      });
    });
  }

  onAddMessage(event) {
    event.preventDefault();
    if(this.state.user == null) {
      return;
    }
    let name, image, id;
    if(this.state.user.currentAccount == null && this.state.user.currentAccount == undefined || this.state.user.currentAccount == "" || this.state.user.currentAccount == "user") {
      name = this.state.user.userName != undefined ? this.state.user.userName : "";
      id = this.state.user.id;
      image = this.state.user.userImage != undefined ? this.state.user.userImage : "";
    } else {
      name = this.state.user.avatarName != undefined ? this.state.user.avatarName : "";
      image = this.state.user.avatarImage != undefined ? this.state.user.avatarImage : "";
      id = this.state.user.id;
    }
    var data = {"date": Date.now(), "user": name, "content": this.input.value, "image" : image, id: id, to: this.state.selectedUser.id};
    database.ref('private_messages/' + this.currentAccount + '/' + this.state.selectedUser.id).push(data);
    database.ref('private_messages/'  + this.state.selectedUser.id + '/' + this.currentAccount).push(data);
    this.input.value = '';
  }

  getInvites(user) {
    const invitesRef = database.ref('invites/' + user.id);
    invitesRef.on('value', snapshot => {
      const invites = snapshot.val();
      this.setState({invites: invites});
    });
  }

  getUsers() {
    const usersRef = database.ref('users');
    usersRef.on('value', snapshot => {
      const users = snapshot.val();
      this.setState({users: users});
    });
  }

  isContact(user) {
    if(this.state.invites == null || this.state.invites == undefined || this.state.invites.length == 0) {
      return false;
    }
    let isContact = false;
    Object.keys(this.state.invites).map(key => {
      let invite = this.state.invites[key];
      invite.key = key;
      if(invite.userId == user.id || invite.otherUserId == user.id) {
        if(invite.status == "accepted") {
          isContact = true;
        } else if (invite.status == "sent") {
          if(invite.userId == user.id) {
            isContact = false;
          } else if (invite.otherUserId == user.id) {
            isContact = false;
          }
        }
      }
    });
    return isContact;
  }

  _getThemeColors() {
      return colors.midnightTheme;
  }

  renderContacts() {
    if(this.state.user == null || this.state.user == undefined || this.state.users == null || this.state.users == undefined || this.state.users.length == 0) {
      return [];
    }
    let userViews = [];
    let defaultAvatar = require("assets/icons/default-avatar.png");
    Object.keys(this.state.users).map(key => {
      let user = this.state.users[key];
      user.id = key;
      if(user.id !== this.state.user.id && this.isContact(user)) {
        if(this.state.selectedUser !== null && user.id === this.state.selectedUser.id) {
          userViews.push(
            <div style={{padding: 10, cursor: "pointer", borderWidth: 1, borderColor: '#00a8d6', borderStyle: 'solid'}} key={key} onClick={() => {this.setState({selectedUser: user}, function() {this.getMessages(user);});}}>
              <div style={{display: 'flex'}}>
                <img
                  src={user.userImage == null || user.userImage == undefined || user.userImage == '' ? defaultAvatar : user.userImage}
                  style={{borderRadius:"50%", border: "none", width: "30px", height: "30px", backgroundColor: "#777777", marginRight:"3px"}}
                />
              <span style={{overflow: 'hidden', color: "#777777",  marginRight:"20px", flex: 1, display: 'flex', alignItems: 'center'}}>
                  {user.id}
                </span>
              </div>
            </div>
          );
        } else {
          userViews.push(
            <div style={{padding: 10, cursor: "pointer", borderBottomWidth: 0.5, borderBottomColor: '#2d2f37', borderLeftWidth: 0, borderTopWidth: 0, borderRightWidth: 0, borderStyle: 'solid'}} key={key} onClick={() => {this.setState({selectedUser: user}, function() {this.getMessages(user);});}}>
              <div style={{display: 'flex'}}>
                <img
                  src={user.userImage == null || user.userImage == undefined || user.userImage == '' ? defaultAvatar : user.userImage}
                  style={{borderRadius:"50%", border: "none", width: "30px", height: "30px", backgroundColor: "#777777", marginRight:"3px"}}
                />
                <span style={{overflow: 'hidden', color: "#777777",  marginRight:"20px", flex: 1, display: 'flex', alignItems: 'center'}}>
                  {user.id}
                </span>
              </div>
            </div>
          );
        }
      }
    });
    return userViews;
  }

  renderChatContent() {
    if(this.state.selectedUser == null || this.state.selectedUser == undefined) {
      return(
        <div>
          <h2>
            Welcome to conversation!
          </h2>
          <h4>
            Tap Contact to start conversation.
          </h4>
        </div>
      );
    } else {
      return(
        <div style={{width: "100%", height: '100%', flex: 1, padding: 10}}>
          <div className="MessagesList">
            {this.renderMessages()}
          </div>
        </div>
      );
    }
  }

  renderMessages() {
    let keys = [];
    let messages = [];
    this.state.messages.map(message => {
      if(keys.indexOf(message.id) === -1) {
        keys.push(message.id);
        messages.push(
          <div style={{marginBottom:"20px"}} key={message.id}>
            <div style={{marginBottom:"5px"}}>
              <img
                src={message.text.image == null || message.text.image == undefined || message.text.image == '' ? defaultAvatar : message.text.image}
                style={{borderRadius:"50%", border: "none", width: "30px", height: "30px", backgroundColor: "#777777", marginRight:"3px"}}
              />
              <span style={{color: "#777777",  marginRight:"20px"}}>
                  {message.text.id}
              </span>
              <span style={{color: "#444444", fontSize:"11px"}}>
                  {this.timeConverter(message.text.date)}
              </span>
            </div>
            <div
              style={{borderRadius:"5px", padding: "5px", marginLeft:"20px"}}
            >{message.text.content}</div>
          </div>
        );
      }
    });
    return messages;
  }

  scrollToBottom(){
    let chatContainer = this.refs.privateChatScroll;
    if(chatContainer !== undefined) {
      var scrollingElement = (chatContainer);
      scrollingElement.scrollTop = scrollingElement.scrollHeight;
    }
  }

  renderMessageInput() {
    if(this.state.selectedUser == null || this.state.selectedUser == undefined) {
      return null;
    }
    return(
      <form style={{height: 50}} onSubmit={this.onAddMessage}>
        <input
          type="text" ref={node => this.input = node} placeholder="Type a message here"
          style={{border:"1px solid #555555"}}
          disabled={
              !this.props.currentAccount || this.props.currentAccount === "1.2.3"
          }
        />
        <input type="submit" style={{display:"none"}}/>
      </form>
    );
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
      <div style={{width: "100%", height: '100%', display: 'flex', flexDirection: 'row', paddingBottom: 38, paddingTop: 6, paddingLeft: 6, paddingRight: 6}}>
        <div style={{width: 150, borderRightWidth: 0.5, borderRightColor: '#2d2f37', borderLeftWidth: 0, borderTopWidth: 0, borderBottomWidth: 0, borderStyle: 'solid'}}>
          {this.renderContacts()}
        </div>
        <div style={{width: "100%", height: '100%', display: 'flex', flexDirection: 'column', flex: 1, paddingRight: 5, paddingLeft: 5}}>
          <div style={{width: "100%", height: '100%', display: 'flex', flexDirection: 'column', flex: 1, paddingRight: 5, paddingLeft: 5, alignItems: 'center', justifyContent: 'center'}} ref="privateChatScroll">
            {this.renderChatContent()}
          </div>
          {this.renderMessageInput()}
        </div>
      </div>
    );
  }
}
export default Message;
