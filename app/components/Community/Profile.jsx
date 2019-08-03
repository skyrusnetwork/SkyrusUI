import React from "react";
import Ps from "perfect-scrollbar";
import colors from "assets/colors";
import Icon from "../Icon/Icon";
import fire from "../firebase";
import FileUploader from "react-firebase-file-uploader";
import {Select, Row, Col, Button, Modal} from "bitshares-ui-style-guide";
import Popup from "reactjs-popup";
const database = fire.database();
const storage = fire.storage();
import {Notification} from "bitshares-ui-style-guide";

class Profile extends React.Component {

  constructor() {
    super();
    this.state = {
      isShowInviteModal: false,
      isShowRemoveContactModal: false,
      isShowCreateGroupModal: false,
      user: null,
      isEditStatus: false,
      posts: null,
      followings: null,
      likes: {
        user: 0,
        avatar: 0
      },
      followers : {
        user: 0,
        avatar: 0
      },
      users: [],
      invites: [],
      groups: {},
      selectedContacts: [],
      isShowRemoveGroupModal: false,
      selectedGroups: [],
      selectedGroup: null,
      groupEditName: '',
      groupEditDescription: '',
      selectedGroupForInvite: null,
      groupInvites: null
    };
    this.closeInviteModal = this.closeInviteModal.bind(this);
    this.closeRemoveContactsModal = this.closeRemoveContactsModal.bind(this);
    this.closeRemoveGroupsModal = this.closeRemoveGroupsModal.bind(this);
    this.closeCreateGroupModal = this.closeCreateGroupModal.bind(this);
    this.closeGroupDetailModal = this.closeGroupDetailModal.bind(this);
    this.closeInviteToGroupModal = this.closeInviteToGroupModal.bind(this);
  }

  componentWillUpdate(nextProps, nextState) {
  }

  componentWillMount() {
  }

  componentDidMount() {
    this.currentAccount = this.props.currentAccount;
    if(this.props.user !== null && this.props.user !== undefined) {
      if(this.state.user == null || this.state.user == undefined || JSON.stringify(this.state.user) !== JSON.stringify(this.props.user)) {
        this.setState({user: this.props.user},
        function() {
          this.getPosts(this.props.user);
          this.getFollowers(this.props.user);
          this.getInvites(this.props.user);
          this.getGroups(this.props.user);
        });
      }
    }
  }

  componentDidUpdate(prevProps) {
    this.currentAccount = this.props.currentAccount;
    if(this.props.user !== null && this.props.user !== undefined) {
      if(this.state.user == null || this.state.user == undefined || JSON.stringify(this.state.user) !== JSON.stringify(this.props.user)) {
        this.setState({user: this.props.user},
        function() {
          this.getPosts(this.props.user);
          this.getFollowers(this.props.user);
          this.getInvites(this.props.user);
          this.getGroups(this.props.user);
        });
      }
    }
  }

  getPosts(user) {
    const postsRef = database.ref('posts');

    postsRef.orderByChild("userId").equalTo(this.currentAccount).on('value', snapshot => {
      this.setState({posts : snapshot.val()})
      const posts = snapshot.val();
      if(posts !== null && posts !== undefined) {
        let userLikes = 0;
        let avatar = 0;
        Object.values(posts).map((post) => {
          if( post.likes !== null && post.likes !== undefined ) {
            let likes = post.likes;

            if(post.user.currentAccount !== null && post.user.currentAccount !== undefined && post.user.currentAccount == "avatar") {
              if(avatar === 0) {
                avatar = likes.length;
              } else {
                avatar = parseFloat(avatar) + likes.length;
              }
            } else {
              if(userLikes === 0) {
                userLikes = likes.length;
              } else {
                userLikes = parseFloat(userLikes) + likes.length;
              }
            }
          }
        });

        this.setState({likes: {
          user: userLikes,
          avatar: avatar
        }});
      } else {
        this.setState({likes: {
          user: 0,
          avatar: 0
        }});
      }
    });
  }

  getFollowers(user) {
    const usersRef = database.ref('users');
    usersRef.on('value', snapshot => {
      const users = snapshot.val();
      this.setState({users: users});
      if(users == null || users == undefined) {
        this.setState({followers : {
          user: 0,
          avatar: 0
        }});
      } else {
        let userFollowers = 0;
        let avatarFollowers = 0;
        Object.values(users).map(item => {
          let followers = item.followings !== null && item.followings !== undefined ? item.followings : [];
          for (var i = 0; i < followers.length; i++) {
            const follower = followers[i];
            if(follower.id == this.currentAccount) {
              if(follower.type == "user") {
                userFollowers ++;
              } else {
                avatarFollowers ++;
              }
            }
          };
        });
        this.setState({followers : {
          user: userFollowers,
          avatar: avatarFollowers
        }});
      }
    });
  }

  getGroups(user) {
    const groupsRef = database.ref('groups/' + user.id);
    groupsRef.on('value', snapshot => {
      const groups = snapshot.val();
      this.setState({groups: groups},
      function() {
        this.getGroupInvites(user);
      });
    });
  }

  getInvites(user) {
    const invitesRef = database.ref('invites/' + user.id);
    invitesRef.on('value', snapshot => {
      const invites = snapshot.val();
      this.setState({invites: invites});
    });
  }

  getGroupInvites(user) {
    const invitesRef = database.ref('group-invites');
    invitesRef.on('value', snapshot => {
      const groupInvites = snapshot.val();
      this.setState({groupInvites: groupInvites});
      if(groupInvites !== null && groupInvites !== undefined) {
        Object.keys(groupInvites).map((key) => {
          let invite = groupInvites[key];
          if(user.id === invite.userId && invite.status == "accepted") {
            this.addGroup(invite.from, invite.key);
          }
        });
      }
    });
  }

  addGroup(id, key) {
    if(this.state.user == null || this.state.user == undefined) {
      return;
    }
    const groupRef = database.ref('groups/' + id + '/' + key);
    groupRef.on('value', snapshot => {
      let group = snapshot.val();
      let groups = this.state.groups;
      if(group !== null && group !== undefined) {
        group.key = snapshot.key;
        if(groups == null || groups == undefined) {
          groups = {};
        }
        groups[group.key] = group;
        this.setState({groups: groups});
      }
    });
  }

  updateUserImage(imageURL) {
    const userRef = database.ref('users/' + this.currentAccount + '/userImage');
    userRef.set(imageURL);
  }

  updateUserAvatar(imageURL) {
    const userRef = database.ref('users/' + this.currentAccount + '/avatarImage');
    userRef.set(imageURL);
  }

  _getThemeColors() {
      return colors.midnightTheme;
  }

  handleUploadStart = () => this.setState({ isUploading: true, progress: 0 });
  handleProgress = progress => this.setState({ progress });
  handleUploadError = error => {
    this.setState({ isUploading: false });
    console.error(error);
  };
  handleUploadSuccess = filename => {
    this.setState({ userImage: filename, progress: 100, isUploading: false });
    storage
      .ref("images")
      .child(filename)
      .getDownloadURL()
      .then(url => this.updateUserImage(url));
  };

  handleUploadStartAvatar = () => this.setState({ isUploadingAvatar: true, progressAvatar: 0 });
  handleProgressAvatar = progressAvatar => this.setState({ progressAvatar });
  handleUploadErrorAvatar = error => {
    this.setState({ isUploadingAvatar: false });
    console.error(error);
  };
  handleUploadSuccessAvatar = filename => {
    this.setState({ avatar: filename, progressAvatar: 100, isUploadingAvatar: false });
    storage
      .ref("images")
      .child(filename)
      .getDownloadURL()
      .then(url => this.updateUserAvatar(url));
  };

  editProfile() {
    this.setState({isEditStatus: true});
    this.refs.avatarName.value = this.state.user === null || this.state.user.avatarName === null ? "" : this.state.user.avatarName;
    this.refs.userName.value = this.state.user === null || this.state.user.userName === null ? "" : this.state.user.userName;
    this.refs.description.value = this.state.user === null || this.state.user.description === null ? "" : this.state.user.description;
  }

  saveProfile() {
    const userNameRef = database.ref('users/' + this.currentAccount + '/userName');
    userNameRef.set(this.refs.userName.value);
    const avatarNameRef = database.ref('users/' + this.currentAccount + '/avatarName');
    avatarNameRef.set(this.refs.avatarName.value);
    const descriptionRef = database.ref('users/' + this.currentAccount + '/description');
    descriptionRef.set(this.refs.description.value);
    this.setState({isEditStatus: false});
    Notification.success({
        message: "Profile is updated successfully."
    });
  }

  renderEditStatusIcon() {
    if(this.state.user == null) {
      return;
    }
    if(this.state.isEditStatus) {
        return(
          <img style={{width: 20, height: 20, position: 'absolute', right: 10, top: 40}} src={require("assets/pngs/icon-save.png")} onClick={() => {this.saveProfile()}}/>
        );
    } else {
      return(
        <img style={{width: 20, height: 20, position: 'absolute', right: 10, top: 40}} src={require("assets/pngs/icon-edit.png")} onClick={() => {this.editProfile()}}/>
      );
    }
  }

  getFollowings() {
    let followings = this.state.user !== null && this.state.user !== undefined && this.state.user.followings !== null && this.state.user.followings !== undefined ? this.state.user.followings : [];
    if(followings.length == 0) {
      return {
        user: 0,
        avatar: 0
      };
    } else {
      let user = 0;
      let avatar = 0;
      for (var i = 0; i < followings.length; i++) {
        if(followings[i].type == "user") {
          user ++;
        } else {
          avatar ++;
        }
      }
      return {
        user: user,
        avatar: avatar
      };
    }
  }

  openInviteModal() {
    this.setState({isShowInviteModal: true});
  }

  closeRemoveGroupsModal() {
    this.setState({isShowRemoveGroupModal: false});
  }

  closeRemoveContactsModal() {
    this.setState({isShowRemoveContactModal: false});
  }

  closeInviteModal() {
    this.setState({isShowInviteModal: false});
  }

  invite(user) {
    if(this.currentAccount == null || this.currentAccount == undefined || this.state.user == null || this.state.user.id === user.id) {
      return;
    }
    let invite = {
      date: Date.now(),
      userId: this.state.user.id,
      currentAccount: this.state.user.currentAccount !== undefined ? this.state.user.currentAccount : "user",
      otherUserId: user.id,
      otherCurrentAccount: user.currentAccount ? user.currentAccount : "user",
      status: "sent"
    };
    database.ref('invites/' + this.state.user.id).push(invite).then((snapshot) => {
      database.ref('invites/' + user.id + '/' + snapshot.key).set(invite).then(() => {
        Notification.success({
            message: "Invite is sent successfully."
        });
        let notification = {
          date: Date.now(),
          userId: user.id,
          from: this.state.user.id,
          type: 'invite',
          key: snapshot.key,
          data: invite,
          read: false
        };
        database.ref('notifications/' + user.id).push(notification);
      }).catch(() => {
        Notification.error({
            message: "Something went wrong."
        });
      });
    }).catch(() => {
      Notification.error({
          message: "Something went wrong."
      });
    });
  }

  accept(invite) {
    database.ref('invites/' + invite.userId + '/' + invite.key + '/status').set("accepted");
    database.ref('invites/' + invite.otherUserId + '/' + invite.key + '/status').set("accepted");
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

  inviteToGroup(group, user) {
    if(this.state.user === null || this.state.user === undefined) {
      return;
    }
    let invite = {
      date: Date.now(),
      from: this.state.user.id,
      userId: user.id,
      key: group.key,
      status: "sent",
      group: group
    };
    database.ref('group-invites').push(invite).then((snapshot) => {
      Notification.success({
          message: "Invite is sent successfully."
      });
      let notification = {
        date: Date.now(),
        userId: user.id,
        from: this.state.user.id,
        type: 'group-invite',
        key: snapshot.key,
        data: invite,
        read: false
      };
      database.ref('notifications/' + user.id).push(notification);
    }).catch(() => {
      Notification.error({
          message: "Something went wrong."
      });
    });
  }

  acceptGroup(group, user) {}

  renderGroupInviteButton(user) {
    if(user.id == this.state.user.id) {
      return;
    }
    let group = this.state.selectedGroupForInvite;
    if(group.userId === user.id) {
      return null;
    }
    if(this.state.groupInvites == null || this.state.groupInvites == undefined || this.state.groupInvites.length == 0) {
      return (
        <span style={{cursor: 'pointer'}} onClick={() => {this.inviteToGroup(group, user)}}>
          + Invite
        </span>
      );
    }
    let button = (<span style={{cursor: 'pointer'}} onClick={() => {this.inviteToGroup(group, user)}}>
      + Invite
    </span>);
    Object.keys(this.state.groupInvites).map(key => {
      let groupInvite = this.state.groupInvites[key];
      if(groupInvite.key == group.key && groupInvite.userId == user.id) {
        if(groupInvite.status == "accepted") {
          button = null;
        } else if (groupInvite.status == "sent") {
          button = (<span style={{cursor: 'pointer'}}>
            Sent
          </span>);
        }
      }
    });
    return button;
  }

  renderInviteButton(user) {
    if(this.state.invites == null || this.state.invites == undefined || this.state.invites.length == 0) {
      return (
        <span style={{cursor: 'pointer'}} onClick={() => {this.invite(user)}}>
          + Invite
        </span>
      );
    }
    let button = (<span style={{cursor: 'pointer'}} onClick={() => {this.invite(user)}}>
      + Invite
    </span>);
    Object.keys(this.state.invites).map(key => {
      let invite = this.state.invites[key];
      invite.key = key;
      if(invite.userId == user.id || invite.otherUserId == user.id) {
        if(invite.status == "accepted") {
          button = null;
        } else if (invite.status == "sent") {
          if(invite.userId == user.id) {
            button = (<span style={{cursor: 'pointer'}} onClick={() => {this.accept(invite)}}>
              Accept
            </span>);
          } else if (invite.otherUserId == user.id) {
            button = (<span style={{cursor: 'pointer'}}>
              Sent
            </span>);
          }
        }
      }
    });
    return button;
  }

  renderGroupPopup() {
    if(this.state.groups == null || this.state.groups == undefined) {
      return (
        <span className = "ant-btn" style={{width: 120, borderRadius: 5, color: '#FFFFFF', borderColor: '#2d2e37', backgroundColor: '#2d2e37', display: 'flex', alignItems: 'center'}}>
          <span style={{marginRight: 10}}>
            GROUP
          </span>
          <Icon
              size="1x"
              className="icon-14px"
              name="drop-down"
          />
        </span>
      );
    }
    return(
      <Popup
        on={'hover'}
        position={['bottom left']}
        offsetX={-120}
        offsetY={-120}
        closeOnDocumentClick
        mouseLeaveDelay={100}
        mouseEnterDelay={0}
        contentStyle={{ height: 200, width: 120, padding: '10px', border: 'none', backgroundColor: "#2d2e37", borderRadius: 3}}
        arrow={false}
        trigger={
          <span className = "ant-btn" style={{width: 120, borderRadius: 5, color: '#FFFFFF', borderColor: '#2d2e37', backgroundColor: '#2d2e37', display: 'flex', alignItems: 'center'}}>
            <span style={{marginRight: 10}}>
              GROUP
            </span>
            <Icon
                size="1x"
                className="icon-14px"
                name="drop-down"
            />
          </span>}
        position="right center">
        <div>
          {this.renderGroups()}
        </div>
      </Popup>
    );
  }

  renderGroups() {
    let groupViews = [];
    if(this.state.groups == null || this.state.groups == undefined) {
      return null;
    }
    Object.keys(this.state.groups).map(key => {
      let group = this.state.groups[key];
      group.key = key;
      groupViews.push(
        <div key={key} style={{cursor: 'pointer', marginVertical: 3}} onClick={() => {this.setState({selectedGroup : group, groupEditName: group.name, groupEditDescription: group.description})}}>
          {group.name}
        </div>
      );
    });
    return groupViews;
  }

  hasContacts() {
    if(this.state.user == null || this.state.user == undefined || this.state.users == null || this.state.users == undefined || this.state.users.length == 0) {
      return false;
    }
    return true;
  }

  renderContactsPopup() {
    if(this.state.user == null || this.state.user == undefined || this.state.users == null || this.state.users == undefined || this.state.users.length == 0) {
      return (
        <span className = "ant-btn" style={{width: 120, borderRadius: 5, color: '#FFFFFF', borderColor: '#2d2e37', backgroundColor: '#2d2e37', display: 'flex', alignItems: 'center'}}>
          <span style={{marginRight: 10}}>
            Contact
          </span>
          <Icon
              size="1x"
              className="icon-14px"
              name="drop-down"
          />
        </span>
      );
    }

    let contactsCount = 0;
    Object.keys(this.state.users).map(key => {
      let user = this.state.users[key];
      user.id = key;
      if(user.id !== this.state.user.id && this.isContact(user)) {
        contactsCount ++;
      }
    });
    if(contactsCount == 0) {
      return (
        <span className = "ant-btn" style={{width: 120, borderRadius: 5, color: '#FFFFFF', borderColor: '#2d2e37', backgroundColor: '#2d2e37', display: 'flex', alignItems: 'center'}}>
          <span style={{marginRight: 10}}>
            Contact
          </span>
          <Icon
              size="1x"
              className="icon-14px"
              name="drop-down"
          />
        </span>
      );
    }
    return(
      <Popup
        on={'hover'}
        position={['bottom left']}
        offsetX={-120}
        offsetY={-120}
        closeOnDocumentClick
        mouseLeaveDelay={100}
        mouseEnterDelay={0}
        contentStyle={{ width: 120, padding: '10px', border: 'none', backgroundColor: "#2d2e37", borderRadius: 3, height: 200}}
        arrow={false}
        trigger={
          <span className = "ant-btn" style={{width: 120, borderRadius: 5, color: '#FFFFFF', borderColor: '#2d2e37', backgroundColor: '#2d2e37', display: 'flex', alignItems: 'center'}}>
            <span style={{marginRight: 10}}>
              Contact
            </span>
            <Icon
                size="1x"
                className="icon-14px"
                name="drop-down"
            />
          </span>}
        position="right center">
        <div>
          {this.renderContacts()}
        </div>
      </Popup>
    );
  }

  renderContacts() {
    if(this.state.user == null || this.state.user == undefined || this.state.users == null || this.state.users == undefined || this.state.users.length == 0) {
      return null;
    }
    let userViews = [];
    let defaultAvatar = require("assets/icons/default-avatar.png");
    Object.keys(this.state.users).map(key => {
      let user = this.state.users[key];
      user.id = key;
      if(user.id !== this.state.user.id && this.isContact(user)) {
        userViews.push(
          <div style={{marginBottom:"20px", cursor: "pointer"}} key={key}>
            <div style={{marginBottom:"5px", display: 'flex'}}>
              <img
                src={user.userImage == null || user.userImage == undefined || user.userImage == '' ? defaultAvatar : user.userImage}
                style={{borderRadius:"50%", border: "none", width: "20px", height: "20px", backgroundColor: "#777777", marginRight:"3px"}}
              />
              <span style={{color: "#777777",  marginRight:"20px", flex: 1, display: 'flex', alignItems: 'center'}}>
                {user.id}
              </span>
            </div>
          </div>
        );
      }
    });
    return userViews;
  }

  renderInvitesToGroup() {
    if(this.state.user == null || this.state.user == undefined || this.state.users == null || this.state.users == undefined || this.state.users.length == 0) {
      return;
    }
    let userViews = [];
    let defaultAvatar = require("assets/icons/default-avatar.png");
    Object.keys(this.state.users).map(key => {
      let user = this.state.users[key];
      user.id = key;
      if(user.id !== this.state.user.id) {
        userViews.push(
          <div style={{marginBottom:"20px"}} key={key}>
            <div style={{marginBottom:"5px", display: 'flex'}}>
              <img
                src={user.userImage == null || user.userImage == undefined || user.userImage == '' ? defaultAvatar : user.userImage}
                style={{borderRadius:"50%", border: "none", width: "30px", height: "30px", backgroundColor: "#777777", marginRight:"3px"}}
              />
              <span style={{color: "#777777",  marginRight:"20px", flex: 1, display: 'flex', alignItems: 'center'}}>
                {user.id}
              </span>
              {this.renderGroupInviteButton(user)}
            </div>
          </div>
        );
      }
    });
    return userViews;
  }

  renderInvites() {
    if(this.state.user == null || this.state.user == undefined || this.state.users == null || this.state.users == undefined || this.state.users.length == 0) {
      return;
    }
    let userViews = [];
    let defaultAvatar = require("assets/icons/default-avatar.png");
    Object.keys(this.state.users).map(key => {
      let user = this.state.users[key];
      user.id = key;
      if(user.id !== this.state.user.id) {
        userViews.push(
          <div style={{marginBottom:"20px"}} key={key}>
            <div style={{marginBottom:"5px", display: 'flex'}}>
              <img
                src={user.userImage == null || user.userImage == undefined || user.userImage == '' ? defaultAvatar : user.userImage}
                style={{borderRadius:"50%", border: "none", width: "30px", height: "30px", backgroundColor: "#777777", marginRight:"3px"}}
              />
              <span style={{color: "#777777",  marginRight:"20px", flex: 1, display: 'flex', alignItems: 'center'}}>
                {user.id}
              </span>
              {this.renderInviteButton(user)}
            </div>
          </div>
        );
      }
    });
    return userViews;
  }

  getContactCount() {
    if(this.state.invites == null || this.state.invites == undefined || this.state.invites.length == 0) {
      return 0;
    }
    let count = 0;
    Object.keys(this.state.invites).map(key => {
      let invite = this.state.invites[key];
      if(invite.status == "accepted") {
        count ++;
      }
    });
    return count;
  }

  toggleGroup(group) {
    if(this.state.selectedGroups == null || this.state.selectedGroups == undefined || this.state.selectedGroups.length == 0) {
      let groups = [];
      groups.push(group);
      this.setState({selectedGroups: groups});
      return;
    }

    let groups = this.state.selectedGroups;

    for (var i = 0; i < this.state.selectedGroups.length; i++) {
      let item = this.state.selectedGroups[i];
      if(group.key == item.key) {
        groups.splice(i, 1);
        this.setState({selectedGroups: groups});
        return;
      }
    }
    groups.push(group);
    this.setState({selectedGroups: groups});
  }

  toggleContact(user) {
    if(this.state.selectedContacts == null || this.state.selectedContacts == undefined || this.state.selectedContacts.length == 0) {
      let users = [];
      users.push(user);
      this.setState({selectedContacts: users});
      return;
    }

    let contacts = this.state.selectedContacts;
    for (var i = 0; i < this.state.selectedContacts.length; i++) {
      let contact = this.state.selectedContacts[i];
      if(contact.id == user.id) {
        contacts.splice(i, 1);
        this.setState({selectedContacts: contacts});
        return;
      }
    }
    contacts.push(user);
    this.setState({selectedContacts: contacts});
  }

  renderRemovalGroups() {
    if(this.state.user == null || this.state.user == undefined || this.state.groups == null || this.state.groups == undefined || this.state.groups.length == 0) {
      return;
    }
    let groupViews = [];
    let defaultAvatar = require("assets/icons/default-avatar.png");
    Object.keys(this.state.groups).map(key => {
      let group = this.state.groups[key];
      group.key = key;
      groupViews.push(
        <div style={{marginBottom:"20px"}} key={key}>
          <div style={{marginBottom:"5px", display: 'flex'}}>
            <span style={{color: "#777777",  flex: 1, display: 'flex', alignItems: 'center', fontSize: 15}}>
              {group.name}
            </span>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <input type="checkbox" id={key} onChange={() => {this.toggleGroup(group)}}/>
              <label htmlFor="checkbox"></label>
            </div>
          </div>
        </div>
      );
    });
    return groupViews;
  }

  renderRemovalContacts() {
    if(this.state.user == null || this.state.user == undefined || this.state.users == null || this.state.users == undefined || this.state.users.length == 0) {
      return;
    }
    let userViews = [];
    let defaultAvatar = require("assets/icons/default-avatar.png");
    Object.keys(this.state.users).map(key => {
      let user = this.state.users[key];
      user.id = key;
      if(user.id !== this.state.user.id && this.isContact(user)) {
        userViews.push(
          <div style={{marginBottom:"20px"}} key={key}>
            <div style={{marginBottom:"5px", display: 'flex'}}>
              <img
                src={user.userImage == null || user.userImage == undefined || user.userImage == '' ? defaultAvatar : user.userImage}
                style={{borderRadius:"50%", border: "none", width: "40px", height: "40px", backgroundColor: "#777777", marginRight:"3px"}}
              />
              <span style={{color: "#777777",  flex: 1, display: 'flex', alignItems: 'center', fontSize: 15}}>
                {user.id}
              </span>
              <div style={{display: 'flex', alignItems: 'center'}}>
                <input type="checkbox" id={key} onChange={() => {this.toggleContact(user)}}/>
                <label htmlFor="checkbox"></label>
              </div>
            </div>
          </div>
        );
      }
    });
    return userViews;
  }

  closeCreateGroupModal() {
    this.setState({isShowCreateGroupModal: false});
  }

  saveGroupInfo() {
    if(this.state.user == null || this.state.user == undefined || this.state.selectedGroup == null || this.state.selectedGroup == undefined) {
      return;
    }
    let groupName = this.refs.groupEditName.value;
    let groupDescription = this.refs.groupEditDescription.value;
    if(groupName == "" || groupDescription == "") {
      return;
    }
    let group = {
      userId: this.state.user.id,
      user: this.state.user,
      name: groupName,
      description: groupDescription
    };
    database.ref('groups/' + this.state.user.id + '/' + this.state.selectedGroup.key).set(group).then((snapshot) => {
    }).catch(() => {
    });
    this.setState({selectedGroup: null});
  }

  createGroup() {
    if(this.state.user == null || this.state.user == undefined) {
      return;
    }
    let groupName = this.refs.groupName.value;
    let groupDescription = this.refs.groupDescription.value;
    if(groupName == "" || groupDescription == "") {
      return;
    }
    let group = {
      userId: this.state.user.id,
      user: this.state.user,
      name: groupName,
      description: groupDescription
    };
    database.ref('groups/' + this.state.user.id).push(group).then((snapshot) => {
    }).catch(() => {
    });
    this.closeCreateGroupModal();
  }

  onGroupNameChange = (e) => {
    this.setState({ groupEditName: e.target.value });
  }

  onGroupDescriptionChange = (e) => {
    this.setState({ groupEditDescription: e.target.value });
  }

  openInviteToGroupModal(group) {
    this.setState({selectedGroupForInvite: group});
  }

  closeInviteToGroupModal() {
    this.setState({selectedGroupForInvite: null});
  }

  renderGroupInfo() {
    if(this.state.selectedGroup == null || this.state.selectedGroup == undefined) {
      return;
    }
    let groupMembers = {};
    if(this.state.groupInvites !== null && this.state.groupInvites !== undefined) {
      Object.values(this.state.groupInvites).map(invite => {
        if(this.state.selectedGroup.key == invite.key && invite.status == 'accepted') {
          groupMembers[invite.userId] = true;
        }
      });
    }
    let userViews = [];
    let defaultAvatar = require("assets/icons/default-avatar.png");
    Object.keys(this.state.users).map(key => {
      let user = this.state.users[key];
      user.id = key;
      if(groupMembers[key] === true) {
        userViews.push(
          <div style={{marginBottom:"20px"}} key={key}>
            <div style={{marginBottom:"5px", display: 'flex'}}>
              <img
                src={user.userImage == null || user.userImage == undefined || user.userImage == '' ? defaultAvatar : user.userImage}
                style={{borderRadius:"50%", border: "none", width: "40px", height: "40px", backgroundColor: "#777777", marginRight:"3px"}}
              />
              <span style={{color: "#777777",  flex: 1, display: 'flex', alignItems: 'center', fontSize: 15}}>
                {user.id}
              </span>
            </div>
          </div>
        );
      }
    });
    return(
      <Modal
          closable={true}
          footer={[
              <Button
                  key="submit"
                  type="primary"
                  onClick={() => {this.saveGroupInfo();}}>
                  SAVE
              </Button>,
              <Button
                  key="cancel"
                  style={{marginLeft: "8px"}}
                  onClick={() => {this.closeGroupDetailModal();}}
              >
                  CANCEL
              </Button>
          ]}
          visible={this.state.selectedGroup !== null && this.state.selectedGroup !== undefined}
          onCancel={this.closeGroupDetailModal}
      >
        <h2>
          Group Info
        </h2>
        <input onChange={this.onGroupNameChange} placeholder="Enter Group Name" ref="groupEditName" type="text" style={{backgroundColor: "#2d2e37", height: 30}} value={this.state.groupEditName}/>
        <input onChange={this.onGroupDescriptionChange} placeholder="Enter Group Description" ref="groupEditDescription" type="text" style={{marginTop: 30, backgroundColor: "#2d2e37", height: 30}} value={this.state.groupEditDescription}/>
        <Button
            key="cancel"
            style={{marginTop: 30, marginBottom: 20}}
            onClick={() => {this.openInviteToGroupModal(this.state.selectedGroup); this.closeGroupDetailModal()}}
        >
            +  Invite
        </Button>
        {userViews}
      </Modal>
    );
  }

  closeGroupDetailModal() {
    this.setState({selectedGroup: null});
  }

  renderCreateGroupModal() {
    if(!this.state.isShowCreateGroupModal) {
      return null;
    }
    return(
      <Modal
          closable={true}
          footer={[
              <Button
                  key="submit"
                  type="primary"
                  onClick={() => {this.createGroup();}}>
                  CREATE
              </Button>,
              <Button
                  key="cancel"
                  style={{marginLeft: "8px"}}
                  onClick={() => {this.closeCreateGroupModal();}}
              >
                  CANCEL
              </Button>
          ]}
          visible={this.state.isShowCreateGroupModal}
          onCancel={this.closeCreateGroupModal}
      >
        <h2>
          Create Group
        </h2>
        <input placeholder="Enter Group Name" ref="groupName" type="text" style={{backgroundColor: "#2d2e37", height: 30}}/>
        <input placeholder="Enter Group Description" ref="groupDescription" type="text" style={{marginTop: 30, backgroundColor: "#2d2e37", height: 30}}/>
      </Modal>
    );
  }

  renderRemoveGroupModal() {
    if(this.state.isShowRemoveGroupModal == false) {
      return null;
    }
    return(
      <Modal
          closable={true}
          footer={[
              <Button
                  disabled={this.state.selectedGroups == null || this.state.selectedGroups == undefined || this.state.selectedGroups.length == 0}
                  key="submit"
                  type="primary"
                  onClick={() => {this.closeRemoveGroupsModal();}}>
                  DELETE
              </Button>,
              <Button
                  key="cancel"
                  style={{marginLeft: "8px"}}
                  onClick={() => {this.closeRemoveGroupsModal();}}
              >
                  CANCEL
              </Button>
          ]}
          visible={this.state.isShowRemoveGroupModal}
          onCancel={this.closeRemoveGroupsModal}
      >
        <h2>
          Groups
        </h2>
        {this.renderRemovalGroups()}
      </Modal>
    );
  }

  removeContacts() {
    if(this.state.selectedContacts == null || this.state.selectedContacts == undefined || this.state.selectedContacts.length == 0) {
      return;
    }
    console.log(this.state.selectedContacts);
    this.closeRemoveContactsModal();
  }

  renderRemoveContactModal() {
    if(this.state.isShowRemoveContactModal == false) {
      return null;
    }
    return(
      <Modal
          closable={true}
          footer={[
              <Button
                  disabled={this.state.selectedContacts == null || this.state.selectedContacts == undefined || this.state.selectedContacts.length == 0}
                  key="submit"
                  type="primary"
                  onClick={() => {this.removeContacts()}}>
                  DELETE
              </Button>,
              <Button
                  key="cancel"
                  style={{marginLeft: "8px"}}
                  onClick={() => {this.closeRemoveContactsModal();}}
              >
                  CANCEL
              </Button>
          ]}
          visible={this.state.isShowRemoveContactModal}
          onCancel={this.closeRemoveContactsModal}
      >
        <h2>
          Contacts
        </h2>
        {this.renderRemovalContacts()}
      </Modal>
    );
  }

  renderInviteModal() {
    if(this.state.isShowInviteModal == false) {
      return null;
    }
    return(
      <Modal
          closable={true}
          footer={null}
          visible={this.state.isShowInviteModal}
          onCancel={this.closeInviteModal}
      >
        <h2>
          Invites
        </h2>
        {this.renderInvites()}
      </Modal>
    );
  }

  renderInviteToGroup() {
    if(this.state.selectedGroupForInvite == null || this.state.selectedGroupForInvite == undefined) {
      return null;
    }
    return(
      <Modal
          closable={true}
          footer={null}
          visible={this.state.selectedGroupForInvite != null && this.state.selectedGroupForInvite != undefined}
          onCancel={this.closeInviteToGroupModal}
      >
        <h2>
          Invites
        </h2>
        {this.renderInvitesToGroup()}
      </Modal>
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
      <div style={{width: "100%", height: '100%', display: 'flex', flexDirection: 'column', paddingBottom: 38}}>
        <div style={{display: 'flex', flexDirection: 'row', flex: 0.25, borderBottomColor: '#2d2e37', borderStyle: 'solid', borderLeftWidth: 0, borderTopWidth: 0, borderBottomWidth: 1, borderRightWidth: 0}}>
          <div style={{flex: 0.3, padding: 15}}>
            <img
              className="hover-icon"
              src={this.state.user == null || this.state.user.userImage == null || this.state.user.userImage == undefined || this.state.user.userImage == '' ? defaultAvatar : this.state.user.userImage}
              style={{borderRadius:"50%", border: "none", width: "90px", height: "90px", backgroundColor: "#777777", marginRight:"3px"}}
            />
            <FileUploader
              accept="image/*"
              name="avatar"
              storageRef={storage.ref("images")}
              onUploadStart={this.handleUploadStart}
              onUploadError={this.handleUploadError}
              onUploadSuccess={this.handleUploadSuccess}
              onProgress={this.handleProgress}
              style={{width: '100%', marginTop: 5, visibility: this.state.isEditStatus ? 'visible' : 'hidden'}}
            />
            <div style={{marginTop: 15}}>
              Name
            </div>
            <div style={{marginTop: 15}}>
              <input placeholder="Enter User Name" ref="userName" type="text" style={{backgroundColor: "#2d2e37", height: 30, display: this.state.isEditStatus?  "block": "none"}}/>
              {!this.state.isEditStatus && (
                <div style={{height: 30, padding: "0.5rem"}}>
                  {this.state.user === null || this.state.user.userName === null ? "" : this.state.user.userName}
                </div>
              )}
            </div>
          </div>
          <div style={{flex: 0.4, position: 'relative', padding: 15}}>
            <div style={{position: 'absolute', bottom: 74, marginRight: 10}}>
              {!this.state.isEditStatus && (
                <div>
                  {this.state.user == null || this.state.user.description == null ? "" : this.state.user.description}
                </div>
              )}
              <textarea
                placeholder="Enter Description"
                ref="description"
                style={{resize: "none", width: '100%', height: 120, backgroundColor: '#2d2e37', marginTop: 20, display: this.state.isEditStatus?  "block": "none"}}>
              </textarea>
            </div>
          </div>
          <div style={{flex: 0.3, padding: 15}}>
            <img
              src={this.state.user == null || this.state.user.avatarImage == null || this.state.user.avatarImage == undefined || this.state.user.avatarImage == '' ? defaultAvatar : this.state.user.avatarImage}
              style={{borderRadius:"50%", border: "none", width: "90px", height: "90px", backgroundColor: "#777777", marginRight:"3px"}}
            />
            <FileUploader
              accept="image/*"
              name="avatar"
              randomizeFilename
              storageRef={storage.ref("images")}
              onUploadStart={this.handleUploadStartAvatar}
              onUploadError={this.handleUploadErrorAvatar}
              onUploadSuccess={this.handleUploadSuccessAvatar}
              onProgress={this.handleProgressAvatar}
              style={{width: '100%', marginTop: 5, visibility: this.state.isEditStatus ? 'visible' : 'hidden'}}
            />
            <div style={{marginTop: 15}}>
              Avatar Name
            </div>
            <div style={{marginTop: 15}}>
              <input placeholder="Enter Avatar Name" ref="avatarName" type="text" style={{backgroundColor: "#2d2e37", height: 30, display: this.state.isEditStatus?  "block": "none"}}/>
              {!this.state.isEditStatus && (
                <div style={{height: 30, padding: "0.5rem"}}>
                  {this.state.user === null || this.state.user.avatarName === null ? "" : this.state.user.avatarName}
                </div>
              )}
            </div>
          </div>
          {this.renderEditStatusIcon()}
        </div>
        <div style={{display: 'flex', flexDirection: 'row', flex: 0.25, justifyContent: 'center', alignItems: 'center', borderBottomColor: '#2d2e37', borderStyle: 'solid', borderLeftWidth: 0, borderTopWidth: 0, borderBottomWidth: 1, borderRightWidth: 0 }}>
          <div style={{flex: 0.3, textAlign: 'center'}}>
            <div>
              {this.state.followers.user}
            </div>
            <div style={{marginTop: 15}}>
              {this.getFollowings().user}
            </div>
            <div style={{marginTop: 15}}>
              {this.state.likes.user}
            </div>
          </div>
          <div style={{flex: 0.4, textAlign: 'center'}}>
            <div>
              Follower
            </div>
            <div style={{marginTop: 15}}>
              Following
            </div>
            <div style={{marginTop: 15}}>
              Likes
            </div>
          </div>
          <div style={{flex: 0.3, textAlign: 'center'}}>
            <div>
              {this.state.followers.avatar}
            </div>
            <div style={{marginTop: 15}}>
              {this.getFollowings().avatar}
            </div>
            <div style={{marginTop: 15}}>
              {this.state.likes.avatar}
            </div>
          </div>
        </div>
        <div style={{display: 'flex', flexDirection: 'row', flex: 0.5}}>
          <div style={{padding: 15, flex: 0.5, display: 'flex', flexDirection: 'row', margin: 5, borderRightColor: '#2d2e37', borderStyle: 'solid', borderLeftWidth: 0, borderTopWidth: 0, borderBottomWidth: 0, borderRightWidth: 1 }}>
            <div style={{flex: 1}}>
              <div style={{justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'row'}}>
                <div style={{flex: 1}}>
                  {this.renderContactsPopup()}
                </div>

                <span
                  style={{cursor: 'pointer'}}
                  onClick={() => {this.setState({isShowRemoveContactModal: true, selectedContacts: []})}}>
                  <Icon
                      className="icon-1_5x"
                      name="trash"
                      title="Remove"
                  />
                </span>
              </div>
              <div style={{marginTop: 10}}>
                {this.getContactCount()}
              </div>
              <div className = "ant-btn" style={{textAlign: 'center', width: 120, marginTop: 10, borderRadius: 5, color: '#FFFFFF', borderColor: '#2d2e37', backgroundColor: '#2d2e37', display: 'flex', alignItems: 'center'}} onClick={() => {this.openInviteModal()}}>
                invite
              </div>
            </div>
          </div>
          <div style={{padding: 15, flex: 0.5, display: 'flex', flexDirection: 'row', margin: 5}}>
            <div style={{flex: 1}}>
              <div style={{justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'row'}}>
                <div style={{flex: 1}}>
                  {this.renderGroupPopup()}
                </div>
                <span
                  style={{cursor: 'pointer'}}
                  onClick={() => {this.setState({isShowRemoveGroupModal: true, selectedGroups: []})}}>
                  <Icon
                      className="icon-1_5x"
                      name="trash"
                      title="Remove"
                  />
                </span>
              </div>
              <div style={{marginTop: 10}}>
                {this.state.groups != null && this.state.groups != undefined ? Object.keys(this.state.groups).length : 0}
              </div>
              <div className = "ant-btn" style={{textAlign: 'center', width: 120, marginTop: 10, borderRadius: 5, color: '#FFFFFF', borderColor: '#2d2e37', backgroundColor: '#2d2e37', display: 'flex', alignItems: 'center'}} onClick={() => {this.setState({isShowCreateGroupModal: true})}}>
                create
              </div>
            </div>
          </div>
        </div>
        {this.renderInviteModal()}
        {this.renderRemoveContactModal()}
        {this.renderRemoveGroupModal()}
        {this.renderCreateGroupModal()}
        {this.renderGroupInfo()}
        {this.renderInviteToGroup()}
      </div>
    );
  }
}
export default Profile;
