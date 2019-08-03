import React from "react";
import Ps from "perfect-scrollbar";
import colors from "assets/colors";
import fire from "../firebase";
import {Tabs, Tab} from "../Utility/Tabs";
import Profile from "./Profile";
import Message from "./Message";
import Notifications from "./Notifications";
import Post from "./Post";

const database = fire.database();

class Community extends React.Component {

  constructor() {
    super();
    this.isCalledGetProfile = false;
    this.currentAccount = null;
    this.state = {
      user: null,
      unreadCount: "",
      notifications: null
    };
  }

  componentWillMount() {
  }

  componentDidMount() {
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

  componentDidUpdate() {
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
      let user = snapshot.val();
      if(user == null) {
        userRef.set({
          userImage: '',
          avatarImage: ''
        });
      } else {
        user.id = snapshot.key;
        this.setState({ user: user });
        this.getNotifications(user);
      }
    });
  }

  getNotifications(user) {
    if(this.currentAccount !== null && this.currentAccount !== undefined) {
      const notificationsRef = database.ref('notifications/' + this.currentAccount);
      notificationsRef.on('value', snapshot => {
        let unreadCount = 0;
        this.setState({posts : snapshot.val()})
        const notifications = snapshot.val();
        this.setState({notifications: notifications});
        if(notifications !== null && notifications !== undefined) {
          Object.keys(notifications).map((key) => {
            let notification = notifications[key];
            if(notification.read === false) {
              unreadCount ++;
            }
          });
        }
        this.setState({unreadCount: unreadCount});
      });
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
      <div style={{width: "100%", height: '100%', display: 'flex', flexDirection: 'column'}}>
        <Tabs
            isFull={true}
            defaultActiveTab={0}
            segmented={false}
            setting="overviewTab"
            className="account-tabs"
            tabsClass="account-overview no-padding bordered-header content-block"
        >
            <Tab
                title="Profile"
            >
              <Profile currentAccount={this.currentAccount} user={this.state.user}/>
            </Tab>

            <Tab
                title="Message"
            >
              <Message currentAccount={this.currentAccount} user={this.state.user}/>
            </Tab>
            <Tab
                title="Post"
            >
              <Post currentAccount={this.currentAccount} user={this.state.user}/>
            </Tab>
            {/* <Tab
                title="Calendar"
            >
              <div>
              </div>
            </Tab>
            <Tab
                title="Tag Chat"
            >
              <div>
              </div>
            </Tab>
            <Tab
                title="Tag Help"
            >
              <div>
              </div>
            </Tab>
            <Tab
                title="Skyrusity"
            >
              <div>
              </div>
            </Tab> */}
            <Tab
                title="Notification"
                unreadCount={this.state.unreadCount}
            >
              <Notifications notifications={this.state.notifications} currentAccount={this.currentAccount} user={this.state.user}/>
            </Tab>
        </Tabs>
      </div>
    );
  }
}

export default Community;
