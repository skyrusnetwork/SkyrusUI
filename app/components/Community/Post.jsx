import React from "react";
import Ps from "perfect-scrollbar";
import colors from "assets/colors";
import Icon from "../Icon/Icon";
import fire from "../firebase";
import FileUploader from "react-firebase-file-uploader";
import {Select, Row, Col, Button, Modal} from "bitshares-ui-style-guide";
import counterpart from "counterpart";
import {Notification} from "bitshares-ui-style-guide";
const database = fire.database();
const storage = fire.storage();
const generateRandomFilename = (): string => generateRandomID();
import generateRandomID from 'uuid/v4';

import Popup from "reactjs-popup";

class Post extends React.Component {

  uploadTasks: Array<Object> = [];

  constructor() {
    super();
    this.state = {
      user: null,
      text: "",
      videoFile: null,
      videoPreviewUrl: null,
      imageFile: null,
      imagePreviewUrl: null,
      audioFile: null,
      audioPreviewUrl: null,
      postText: "",
      users: [],
      invites: [],
      groups: {},
      groupInvites: null,

      selectedGroups: [],
      selectedGroup: null,
      groupEditName: '',
      groupEditDescription: '',
      selectedGroupForInvite: null
    };
    this.post = this.post.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handlePostChange = this.handlePostChange.bind(this);
    this.hideModal = this.hideModal.bind(this);
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
          this.getFollowers(this.props.user);
          this.getInvites(this.props.user);
          this.getGroups(this.props.user);
        });
      }
    }
  }

  componentDidUpdate() {
    this.currentAccount = this.props.currentAccount;
    if(this.props.user !== null && this.props.user !== undefined) {
      if(this.state.user == null || this.state.user == undefined || JSON.stringify(this.state.user) !== JSON.stringify(this.props.user)) {
        this.setState({user: this.props.user},
        function() {
          this.getFollowers(this.props.user);
          this.getInvites(this.props.user);
          this.getGroups(this.props.user);
        });
      }
    }
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

  getGroupInvites(user) {
    const invitesRef = database.ref('group-invites');
    invitesRef.on('value', snapshot => {
      const groupInvites = snapshot.val();
      this.setState({groupInvites: groupInvites});
    });
  }

  getInvites(user) {
    const invitesRef = database.ref('invites/' + user.id);
    invitesRef.on('value', snapshot => {
      const invites = snapshot.val();
      this.setState({invites: invites});
    });
  }

  toggleFriend(user) {
    let selectedFlag = user.selected == null || user.selected == 0 ? 0 : 1 ;
    let users = this.state.users;
    selectedFlag = selectedFlag == 1?0:1;
    users[user.id]["selected"] = selectedFlag;
    this.setState({users: users});
  }

  toggleGroup(group) {
    let selectedFlag = group.selected == null || group.selected == 0 ? 1 : 0 ;
    let groups = this.state.groups;
    groups[group.key]["selected"] = selectedFlag;
    this.setState({groups: groups});
  }

  renderContacts() {
    if(this.state.user == null || this.state.user == undefined || this.state.users == null || this.state.users == undefined || this.state.users.length == 0) {
      return null;
    }
    let userViews = [];
    let defaultAvatar = require("assets/icons/default-avatar.png");
    Object.keys(this.state.users).map(key => {
      let user = this.state.users[key];
      if(user == null || user == undefined) {
        return;
      }
      user.id = key;
      if(user.id !== this.state.user.id && this.isContact(user)) {
        userViews.push(
          <div style={{marginBottom:"10px", cursor: "pointer"}} key={key} onClick={() => {this.toggleFriend(user);}}>
            <div style={{display: 'flex'}}>
              <img
                src={user.userImage == null || user.userImage == undefined || user.userImage == '' ? defaultAvatar : user.userImage}
                style={{borderRadius:"50%", border: "none", width: "20px", height: "20px", backgroundColor: "#777777", marginRight:"3px"}}
              />
            <span className="three-dot" style={{color: "#777777"}}>
                {user.id}
              </span>
              <span style={{color: "#999999",  flex: 1, display: 'flex', alignItems: 'center'}}>
                {this.state.users[user.id]["selected"] == 1?'\u{2713}':''}
              </span>
            </div>
          </div>
        );
      }
    });
    return userViews;
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


  renderGroups() {
    let groupViews = [];
    if(this.state.groups == null || this.state.groups == undefined) {
      return null;
    }
    Object.keys(this.state.groups).map(key => {
      let group = this.state.groups[key];
      group.key = key;
      groupViews.push(
        <div key={key} key={key} style={{marginBottom:"10px", cursor: 'pointer', marginVertical: 3}}
        onClick={() => {this.toggleGroup(group)}}>
          <span className="three-dot" style={{overflow: 'hidden', color: "#777777",  marginRight:"20px"}}>
            {group.name}
          </span>
          <span style={{color: "#999999"}}>
            {group.selected == 1?'\u{2713}':''}
          </span>
        </div>
      );
    });
    return groupViews;
  }

  hideModal() {
    this.setState({videoFile: null, videoPreviewUrl: null, imageFile: null, imagePreviewUrl: null, audioFile: null, audioPreviewUrl: null});
  }

  _getThemeColors() {
      return colors.midnightTheme;
  }

  handleChange(event) {
    this.setState({text: event.target.value});
  }

  handlePostChange(event) {
    this.setState({postText: event.target.value});
  }

  bCanPost() {
    return (this.state.text !== "" && this.state.videoPreviewUrl == null && this.state.imagePreviewUrl == null && this.state.audioPreviewUrl == null) || (this.state.videoPreviewUrl !== null || this.state.audioPreviewUrl !== null || this.state.imagePreviewUrl !== null);
  }

  handleUploadStart = () => this.setState({ isUploading: true, progress: 0 });

  handleProgress = progress => this.setState({ progress });

  handleUploadError = error => {
    this.setState({ isUploading: false });
    this.hideModal();
  };

  handleUploadSuccess = filename => {
    let _this = this;
    storage
      .ref("posts")
      .child(filename)
      .getDownloadURL()
      .then(url => _this.postFile(url));
  };

  postFile(url) {
    if(this.bCanPost()) {
      let type;
      if(this.state.videoFile !== null) {
        type = "video";
      } else if(this.state.imageFile !== null) {
        type = "image";
      } else if(this.state.audioFile !== null) {
        type = "audio";
      } else {
        return;
      }
      let post = {
        date: Date.now(),
        userId: this.state.user.id,
        user: this.state.user,
        text: this.state.postText,
        url: url,
        type: type
      };
      this.hideModal();
      database.ref('posts').push(post).then(() => {
        Notification.success({
            message: "Post is posted successfully."
        });
        this.setState({text: ""});
      }).catch(() => {
        Notification.error({
            message: "Something went wrong."
        });
        this.setState({text: ""});
      });
    }
  }

  removeTask(task: Object) {
    for (let i = 0; i < this.uploadTasks.length; i++) {
      if (this.uploadTasks[i] === task) {
        this.uploadTasks.splice(i, 1);
        return;
      }
    }
  }

  post() {
    if(this.bCanPost()) {
      let users = this.state.users;
      let selectedUsers = [];

      Object.keys(users).map(key => {
        let user = users[key];
        user.key = key;
        if(user.selected == 1) {
          selectedUsers.push(user.id);
        }
      });

      let groups = this.state.groups;
      let selectedGroups = [];

      Object.keys(groups).map(key => {
        let group = groups[key];
        if(group.selected == 1) {
          selectedGroups.push(group.key);
        }
      });

      let post = {
        date: Date.now(),
        userId: this.state.user.id,
        user: this.state.user,
        text: this.state.text,
        type: "text",
        friends: selectedUsers,
        groups: selectedGroups
      };

      database.ref('posts').push(post).then(() => {
        Notification.success({
            message: "Post is posted successfully."
        });
        this.setState({text: ""});
      }).catch(() => {
        Notification.error({
            message: "Something went wrong."
        });
        this.setState({text: ""});
      });
    }
  }

  uploadFile() {
    let file;
    if(this.state.videoFile !== null) {
      file = this.state.videoFile;
    } else if(this.state.imageFile !== null) {
      file = this.state.imageFile;
    } else if(this.state.audioFile !== null) {
      file = this.state.audioFile;
    } else {
      return;
    }
    let filenameToUse = generateRandomFilename();
    if (!this.extractExtension(filenameToUse)) {
      filenameToUse += this.extractExtension(file.name);
    }
    const task = storage.ref("posts").child(filenameToUse).put(file);

    if (this.handleUploadStart) {
      this.handleUploadStart(file, task);
    }

    task.on(
      'state_changed',
      snapshot =>
        this.handleProgress &&
        this.handleProgress(
          Math.round(100 * snapshot.bytesTransferred / snapshot.totalBytes),
          task
        ),
      error => this.handleUploadError && this.handleUploadError(error, task),
      () => {
        this.removeTask(task);
        return (
          this.handleUploadSuccess &&
          this.handleUploadSuccess(task.snapshot.metadata.name, task)
        );
      }
    );
    this.uploadTasks.push(task);
  }

  cancelRunningUploads() {
    while (this.uploadTasks.length > 0) {
      const task = this.uploadTasks.pop();
      if (task.snapshot.state === 'running') {
        task.cancel();
      }
    }
  }

  extractExtension(filename: string): string {
    return /(?:\.([^.]+))?$/.exec(filename)[0];
  }

  onChangeVideoFile(event) {
    event.stopPropagation();
    event.preventDefault();
    var file = event.target.files[0];
    let reader = new FileReader();
    reader.onloadend = () => {
      this.setState({
        postText: "",
        videoFile: file,
        videoPreviewUrl: reader.result
      });
    }

    reader.readAsDataURL(file);
  }

  onChangeImageFile(event) {
    event.stopPropagation();
    event.preventDefault();
    var file = event.target.files[0];
    let reader = new FileReader();
    reader.onloadend = () => {
      this.setState({
        postText: "",
        imageFile: file,
        imagePreviewUrl: reader.result
      });
    }

    reader.readAsDataURL(file)
  }

  onChangeAudioFile(event) {
    event.stopPropagation();
    event.preventDefault();
    var file = event.target.files[0];
    let reader = new FileReader();
    reader.onloadend = () => {
      this.setState({
        postText: "",
        audioFile: file,
        audioPreviewUrl: reader.result
      });
    }

    reader.readAsDataURL(file);
  }

  renderPostPreview() {
    if(this.state.imagePreviewUrl !== null) {
      return(
        <div>
          <h2>
            {counterpart.translate("community.postPreview")}
          </h2>
          <img src={this.state.imagePreviewUrl} style={{width: 250}} />
          <textarea
            value={this.state.postText}
            onChange={this.handlePostChange}
            style={{resize: "none", width: '100%', height: 40, backgroundColor: '#2d2e37', marginTop: 20}}>
          </textarea>
        </div>
      );
    } else if (this.state.videoPreviewUrl !== null) {
      return(
        <div>
          <h2>
            {counterpart.translate("community.postPreview")}
          </h2>
          <video width="400" controls>
            <source src={this.state.videoPreviewUrl}/>
          </video>
          <textarea
            value={this.state.postText}
            onChange={this.handlePostChange}
            style={{resize: "none", width: '100%', height: 40, backgroundColor: '#2d2e37', marginTop: 20}}>
          </textarea>
        </div>
      );
    } else if (this.state.audioPreviewUrl !== null) {
      return(
        <div>
          <h2>
            {counterpart.translate("community.postPreview")}
          </h2>
          <audio width="400" controls>
            <source src={this.state.audioPreviewUrl}/>
          </audio>
          <textarea
            value={this.state.postText}
            onChange={this.handlePostChange}
            style={{resize: "none", width: '100%', height: 40, backgroundColor: '#2d2e37', marginTop: 20}}>
          </textarea>
        </div>
      );
    } else {
      return null;
    }
  }

  renderImage() {
    let defaultAvatar = require("assets/icons/default-avatar.png");
    if(this.state.user == null) {
      return;
    }
    if(this.state.user.currentAccount == null && this.state.user.currentAccount == undefined || this.state.user.currentAccount == "" || this.state.user.currentAccount == "user") {
      return(
        <div style={{textAlign: 'center', margin: 3}}>
          <img
            className="hover-icon"
            src={this.state.user == null || this.state.user.userImage == null || this.state.user.userImage == undefined || this.state.user.userImage == '' ? defaultAvatar : this.state.user.userImage}
            style={{borderRadius:"50%", border: "none", width: "50px", height: "50px", backgroundColor: "#777777", marginRight:"3px"}}
          />
          <div style={{marginTop: 15}}>
            {counterpart.translate("community.name")}
          </div>
          <div style={{marginTop: 15}}>
            {this.state.user === null || this.state.user.userName === null ? "" : this.state.user.userName}
          </div>
        </div>
      );
    } else {
      return(
        <div style={{textAlign: 'center', margin: 3}}>
          <img
            className="hover-icon"
            src={this.state.user == null || this.state.user.avatarImage == null || this.state.user.avatarImage == undefined || this.state.user.avatarImage == '' ? defaultAvatar : this.state.user.avatarImage}
            style={{borderRadius:"50%", border: "none", width: "50px", height: "50px", backgroundColor: "#777777", marginRight:"3px"}}
          />
          <div style={{marginTop: 15}}>
            {counterpart.translate("community.name")}
          </div>
          <div style={{marginTop: 15}}>
            {this.state.user === null || this.state.user.avatarName === null ? "" : this.state.user.avatarName}
          </div>
        </div>
      );
    }
  }

  getMenuLabel(type){
    if(type == "friend"){
      if(this.state.users != null){
        let users = this.state.users;
        let userNum = 0;
        Object.keys(users).map(key => {
          let user = users[key];
          user.key = key;
          if(user.selected == 1) {
            userNum ++;
          }
        });
        if(userNum == 0){
          return counterpart.translate("community.friend");
        }else{
          return userNum.toString() + " " + counterpart.translate("community.friends");
        }
      }
      else{
        return counterpart.translate("community.friend");
      }
    }
    if(type == "group"){
      if(this.state.groups != null){
        let groups = this.state.groups;
        let groupNum = 0;
        Object.keys(groups).map(key => {
          let group = groups[key];
          if(group.selected == 1) {
            groupNum += 1;
          }
        });
        if(groupNum == 0){
          return counterpart.translate("community.group");
        }else{
          return groupNum.toString() + " " + counterpart.translate("community.groups");
        }
      }
      else{
        return counterpart.translate("community.group");
      }
    }
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
        <div style={{display: 'flex', flexDirection: 'row', margin: 10}}>
          {this.renderImage()}
          <div style={{flex: 1}}>
            <textarea
              value={this.state.text}
              onChange={this.handleChange}
              style={{resize: "none", width: '100%', height: 100, backgroundColor: '#2d2e37'}}
              ref="postText">
            </textarea>
          </div>
        </div>
        <div style={{display: 'flex', flexDirection: 'row', margin: 10, marginTop: 30}}>
          <div style={{flex: 1}}>
            <div style={{marginTop: 7}}>
              <input onChange={this.onChangeVideoFile.bind(this)} accept="video/*" type='file' ref="videoFile" style={{display: 'none'}}/>
              <img style={{width: 20, marginRight: 15, cursor: "pointer"}} src={require("assets/pngs/ic-video.png")} onClick={() => {this.refs.videoFile.click()}}/>
              <input onChange={this.onChangeImageFile.bind(this)} accept="image/*" type='file' ref="imageFile" style={{display: 'none'}}/>
              <img style={{width: 20, marginRight: 15, cursor: "pointer"}} src={require("assets/pngs/ic-camera.png")} onClick={() => {this.refs.imageFile.click()}}/>
              <Popup
                on={'click'}
                position={['bottom left']}
                offsetX={-80}
                offsetY={90}
                closeOnDocumentClick
                mouseLeaveDelay={100}
                mouseEnterDelay={0}
                contentStyle={{ width: 200, border: 'none', backgroundColor: "#2d2e37", borderRadius: 3}}
                arrow={false}
                trigger={
                  <img style={{width: 20, marginRight: 15, cursor: "pointer"}} src={require("assets/pngs/ic-emoticon.png")} />
                }
                position="right center">
                <div className="emoticon-box" style={{padding:10, borderRadius: 3, fontSize:20}}>
                  <div className="emoticon-item" onClick={() => {this.setState({text: this.state.text+"\u{1F600}"})}}>{'\u{1F600}'}</div>
                  <div className="emoticon-item" onClick={() => {this.setState({text: this.state.text+"\u{1F601}"})}}>{'\u{1F601}'}</div>
                  <div className="emoticon-item" onClick={() => {this.setState({text: this.state.text+"\u{1F602}"})}}>{'\u{1F602}'}</div>
                  <div className="emoticon-item" onClick={() => {this.setState({text: this.state.text+"\u{1F603}"})}}>{'\u{1F603}'}</div>
                  <div className="emoticon-item" onClick={() => {this.setState({text: this.state.text+"\u{1F642}"})}}>{'\u{1F642}'}</div>
                  <div className="emoticon-item" onClick={() => {this.setState({text: this.state.text+"\u{1F643}"})}}>{'\u{1F643}'}</div>
                  <div className="emoticon-item" onClick={() => {this.setState({text: this.state.text+"\u{1F60E}"})}}>{'\u{1F60E}'}</div>
                  <div className="emoticon-item" onClick={() => {this.setState({text: this.state.text+"\u{1F636}"})}}>{'\u{1F636}'}</div>
                  <div className="emoticon-item" onClick={() => {this.setState({text: this.state.text+"\u{1F610}"})}}>{'\u{1F610}'}</div>
                  <div className="emoticon-item" onClick={() => {this.setState({text: this.state.text+"\u{1F611}"})}}>{'\u{1F611}'}</div>
                  <div className="emoticon-item" onClick={() => {this.setState({text: this.state.text+"\u{1F641}"})}}>{'\u{1F641}'}</div>
                  <div className="emoticon-item" onClick={() => {this.setState({text: this.state.text+"\u{1F61F}"})}}>{'\u{1F61F}'}</div>
                  <div className="emoticon-item" onClick={() => {this.setState({text: this.state.text+"\u{1F622}"})}}>{'\u{1F622}'}</div>
                  <div className="emoticon-item" onClick={() => {this.setState({text: this.state.text+"\u{1F625}"})}}>{'\u{1F625}'}</div>
                  <div className="emoticon-item" onClick={() => {this.setState({text: this.state.text+"\u{1F62D}"})}}>{'\u{1F62D}'}</div>
                </div>
              </Popup>

              <input onChange={this.onChangeAudioFile.bind(this)} accept="audio/*" type='file' ref="audioFile" style={{display: 'none'}}/>
              <img style={{width: 20, marginRight: 10, cursor: "pointer"}} src={require("assets/pngs/ic-audio.png")} onClick={() => {this.refs.audioFile.click()}}/>
            </div>
          </div>
          <div>
            <button
              className = "primary"
              style={{borderRadius: 15, backgroundColor: '#2d2e37', height: 35, width: 100}}
              onClick={() => {
                this.post();
              }}
              >
                {counterpart.translate("community.post")}
            </button>
          </div>
        </div>
        <div style={{display: 'flex', flexDirection: 'row', margin: 10, backgroundColor: '#2d2e37', height:40, justifyContent:"flex-end"}} className = "post-to">
          <Popup
            on={'click'}
            position={['bottom left']}
            offsetX={-230}
            offsetY={120}
            closeOnDocumentClick
            mouseLeaveDelay={100}
            mouseEnterDelay={0}
            contentStyle={{ width: 220, padding: '10px', border: 'none', backgroundColor: "#2d2e37", borderRadius: 3, height: 200}}
            arrow={false}
            trigger={
              <span style={{width: 230, borderRadius: 5, color: '#FFFFFF', borderColor: '#2d2e37', backgroundColor: '#2d2e37', display:"flex",alignItems:"center"}}>
                <span style={{marginLeft: 20, marginRight: 10, cursor:"pointer"}}>
                  {'\u{1F5F9}   ' + this.getMenuLabel("friend")}
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
          <Popup
            on={'click'}
            position={['bottom left']}
            offsetX={-230}
            offsetY={120}
            closeOnDocumentClick
            mouseLeaveDelay={100}
            mouseEnterDelay={0}
            contentStyle={{ width: 220, padding: '10px', border: 'none', backgroundColor: "#2d2e37", borderRadius: 3, height: 200}}
            arrow={false}
            trigger={
              <span style={{width: 230, borderRadius: 5, color: '#FFFFFF', borderColor: '#2d2e37', backgroundColor: '#2d2e37', display:"flex", alignItems:"center"}}>
                <span style={{marginRight: 10, cursor:"pointer"}}>
                  {'\u{1F5F9}   ' + this.getMenuLabel("group")}
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
        </div>
        <Modal
            closable={false}
            footer={[
                <Button
                    key="submit"
                    type="primary"
                    onClick={() => {this.uploadFile();}}>
                    {counterpart.translate("community.post")}
                </Button>,
                <Button
                    key="cancel"
                    style={{marginLeft: "8px"}}
                    onClick={() => {this.hideModal();}}
                >
                    {counterpart.translate("community.cancel")}
                </Button>
            ]}
            visible={this.state.videoPreviewUrl !== null || this.state.imagePreviewUrl !== null || this.state.audioPreviewUrl !== null}
            onCancel={this.hideModal}
        >
            {this.renderPostPreview()}
        </Modal>
      </div>
    );
  }
}
export default Post;
