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

import BackgroundChain from '../../assets/pngs/icon_chain_finanacing.png';
import BackgroundCommunity from '../../assets/pngs/icon_community.png';
import BackgroundExchange from '../../assets/pngs/icon_exchange.png';
import BackgroundGreen from '../../assets/pngs/icon_green.png';
import BackgroundWallet from '../../assets/pngs/icon_wallet.png';

import {getLogo} from "branding";
var logo = getLogo();

// const FlagImage = ({flag, width = 20, height = 20}) => {
//     return <img height={height} width={width} src={`${__BASE_URL__}language-dropdown/${flag.toUpperCase()}.png`} />;
// };

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
            isScreensaverModalVisible: false
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
    }

    componentWillUnmount() {
        if (this.unlisten) {
            this.unlisten();
            this.unlisten = null;
        }

        document.body.removeEventListener("click", this.onBodyClick);
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
            nextProps.location.pathname !== this.props.location.pathname
        );
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
    _onNavigate(route, page, e) {

        if(e) {
            e.preventDefault();
        }
        if(page === "chainFinancing") {
          return;
        }
        // Set Accounts Tab as active tab
        if (route == "/accounts") {
            SettingsActions.changeViewSetting({
                dashboardEntry: "accounts"
            });
        }

        this.props.history.push(route);
        this._closeDropdown();
        if(route.indexOf("market/") !== -1) {
          this.props.setCenterPanelContent(page);
        }
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

        const hasLocalWallet = !!WalletDb.getWallet();

        if (!hasLocalWallet) return false;

        this.setState({
            accountsListDropdownActive: !this.state.accountsListDropdownActive
        });
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

    renderTitle(title) {
      if(window.innerWidth <= 1199) {
        return;
      }
      switch (title) {
        case "Dashboard":
          return(
            <li><div style={{color:"#888888", fontSize:"30px",paddingTop:"1px", zIndex: 9}}><Translate content="header.dashboard" /></div></li>
          );
          break;
        case "Exchange":
          return(
            <li><div style={{color:"#888888", fontSize:"30px",paddingTop:"1px", zIndex: 9}}><Translate content="header.exchange" /></div></li>
          );
          break;
        case "Wallet":
          return(
            <li><div style={{color:"#888888", fontSize:"30px",paddingTop:"1px", zIndex: 9}}><Translate content="wallet.title" /></div></li>
          );
          break;
        case "chainFinancing":
          return(
            <li><div style={{color:"#888888", fontSize:"30px",paddingTop:"1px", zIndex: 9}}><Translate content="header.chainFinancing" /></div></li>
          );
          break;
        case "Community":
          return(
            <li><div style={{color:"#888888", fontSize:"30px",paddingTop:"1px", zIndex: 9}}><Translate content="header.community" /></div></li>
          );
          break;
        default:

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
                    onClick={this._toggleAccountDropdownMenu}
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
                style={{paddingTop:"0px",paddingBottom:"0px"}}
                onClick={this._onNavigate.bind(this, "/")}
            >
                <img style={{margin: 0, height: 30}} src={logo} />
            </a>
        );

        let createAccountLink = myAccountCount === 0 ? true : null;

        // let lock_unlock = ((!!this.props.current_wallet) || passwordLogin) ? (
        //     <div className="grp-menu-item" >
        //     { this.props.locked ?
        //         <a style={{padding: "1rem"}} href onClick={this._toggleLock.bind(this)} data-class="unlock-tooltip" data-offset="{'left': 50}" data-tip={locked_tip} data-place="bottom" data-html><Icon className="icon-14px" name="locked" title="icons.locked.common" /></a>
        //         : <a style={{padding: "1rem"}} href onClick={this._toggleLock.bind(this)} data-class="unlock-tooltip" data-offset="{'left': 50}" data-tip={unlocked_tip} data-place="bottom" data-html><Icon className="icon-14px" name="unlocked" title="icons.unlocked.common" /></a> }
        //     </div>
        // ) : null;

        let tradeUrl = this.props.lastMarket
            ? `/market/${this.props.lastMarket}`
            : "/market/SKYRUS.BTC_SKX";

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


        return (
            <div
              className="header-small-container"
              style={{minHeight: "30px", height:"30px !important", flex: 1, position: 'relative'}}
            >
                <div style={{width: '100%', position: 'absolute'}}>
                    <div
                        className="header menu-group primary"
                        style={{flexWrap: "nowrap", justifyContent: "center", background:"none"}}
                    >
                        <ul className="menu-bar" style={{background:"none"}}>
                            {/*<li>{dashboard}</li>*/}
                            {this.renderTitle(this.props.title)}
                        </ul>
                    </div>
                </div>
                <div
                    className="truncated active-account"
                    style={{cursor: "pointer"}}
                >
                </div>
                <div style={{zIndex: 2}}>
                    <a
                        style={{flexFlow: "row"}}
                        title={counterpart.translate("header.exchange")}
                        onClick={this._onNavigate.bind(
                            this,
                            tradeUrl,
                            "Exchange"
                        )}
                    >
                        <div
                          style={{
                            width: 30,
                            height: 15,
                            marginLeft: 10,
                            backgroundImage: "url(" + BackgroundExchange + ")",
                            backgroundPosition: 'center',
                            backgroundSize: 'cover',
                            backgroundRepeat: 'no-repeat'}}>
                        </div>
                    </a>
                </div>
                <div style={{zIndex: 2}}>
                    <a
                        style={{flexFlow: "row"}}
                        title={counterpart.translate("header.chainFinancing")}
                        onClick={this._onNavigate.bind(
                            this,
                            tradeUrl,
                            "chainFinancing"
                        )}
                    >
                    <div
                      style={{
                        width: 30,
                        height: 15,
                        marginLeft: 10,
                        backgroundImage: "url(" + BackgroundChain + ")",
                        backgroundPosition: 'center',
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat'}}>
                    </div>
                    </a>
                </div>
                <div style={{zIndex: 2}}>
                    {this.props.currentAccount == null ? null : (
                        <a
                            style={{flexFlow: "row"}}
                            onClick={this._onNavigate.bind(
                                this,
                                tradeUrl,
                                "Wallet"
                            )}
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
                            title={counterpart.translate("wallet.title")}
                        >
                        <div
                          style={{
                            width: 30,
                            height: 15,
                            marginLeft: 10,
                            backgroundImage: "url(" + BackgroundWallet + ")",
                            backgroundPosition: 'center',
                            backgroundSize: 'cover',
                            backgroundRepeat: 'no-repeat'}}>
                        </div>
                      </a>
                    )}
                </div>
                <div style={{zIndex: 2}}>
                    <a
                        style={{flexFlow: "row"}}
                        title={counterpart.translate("header.community")}
                        onClick={this._onNavigate.bind(
                            this,
                            tradeUrl,
                            "Community"
                        )}
                    >
                    <div
                      style={{
                        width: 30,
                        height: 15,
                        marginLeft: 10,
                        backgroundImage: "url(" + BackgroundCommunity + ")",
                        backgroundPosition: 'center',
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat'}}>
                    </div>
                    </a>
                </div>
                <div style={{zIndex: 2}}>
                    <a
                        style={{flexFlow: "row"}}
                    >
                    <div
                      style={{
                        width: 30,
                        height: 15,
                        marginLeft: 10,
                        backgroundImage: "url(" + BackgroundGreen + ")",
                        backgroundPosition: 'center',
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat'}}>
                    </div>
                    </a>
                </div>
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
