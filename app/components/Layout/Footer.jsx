import React, {Component} from "react";
import AltContainer from "alt-container";
import Translate from "react-translate-component";
import BindToChainState from "../Utility/BindToChainState";
import ChainTypes from "../Utility/ChainTypes";
import CachedPropertyStore from "stores/CachedPropertyStore";
import BlockchainStore from "stores/BlockchainStore";
import WalletDb from "stores/WalletDb";
import SettingsStore from "stores/SettingsStore";
import SettingsActions from "actions/SettingsActions";
import AccessSettings from "../Settings/AccessSettings";
import Icon from "../Icon/Icon";
import "intro.js/introjs.css";
import guide from "intro.js";
import ReportModal from "../Modal/ReportModal";
import PropTypes from "prop-types";
import {routerTransitioner} from "../../routerTransition";
import LoadingIndicator from "../LoadingIndicator";
import counterpart from "counterpart";
import ChoiceModal from "../Modal/ChoiceModal";
import {ChainStore} from "bitsharesjs";
import ifvisible from "ifvisible";
import {getWalletName} from "branding";
import {Modal, Button} from "bitshares-ui-style-guide";
import AccountStore from "stores/AccountStore";
import ButtonsGroup from "../Layout/ButtonsGroup";
import Button2 from '../../assets/pngs/icon_bt2.png';
import Button21 from '../../assets/pngs/icon_bt21.png';
import Button22 from '../../assets/pngs/icon_bt22.png';
import Button23 from '../../assets/pngs/icon_bt23.png';

import Button3 from '../../assets/pngs/icon_bt3.png';
import Button31 from '../../assets/pngs/icon_bt31.png';
import Button32 from '../../assets/pngs/icon_bt32.png';
import Button33 from '../../assets/pngs/icon_bt33.png';

import Button4 from '../../assets/pngs/icon_bt4.png';
import Button41 from '../../assets/pngs/icon_bt41.png';
import Button42 from '../../assets/pngs/icon_bt42.png';
import Button43 from '../../assets/pngs/icon_bt43.png';

import Button5 from '../../assets/pngs/icon_bt5.png';
import Button51 from '../../assets/pngs/icon_bt51.png';
import Button52 from '../../assets/pngs/icon_bt52.png';
import Button53 from '../../assets/pngs/icon_bt53.png';

class Footer extends React.Component {
    static propTypes = {
        dynGlobalObject: ChainTypes.ChainObject.isRequired,
        synced: PropTypes.bool.isRequired
    };

    static defaultProps = {
        dynGlobalObject: "2.1.0"
    };

    constructor(props) {
        super(props);

        this.state = {
            choiceModalShowOnce: false,
            isChoiceModalVisible: false,
            isReportModalVisible: false,
            showNodesPopup: false,
            showConnectingPopup: false,
            rightPanelContent: "liveChat",
            centerContent: "Exchange",
            hideTopAndBottomBar: true
        };

        this.confirmOutOfSync = {
            modal: null,
            shownOnce: false
        };

        this.getNode = this.getNode.bind(this);
        this.showChoiceModal = this.showChoiceModal.bind(this);
        this.hideChoiceModal = this.hideChoiceModal.bind(this);
        this.showReportModal = this.showReportModal.bind(this);
        this.hideReportModal = this.hideReportModal.bind(this);
        this.openBuyModal = this.openBuyModal.bind(this);
        this.openSellModal = this.openSellModal.bind(this);
    }

    componentWillMount() {

    }

    componentWillUnmount() {

    }

    openBuyModal() {
      this.props.openBuyModal(true);
    }

    openSellModal() {
      this.props.openSellModal(true);
    }

    showChoiceModal() {
        this.setState({
            isChoiceModalVisible: true
        });
    }

    hideChoiceModal() {
        this.setState({
            isChoiceModalVisible: false
        });
    }

    showReportModal() {
        this.setState({
            isReportModalVisible: true
        });
    }

    hideReportModal() {
        this.setState({
            isReportModalVisible: false
        });
    }

    componentWillReceiveProps(nextProps) {
      this.setState({centerContent: nextProps.centerContent});
      this.setState({rightPanelContent: nextProps.rightPanelContent});
      this.setState({hideTopAndBottomBar: nextProps.hideTopAndBottomBar});
    }

    componentDidMount() {
        this.checkNewVersionAvailable.call(this);

        this.downloadLink = "https://bitshares.org/download";

        let ensure = this._ensureConnectivity.bind(this);
        ifvisible.on("wakeup", function() {
            ensure();
        });
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            nextState.isChoiceModalVisible !==
                this.state.isChoiceModalVisible ||
            nextState.isReportModalVisible !==
                this.state.isReportModalVisible ||
            nextProps.dynGlobalObject !== this.props.dynGlobalObject ||
            nextProps.backup_recommended !== this.props.backup_recommended ||
            nextProps.rpc_connection_status !==
                this.props.rpc_connection_status ||
            nextProps.synced !== this.props.synced ||
            nextState.showNodesPopup !== this.state.showNodesPopup ||
            nextProps.centerContent !== this.state.centerContent ||
            nextProps.rightPanelContent !== this.state.rightPanelContent ||
            nextProps.hideTopAndBottomBar !== this.state.hideTopAndBottomBar
        );
    }

    checkNewVersionAvailable() {
        if (__ELECTRON__) {
            fetch(
                "https://api.github.com/repos/bitshares/bitshares-ui/releases/latest"
            )
                .then(res => {
                    return res.json();
                })
                .then(
                    function(json) {
                        let oldVersion = String(json.tag_name);
                        let newVersion = String(APP_VERSION);
                        let isReleaseCandidate =
                            APP_VERSION.indexOf("rc") !== -1;
                        if (!isReleaseCandidate && oldVersion !== newVersion) {
                            this.setState({newVersion});
                        }
                    }.bind(this)
                );
        }
    }

    downloadVersion() {
        var a = document.createElement("a");
        a.href = this.downloadLink;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.style = "display: none;";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    launchIntroJS() {
        const translator = require("counterpart");

        var hintData = document.querySelectorAll("[data-intro]");
        var theme = SettingsStore.getState().settings.get("themes");

        if (hintData.length == 0) {
            this.props.history.push("/help");
        } else {
            guide
                .introJs()
                .setOptions({
                    tooltipClass: theme,
                    highlightClass: theme,
                    showBullets: false,
                    hideNext: true,
                    hidePrev: true,
                    nextLabel: translator.translate("walkthrough.next_label"),
                    prevLabel: translator.translate("walkthrough.prev_label"),
                    skipLabel: translator.translate("walkthrough.skip_label"),
                    doneLabel: translator.translate("walkthrough.done_label")
                })
                .start();
        }
    }

    getNodeIndexByURL(url) {
        let nodes = this.props.defaults.apiServer;

        let index = nodes.findIndex(node => node.url === url);
        if (index === -1) {
            return null;
        }
        return index;
    }

    getCurrentNodeIndex() {
        const {props} = this;
        let currentNode = this.getNodeIndexByURL.call(this, props.currentNode);

        return currentNode;
    }

    getNode(node = {url: "", operator: ""}) {
        const {props} = this;

        let title = node.operator + " " + !!node.location ? node.location : "";
        if ("country" in node) {
            title = node.country + (!!title ? " - " + title : "");
        }

        return {
            name: title,
            url: node.url,
            ping: props.apiLatencies[node.url]
        };
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
            console.log(err);
            return -1;
        }
    }

    /**
     * Closes the out of sync modal if closed
     *
     * @private
     */
    _closeOutOfSyncModal() {
        this.hideChoiceModal();
    }

    /**
     * This method can be called whenever it is assumed that the connection is stale.
     * It will check synced/connected state and notify the user or do automatic reconnect.
     * In general the connection state can be "out of sync" and "disconnected".
     *
     * disconnected:
     *      - dependent on rpc_connection_status of BlockchainStore
     *
     * out of sync:
     *      - reported block time is more than X sec in the past, as reported in
     *        App -> _syncStatus
     *
     * @private
     */
    _ensureConnectivity() {
        // user is not looking at the app, no reconnection effort necessary
        if (!ifvisible.now("active")) return;

        let connected = !(this.props.rpc_connection_status === "closed");

        if (!connected) {
            console.log("Your connection was lost");
            setTimeout(() => {
                this._triggerReconnect();
            }, 50);
        } else if (!this.props.synced) {
            // If the blockchain is out of sync the footer will be rerendered one last time and then
            // not receive anymore blocks, meaning no rerender. Thus we need to trigger any and all
            // handling out of sync state within this one call

            let forceReconnectAfterSeconds = this._getForceReconnectAfterSeconds();
            let askToReconnectAfterSeconds = 10;

            // Trigger automatic reconnect after X seconds
            setTimeout(() => {
                if (!this.props.synced) {
                    this._triggerReconnect();
                }
            }, forceReconnectAfterSeconds * 1000);

            // Still out of sync?
            if (this.getBlockTimeDelta() > 3) {
                console.log(
                    "Your node is out of sync since " +
                        this.getBlockTimeDelta() +
                        " seconds, waiting " +
                        askToReconnectAfterSeconds +
                        " seconds, then we notify you"
                );
                setTimeout(() => {
                    // Only ask the user once, and only continue if still out of sync
                    if (
                        this.getBlockTimeDelta() > 3 &&
                        this.state.choiceModalShowOnce === false
                    ) {
                        this.setState({
                            choiceModalShowOnce: true
                        });
                        this.showChoiceModal();
                    }
                }, askToReconnectAfterSeconds * 1000);
            }
        } else {
            setTimeout(() => {
                this._closeOutOfSyncModal();
                this.setState({
                    choiceModalShowOnce: false
                });
            }, 50);
        }
    }

    _getForceReconnectAfterSeconds() {
        return 60;
    }

    _triggerReconnect(honorManualSelection = true) {
        if (honorManualSelection && !routerTransitioner.isAutoSelection()) {
            return;
        }
        if (!routerTransitioner.isTransitionInProgress()) {
            this._closeOutOfSyncModal();
            console.log("Trying to reconnect ...");

            // reconnect to anythin
            let promise = routerTransitioner.willTransitionTo(false);
            if (!!promise)
                setTimeout(() => {
                    this.forceUpdate();
                }, 10);
            promise.then(() => {
                console.log("... done trying to reconnect");
            });
        }
    }

    _setRightPanel(content){
      this.props.selectRightPanelLayout(content);
    }

    _setLeftPanel(content){
      this.props.selectLeftPanelLayout(content);
    }

    onBackup() {
        this.props.history.push("/wallet/backup/create");
    }

    onBackupBrainkey() {
        this.props.history.push("/wallet/backup/brainkey");
    }

    onPopup() {
        this.setState({
            showNodesPopup: !this.state.showNodesPopup
        });
    }

    onAccess() {
        SettingsActions.changeViewSetting({activeSetting: 6});
        this.props.history.push("/settings/access");
    }

    render() {
        let currentAccount = AccountStore.getState().currentAccount;
        if(this.state.hideTopAndBottomBar == undefined || this.state.hideTopAndBottomBar === true){
          if((window.location.href.split("/").length - 1 == 3 && !currentAccount ) || window.location.href.indexOf("land") !== -1) {
            return(<div></div>);
          }
        }
        let smallScreen = window.innerWidth < 850 ? true : false;
        let tinyScreen = window.innerWidth < 640 ? true : false;
        let bottomMenuContainer = null;
        let rightPanelMenu;
        let bottomRightMenu;
        rightPanelMenu = (
          <div style={{margin: 0, padding: 5, textAlign: "left", flex: 1}}>
            <ButtonsGroup
              title1="AIBot"
              title2={"ActionPanels"}
              title3={"EmotionIndicator"}
              button1={Button4}
              button2={Button41}
              button3={Button42}
              button4={Button43}
              onClickButton1={() => {}}
              onClickButton2={this._setRightPanel.bind(this, "actionCardPane")}
              onClickButton3={this._setRightPanel.bind(this, "emotionIndicator")}
              />
          </div>
        );
        bottomRightMenu = (
          <div style={{margin: 0, padding: 5, textAlign: "left", flex: 1}}>
            <ButtonsGroup
              title1="LiveChat"
              title2={"Posts"}
              title3={"Reserved"}
              button1={Button5}
              button2={Button51}
              button3={Button52}
              button4={Button53}
              onClickButton1={this._setRightPanel.bind(this, "liveChat")}
              onClickButton2={this._setRightPanel.bind(this, "Posts")}
              onClickButton3={() => {}}
              />
          </div>
        );

        if (this.state.centerContent == "Wallet") {
          bottomMenuContainer = (
            <div
              style={tinyScreen? {height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#191a1f', borderTopColor: '#6d6d6d', borderStyle: 'groove', marginTop: -2, borderBottomWidth: 0, borderLeftWidth: 0, borderRightWidth: 0 } : {height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#191a1f', borderTopColor: '#6d6d6d', display: 'flex', borderBottomWidth: 0, borderLeftWidth: 0, borderRightWidth: 0, borderStyle: 'groove', marginTop: -2}}>
              <div style={{width: 379}}>
                <ButtonsGroup
                  title1=""
                  title2=""
                  title3=""
                  button1={Button2}
                  button2={Button21}
                  button3={Button22}
                  button4={Button23}
                  onClickButton1={this._setLeftPanel.bind(this, "liveFeed")}
                  onClickButton2={() => {}}
                  onClickButton3={() => {}}
                  />
              </div>
              <div style={{display: 'flex', flex: 0.33}}>
                <div style={{margin: 0, padding: 5, textAlign: "left", flex: 1}}>
                  {/*<div title={"LiveChat"} className = "circle-button" style = {{marginLeft: 20}}></div>
                  <div title={"Posts"} className = "circle-button" style = {{marginLeft: 10}}></div>
                  <div title={"Reserved"} className = "circle-button" style = {{marginLeft: 10}}></div>*/}
                </div>
              </div>
              <div style={{display: 'flex', flex: 0.33}}>
                <button className = "ant-btn"
                    onClick={this.props.send}
                    style={{marginRight: 10}}>
                    {counterpart.translate("header.payments")}
                </button>
                <button className = "ant-btn"
                    onClick={this.props.withdraw}
                    style={{marginLeft: 10}}>
                    {counterpart.translate("icons.withdraw")}
                </button>
                <button className = "ant-btn"
                    onClick={this.props.deposit}
                    style={{marginLeft: 10}}>
                    {counterpart.translate("icons.deposit.deposit")}
                </button>
              </div>
              <div style={{display: 'flex', flex: 0.33}}>

              </div>
              <div style={{width: 378, display: 'flex', alignItems: 'center'}}>
                {rightPanelMenu}
                <div style={{margin: 0, padding: 5, textAlign: "right"}}>
                  {bottomRightMenu}
                </div>
              </div>
            </div>
          );
        } else if (this.state.centerContent == "Exchange") {
          bottomMenuContainer = (
            <div
              style={tinyScreen? {height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#191a1f', borderTopColor: '#6d6d6d', borderStyle: 'groove', marginTop: -2, borderBottomWidth: 0, borderLeftWidth: 0, borderRightWidth: 0 } : {height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#191a1f', borderTopColor: '#6d6d6d', display: 'flex', borderBottomWidth: 0, borderLeftWidth: 0, borderRightWidth: 0, borderStyle: 'groove', marginTop: -2}}>
              <div style={{width: 379}}>
                <ButtonsGroup
                  title1=""
                  title2=""
                  title3=""
                  button1={Button2}
                  button2={Button21}
                  button3={Button22}
                  button4={Button23}
                  onClickButton1={this._setLeftPanel.bind(this, "liveFeed")}
                  onClickButton2={() => {}}
                  onClickButton3={() => {}}
                  />
              </div>
              <div style={{display: 'flex', flex: 0.5, alignItems: 'center'}}>
                <div style={{margin: 0, padding: 5, textAlign: "left", flex: 1}}>
                  <ButtonsGroup
                    title1=""
                    title2=""
                    title3=""
                    button1={Button3}
                    button2={Button31}
                    button3={Button32}
                    button4={Button33}
                    onClickButton1={() => {}}
                    onClickButton2={() => {}}
                    onClickButton3={() => {}}
                    />
                </div>
                <button className = "ant-btn"
                    style={{marginRight: 4, backgroundColor: '#249624', borderColor: '#249624', color: 'white', borderRadius: 4}}
                    onClick={this.openBuyModal}>
                    {counterpart.translate("exchange.buy")}
                </button>
              </div>
              <div style={{display: 'flex', flex: 0.5}}>
                <button className = "ant-btn"
                     style={{marginLeft: 4, backgroundColor: '#FF0000', borderColor: '#FF0000', color: 'white', borderRadius: 4}}
                     onClick={this.openSellModal}>
                    {counterpart.translate("exchange.sell")}
                </button>
              </div>
              <div style={{width: 378, display: 'flex', alignItems: 'center'}}>
                {rightPanelMenu}
                <div style={{margin: 0, padding: 5, textAlign: "right"}}>
                  {bottomRightMenu}
                </div>
              </div>
            </div>
          );
        } else {
          bottomMenuContainer = (
            <div
              style={tinyScreen? {height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#191a1f', borderTopColor: '#6d6d6d', borderStyle: 'groove', marginTop: -2, borderBottomWidth: 0, borderLeftWidth: 0, borderRightWidth: 0 } : {height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#191a1f', borderTopColor: '#6d6d6d', display: 'flex', borderBottomWidth: 0, borderLeftWidth: 0, borderRightWidth: 0, borderStyle: 'groove', marginTop: -2}}>
              <div style={{width: 379}}>
                <ButtonsGroup
                  title1=""
                  title2=""
                  title3=""
                  button1={Button2}
                  button2={Button21}
                  button3={Button22}
                  button4={Button23}
                  onClickButton1={this._setLeftPanel.bind(this, "liveFeed")}
                  onClickButton2={() => {}}
                  onClickButton3={() => {}}
                  />
              </div>
              <div style={{display: 'flex', flex: 0.5}}>
                <div style={{margin: 0, padding: 5, textAlign: "left", flex: 1}}>
                  {/*<div title={"LiveChat"} className = "circle-button" style = {{marginLeft: 20}}></div>
                  <div title={"Posts"} className = "circle-button" style = {{marginLeft: 10}}></div>
                  <div title={"Reserved"} className = "circle-button" style = {{marginLeft: 10}}></div>*/}
                </div>

              </div>
              <div style={{display: 'flex', flex: 0.5}}>
              </div>
              <div style={{width: 378, display: 'flex', alignItems: 'center'}}>
                {rightPanelMenu}
                <div style={{margin: 0, padding: 5, textAlign: "right"}}>
                  {bottomRightMenu}
                </div>
              </div>
            </div>
          );
        }

        const autoSelectAPI = "wss://fake.automatic-selection.com";
        const {state, props} = this;
        const {synced} = props;
        const connected = !(this.props.rpc_connection_status === "closed");

        // Current Node Details
        // let activeNode = {name: 'sdf'};
        let nodes = this.props.defaults.apiServer;

        let currentNodeIndex = this.getCurrentNodeIndex.call(this);
        let activeNode = this.getNode(nodes[currentNodeIndex] || nodes[0]);
        if (activeNode.url == autoSelectAPI) {
            let nodeUrl = props.activeNode;
            currentNodeIndex = this.getNodeIndexByURL.call(this, nodeUrl);
            if (!!currentNodeIndex) {
                activeNode = this.getNode(nodes[currentNodeIndex]);
            } else {
                activeNode = this.getNode(nodes[0]);
            }
        }

        let block_height = this.props.dynGlobalObject.get("head_block_number");
        let version_match = APP_VERSION.match(/2\.0\.(\d\w+)/);
        let version = version_match
            ? `.${version_match[1]}`
            : ` ${APP_VERSION}`;
        let rc_match = APP_VERSION.match(/-rc[0-9]$/);
        if (rc_match) version += rc_match[0];
        let updateStyles = {display: "inline-block", verticalAlign: "top"};
        let logoProps = {};

        this._ensureConnectivity();
        if(this.state.hideTopAndBottomBar == undefined || this.state.hideTopAndBottomBar === true){
          if((window.location.href.split("/").length - 1 == 3 && !currentAccount ) || window.location.href.indexOf("land") !== -1) {
            return(<div></div>);
          } else {
            bottomMenuContainer = null;
          }
        }
        let footerImg = require("assets/pngs/TranscendOrdinary.png");
        return (
            <div style={{alignItems: 'center', justifyContent: 'center'}}>
                {!!routerTransitioner &&
                    routerTransitioner.isTransitionInProgress() && (
                        <LoadingIndicator
                            loadingText={routerTransitioner.getTransitionTarget()}
                        />
                    )}
                <ChoiceModal
                    showModal={this.showChoiceModal}
                    hideModal={this.hideChoiceModal}
                    visible={this.state.isChoiceModalVisible}
                    choices={[
                        {
                            translationKey: "connection.manual_reconnect",
                            callback: () => {
                                if (!this.props.synced) {
                                    this._triggerReconnect(false);
                                }
                            }
                        },
                        {
                            translationKey: "connection.manual_ping",
                            callback: () => {
                                if (!this.props.synced) {
                                    this.onAccess();
                                }
                            }
                        }
                    ]}
                >
                    <div>
                        <Translate
                            content="connection.out_of_sync"
                            out_of_sync_seconds={parseInt(
                                this.getBlockTimeDelta()
                            )}
                        />
                        <br />
                        <br />
                        <Translate content="connection.want_to_reconnect" />
                        {routerTransitioner.isAutoSelection() && (
                            <Translate
                                content="connection.automatic_reconnect"
                                reconnect_in_seconds={parseInt(
                                    this._getForceReconnectAfterSeconds()
                                )}
                            />
                        )}
                    </div>
                </ChoiceModal>
                {bottomMenuContainer}
                <div className="show-for-medium grid-block shrink footer" style={{height: 70}}>
                    <div className="align-justify grid-block">
                        <div className="grid-block">
                            <div
                                className="logo"
                                style={{
                                    fontSize: state.newVersion
                                        ? "0.9em"
                                        : "1em",
                                    cursor: state.newVersion
                                        ? "pointer"
                                        : "normal",
                                    marginTop: state.newVersion
                                        ? "-5px"
                                        : "0px",
                                    overflow: "hidden",
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                                onClick={
                                    state.newVersion
                                        ? this.downloadVersion.bind(this)
                                        : null
                                }
                                {...logoProps}
                            >
                                {state.newVersion && (
                                    <Icon
                                        name="download"
                                        title={counterpart.translate(
                                            "icons.download",
                                            {wallet_name: getWalletName()}
                                        )}
                                        style={{
                                            marginRight: "20px",
                                            marginTop: "10px",
                                            fontSize: "1.35em",
                                            display: "inline-block"
                                        }}
                                    />
                                )}
                                <span style={updateStyles}>
                                    <Translate
                                        content="footer.title"
                                        wallet_name={getWalletName()}
                                    />
                                    {__GIT_BRANCH__ === "staging" ? (
                                        <a
                                            href={`https://github.com/bitshares/bitshares-ui/commit/${version.trim()}`}
                                            className="version"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {version}
                                        </a>
                                    ) : (
                                        <span className="version">
                                            {version}
                                        </span>
                                    )}
                                </span>

                                {state.newVersion && (
                                    <Translate
                                        content="footer.update_available"
                                        style={{
                                            color: "#FCAB53",
                                            position: "absolute",
                                            top: "8px",
                                            left: "36px"
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                        {!!routerTransitioner &&
                            routerTransitioner.isBackgroundPingingInProgress() && (
                                <div
                                    onClick={() => {
                                        this.setState({
                                            showNodesPopup: !this.state
                                                .showNodesPopup
                                        });
                                    }}
                                    style={{
                                        cursor: "pointer"
                                    }}
                                    className="grid-block shrink txtlabel"
                                >
                                    {routerTransitioner.getBackgroundPingingTarget()}
                                    <div
                                        style={{
                                            marginTop: "0.4rem",
                                            marginLeft: "0.5rem"
                                        }}
                                    >
                                        <LoadingIndicator type="circle" />
                                    </div>
                                    &nbsp; &nbsp;
                                </div>
                            )}
                        {synced ? null : (
                            <div className="grid-block shrink txtlabel cancel">
                                <Translate content="footer.nosync" />
                                &nbsp; &nbsp;
                            </div>
                        )}
                        {!connected ? (
                            <div className="grid-block shrink txtlabel error">
                                <Translate content="footer.connection" />
                                &nbsp; &nbsp;
                            </div>
                        ) : null}
                        {this.props.backup_recommended ? (
                            <span>
                                <div className="grid-block">
                                    <a
                                        className="shrink txtlabel facolor-alert"
                                        data-tip="Please understand that you are responsible for making your own backup&hellip;"
                                        data-type="warning"
                                        onClick={this.onBackup.bind(this)}
                                    >
                                        <Translate content="footer.backup" />
                                    </a>
                                    &nbsp;&nbsp;
                                </div>
                            </span>
                        ) : null}
                        {this.props.backup_brainkey_recommended ? (
                            <span>
                                <div className="grid-block">
                                    <a
                                        className="grid-block shrink txtlabel facolor-alert"
                                        onClick={this.onBackupBrainkey.bind(
                                            this
                                        )}
                                    >
                                        <Translate content="footer.brainkey" />
                                    </a>
                                    &nbsp;&nbsp;
                                </div>
                            </span>
                        ) : null}
                        {block_height ? (
                            <div className="grid-block shrink">
                                <div
                                    onClick={() => {
                                        this.setState({
                                            showNodesPopup: !this.state
                                                .showNodesPopup
                                        });
                                    }}
                                    style={{
                                        position: "relative",
                                        cursor: "pointer",
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div className="footer-status">
                                        {!connected ? (
                                            <span className="warning">
                                                <Translate content="footer.disconnected" />
                                            </span>
                                        ) : (
                                            <span className="success">
                                                {activeNode.name}
                                            </span>
                                        )}
                                    </div>
                                    <div className="footer-block">
                                        <span>
                                            <span className="footer-block-title" style={{display:"none"}}>
                                                <Translate content="footer.latency" />
                                            </span>
                                            &nbsp;
                                            {/*!connected
                                                ? "-"
                                                : !activeNode.ping
                                                    ? "-"
                                                    : activeNode.ping + "ms"*/}
                                            &nbsp;&nbsp;
                                            <span className="footer-block-title">
                                                <Translate content="footer.block" />
                                            </span>
                                            &nbsp;#
                                            {block_height}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid-block shrink">
                                <Translate content="footer.loading" />
                            </div>
                        )}
                    </div>
                </div>
                <div
                    onMouseLeave={() => {
                        this.setState({showNodesPopup: false});
                    }}
                    className="node-access-popup"
                    style={{display: this.state.showNodesPopup ? "none" : "none"}}
                >
                    <AccessSettings
                        nodes={this.props.defaults.apiServer}
                        popup={true}
                    />
                    <div style={{paddingTop: 15, display: 'none'}}>
                        <a onClick={this.onAccess.bind(this)}>
                            <Translate content="footer.advanced_settings" />
                        </a>
                    </div>
                </div>

                <ReportModal
                    showModal={this.showReportModal}
                    hideModal={this.hideReportModal}
                    visible={this.state.isReportModalVisible}
                    refCallback={e => {
                        if (e) this.reportModal = e;
                    }}
                />
              <div style={{position: 'absolute', left: 0, right: 0, bottom: 23, textAlign: 'center'}}>
                  <img src={footerImg} style={{height: 20}}/>
                </div>
            </div>
        );
    }

}

Footer = BindToChainState(Footer);

class AltFooter extends Component {
    render() {
        var wallet = WalletDb.getWallet();
        return (
            <AltContainer
                stores={[
                    CachedPropertyStore,
                    BlockchainStore,
                    WalletDb,
                    SettingsStore
                ]}
                inject={{
                    defaults: () => {
                        return SettingsStore.getState().defaults;
                    },
                    apiLatencies: () => {
                        return SettingsStore.getState().apiLatencies;
                    },
                    currentNode: () => {
                        return SettingsStore.getState().settings.get(
                            "apiServer"
                        );
                    },
                    activeNode: () => {
                        return SettingsStore.getState().settings.get(
                            "activeNode"
                        );
                    },
                    backup_recommended: () =>
                        wallet &&
                        (!wallet.backup_date ||
                            CachedPropertyStore.get("backup_recommended")),
                    rpc_connection_status: () =>
                        BlockchainStore.getState().rpc_connection_status
                }}
            >
                <Footer {...this.props} />
            </AltContainer>
        );
    }
}

export default AltFooter;
