import React from "react";
import Ps from "perfect-scrollbar";
import colors from "assets/colors";
import Icon from "../Icon/Icon";
import fire from "../firebase";
import FileUploader from "react-firebase-file-uploader";
import {Select, Row, Col, Button, Modal} from "bitshares-ui-style-guide";
import {Notification} from "bitshares-ui-style-guide";
const database = fire.database();
const storage = fire.storage();
const generateRandomFilename = (): string => generateRandomID();
import generateRandomID from 'uuid/v4';

class Notifications extends React.Component {

  uploadTasks: Array<Object> = [];

  constructor() {
    super();
    this.state = {
      user: null,
      notifications: null,
      invites: null,
      users: null,
      groupInvites: null
    };
  }

  componentWillUpdate(nextProps, nextState) {
  }

  componentWillMount() {
  }

  componentDidMount() {
    this.currentAccount = this.props.currentAccount;
    this.setState({notifications: this.props.notifications},
    function () {
      if(this.props.user !== null && this.props.user !== undefined) {
        if(this.state.user == null || this.state.user == undefined || JSON.stringify(this.state.user) !== JSON.stringify(this.props.user)) {
          this.setState({user: this.props.user});
          this.getInvites(this.currentAccount);
          this.getGroupInvites();
        }
      }
    });

  }

  shouldComponentUpdate(nextProps, nextState) {
      return (
          (nextProps.notifications !== null && (
            this.props.notifications == null ||
            (JSON.stringify(nextProps.notifications !== JSON.stringify(this.props.notifications)))
          )) ||
          nextProps.currentAccount !== this.props.currentAccount ||
          nextProps.passwordLogin !== this.props.passwordLogin ||
          nextProps.locked !== this.props.locked
      );
  }

  componentWillReceiveProps(nextProps) {
    this.currentAccount = nextProps.currentAccount;
    this.setState({notifications: nextProps.notifications},
    function () {
      if(nextProps.user !== null && nextProps.user !== undefined) {
        if(this.state.user == null || this.state.user == undefined || JSON.stringify(this.state.user) !== JSON.stringify(nextProps.user)) {
          this.setState({user: nextProps.user});
          this.getInvites(this.currentAccount);
          this.getGroupInvites();
        }
      }
    });
  }

  getGroupInvites() {
    const invitesRef = database.ref('group-invites');
    invitesRef.on('value', snapshot => {
      const groupInvites = snapshot.val();
      this.setState({groupInvites: groupInvites});
    });
  }

  getInvites(id) {
    if(id == undefined) {
      return;
    }
    const invitesRef = database.ref('invites/' + id);
    invitesRef.on('value', snapshot => {
      const invites = snapshot.val();
      this.setState({invites: invites});
    });
  }

  accept(invite) {
    database.ref('invites/' + invite.userId + '/' + invite.key + '/status').set("accepted");
    database.ref('invites/' + invite.otherUserId + '/' + invite.key + '/status').set("accepted");
  }

  acceptGroup(invite, inviteKey) {
    const groupInvitesRef = database.ref('group-invites/' + inviteKey + '/status');
    groupInvitesRef.set("accepted");
  }

  renderGroupInviteActionButton(inviteKey) {
    if(this.state.groupInvites == null || this.state.groupInvites == undefined || this.state.groupInvites.length == 0) {
      return null;
    }
    let button = null;
    if(this.state.groupInvites[inviteKey] !== null && this.state.groupInvites[inviteKey] !== undefined) {
      let invite = this.state.groupInvites[inviteKey];
      if(invite.status == "accepted") {
        button = null;
      } else if (invite.status == "sent") {
        button = (<span style={{cursor: 'pointer'}} onClick={() => {this.acceptGroup(invite, inviteKey)}}>
          Accept
        </span>);
      }
    } else {
      return null;
    }
    return button;
  }

  renderInviteActionButton(inviteKey) {
    if(this.state.invites == null || this.state.invites == undefined || this.state.invites.length == 0) {
      return null;
    }
    let button = null;
    Object.keys(this.state.invites).map(key => {
      let invite = this.state.invites[key];
      invite.key = key
      if(inviteKey === key) {
        if(invite.status == "accepted") {
          button = null;
        } else if (invite.status == "sent") {
          button = (<span style={{cursor: 'pointer'}} onClick={() => {this.accept(invite)}}>
            Accept
          </span>);
        }
      }
    });
    return button;
  }

  readNotification(key, id) {
    const notificationRef = database.ref('notifications/' + id + '/' + key + '/read');
    notificationRef.set(true);
  }

  getUserProfile(id) {
    const userRef = database.ref('users/' + id);
    userRef.on('value', snapshot => {
      let user = snapshot.val();
      if(user != null) {
        user.id = snapshot.key;
        if(this.state.users == null || this.state.users == undefined) {
          let users = [];
          users.push(user);
          this.setState({users: users});
        } else {
          let users = this.state.users;
          let isExist = false;
          for (var i = 0; i < users.length; i++) {
            if(users[i].id === user.id) {
              if(JSON.stringify(users[i]) !== JSON.stringify(user)) {
                  users[i] = user;
              }
              isExist = true;
            }
          }
          if(isExist == false) {
            users.push(user);
          }
          this.setState({users: users});
          console.log(users);
        }
      }
    });
  }

  getUserImage(id) {
    let defaultAvatar = require("assets/icons/default-avatar.png");
    let users = this.state.users;
    if(users === null) {
      this.getUserProfile(id);
      return defaultAvatar;
    }
    let isExist = false;
    for (var i = 0; i < users.length; i++) {
      if(users[i].id === id) {
        if(users[i].id.currentAccount == undefined || users[i].id.currentAccount == 'user') {
          return users[i].userImage !== undefined ? users[i].userImage : defaultAvatar;
        } else {
          return users[i].avatarImage !== undefined ? users[i].avatarImage : defaultAvatar;
        }
      }
    }
    this.getUserProfile(id);
    return defaultAvatar;
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

  renderNotifications() {
    let notifications = [];
    let defaultAvatar = require("assets/icons/default-avatar.png");
    let avatar;
    if(this.state.notifications !== null && this.state.notifications !== undefined) {
      Object.keys(this.state.notifications).map((key) => {
        let notification = this.state.notifications[key];
        if(notification.read === false) {
          this.readNotification(key, notification.userId);
        }
        switch (notification.type) {
          case "invite":
            avatar = this.getUserImage(notification.from);
            notifications.push(
              <div key={notification.key + '_invite'} style={{display: 'flex', flexDirection: 'row', padding: 10, borderBottomWidth: 0.2, borderBottomColor: '#2d2f37', borderStyle:'solid', borderLeftWidth: 0, borderTopWidth: 0, borderRightWidth: 0}}>
                <div style={{flex: 1}}>
                  <img
                    src={avatar}
                    style={{borderRadius:"50%", border: "none", width: "30px", height: "30px", backgroundColor: "#777777", marginRight:"3px"}}
                  />
                  <span style={{color: "#2580be",  marginLeft:"20px", pointer: 'cusor'}}>
                    {notification.from + ' '}
                  </span>
                  <span>
                    sent friend request.
                  </span>
                  <span style={{color: "#444444", fontSize:"11px", marginLeft: 50}}>
                      {this.timeConverter(notification.date)}
                  </span>
                </div>
                <span>
                  {this.renderInviteActionButton(notification.key)}
                </span>
              </div>
            );
            break;
          case 'group-invite':
            avatar = this.getUserImage(notification.from);
            notifications.push(
              <div key={notification.key + '_group_invite'} style={{display: 'flex', flexDirection: 'row', padding: 10, borderBottomWidth: 0.2, borderBottomColor: '#2d2f37', borderStyle:'solid', borderLeftWidth: 0, borderTopWidth: 0, borderRightWidth: 0}}>
                <div style={{flex: 1}}>
                  <img
                    src={avatar}
                    style={{borderRadius:"50%", border: "none", width: "30px", height: "30px", backgroundColor: "#777777", marginRight:"3px"}}
                  />
                  <span style={{color: "#2580be",  marginLeft:"20px", pointer: 'cusor'}}>
                    {notification.from + ' '}
                  </span>
                  <span>
                    invited you to his group
                  </span>
                  <span style={{color: "#444444", fontSize:"11px", marginLeft: 50}}>
                      {this.timeConverter(notification.date)}
                  </span>
                </div>
                <span>
                  {this.renderGroupInviteActionButton(notification.key)}
                </span>
              </div>
            );
            break;
          default:

        }
      });
      return notifications;
    } else {
      return;
    }
  }

  _getThemeColors() {
      return colors.midnightTheme;
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
      <div style={{width: "100%", height: '100%', paddingBottom: 38}}>
        {this.renderNotifications()}
      </div>
    );
  }
}
export default Notifications;
