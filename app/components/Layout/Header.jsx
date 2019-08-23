import React from "react";
import {Link} from "react-router-dom";
import {connect} from "alt-react";
import AccountActions from "actions/AccountActions";
import AccountStore from "stores/AccountStore";
import SettingsStore from "stores/SettingsStore";
import SettingsActions from "actions/SettingsActions";
import ZfApi from "react-foundation-apps/src/utils/foundation-api";
import SendModal from "../Modal/SendModal";
import DepositModal from "../Modal/DepositModal";
import GatewayStore from "stores/GatewayStore";
import Icon from "../Icon/Icon";
import Translate from "react-translate-component";
import counterpart from "counterpart";
import WalletDb from "stores/WalletDb";
import WalletUnlockStore from "stores/WalletUnlockStore";
import WalletUnlockActions from "actions/WalletUnlockActions";
import WalletManagerStore from "stores/WalletManagerStore";
import cnames from "classnames";
import TotalBalanceValue from "../Utility/TotalBalanceValue";
import ReactTooltip from "react-tooltip";
import {Apis} from "bitsharesjs-ws";
import AccountImage from "../Account/AccountImage";
import {ChainStore} from "bitsharesjs";
import WithdrawModal from "../Modal/WithdrawModalNew";
import {List} from "immutable";
import DropDownMenu from "./HeaderDropdown";
import {withRouter} from "react-router-dom";
import {Notification} from "bitshares-ui-style-guide";
import AccountBrowsingMode from "../Account/AccountBrowsingMode";
import {setLocalStorageType, isPersistantType} from "lib/common/localStorage";
import ScreensaverModal from "../Modal/ScreensaverModal";
import HeaderSmall from "../Layout/HeaderSmall";
import ButtonsGroup from "../Layout/ButtonsGroup";
import Button1 from '../../assets/pngs/icon_bt1.png';
import Button11 from '../../assets/pngs/icon_bt11.png';
import Button12 from '../../assets/pngs/icon_bt12.png';
import Button13 from '../../assets/pngs/icon_bt13.png';

import fire from "../firebase";
const database = fire.database();

import {getLogo} from "branding";
var logo = getLogo();


const SUBMENUS = {
    SETTINGS: "SETTINGS"
};

class Header extends React.Component {
    constructor(props) {
        super();
        this.state = {
            active: props.location.pathname,
            accountsListDropdownActive: false,
            dropdownActive: false,
            dropdownSubmenuActive: false,
            isDepositModalVisible: false,
            isWithdrawModalVisible: false,
            isScreensaverModalVisible: false,
            leftPanelContent: 'market'
        };

        this.unlisten = null;
        this._toggleAccountDropdownMenu = this._toggleAccountDropdownMenu.bind(
            this
        );
        this._toggleDropdownMenu = this._toggleDropdownMenu.bind(this);
        this._closeDropdown = this._closeDropdown.bind(this);
        this._closeDropdownSubmenu = this._closeDropdownSubmenu.bind(this);
        this._toggleDropdownSubmenu = this._toggleDropdownSubmenu.bind(this);
        this._closeMenuDropdown = this._closeMenuDropdown.bind(this);
        this._closeAccountsListDropdown = this._closeAccountsListDropdown.bind(
            this
        );

        this.showScreensaverModal = this.showScreensaverModal.bind(this);
        this.hideScreensaverModal = this.hideScreensaverModal.bind(this);

        this.showDepositModal = this.showDepositModal.bind(this);
        this.hideDepositModal = this.hideDepositModal.bind(this);

        this.showWithdrawModal = this.showWithdrawModal.bind(this);
        this.hideWithdrawModal = this.hideWithdrawModal.bind(this);

        this.onBodyClick = this.onBodyClick.bind(this);
        this.setCenterPanelContent = this.setCenterPanelContent.bind(this);
        this.isCalledGetProfile = false;
    }

    setCenterPanelContent(page) {
      this.props.setCenterPanelContent(page);
    }

    showScreensaverModal() {
        this.setState({
            isScreensaverModalVisible: true
        });
    }

    hideScreensaverModal() {
        this.setState({
            isScreensaverModalVisible: false
        });
    }

    showDepositModal() {
        this.setState({
            isDepositModalVisible: true
        });
    }

    hideDepositModal() {
        this.props.hideDepositModal();
        this.setState({
            isDepositModalVisible: false
        });
    }

    showWithdrawModal() {
        this.setState({
            isWithdrawModalVisible: true
        });
    }

    hideWithdrawModal() {
        this.props.hideWithdrawModal();
        this.setState({
            isWithdrawModalVisible: false
        });
    }

    componentWillMount() {
        this.unlisten = this.props.history.listen(newState => {
            if (this.unlisten && this.state.active !== newState.pathname) {
                this.setState({
                    active: newState.pathname
                });
            }
        });
    }

    componentDidMount() {
        setTimeout(() => {
            ReactTooltip.rebuild();
        }, 1250);

        document.body.addEventListener("click", this.onBodyClick, {
            capture: false,
            passive: true
        });
        this.getUserProfile();
    }

    componentWillUnmount() {
        if (this.unlisten) {
            this.unlisten();
            this.unlisten = null;
        }

        document.body.removeEventListener("click", this.onBodyClick);
    }

    componentWillUpdate(nextProps, nextState) {
      if(this.props.isWithdrawModalVisible !== nextProps.isWithdrawModalVisible || this.props.isDepositModalVisible !== nextProps.isDepositModalVisible) {
          this.setState({isWithdrawModalVisible: nextProps.isWithdrawModalVisible, isDepositModalVisible: nextProps.isDepositModalVisible});
      }
      if(!this.props.isWithdrawModalVisible && nextProps.isShowSendModalVisible) {
        if (this.send_modal) this.send_modal.show();
        this._closeDropdown();
        this.props.hideSendModal();
      }
      this.getUserProfile();
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            nextProps.myActiveAccounts !== this.props.myActiveAccounts ||
            nextProps.currentAccount !== this.props.currentAccount ||
            nextProps.passwordLogin !== this.props.passwordLogin ||
            nextProps.locked !== this.props.locked ||
            nextProps.current_wallet !== this.props.current_wallet ||
            nextProps.lastMarket !== this.props.lastMarket ||
            nextProps.starredAccounts !== this.props.starredAccounts ||
            nextProps.currentLocale !== this.props.currentLocale ||
            nextState.active !== this.state.active ||
            nextState.hiddenAssets !== this.props.hiddenAssets ||
            nextState.dropdownActive !== this.state.dropdownActive ||
            nextState.dropdownSubmenuActive !==
                this.state.dropdownSubmenuActive ||
            nextState.accountsListDropdownActive !==
                this.state.accountsListDropdownActive ||
            nextProps.height !== this.props.height ||
            nextProps.location.pathname !== this.props.location.pathname ||
            nextProps.isDepositModalVisible !== this.props.isDepositModalVisible ||
            nextProps.isWithdrawModalVisible !== this.props.isWithdrawModalVisible ||
            nextProps.isShowSendModalVisible !== this.props.isShowSendModalVisible
        );
    }

    componentDidUpdate() {
      if(this.props.currentAccount !== null && this.props.currentAccount !== undefined) {
        this.props.setCurrentAccount(this.props.currentAccount, this.state.user);
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
      if(this.currentAccount == null || this.isCalledGetProfile) {
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
          this.props.setCurrentAccount(this.props.currentAccount, this.state.user);
        }
      });
    }

    _showScreensaver(e) {
        e.preventDefault();
        this.showScreensaverModal();
        this._closeDropdown();
    }

    _showSend(e) {
        e.preventDefault();
        if (this.send_modal) this.send_modal.show();
        this._closeDropdown();
    }

    _showDeposit(e) {
        e.preventDefault();
        this.showDepositModal();
        this._closeDropdown();
    }

    _showWithdraw(e) {
        e.preventDefault();
        this._closeDropdown();
        this.showWithdrawModal();
    }

    _triggerMenu(e) {
        e.preventDefault();
        ZfApi.publish("mobile-menu", "toggle");
    }

    logout(e) {
      if(e !== undefined) {
        e.preventDefault();
      }
      if (!WalletDb.isLocked()) {
          WalletUnlockActions.lock();
          if (!WalletUnlockStore.getState().rememberMe) {
              if (!isPersistantType()) {
                  setLocalStorageType("persistant");
              }
              AccountStore.tryToSetCurrentAccount();
          }
      }
    }

    _toggleLock(e) {
        if(e !== undefined) {
          e.preventDefault();
        }
        if (WalletDb.isLocked()) {
            WalletUnlockActions.unlock()
                .then(() => {
                    AccountActions.tryToSetCurrentAccount();
                })
                .catch(() => {});
        } else {
            WalletUnlockActions.lock();
            if (!WalletUnlockStore.getState().rememberMe) {
                if (!isPersistantType()) {
                    setLocalStorageType("persistant");
                }
                AccountStore.tryToSetCurrentAccount();
            }
        }
        this._closeDropdown();
    }

    _onNavigate(route, e) {
        e.preventDefault();

        // Set Accounts Tab as active tab
        if (route == "/accounts") {
            SettingsActions.changeViewSetting({
                dashboardEntry: "accounts"
            });
        } else if (route == "/land") {
          this.logout();
        }

        this.props.history.push(route);
        this._closeDropdown();
    }

    _closeAccountsListDropdown() {
        if (this.state.accountsListDropdownActive) {
            this.setState({
                accountsListDropdownActive: false
            });
        }
    }

    _closeMenuDropdown() {
        if (this.state.dropdownActive) {
            this.setState({
                dropdownActive: false
            });
        }
    }

    _closeDropdownSubmenu() {
        if (this.state.dropdownSubmenuActive) {
            this.setState({
                dropdownSubmenuActive: false
            });
        }
    }

    _closeDropdown() {
        this._closeMenuDropdown();
        this._closeAccountsListDropdown();
        this._closeDropdownSubmenu();
    }

    _onGoBack(e) {
        e.preventDefault();
        window.history.back();
    }

    _onGoForward(e) {
        e.preventDefault();
        window.history.forward();
    }

    _accountClickHandler(account_name, e) {
        e.preventDefault();
        ZfApi.publish("account_drop_down", "close");
        if (this.props.location.pathname.indexOf("/account/") !== -1) {
            let currentPath = this.props.location.pathname.split("/");
            currentPath[2] = account_name;
            this.props.history.push(currentPath.join("/"));
        }
        if (account_name !== this.props.currentAccount) {
            AccountActions.setCurrentAccount.defer(account_name);
            Notification.success({
                message: counterpart.translate("header.account_notify", {
                    account: account_name
                })
            });
            this._closeDropdown();
        }
    }

    _toggleAccountDropdownMenu() {
        // prevent state toggling if user cannot have multiple accounts
        this.setState({
            accountsListDropdownActive: !this.state.accountsListDropdownActive
        });
        const hasLocalWallet = !!WalletDb.getWallet();

        if (!hasLocalWallet) return false;
    }

    _toggleDropdownSubmenu(item = this.state.dropdownSubmenuActiveItem, e) {
        if (e) e.stopPropagation();

        this.setState({
            dropdownSubmenuActive: !this.state.dropdownSubmenuActive,
            dropdownSubmenuActiveItem: item
        });
    }

    _toggleDropdownMenu() {
        this.setState({
            dropdownActive: !this.state.dropdownActive
        });
    }

    _setLeftPanel(content){
      this.setState({leftPanelContent: content});
      this.props.selectLeftPanelLayout(content);
    }

    onBodyClick(e) {
        let el = e.target;
        let insideMenuDropdown = false;
        let insideAccountDropdown = false;

        do {
            if (
                el.classList &&
                el.classList.contains("account-dropdown-wrapper")
            ) {
                insideAccountDropdown = true;
                break;
            }

            if (
                el.classList &&
                el.classList.contains("menu-dropdown-wrapper")
            ) {
                insideMenuDropdown = true;
                break;
            }
        } while ((el = el.parentNode));

        if (!insideAccountDropdown) this._closeAccountsListDropdown();
        if (!insideMenuDropdown) {
            this._closeMenuDropdown();
            this._closeDropdownSubmenu();
        }
    }

    toggleAccount() {
      if(this.state.user == null) {
        return;
      }
      const currentAccountRef = database.ref('users/' + this.props.currentAccount + '/currentAccount');
      let nextAccount;
      if(this.state.user.currentAccount == undefined || this.state.user.currentAccount == null || this.state.user.currentAccount == "user") {
        nextAccount = "avatar";
      } else {
        nextAccount = "user";
      }
      currentAccountRef.set(nextAccount);
    }

    renderAccountImage() {
      if(this.state.user == null) {
        return;
      }
      let defaultAvatar = require("assets/icons/default-avatar.png");
      if(this.state.user.currentAccount == null || this.state.user.currentAccount == undefined || this.state.user.currentAccount == "" || this.state.user.currentAccount == "user") {
        return(
          <div style={{display: 'flex'}}>
            <img
              src={this.state.user == null || this.state.user.userImage == null || this.state.user.userImage == undefined || this.state.user.userImage == '' ? defaultAvatar : this.state.user.userImage}
              style={{borderRadius:"50%", border: "none", width: "30px", height: "30px", backgroundColor: "#777777", marginRight:"3px"}}
              onClick={() => {this._toggleAccountDropdownMenu();}}
            />
            <div className="text account-name" style={{display: 'flex', marginRight: 20, justifyContent: 'center', alignItems: 'center'}} onClick={() => {this._toggleAccountDropdownMenu();}}>
                <span>
                    {this.state.user === null ? "" : (this.state.user.userName !== null && this.state.user.userName !== undefined && this.state.user.userName !== 'undefined' ? this.state.user.userName : this.state.user.id )}
                </span>
                <AccountBrowsingMode
                    location={this.props.location}
                    usernameViewIcon={true}
                />
            </div>
          </div>
        );
      } else {
        return(
          <div style={{display: 'flex'}}>
            <img
              src={this.state.user == null || this.state.user.avatarImage == null || this.state.user.avatarImage == undefined || this.state.user.avatarImage == '' ? defaultAvatar : this.state.user.avatarImage}
              style={{borderRadius:"50%", border: "none", width: "30px", height: "30px", backgroundColor: "#777777", marginRight:"3px"}}
              onClick={() => {this._toggleAccountDropdownMenu();}}
            />
            <div className="text account-name" style={{display: 'flex', marginRight: 20, justifyContent: 'center', alignItems: 'center'}} onClick={() => {this._toggleAccountDropdownMenu();}}>
                <span>
                  {this.state.user === null ? "" : (this.state.user.avatarName !== null && this.state.user.avatarName !== undefined && this.state.user.avatarName !== 'undefined' ? this.state.user.avatarName : this.state.user.id )}
                </span>
                <AccountBrowsingMode
                    location={this.props.location}
                    usernameViewIcon={true}
                />
            </div>
          </div>
        );
      }
    }

    render() {
        let {active} = this.state;
        let {
            currentAccount,
            starredAccounts,
            passwordLogin,
            passwordAccount,
            height
        } = this.props;
        let defaultAvatar = require("assets/icons/default-avatar.png");
        let tradingAccounts = AccountStore.getMyAccounts();
        let maxHeight = Math.max(40, height - 67 - 36) + "px";

        const a = ChainStore.getAccount(currentAccount);
        const showAccountLinks = !!a;
        const isMyAccount = !a
            ? false
            : AccountStore.isMyAccount(a) ||
              (passwordLogin && currentAccount === passwordAccount);
        const enableDepositWithdraw =
            !!a &&
            Apis.instance() &&
            Apis.instance().chain_id &&
            Apis.instance().chain_id.substr(0, 8) === "2843a40a";

        if (starredAccounts.size) {
            for (let i = tradingAccounts.length - 1; i >= 0; i--) {
                if (!starredAccounts.has(tradingAccounts[i])) {
                    tradingAccounts.splice(i, 1);
                }
            }
            starredAccounts.forEach(account => {
                if (tradingAccounts.indexOf(account.name) === -1) {
                    tradingAccounts.push(account.name);
                }
            });
        }

        let myAccounts = AccountStore.getMyAccounts();
        let myAccountCount = myAccounts.length;

        let walletBalance =
            myAccounts.length && this.props.currentAccount ? (
                <div
                    className="total-value"
                >
                    <TotalBalanceValue.AccountWrapper
                        hiddenAssets={this.props.hiddenAssets}
                        accounts={List([this.props.currentAccount])}
                        noTip
                        style={{minHeight: 15}}
                    />
                </div>
            ) : null;

        let dashboard = (
            <a
                className={cnames("logo", {
                    active:
                        active === "/" ||
                        (active.indexOf("dashboard") !== -1 &&
                            active.indexOf("account") === -1)
                })}
                onClick={this._onNavigate.bind(this, "/")}
            >
                <img style={{margin: 0, height: 40}} src={logo} />
            </a>
        );

        let createAccountLink = myAccountCount === 0 ? true : null;

        let tradeUrl = this.props.lastMarket
            ? `/market/${this.props.lastMarket}`
            : "/market/SKYRUS.BTC_SKX";

        // Account selector: Only active inside the exchange
        let account_display_name, accountsList;
        if (currentAccount) {
            account_display_name =
                currentAccount.length > 20
                    ? `${currentAccount.slice(0, 20)}..`
                    : currentAccount;
            if (tradingAccounts.indexOf(currentAccount) < 0 && isMyAccount) {
                tradingAccounts.push(currentAccount);
            }
            if (tradingAccounts.length >= 1) {
                accountsList = tradingAccounts
                    .sort()
                    .filter(name => name !== currentAccount)
                    .map(name => {
                        return (
                            <li
                                key={name}
                                className={cnames({
                                    active:
                                        active
                                            .replace("/account/", "")
                                            .indexOf(name) === 0
                                })}
                                onClick={this._accountClickHandler.bind(
                                    this,
                                    name
                                )}
                            >
                                <div
                                    style={{paddingTop: 0}}
                                    className="table-cell"
                                >
                                    <AccountImage
                                        style={{position: "relative", top: 4}}
                                        size={{height: 20, width: 20}}
                                        account={name}
                                    />
                                </div>
                                <div
                                    className="table-cell"
                                    style={{paddingLeft: 10}}
                                >
                                    <a
                                        className={
                                            "text lower-case" +
                                            (name === account_display_name
                                                ? " current-account"
                                                : "")
                                        }
                                    >
                                        {name}
                                    </a>
                                </div>
                            </li>
                        );
                    });
            }
        }

        let hamburger = this.state.dropdownActive ? (
            <Icon
                className="icon-14px"
                name="hamburger-x"
                title="icons.hamburger_x"
            />
        ) : (
            <Icon
                className="icon-14px"
                name="hamburger"
                title="icons.hamburger"
            />
        );
        const hasLocalWallet = !!WalletDb.getWallet();

        /* Dynamic Menu Item */
        let dynamicMenuItem;
        if (active.indexOf("transfer") !== -1) {
            dynamicMenuItem = (
                <a style={{flexFlow: "row"}} className={cnames({active: true})}>
                    <Icon
                        size="1_5x"
                        style={{position: "relative", top: 0, left: -8}}
                        name="transfer"
                        title="icons.transfer"
                    />
                    <Translate
                        className="column-hide-small"
                        component="span"
                        content="header.payments"
                    />
                </a>
            );
        }
        if (active.indexOf("settings") !== -1) {
            dynamicMenuItem = (
                <a
                    style={{flexFlow: "row"}}
                    className={cnames({
                        active: active.indexOf("settings") !== -1
                    })}
                >
                    <Icon
                        size="1_5x"
                        style={{position: "relative", top: 0, left: -8}}
                        name="cogs"
                        title="icons.cogs"
                    />
                    <Translate
                        className="column-hide-small"
                        component="span"
                        content="header.settings"
                    />
                </a>
            );
        }
        if (active.indexOf("deposit-withdraw") !== -1) {
            dynamicMenuItem = (
                <a
                    style={{flexFlow: "row"}}
                    className={cnames({
                        active: active.indexOf("deposit-withdraw") !== -1
                    })}
                >
                    <Icon
                        size="1_5x"
                        style={{position: "relative", top: 0, left: -8}}
                        name="deposit"
                        title="icons.deposit.deposit_withdraw"
                    />
                    <Translate
                        className="column-hide-small"
                        component="span"
                        content="header.deposit-withdraw"
                    />
                </a>
            );
        }
        if (active.indexOf("news") !== -1) {
            dynamicMenuItem = (
                <a
                    style={{flexFlow: "row"}}
                    className={cnames({active: active.indexOf("news") !== -1})}
                >
                    <Icon
                        size="1_5x"
                        style={{position: "relative", top: 0, left: -8}}
                        name="news"
                        title="icons.news"
                    />
                    <Translate
                        className="column-hide-small"
                        component="span"
                        content="news.news"
                    />
                </a>
            );
        }
        if (active.indexOf("help") !== -1) {
            dynamicMenuItem = (
                <a
                    style={{flexFlow: "row"}}
                    className={cnames({active: active.indexOf("help") !== -1})}
                >
                    <Icon
                        size="1_5x"
                        style={{position: "relative", top: 0, left: -8}}
                        name="question-circle"
                        title="icons.question_circle"
                    />
                    <Translate
                        className="column-hide-small"
                        component="span"
                        content="header.help"
                    />
                </a>
            );
        }
        if (active.indexOf("/voting") !== -1) {
            dynamicMenuItem = (
                <a
                    style={{flexFlow: "row"}}
                    className={cnames({
                        active: active.indexOf("/voting") !== -1
                    })}
                >
                    <Icon
                        size="1_5x"
                        style={{position: "relative", top: 0, left: -8}}
                        name="thumbs-up"
                        title="icons.thumbs_up"
                    />
                    <Translate
                        className="column-hide-small"
                        component="span"
                        content="account.voting"
                    />
                </a>
            );
        }
        if (
            active.indexOf("/assets") !== -1 &&
            active.indexOf("explorer") === -1
        ) {
            dynamicMenuItem = (
                <a
                    style={{flexFlow: "row"}}
                    className={cnames({
                        active: active.indexOf("/assets") !== -1
                    })}
                >
                    <Icon
                        size="1_5x"
                        style={{position: "relative", top: 0, left: -8}}
                        name="assets"
                        title="icons.assets"
                    />
                    <Translate
                        className="column-hide-small"
                        component="span"
                        content="explorer.assets.title"
                    />
                </a>
            );
        }
        if (active.indexOf("/signedmessages") !== -1) {
            dynamicMenuItem = (
                <a
                    style={{flexFlow: "row"}}
                    className={cnames({
                        active: active.indexOf("/signedmessages") !== -1
                    })}
                >
                    <Icon
                        size="1_5x"
                        style={{position: "relative", top: 0, left: -8}}
                        name="text"
                        title="icons.text.signed_messages"
                    />
                    <Translate
                        className="column-hide-small"
                        component="span"
                        content="account.signedmessages.menuitem"
                    />
                </a>
            );
        }
        if (active.indexOf("/member-stats") !== -1) {
            dynamicMenuItem = (
                <a
                    style={{flexFlow: "row"}}
                    className={cnames({
                        active: active.indexOf("/member-stats") !== -1
                    })}
                >
                    <Icon
                        size="1_5x"
                        style={{position: "relative", top: 0, left: -8}}
                        name="text"
                        title="icons.text.membership_stats"
                    />
                    <Translate
                        className="column-hide-small"
                        component="span"
                        content="account.member.stats"
                    />
                </a>
            );
        }
        if (active.indexOf("/vesting") !== -1) {
            dynamicMenuItem = (
                <a
                    style={{flexFlow: "row"}}
                    className={cnames({
                        active: active.indexOf("/vesting") !== -1
                    })}
                >
                    <Icon
                        size="1_5x"
                        style={{position: "relative", top: 0, left: -8}}
                        name="hourglass"
                        title="icons.hourglass"
                    />
                    <Translate
                        className="column-hide-small"
                        component="span"
                        content="account.vesting.title"
                    />
                </a>
            );
        }
        if (active.indexOf("/whitelist") !== -1) {
            dynamicMenuItem = (
                <a
                    style={{flexFlow: "row"}}
                    className={cnames({
                        active: active.indexOf("/whitelist") !== -1
                    })}
                >
                    <Icon
                        size="1_5x"
                        style={{position: "relative", top: 0, left: -8}}
                        name="list"
                        title="icons.list"
                    />
                    <Translate
                        className="column-hide-small"
                        component="span"
                        content="account.whitelist.title"
                    />
                </a>
            );
        }
        if (active.indexOf("/permissions") !== -1) {
            dynamicMenuItem = (
                <a
                    style={{flexFlow: "row"}}
                    className={cnames({
                        active: active.indexOf("/permissions") !== -1
                    })}
                >
                    <Icon
                        size="1_5x"
                        style={{position: "relative", top: 0, left: -8}}
                        name="warning"
                        title="icons.warning"
                    />
                    <Translate
                        className="column-hide-small"
                        component="span"
                        content="account.permissions"
                    />
                </a>
            );
        }

        const submenus = {
            [SUBMENUS.SETTINGS]: (
                <ul
                    className="dropdown header-menu header-submenu"
                    style={{
                        left: -200,
                        top: 64,
                        maxHeight: !this.state.dropdownActive ? 0 : maxHeight,
                        overflowY: "auto"
                    }}
                >
                    <li
                        className="divider parent-item"
                        onClick={this._toggleDropdownSubmenu.bind(
                            this,
                            undefined
                        )}
                    >
                        <div className="table-cell">
                            <span className="parent-item-icon">&lt;</span>
                            <Translate
                                content="header.settings"
                                component="span"
                                className="parent-item-name"
                            />
                        </div>
                    </li>
                    <li
                        onClick={this._onNavigate.bind(
                            this,
                            "/settings/general"
                        )}
                    >
                        <Translate
                            content="settings.general"
                            component="div"
                            className="table-cell"
                        />
                    </li>
                    {!this.props.settings.get("passwordLogin") && (
                        <li
                            onClick={this._onNavigate.bind(
                                this,
                                "/settings/wallet"
                            )}
                        >
                            <Translate
                                content="settings.wallet"
                                component="div"
                                className="table-cell"
                            />
                        </li>
                    )}
                    <li
                        onClick={this._onNavigate.bind(
                            this,
                            "/settings/accounts"
                        )}
                    >
                        <Translate
                            content="settings.accounts"
                            component="div"
                            className="table-cell"
                        />
                    </li>

                    {!this.props.settings.get("passwordLogin") && [
                        <li
                            key={"settings.password"}
                            onClick={this._onNavigate.bind(
                                this,
                                "/settings/password"
                            )}
                        >
                            <Translate
                                content="settings.password"
                                component="div"
                                className="table-cell"
                            />
                        </li>,
                        <li
                            key={"settings.backup"}
                            onClick={this._onNavigate.bind(
                                this,
                                "/settings/backup"
                            )}
                        >
                            <Translate
                                content="settings.backup"
                                component="div"
                                className="table-cell"
                            />
                        </li>
                    ]}
                    <li
                        onClick={this._onNavigate.bind(
                            this,
                            "/settings/restore"
                        )}
                    >
                        <Translate
                            content="settings.restore"
                            component="div"
                            className="table-cell"
                        />
                    </li>
                    <li
                        onClick={this._onNavigate.bind(
                            this,
                            "/settings/access"
                        )}
                    >
                        <Translate
                            content="settings.access"
                            component="div"
                            className="table-cell"
                        />
                    </li>
                    <li
                        onClick={this._onNavigate.bind(
                            this,
                            "/settings/faucet_address"
                        )}
                    >
                        <Translate
                            content="settings.faucet_address"
                            component="div"
                            className="table-cell"
                        />
                    </li>
                    <li
                        onClick={this._onNavigate.bind(this, "/settings/reset")}
                    >
                        <Translate
                            content="settings.reset"
                            component="div"
                            className="table-cell"
                        />
                    </li>
                </ul>
            )
        };
        let leftHeader;
        let smallScreen = window.innerWidth < 1200 ? true : false;
        let tinyScreen = window.innerWidth < 640 ? true : false;
        if(!tinyScreen) {
          leftHeader = (
            <ButtonsGroup
              title1={counterpart.translate("account.bts_market")}
              title2={counterpart.translate("icons.news")}
              title3={counterpart.translate("header.dashboard")}
              button1={Button1}
              button2={Button11}
              button3={Button12}
              button4={Button13}
              onClickButton1={this._setLeftPanel.bind(this, "market")}
              onClickButton2={() => {}}
              onClickButton3={this._setLeftPanel.bind(this, "dashboard")}
              />
          );
        }

        let accountMenu = [];
        if(this.state.user) {
          if(this.state.user.currentAccount == undefined || this.state.user.currentAccount == null || this.state.user.currentAccount == "user") {
            accountMenu.push(
              <li
                  key="account"
                  className={cnames({
                      active: true
                  })}
                  onClick={this.toggleAccount.bind(this)}
              >
                <img
                  onClick={() => {console.log("sdfsdf")}}
                  src={this.state.user == null || this.state.user.avatarImage == null || this.state.user.avatarImage == undefined || this.state.user.avatarImage == '' ? defaultAvatar : this.state.user.avatarImage}
                  style={{borderRadius:"50%", border: "none", width: "25px", height: "25px", backgroundColor: "#777777", marginRight:"3px"}}
                />
                <span onClick={this.toggleAccount.bind(this)} style={{height: 30, padding: "0.5rem", display: "inline-block"}}>
                  {this.state.user === null || this.state.user.avatarName === null ? "" : this.state.user.avatarName || this.state.user.id}
                </span>
              </li>
            );
          } else {
            accountMenu.push(
              <li
                  key="account"
                  className={cnames({
                      active: true
                  })}
                  onClick={() => {this.toggleAccount();}}
              >
                <img
                  className="hover-icon"
                  src={this.state.user == null || this.state.user.userImage == null || this.state.user.userImage == undefined || this.state.user.userImage == '' ? defaultAvatar : this.state.user.userImage}
                  style={{borderRadius:"50%", border: "none", width: "25px", height: "25px", backgroundColor: "#777777", marginRight:"3px"}}
                />
                <span style={{height: 30, padding: "0.5rem", display: "inline-block"}}>
                  {this.state.user === null || this.state.user.userName === null ? "" : this.state.user.userName || this.state.user.id}
                </span>

              </li>
            );
          }
        }

        accountMenu.push(
          <li
              key="balance"
              className={cnames({
                  active: true
              })}
          >
              {walletBalance}
          </li>
        );

        let topMenuContainer;
        if ((!currentAccount && window.location.href.split("/").length - 1 == 3) || window.location.href.indexOf("create-account") !== -1 || window.location.href.indexOf("/land") > -1 || window.location.href.indexOf("/policy") > -1) {
          topMenuContainer = null;
        } else if (currentAccount && window.location.href.split("/").length - 1 == 3) {
          topMenuContainer = (
            <div
              style={tinyScreen? {borderBottom:"1px solid #333333", position: 'absolute', left: 0, right: 0, bottom: 0, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#191a1f', borderTopColor: '#6d6d6d', borderTopWidth: 1} : {borderBottom:"1px solid #333333", position: 'absolute', left: 0, right: 0, bottom: 0, height: 40, backgroundColor: '#191a1f', borderTopColor: '#6d6d6d', borderTopWidth: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <HeaderSmall
                height={"20px"}
                title={window.location.href.split("/").length - 1 == 3 ? "Dashboard" : this.props.centerContent}
                setCenterPanelContent={this.setCenterPanelContent}
              />
            <div style={{display: 'flex', width: 377}}>
                <div>
                    <div
                        className="header menu-group primary"
                        style={{flexWrap: "nowrap", justifyContent: "none"}}
                    >
                        {__ELECTRON__ ? (
                            <div className="grid-block show-for-medium shrink electron-navigation">
                                <ul className="menu-bar" style={{borderBottom:"1px solid #333333", display:"none"}}>
                                    <li>
                                        <div
                                            style={{
                                                marginLeft: "1rem",
                                                height: "3rem"
                                            }}
                                        >
                                            <div
                                                style={{marginTop: "0.5rem"}}
                                                onClick={this._onGoBack.bind(
                                                    this
                                                )}
                                                className="button outline small"
                                            >
                                                {"<"}
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div
                                            style={{
                                                height: "3rem",
                                                marginLeft: "0.5rem",
                                                marginRight: "0.75rem"
                                            }}
                                        >
                                            <div
                                                style={{marginTop: "0.5rem"}}
                                                onClick={this._onGoForward.bind(
                                                    this
                                                )}
                                                className="button outline small"
                                            >
                                                >
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        ) : null}

                        <ul className="menu-bar" style={{borderBottom:"1px solid #333333", display:"none"}}>
                            <li>{dashboard}</li>
                            {!currentAccount || !!createAccountLink ? null : (
                                <li>
                                    <Link
                                        style={{flexFlow: "row"}}
                                        to={`/account/${currentAccount}`}
                                        className={cnames({
                                            active:
                                                active.indexOf("account/") !==
                                                    -1 &&
                                                active.indexOf("/account/") !==
                                                    -1 &&
                                                active.indexOf("/assets") ===
                                                    -1 &&
                                                active.indexOf("/voting") ===
                                                    -1 &&
                                                active.indexOf(
                                                    "/signedmessages"
                                                ) === -1 &&
                                                active.indexOf(
                                                    "/member-stats"
                                                ) === -1 &&
                                                active.indexOf("/vesting") ===
                                                    -1 &&
                                                active.indexOf("/whitelist") ===
                                                    -1 &&
                                                active.indexOf(
                                                    "/permissions"
                                                ) === -1
                                        })}
                                    >
                                        <Icon
                                            size="1_5x"
                                            style={{
                                                position: "relative",
                                                top: -2,
                                                left: -8
                                            }}
                                            name="dashboard"
                                            title="icons.dashboard"
                                        />
                                        <Translate
                                            className="column-hide-small"
                                            content="header.dashboard"
                                        />
                                    </Link>
                                </li>
                            )}
                            <li>
                                <a
                                    style={{flexFlow: "row"}}
                                    className={cnames(
                                        active.indexOf("market/") !== -1
                                            ? null
                                            : "column-hide-xxs",
                                        {
                                            active:
                                                active.indexOf("market/") !== -1
                                        }
                                    )}
                                    onClick={this._onNavigate.bind(
                                        this,
                                        tradeUrl
                                    )}
                                >
                                    <Icon
                                        size="1_5x"
                                        style={{
                                            position: "relative",
                                            top: -2,
                                            left: -8
                                        }}
                                        name="exchange"
                                        title="icons.trade.exchange"
                                    />
                                    <Translate
                                        className="column-hide-small"
                                        component="span"
                                        content="header.exchange"
                                    />
                                </a>
                            </li>
                            <li>
                                <a
                                    style={{flexFlow: "row", display:"none"}}
                                    className={cnames(
                                        active.indexOf("explorer") !== -1
                                            ? null
                                            : "column-hide-xs",
                                        {
                                            active:
                                                active.indexOf("explorer") !==
                                                -1
                                        }
                                    )}
                                    onClick={this._onNavigate.bind(
                                        this,
                                        "/explorer/blocks"
                                    )}
                                >
                                    <Icon
                                        size="2x"
                                        style={{
                                            position: "relative",
                                            top: 0,
                                            left: -8
                                        }}
                                        name="list"
                                        title="icons.list"
                                    />
                                    <Translate
                                        className="column-hide-small"
                                        component="span"
                                        content="header.explorer"
                                    />
                                </a>
                            </li>
                            {/* Dynamic Menu Item */}
                            <li>{dynamicMenuItem}</li>
                        </ul>
                    </div>
                </div>
                <div style={{flex: 1}}>
                </div>
                <div
                  className={cnames(
                          "truncated active-account menu-dropdown-wrapper dropdown-wrapper",
                          {active: this.state.accountsListDropdownActive}
                      )}
                  style={{cursor: "pointer", padding: 0}}
                >
                    <AccountBrowsingMode location={this.props.location} />
                    <div style={{display: 'flex'}}>
                      {this.renderAccountImage()}
                    </div>

                    {(
                        <ul
                            className="dropdown header-menu"
                            style={{
                                right: 0,
                                maxHeight: !this.state
                                    .accountsListDropdownActive
                                    ? 0
                                    : maxHeight,
                                overflowY: "auto",
                                position: "absolute",
                                width: "16em"
                            }}
                        >
                            {accountMenu}
                        </ul>
                    )}

                    {hasLocalWallet && (
                        <ul
                            className="dropdown header-menu local-wallet-menu"
                            style={{
                                right: 0,
                                maxHeight: !this.state
                                    .accountsListDropdownActive
                                    ? 0
                                    : maxHeight,
                                overflowY: "auto",
                                position: "absolute",
                                width: "20em"
                            }}
                        >
                            <li
                                className={cnames(
                                    {
                                        active:
                                            active.indexOf("/accounts") !== -1
                                    },
                                    "divider"
                                )}
                                onClick={this._onNavigate.bind(
                                    this,
                                    "/accounts"
                                )}
                            >
                                <div className="table-cell">
                                    <Icon
                                        size="2x"
                                        name="people"
                                        title="icons.manage_accounts"
                                    />
                                </div>
                                <div className="table-cell">
                                    <Translate content="header.accounts_manage" />
                                </div>
                            </li>
                            {accountsList}
                        </ul>
                    )}
                </div>
                <div>
                    {this.props.currentAccount == null ? null : (
                        <span
                            onClick={this._toggleLock.bind(this)}
                            style={{cursor: "pointer", verticalAlign: "-webkit-baseline-middle"}}
                        >
                            <Icon
                                className="lock-unlock"
                                size="1x"
                                name={this.props.locked ? "locked" : "unlocked"}
                                title={
                                    this.props.locked
                                        ? counterpart.translate("icons.locked.common")
                                        : counterpart.translate("icons.unlocked.common")
                                }
                            />
                        </span>
                    )}
                </div>
                <div>
                    {
                        <span
                            onClick={this.props.toggleLayout}
                            style={{cursor: "pointer", marginLeft: "10px"}}
                        >
                            <Icon
                                className="lock-unlock"
                                size="1_5x"
                                name={"server"}
                                title={counterpart.translate("header.screensaver")}
                            />
                        </span>
                    }
                </div>

                <div className="app-menu" style={{marginTop: -7}}>
                    <div
                        onClick={this._toggleDropdownMenu}
                        className={cnames(
                            "menu-dropdown-wrapper dropdown-wrapper",
                            {active: this.state.dropdownActive}
                        )}
                    >
                        <div className="hamburger" style={{marginRight: 10}}>{hamburger}</div>

                        {(this.state.dropdownSubmenuActive &&
                            submenus[this.state.dropdownSubmenuActiveItem] &&
                            submenus[this.state.dropdownSubmenuActiveItem]) || (
                            <DropDownMenu
                                dropdownActive={this.state.dropdownActive}
                                toggleLock={this._toggleLock.bind(this)}
                                maxHeight={maxHeight}
                                locked={this.props.locked}
                                active={active}
                                passwordLogin={passwordLogin}
                                onNavigate={this._onNavigate.bind(this)}
                                isMyAccount={isMyAccount}
                                contacts={this.props.contacts}
                                showAccountLinks={showAccountLinks}
                                tradeUrl={tradeUrl}
                                currentAccount={currentAccount}
                                enableDepositWithdraw={enableDepositWithdraw}
                                showDeposit={this._showDeposit.bind(this)}
                                showWithdraw={this._showWithdraw.bind(this)}
                                showSend={this._showSend.bind(this)}
                                toggleDropdownSubmenu={this._toggleDropdownSubmenu.bind(
                                    this,
                                    SUBMENUS.SETTINGS
                                )}
                            />
                        )}
                    </div>
                </div>
              </div>
            </div>
          );
        } else {
          topMenuContainer = (
            <div
              style={tinyScreen? {borderBottom:"1px solid #333333", position: 'absolute', left: 0, right: 0, bottom: 0, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#191a1f', borderTopColor: '#6d6d6d', borderTopWidth: 1} : {borderBottom:"1px solid #333333", position: 'absolute', left: 0, right: 0, bottom: 0, height: 40, backgroundColor: '#191a1f', borderTopColor: '#6d6d6d', borderTopWidth: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{width: "100%",margin: 0, padding: 5, textAlign: "left", width: 377}}>
                {leftHeader}
              </div>
              <HeaderSmall
                height={"20px"}
                title={window.location.href.split("/").length - 1 == 3 ? "Dashboard" : this.props.centerContent}
                setCenterPanelContent={this.setCenterPanelContent}
              />
            <div style={{display: 'flex', width: 377}}>
                <div>
                    <div
                        className="header menu-group primary"
                        style={{flexWrap: "nowrap", justifyContent: "none"}}
                    >
                        {__ELECTRON__ ? (
                            <div className="grid-block show-for-medium shrink electron-navigation">
                                <ul className="menu-bar" style={{borderBottom:"1px solid #333333", display:"none"}}>
                                    <li>
                                        <div
                                            style={{
                                                marginLeft: "1rem",
                                                height: "3rem"
                                            }}
                                        >
                                            <div
                                                style={{marginTop: "0.5rem"}}
                                                onClick={this._onGoBack.bind(
                                                    this
                                                )}
                                                className="button outline small"
                                            >
                                                {"<"}
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div
                                            style={{
                                                height: "3rem",
                                                marginLeft: "0.5rem",
                                                marginRight: "0.75rem"
                                            }}
                                        >
                                            <div
                                                style={{marginTop: "0.5rem"}}
                                                onClick={this._onGoForward.bind(
                                                    this
                                                )}
                                                className="button outline small"
                                            >
                                                >
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        ) : null}

                        <ul className="menu-bar" style={{borderBottom:"1px solid #333333", display:"none"}}>
                            <li>{dashboard}</li>
                            {!currentAccount || !!createAccountLink ? null : (
                                <li>
                                    <Link
                                        style={{flexFlow: "row"}}
                                        to={`/account/${currentAccount}`}
                                        className={cnames({
                                            active:
                                                active.indexOf("account/") !==
                                                    -1 &&
                                                active.indexOf("/account/") !==
                                                    -1 &&
                                                active.indexOf("/assets") ===
                                                    -1 &&
                                                active.indexOf("/voting") ===
                                                    -1 &&
                                                active.indexOf(
                                                    "/signedmessages"
                                                ) === -1 &&
                                                active.indexOf(
                                                    "/member-stats"
                                                ) === -1 &&
                                                active.indexOf("/vesting") ===
                                                    -1 &&
                                                active.indexOf("/whitelist") ===
                                                    -1 &&
                                                active.indexOf(
                                                    "/permissions"
                                                ) === -1
                                        })}
                                    >
                                        <Icon
                                            size="1_5x"
                                            style={{
                                                position: "relative",
                                                top: -2,
                                                left: -8
                                            }}
                                            name="dashboard"
                                            title="icons.dashboard"
                                        />
                                        <Translate
                                            className="column-hide-small"
                                            content="header.dashboard"
                                        />
                                    </Link>
                                </li>
                            )}
                            <li>
                                <a
                                    style={{flexFlow: "row"}}
                                    className={cnames(
                                        active.indexOf("market/") !== -1
                                            ? null
                                            : "column-hide-xxs",
                                        {
                                            active:
                                                active.indexOf("market/") !== -1
                                        }
                                    )}
                                    onClick={this._onNavigate.bind(
                                        this,
                                        tradeUrl
                                    )}
                                >
                                    <Icon
                                        size="1_5x"
                                        style={{
                                            position: "relative",
                                            top: -2,
                                            left: -8
                                        }}
                                        name="exchange"
                                        title="icons.trade.exchange"
                                    />
                                    <Translate
                                        className="column-hide-small"
                                        component="span"
                                        content="header.exchange"
                                    />
                                </a>
                            </li>
                            <li>
                                <a
                                    style={{flexFlow: "row", display:"none"}}
                                    className={cnames(
                                        active.indexOf("explorer") !== -1
                                            ? null
                                            : "column-hide-xs",
                                        {
                                            active:
                                                active.indexOf("explorer") !==
                                                -1
                                        }
                                    )}
                                    onClick={this._onNavigate.bind(
                                        this,
                                        "/explorer/blocks"
                                    )}
                                >
                                    <Icon
                                        size="2x"
                                        style={{
                                            position: "relative",
                                            top: 0,
                                            left: -8
                                        }}
                                        name="list"
                                        title="icons.list"
                                    />
                                    <Translate
                                        className="column-hide-small"
                                        component="span"
                                        content="header.explorer"
                                    />
                                </a>
                            </li>
                            {/* Dynamic Menu Item */}
                            <li>{dynamicMenuItem}</li>
                        </ul>
                    </div>
                </div>

                <div
                  className={cnames(
                          "truncated active-account menu-dropdown-wrapper dropdown-wrapper",
                          {active: this.state.accountsListDropdownActive}
                      )}
                  style={{cursor: "pointer", padding: 0}}
                >
                    <AccountBrowsingMode location={this.props.location} />
                    <div style={{display: 'flex'}}>
                      {this.renderAccountImage()}
                    </div>

                    {(
                        <ul
                            className="dropdown header-menu"
                            style={{
                                right: 0,
                                maxHeight: !this.state
                                    .accountsListDropdownActive
                                    ? 0
                                    : maxHeight,
                                overflowY: "auto",
                                position: "absolute",
                                width: "16em"
                            }}
                        >
                            {accountMenu}
                        </ul>
                    )}

                    {hasLocalWallet && (
                        <ul
                            className="dropdown header-menu local-wallet-menu"
                            style={{
                                right: 0,
                                maxHeight: !this.state
                                    .accountsListDropdownActive
                                    ? 0
                                    : maxHeight,
                                overflowY: "auto",
                                position: "absolute",
                                width: "20em"
                            }}
                        >
                            <li
                                className={cnames(
                                    {
                                        active:
                                            active.indexOf("/accounts") !== -1
                                    },
                                    "divider"
                                )}
                                onClick={this._onNavigate.bind(
                                    this,
                                    "/accounts"
                                )}
                            >
                                <div className="table-cell">
                                    <Icon
                                        size="2x"
                                        name="people"
                                        title="icons.manage_accounts"
                                    />
                                </div>
                                <div className="table-cell">
                                    <Translate content="header.accounts_manage" />
                                </div>
                            </li>
                            {accountsList}
                        </ul>
                    )}
                </div>
                <div>
                    {this.props.currentAccount == null ? null : (
                        <span
                            onClick={this._toggleLock.bind(this)}
                            style={{cursor: "pointer", verticalAlign: "-webkit-baseline-middle"}}
                        >
                            <Icon
                                className="lock-unlock"
                                size="1x"
                                name={this.props.locked ? "locked" : "unlocked"}
                                title={
                                    this.props.locked
                                        ? counterpart.translate("icons.locked.common")
                                        : counterpart.translate("icons.unlocked.common")
                                }
                            />
                        </span>
                    )}
                </div>
                <div>
                    {
                        <span
                            onClick={this.props.toggleLayout}
                            style={{cursor: "pointer", marginLeft: "10px"}}
                        >
                            <Icon
                                className="lock-unlock"
                                size="1_5x"
                                name={"server"}
                                title={counterpart.translate("header.screensaver")}
                            />
                        </span>
                    }
                </div>

                <div className="app-menu" style={{marginTop: -7}}>
                    <div
                        onClick={this._toggleDropdownMenu}
                        className={cnames(
                            "menu-dropdown-wrapper dropdown-wrapper",
                            {active: this.state.dropdownActive}
                        )}
                    >
                        <div className="hamburger" style={{marginRight: 10}}>{hamburger}</div>

                        {(this.state.dropdownSubmenuActive &&
                            submenus[this.state.dropdownSubmenuActiveItem] &&
                            submenus[this.state.dropdownSubmenuActiveItem]) || (
                            <DropDownMenu
                                dropdownActive={this.state.dropdownActive}
                                toggleLock={this._toggleLock.bind(this)}
                                maxHeight={maxHeight}
                                locked={this.props.locked}
                                active={active}
                                passwordLogin={passwordLogin}
                                onNavigate={this._onNavigate.bind(this)}
                                isMyAccount={isMyAccount}
                                contacts={this.props.contacts}
                                showAccountLinks={showAccountLinks}
                                tradeUrl={tradeUrl}
                                currentAccount={currentAccount}
                                enableDepositWithdraw={enableDepositWithdraw}
                                showDeposit={this._showDeposit.bind(this)}
                                showWithdraw={this._showWithdraw.bind(this)}
                                showSend={this._showSend.bind(this)}
                                toggleDropdownSubmenu={this._toggleDropdownSubmenu.bind(
                                    this,
                                    SUBMENUS.SETTINGS
                                )}
                            />
                        )}
                    </div>
                </div>
              </div>
            </div>
          );
        }
        let headerImg = require("assets/pngs/Skyrus.png");
        return (
            <div style={{position: 'relative'}}>
              <div
                className="header-container"
                style={topMenuContainer == null?
                  {height: "0px", borderBottom:"0px solid #333333", opacity:"0"}
                  : {height: "110px", borderBottom:"1px solid #333333", opacity:"0"}}
              >
                  <SendModal
                      id="send_modal_header"
                      refCallback={e => {
                          if (e) this.send_modal = e;
                      }}
                      from_name={currentAccount}
                  />

                  <ScreensaverModal
                      visible={this.state.isScreensaverModalVisible}
                      hideModal={this.hideScreensaverModal}
                      showModal={this.showScreensaverModal}
                      ref="screensaver_modal_new"
                      modalId="screensaver_modal_new"
                  />
                  <DepositModal
                      visible={this.state.isDepositModalVisible}
                      hideModal={this.hideDepositModal}
                      showModal={this.showDepositModal}
                      ref="deposit_modal_new"
                      modalId="deposit_modal_new"
                      account={currentAccount}
                      backedCoins={this.props.backedCoins}
                  />
                  <WithdrawModal
                      visible={this.state.isWithdrawModalVisible}
                      hideModal={this.hideWithdrawModal}
                      showModal={this.showWithdrawModal}
                      ref="withdraw_modal_new"
                      modalId="withdraw_modal_new"
                      backedCoins={this.props.backedCoins}
                  />
              </div>
              <div style={{position: 'absolute', left: 0, right: 0, bottom: 58, textAlign: 'center'}}>
                <img src={headerImg} style={{height: 32}}/>
              </div>
              {topMenuContainer}
            </div>
        );
    }
}

Header = connect(
    Header,
    {
        listenTo() {
            return [
                AccountStore,
                WalletUnlockStore,
                WalletManagerStore,
                SettingsStore,
                GatewayStore
            ];
        },
        getProps() {
            const chainID = Apis.instance().chain_id;
            return {
                backedCoins: GatewayStore.getState().backedCoins,
                myActiveAccounts: AccountStore.getState().myActiveAccounts,
                currentAccount:
                    AccountStore.getState().currentAccount ||
                    AccountStore.getState().passwordAccount,
                passwordAccount: AccountStore.getState().passwordAccount,
                locked: WalletUnlockStore.getState().locked,
                current_wallet: WalletManagerStore.getState().current_wallet,
                lastMarket: SettingsStore.getState().viewSettings.get(
                    `lastMarket${chainID ? "_" + chainID.substr(0, 8) : ""}`
                ),
                starredAccounts: AccountStore.getState().starredAccounts,
                passwordLogin: SettingsStore.getState().settings.get(
                    "passwordLogin"
                ),
                currentLocale: SettingsStore.getState().settings.get("locale"),
                hiddenAssets: SettingsStore.getState().hiddenAssets,
                settings: SettingsStore.getState().settings,
                locales: SettingsStore.getState().defaults.locale,
                contacts: AccountStore.getState().accountContacts
            };
        }
    }
);

export default withRouter(Header);
