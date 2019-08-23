import React from "react";
import {ChainStore} from "bitsharesjs";
import AccountStore from "stores/AccountStore";
import NotificationStore from "stores/NotificationStore";
import {withRouter} from "react-router-dom";
import SyncError from "./components/SyncError";
import LoadingIndicator from "./components/LoadingIndicator";
import BrowserNotifications from "./components/BrowserNotifications/BrowserNotificationsContainer";
import Header from "components/Layout/Header";
import ReactTooltip from "react-tooltip";
import NotificationSystem from "react-notification-system";
import TransactionConfirm from "./components/Blockchain/TransactionConfirm";
import WalletUnlockModal from "./components/Wallet/WalletUnlockModal";
import BrowserSupportModal from "./components/Modal/BrowserSupportModal";
import Footer from "./components/Layout/Footer";
import Deprecate from "./Deprecate";
import Incognito from "./components/Layout/Incognito";
import {isIncognito} from "feature_detect";
import {updateGatewayBackers} from "common/gatewayUtils";
import titleUtils from "common/titleUtils";
import {BodyClassName, Notification} from "bitshares-ui-style-guide";
import {DEFAULT_NOTIFICATION_DURATION} from "services/Notification";
import Loadable from "react-loadable";
import counterpart from "counterpart";

import {Route, Switch} from "react-router-dom";
import Video from "./components/Video"
import {Button} from "bitshares-ui-style-guide";
import { Widget, addResponseMessage, addLinkSnippet, addUserMessage } from 'react-chat-widget';
import { Rnd } from "react-rnd";

import 'react-chat-widget/lib/styles.css';

// Nested route components
import Page404 from "./components/Page404/Page404";
const Exchange = Loadable({
    loader: () =>
        import(/* webpackChunkName: "exchange" */ "./components/Exchange/ExchangeContainer"),
    loading: LoadingIndicator
});

const Explorer = Loadable({
    loader: () =>
        import(/* webpackChunkName: "explorer" */ "./components/Explorer/Explorer"),
    loading: LoadingIndicator
});

const AccountPage = Loadable({
    loader: () =>
        import(/* webpackChunkName: "account" */ "./components/Account/AccountPage"),
    loading: LoadingIndicator
});

const Transfer = Loadable({
    loader: () =>
        import(/* webpackChunkName: "transfer" */ "./components/Transfer/Transfer"),
    loading: LoadingIndicator
});

const AccountDepositWithdraw = Loadable({
    loader: () =>
        import(/* webpackChunkName: "deposit-withdraw" */ "./components/Account/AccountDepositWithdraw"),
    loading: LoadingIndicator
});

const News = Loadable({
    loader: () => import(/* webpackChunkName: "news" */ "./components/News"),
    loading: LoadingIndicator
});

const Settings = Loadable({
    loader: () =>
        import(/* webpackChunkName: "settings" */ "./components/Settings/SettingsContainer"),
    loading: LoadingIndicator
});

const Help = Loadable({
    loader: () => import(/* webpackChunkName: "help" */ "./components/Help"),
    loading: LoadingIndicator
});

const Asset = Loadable({
    loader: () =>
        import(/* webpackChunkName: "asset" */ "./components/Blockchain/Asset"),
    loading: LoadingIndicator
});

const Block = Loadable({
    loader: () =>
        import(/* webpackChunkName: "block" */ "./components/Blockchain/BlockContainer"),
    loading: LoadingIndicator
});

const DashboardAccountsOnly = Loadable({
    loader: () =>
        import(/* webpackChunkName: "dashboard-accounts" */ "./components/Dashboard/DashboardAccountsOnly"),
    loading: LoadingIndicator
});

const DashboardPage = Loadable({
    loader: () =>
        import(/* webpackChunkName: "dashboard" */ "./components/Dashboard/DashboardPage"),
    loading: LoadingIndicator
});

const WalletManager = Loadable({
    loader: () =>
        import(/* webpackChunkName: "wallet" */ "./components/Wallet/WalletManager"),
    loading: LoadingIndicator
});

const ExistingAccount = Loadable({
    loader: () =>
        import(/* webpackChunkName: "existing-account" */ "./components/Wallet/ExistingAccount"),
    loading: LoadingIndicator
});

const CreateWorker = Loadable({
    loader: () =>
        import(/* webpackChunkName: "create-worker" */ "./components/Account/CreateWorker"),
    loading: LoadingIndicator
});

import LoginSelector from "./components/LoginSelector";
import Login from "./components/Login/Login";
import RegistrationSelector from "./components/Registration/RegistrationSelector";
import WalletRegistration from "./components/Registration/WalletRegistration";
import AccountRegistration from "./components/Registration/AccountRegistration";
import {CreateWalletFromBrainkey} from "./components/Wallet/WalletCreate";
import PriceAlertNotifications from "./components/PriceAlertNotifications";

import fire from "./components/firebase";
const database = fire.database();
const storage = fire.storage();

class App extends React.Component {
    constructor() {
        super();

        let syncFail =
            ChainStore.subError &&
            ChainStore.subError.message ===
                "ChainStore sync error, please check your system clock"
                ? true
                : false;
        this.state = {
            isBrowserSupportModalVisible: false,
            loading: false,
            synced: this._syncStatus(),
            syncFail,
            incognito: false,
            incognitoWarningDismissed: false,
            height: window && window.innerHeight,
            isShowLayout: true,
            buyModalIsOpen: false,
            sellModalIsOpen: false,
            centerContent: 'Exchange',
            isDepositModalVisible: false,
            isWithdrawModalVisible: false,
            isShowSendModalVisible: false,
            rightPanelContent: "liveChat",
            hideTopAndBottomBar: true
        };

        this._rebuildTooltips = this._rebuildTooltips.bind(this);
        this._chainStoreSub = this._chainStoreSub.bind(this);
        this._syncStatus = this._syncStatus.bind(this);
        this._getWindowHeight = this._getWindowHeight.bind(this);

        this.showBrowserSupportModal = this.showBrowserSupportModal.bind(this);
        this.hideBrowserSupportModal = this.hideBrowserSupportModal.bind(this);

        this.toggleLayout = this.toggleLayout.bind(this);
        this.selectLeftPanelLayout = this.selectLeftPanelLayout.bind(this);
        this.selectRightPanelLayout = this.selectRightPanelLayout.bind(this);
        this.openBuyModal = this.openBuyModal.bind(this);
        this.openSellModal = this.openSellModal.bind(this);
        this.closeSellModal = this.closeSellModal.bind(this);
        this.closeBuyModal = this.closeBuyModal.bind(this);
        this.setCenterPanelContent = this.setCenterPanelContent.bind(this);
        this.send = this.send.bind(this);
        this.withdraw = this.withdraw.bind(this);
        this.deposit = this.deposit.bind(this);
        this.hideWithdrawModal = this.hideWithdrawModal.bind(this);
        this.hideDepositModal = this.hideDepositModal.bind(this);
        this.hideSendModal = this.hideSendModal.bind(this);
        this.setCurrentAccount = this.setCurrentAccount.bind(this);
        this.handleNewUserMessage = this.handleNewUserMessage.bind(this);
        Notification.config({
            duration: DEFAULT_NOTIFICATION_DURATION,
            top: 90
        });
    }

    getMessages() {
      if(this.state.currentAccount == null || this.state.currentAccount == undefined) {
        return;
      }
      database.ref('support_chats/' + this.state.currentAccount + '/' + 'supports').set(null).then(() => {
        database.ref('support_chats/' + 'supports' + '/' + this.state.currentAccount).set(null).then(() => {
          const messagesRef = database.ref('support_chats/' + this.state.currentAccount + '/' + 'supports');
          let keys = [];
          messagesRef.on('child_added', snapshot => {
            if(keys.indexOf(snapshot.key) === -1) {
              keys.push(snapshot.key);
              const message = { text: snapshot.val(), id: snapshot.key };
              if(message.text.id === this.state.currentAccount) {
                // addUserMessage(message.text.content);
              } else {
                addResponseMessage(message.text.content);
              }
            }
          });
        }).catch(() => {});
      }).catch(() => {});
    }

    setCurrentAccount(currentAccount, user) {
      this.user = user;
      if(this.state.currentAccount !== currentAccount) {
        this.setState({currentAccount: currentAccount}, function() {
          this.getMessages();
        });
      }
    }

    hideBar(hideTopAndBottomBar) {
      this.setState({hideTopAndBottomBar: hideTopAndBottomBar});
    }

    componentWillMount() {
      let currentAccount = AccountStore.getState().currentAccount;
      this.hideBar(window.location.href.indexOf("market") === -1);
      this.unlisten = this.props.history.listen((location, action) => {
        this.hideBar(window.location.href.indexOf("market") === -1);
      });
    }

    componentWillUnmount() {
      this.unlisten();
      window.removeEventListener("resize", this._getWindowHeight);
      NotificationStore.unlisten(this._onNotificationChange);
      ChainStore.unsubscribe(this._chainStoreSub);
      clearInterval(this.syncCheckInterval);
    }

    send() {
      this.setState({isShowSendModalVisible: true});
    }

    hideSendModal() {
      this.setState({isShowSendModalVisible: false});
    }

    hideDepositModal() {
      this.setState({isDepositModalVisible: false});
    }

    hideWithdrawModal() {
      this.setState({isWithdrawModalVisible: false});
    }

    deposit() {
      this.setState({isDepositModalVisible: true});
    }

    withdraw() {
      this.setState({isWithdrawModalVisible: true});
    }

    setCenterPanelContent(page) {
      this.setState({centerContent: page});
    }

    closeSellModal() {
      this.setState({sellModalIsOpen: false});
    }

    closeBuyModal() {
      this.setState({buyModalIsOpen: false});
    }

    openBuyModal(bOpen) {
      this.setState({buyModalIsOpen: bOpen});
    }

    openSellModal(bOpen) {
      this.setState({sellModalIsOpen: bOpen});
    }

    selectLeftPanelLayout(content) {
      this.setState(
        {leftPanelContent: content}
      );
    }

    selectRightPanelLayout(content) {
      this.setState(
        {rightPanelContent: content}
      );
    }

    toggleLayout() {
      if(this.state.isShowLayout){
        this.setState({
            isShowLayout: false
        });
      }
      else{
        this.setState({
            isShowLayout: true
        });
      }
    }

    /**
     * Returns the current blocktime, or exception if not yet available
     * @returns {Date}
     */
    getBlockTime() {
        let dynGlobalObject = ChainStore.getObject("2.1.0");
        if (dynGlobalObject) {
            let block_time = dynGlobalObject.get("time");
            if (!/Z$/.test(block_time)) {
                block_time += "Z";
            }
            return new Date(block_time);
        } else {
            throw new Error("Blocktime not available right now");
        }
    }

    /**
     * Returns the delta between the current time and the block time in seconds, or -1 if block time not available yet
     *
     * Note: Could be integrating properly with BlockchainStore to send out updates, but not necessary atp
     */
    getBlockTimeDelta() {
        try {
            let bt =
                (this.getBlockTime().getTime() +
                    ChainStore.getEstimatedChainTimeOffset()) /
                1000;
            let now = new Date().getTime() / 1000;
            return Math.abs(now - bt);
        } catch (err) {
            return -1;
        }
    }

    hideBrowserSupportModal() {
        this.setState({
            isBrowserSupportModalVisible: false
        });
    }

    showBrowserSupportModal() {
        this.setState({
            isBrowserSupportModalVisible: true
        });
    }

    _syncStatus(setState = false) {
        let synced = this.getBlockTimeDelta() < 5;
        if (setState && synced !== this.state.synced) {
            this.setState({synced});
        }
        return synced;
    }

    _setListeners() {
        try {
            window.addEventListener("resize", this._getWindowHeight, {
                capture: false,
                passive: true
            });
            NotificationStore.listen(this._onNotificationChange.bind(this));
            ChainStore.subscribe(this._chainStoreSub);
            AccountStore.tryToSetCurrentAccount();
        } catch (e) {
            console.error("e:", e);
        }
    }

    componentDidMount() {
        this._setListeners();
        this.syncCheckInterval = setInterval(
            this._syncStatus.bind(this, true),
            5000
        );
        const user_agent = navigator.userAgent.toLowerCase();
        if (
            !(
                window.electron ||
                user_agent.indexOf("firefox") > -1 ||
                user_agent.indexOf("chrome") > -1 ||
                user_agent.indexOf("edge") > -1
            )
        ) {
            this.showBrowserSupportModal();
        }

        this.props.history.listen(this._rebuildTooltips);

        this._rebuildTooltips();

        isIncognito(
            function(incognito) {
                this.setState({incognito});
            }.bind(this)
        );
        updateGatewayBackers();
        addResponseMessage(counterpart.translate("community.howCanI"));
    }

    handleNewUserMessage(newMessage) {
      if(this.user == null || this.user == undefined) {
        return;
      }
      let name, image, id;
      if(this.user.currentAccount == null && this.user.currentAccount == undefined || this.user.currentAccount == "" || this.user.currentAccount == "user") {
        name = this.user.userName != undefined ? this.user.userName : "";
        id = this.user.id;
        image = this.user.userImage != undefined ? this.user.userImage : "";
      } else {
        name = this.user.avatarName != undefined ? this.user.avatarName : "";
        image = this.user.avatarImage != undefined ? this.user.avatarImage : "";
        id = this.user.id;
      }
      var data = {"date": Date.now(), "user": name, "content": newMessage, "image" : image, id: id, to: "supports"};
      database.ref('support_chats/' + this.state.currentAccount + '/' + "supports").push(data);
      database.ref('support_chats/'  + "supports" + '/' + this.state.currentAccount).push(data);
    }

    componentDidUpdate(prevProps) {
        if (this.props.location !== prevProps.location) {
            this.onRouteChanged();
        }
    }

    onRouteChanged() {  //Set_title
        document.title = titleUtils.GetTitleByPath(
            this.props.location.pathname
        );
        document.title = "Skyrus-Exchange";
    }

    _onIgnoreIncognitoWarning() {
        this.setState({incognitoWarningDismissed: true});
    }

    _rebuildTooltips() {
        if (this.rebuildTimeout) return;
        ReactTooltip.hide();

        this.rebuildTimeout = setTimeout(() => {
            if (this.refs.tooltip) {
                this.refs.tooltip.globalRebuild();
            }
            this.rebuildTimeout = null;
        }, 1500);
    }

    _chainStoreSub() {
        let synced = this._syncStatus();
        if (synced !== this.state.synced) {
            this.setState({synced});
        }
        if (
            ChainStore.subscribed !== this.state.synced ||
            ChainStore.subError
        ) {
            let syncFail =
                ChainStore.subError &&
                ChainStore.subError.message ===
                    "ChainStore sync error, please check your system clock"
                    ? true
                    : false;
            this.setState({
                syncFail
            });
        }
    }

    /** Usage: NotificationActions.[success,error,warning,info] */
    _onNotificationChange() {
        let notification = NotificationStore.getState().notification;
        if (notification.autoDismiss === void 0) {
            notification.autoDismiss = 10;
        }
        if (this.refs.notificationSystem)
            this.refs.notificationSystem.addNotification(notification);
    }

    _getWindowHeight() {
        this.setState({height: window && window.innerHeight});
    }

    render() {
        let {incognito, incognitoWarningDismissed} = this.state;
        let {walletMode, theme, location, match, ...others} = this.props;
        let content = null;
        if (this.state.syncFail) {
            content = <SyncError />;
        } else if (this.state.loading) {
            content = (
                <div className="grid-frame vertical">
                    <LoadingIndicator
                        loadingText={"Connecting to APIs and starting app"}
                    />
                </div>
            );
        } else if (__DEPRECATED__) {
            content = <Deprecate {...this.props} />;
        } else {
            content = (
                <div className="grid-frame vertical">
                    <Header
                      height={this.state.height}
                      toggleLayout={this.toggleLayout}
                      selectLeftPanelLayout={this.selectLeftPanelLayout}
                      setCenterPanelContent ={this.setCenterPanelContent }
                      centerContent={this.state.centerContent}
                      isWithdrawModalVisible={this.state.isWithdrawModalVisible}
                      isDepositModalVisible={this.state.isDepositModalVisible}
                      isShowSendModalVisible={this.state.isShowSendModalVisible}
                      hideWithdrawModal={this.hideWithdrawModal}
                      hideDepositModal={this.hideDepositModal}
                      hideSendModal={this.hideSendModal}
                      setCurrentAccount={this.setCurrentAccount}
                      {...others}
                    />
                    <div
                      id="mainContainer"
                      className="grid-block"
                      style={{backgroundColor: theme=="midnightTheme" ? "#191a1f" : "#fff"}}
                    >
                        <div className="grid-block vertical">
                            <Switch>
                                <Route
                                    exact
                                    path="/"
                                    component={DashboardPage}
                                />
                                <Route
                                    exact
                                    path="/land"
                                    component={DashboardPage}
                                />
                                <Route
                                    exact
                                    path="/policy/:type"
                                    component={DashboardPage}
                                />
                                <Route
                                    path="/account/:account_name"
                                    component={AccountPage}
                                />
                                <Route
                                    path="/accountwallet/:account_name"
                                    component={AccountPage}
                                />
                                <Route
                                    path="/accounts"
                                    component={DashboardAccountsOnly}
                                />
                                <Route
                                    path="/market/:marketID"
                                    render={() =>
                                      <Exchange
                                        centerContent={this.state.centerContent}
                                        closeBuyModal={this.closeBuyModal}
                                        closeSellModal={this.closeSellModal}
                                        content={this.state.leftPanelContent}
                                        rightContent={this.state.rightPanelContent}
                                        buyModalIsOpen ={this.state.buyModalIsOpen}
                                        sellModalIsOpen={this.state.sellModalIsOpen}/>}
                                />                                
                                <Route
                                    path="/transfer"
                                    exact
                                    component={Transfer}
                                />
                                <Route
                                    path="/deposit-withdraw"
                                    exact
                                    component={AccountDepositWithdraw}
                                />
                                <Route
                                    path="/create-account"
                                    component={LoginSelector}
                                />
                                <Route path="/login" component={Login} />
                                <Route
                                    path="/registration"
                                    exact
                                    component={RegistrationSelector}
                                />
                                <Route path="*" component={Page404} />
                            </Switch>
                        </div>
                    </div>
                    <Footer
                        selectLeftPanelLayout={this.selectLeftPanelLayout}
                        hideTopAndBottomBar={this.state.hideTopAndBottomBar}
                        synced={this.state.synced}
                        history={this.props.history}
                        openBuyModal={this.openBuyModal}
                        openSellModal={this.openSellModal}
                        selectRightPanelLayout={this.selectRightPanelLayout}
                        centerContent={this.state.centerContent}
                        send={this.send}
                        withdraw={this.withdraw}
                        deposit={this.deposit}
                        rightPanelContent={this.state.rightPanelContent}
                    />
                    <ReactTooltip
                        ref="tooltip"
                        place="top"
                        type={theme === "lightTheme" ? "dark" : "light"}
                        effect="solid"
                    />
                </div>
            );
        }
        let defaultAvatar = require("assets/icons/default-avatar.png");
        return (
            <div
                style={{backgroundColor: !theme ? "#2a2a2a" : null}}
                className={theme}
            >
                <BodyClassName className={theme}>
                    {walletMode && incognito && !incognitoWarningDismissed ? (
                        <Incognito
                            onClickIgnore={this._onIgnoreIncognitoWarning.bind(
                                this
                            )}
                        />
                    ) : null}
                    {window.innerWidth > 1199 ? (
                        <Video videoUrl={require('./assets/fish.mp4')}></Video>
                    ) : null}
                    <div style={{width: "100vw", textAlign: "right", position: "absolute"}}>
                      <div className = "button"
                        onClick={this.toggleLayout}
                        style = {this.state.isShowLayout? {display: "none"} : {}}
                      >
                        {this.state.isShowLayout? "HIDE" : "SHOW"}
                      </div>
                    </div>
                    <div id="content-wrapper" style={{height: "100vh"}} >
                        {this.state.isShowLayout? content : null}
                        <NotificationSystem
                            ref="notificationSystem"
                            allowHTML={true}
                            style={{
                                Containers: {
                                    DefaultStyle: {
                                        width: "425px"
                                    }
                                }
                            }}
                        />
                        <TransactionConfirm />
                        <BrowserNotifications />
                        <PriceAlertNotifications />
                        <WalletUnlockModal />
                        <BrowserSupportModal
                            visible={this.state.isBrowserSupportModalVisible}
                            hideModal={this.hideBrowserSupportModal}
                            showModal={this.showBrowserSupportModal}
                        />
                    </div>
                </BodyClassName>
                {this.state.currentAccount !== null && this.state.currentAccount !== undefined && this.state.hideTopAndBottomBar === false && (
                  <Rnd
                    style={{right: 20, bottom: 10}}
                    default={{
                      x: window.innerWidth - 200,
                      y: window.innerHeight - 65
                    }}
                    enableUserSelectHack={false}
                  >
                    <Widget
                      handleNewUserMessage={this.handleNewUserMessage}
                      profileAvatar={defaultAvatar}
                      title={counterpart.translate("community.skyrusLiveChat")}
                      subtitle={counterpart.translate("community.welcome")}
                      titleAvatar={defaultAvatar}
                    />
                  </Rnd>
                )}
            </div>
        );
    }
}

export default withRouter(App);
