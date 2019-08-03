import React from "react";
import Ps from "perfect-scrollbar";
import colors from "assets/colors";
import Icon from "../Icon/Icon";
import fire from "../firebase";
import FileUploader from "react-firebase-file-uploader";
import {Select, Row, Col, Button, Modal} from "bitshares-ui-style-guide";
import Popup from "reactjs-popup";
import {Notification} from "bitshares-ui-style-guide";
const database = fire.database();
const storage = fire.storage();

const customNames = {
    foods: 'food and drink',
    nature: 'outdoors',
    objects: 'stuff'
};

class Posts extends React.Component {

  constructor() {
    super();
    this.isCalledGetProfile = false;
    this.currentAccount = null;
    this.state = {
      user: null,
      posts: [],
      groupInvites: []
    };
    this.renderPosts = this.renderPosts.bind(this);
    this.timeConverter = this.timeConverter.bind(this);
  }

  componentWillUpdate(nextProps, nextState) {
  }

  componentWillMount() {
    this.getGroupInvites();
    const postsRef = database.ref('posts');

    postsRef.orderByChild('date').on('child_added', snapshot => {
      const post = { value: snapshot.val(), id: snapshot.key };
      let posts = this.state.posts;

      posts.push(post);
      this.setState(prevState => ({
        posts: posts,
      }));
    });

    postsRef.on('child_changed', snapshot => {
      const post = { value: snapshot.val(), id: snapshot.key };
      let posts = this.state.posts != null ? this.state.posts : [];
      for(let i = 0 ; i < posts.length ; i ++) {
        if(post.id === posts[i].id) {
          posts[i] = post;
        }
      }
      this.setState({posts: posts});
    });

  }

  componentDidMount() {
    if(this.state.user == null) {
      this.isCalledGetProfile = false;
      this.currentAccount = this.props.currentAccount;
      this.getUserProfile();
    }
    let postContainer = this.refs.postScroll;
    Ps.initialize(postContainer);
  }

  componentDidUpdate() {
    let postContainer = this.refs.postScroll;
    Ps.update(postContainer);
    if(this.props.currentAccount !== null && this.props.currentAccount !== undefined || this.state.user == null || this.state.user == undefined) {
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

  isGroupMember(groupId, userId){
    const groupsRef = database.ref('group-invites');
    groupsRef.on('value', snapshot => {
      const group = snapshot.val();
      console.log(group);
    });
  }

  getGroupInvites(){
    const invitesRef = database.ref('group-invites');
    invitesRef.on('value', snapshot => {
      const groupInvites = snapshot.val();
      this.setState({groupInvites: groupInvites});
    });
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

  renderUrl(post) {
    if(post.value.url !== null && post.value.url !== undefined) {
      if(post.value.type === "image") {
        return(
          <img style={{margin: 10, width: 200, marginTop: 20, marginBottom: 20}} src={post.value.url} />
        );
      } else if (post.value.type === "video") {
        return(
          <video width="200" controls style={{margin: 10, marginTop: 20, marginBottom: 20}}>
            <source src={post.value.url}/>
          </video>
        );
      } else if (post.value.type == "audio") {
        return(
          <audio width="200" controls style={{margin: 10, marginTop: 20, marginBottom: 20}}>
            <source src={post.value.url}/>
          </audio>
        );
      }
    }
  }

  invite(post) {
    if(this.currentAccount == null || this.currentAccount == undefined || this.state.user == null) {
      Notification.error({
          message: "Something went wrong."
      });
      return;
    }
    if(this.state.user.id === post.value.user.id) {
      Notification.warning({
          message: "You can't send invite to you."
      });
      return;
    }
    let invite = {
      date: Date.now(),
      userId: this.state.user.id,
      currentAccount: this.state.user.currentAccount !== undefined ? this.state.user.currentAccount : "user",
      otherUserId: post.value.user.id,
      otherCurrentAccount: post.value.user.currentAccount ? post.value.user.currentAccount : "user",
      status: "sent"
    };
    database.ref('invites/' + this.state.user.id).push(invite).then((snapshot) => {
      database.ref('invites/' + post.value.user.id + '/' + snapshot.key).set(invite).then(() => {
        Notification.success({
            message: "Invite is sent successfully."
        });
        let notification = {
          date: Date.now(),
          userId: post.value.user.id,
          from: this.state.user.id,
          type: 'invite',
          key: snapshot.key,
          data: invite,
          read: false
        };
        database.ref('notifications/' + post.value.user.id).push(notification);
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

  renderLikes(post) {
    if(this.currentAccount == null || this.currentAccount == undefined || this.state.user == null) {
      return;
    }
    let likes = post.value.likes !== null && post.value.likes !== undefined ? post.value.likes : [];
    return(
      <div style={{display: 'flex', borderTopWidth: 1, borderRightWidth: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderStyle: 'solid', borderColor: "#77777733", padding: 10, marginTop: 20, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', cursor: "pointer"}} >
        <img style={{width: 20, marginRight: 10}} src={require("assets/pngs/ic-like.png")}  onClick={() => {this.toggleLike(post)}}/>
        <span style={{flex: 1}}>
          <span style={{fontSize: 14}}  onClick={() => {this.toggleLike(post)}}>
            {likes.length}
          </span>
          {this.renderFollowButton(post)}
        </span>
        <Popup
          on={'hover'}
          position={['bottom left']}
          offsetX={-150}
          offsetY={30}
          closeOnDocumentClick
          mouseLeaveDelay={100}
          mouseEnterDelay={0}
          contentStyle={{ width: 150, padding: '10px', border: 'none', backgroundColor: "#2d2e37", borderRadius: 3}}
          arrow={false}
          trigger={<img style={{width: 20, marginRight: 10}} src={require("assets/pngs/icon-more.png")}/>} position="right center">
          <div onClick={() => {this.invite(post)}}>Invite</div>
        </Popup>
      </div>
    );
  }

  toggleLike(post) {
    let likes = post.value.likes !== null && post.value.likes !== undefined ? post.value.likes : [];
    if(this.currentAccount == null || this.currentAccount == undefined || this.state.user == null) {
      return;
    }
    let isAlreadyLiked = this.isAlreadyLiked(post);
    if(isAlreadyLiked) {
      for(let i = 0 ; i < likes.length ; i ++) {
        if(likes[i].id === this.currentAccount && (this.state.user.currentAccount == likes[i].type || (this.state.user.currentAccount == undefined && likes[i].type == "user"))) {
          likes.splice(i, 1);
        }
      }
    } else {
      likes.push({id: this.currentAccount, type: this.state.user.currentAccount !== undefined || this.state.user.currentAccount !== null ? this.state.user.currentAccount : "user"});
    }
    this.updateLikes(post, likes);
  }

  updateLikes(post, likes) {
    const postRef = database.ref('posts/' + post.id + '/likes');
    postRef.set(likes);
  }

  isAlreadyLiked(post) {
    let likes = post.value.likes !== null && post.value.likes !== undefined ? post.value.likes : [];
    for(let i = 0 ; i < likes.length ; i ++) {
      if(likes[i].id === this.currentAccount && (this.state.user.currentAccount == likes[i].type || (this.state.user.currentAccount == undefined && likes[i].type == "user"))) {
        return true;
      }
    }
    return false;
  }

  isFollowing(post) {
    if(this.currentAccount == null || this.currentAccount == undefined || this.state.user == null) {
      return false;
    }
    let followings = this.state.user.followings !== null && this.state.user.followings !== undefined ? this.state.user.followings : [];

    for (var i = 0; i < followings.length; i++) {
      if(followings[i].id == post.value.user.id && (post.value.user.currentAccount == followings[i].type || (post.value.currentAccount == undefined && followings[i].type == "user"))) {
        return true;
      }
    }
    return false;
  }

  toogleFollow(post) {
    if(this.currentAccount == null || this.currentAccount == undefined || this.state.user == null) {
      return false;
    }
    let followings = this.state.user.followings !== null && this.state.user.followings !== undefined ? this.state.user.followings : [];

    if(this.isFollowing(post)) {
      for (var i = 0; i < followings.length; i++) {
        if(followings[i].id == post.value.user.id && (post.value.user.currentAccount == followings[i].type || (post.value.currentAccount == undefined && followings[i].type == "user"))) {
          followings.splice(i, 1);
        }
      }
    } else {
      followings.push({id: post.value.user.id, type: post.value.user.currentAccount !== undefined ? post.value.user.currentAccount : "user"});
    }
    this.updateFollow(post, followings);
  }

  updateFollow(post, followings) {
    if(this.currentAccount == null || this.currentAccount == undefined || this.state.user == null) {
      return false;
    }
    const postRef = database.ref('users/' + this.currentAccount + '/followings');
    postRef.set(followings);
  }

  renderFollowButton(post) {
    if(this.currentAccount == null || this.currentAccount == undefined || this.state.user == null) {
      return null;
    }
    if(this.currentAccount == post.value.user.id && this.state.user.currentAccount == post.value.user.currentAccount) {
      return null
    }
    if(this.isFollowing(post)) {
      return(
        <Button
            key="cancel"
            style={{marginLeft: 30}}
            onClick={() => {this.toogleFollow(post)}}
        >
            Following
        </Button>
      );
    } else {
      return(
        <Button
            key="cancel"
            style={{marginLeft: 30}}
            onClick={() => {this.toogleFollow(post)}}
        >
            +  Follow
        </Button>
      );
    }
  }

  renderPosts() {
    let defaultAvatar = require("assets/icons/default-avatar.png");
    let posts = [];
    let showFlag = 0;
    let groupInvites = this.state.groupInvites;

    [...this.state.posts].reverse().map(post => {
      showFlag = 0;
      if(post.value.friends == null && post.value.groups == null){
        showFlag = 1;
      }
      else{
        if(post.value.friends != null){
          if(this.state.user != null){
            if(post.value.friends.indexOf(this.state.user.id) > -1 || post.value.userId == this.state.user.id){
              showFlag = 1;
            }
          }
        }
        if(post.value.groups != null){
          if(this.state.user != null){
            for (let [key, value] of Object.entries(groupInvites)) {
              if((value.from == this.state.user.id || value.userId == this.state.user.id) && value.status == "accepted"){
                if(post.value.groups.indexOf(value.key)){
                  showFlag = 1;
                }
              }
            }
          }
        }
      }

      if(showFlag == 1){
        posts.push(
          <div
            style={{margin: 2, borderWidth: 1, borderStyle: 'solid', borderColor: '#494a4e'}}
            key={post.id}>
            {this.renderPost(post)}
            {this.renderUrl(post)}
            <div style={{marginTop: 20, padding: 10}}>
              {post.value.text}
            </div>
            {this.renderLikes(post)}
          </div>
        );
      }
    });
    return posts;
  }

  renderPost(post) {
    let defaultAvatar = require("assets/icons/default-avatar.png");
    if(post.value.user.currentAccount == null && post.value.user.currentAccount == undefined || post.value.user.currentAccount == "" || post.value.user.currentAccount == "user") {
      return(
        <div style={{marginBottom:"5px", padding: 10}}>
          <img
            src={post.value.user.userImage == null || post.value.user.userImage == undefined || post.value.user.userImage == '' ? defaultAvatar : post.value.user.userImage}
            style={{borderRadius:"50%", border: "none", width: "30px", height: "30px", backgroundColor: "#777777", marginRight:"3px"}}
          />
          <span style={{color: "#2580be",  marginLeft:"20px"}}>
              {post.value.user.userName || post.value.user.id}
          </span>
          <div>
            <span style={{color: "#444444", fontSize:"11px", marginLeft: 50}}>
                {this.timeConverter(post.value.date)}
            </span>
          </div>
        </div>
      );
    } else {
      return(
        <div style={{marginBottom:"5px", padding: 10}}>
          <img
            src={post.value.user.avatarImage == null || post.value.user.avatarImage == undefined || post.value.user.avatarImage == '' ? defaultAvatar : post.value.user.avatarImage}
            style={{borderRadius:"50%", border: "none", width: "30px", height: "30px", backgroundColor: "#777777", marginRight:"3px"}}
          />
          <span style={{color: "#2580be",  marginLeft:"20px"}}>
              {post.value.user.avatarName || post.value.user.id}
          </span>
          <div>
            <span style={{color: "#444444", fontSize:"11px", marginLeft: 50}}>
                {this.timeConverter(post.value.date)}
            </span>
          </div>
        </div>
      );
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
      <div style={{width: "100%", height: '100%', paddingBottom: 38}} ref="postScroll">
        {this.renderPosts()}
      </div>
    );
  }
}
export default Posts;
