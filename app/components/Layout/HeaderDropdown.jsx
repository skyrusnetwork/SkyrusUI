import React from "react";
import Icon from "../Icon/Icon";
import Translate from "react-translate-component";
import cnames from "classnames";
import AccountActions from "actions/AccountActions";
import {Notification} from "bitshares-ui-style-guide";

export default class HeaderDropdown extends React.Component {
    shouldComponentUpdate(np) {
        let shouldUpdate = false;
        for (let key in np) {
            if (typeof np[key] === "function") continue;
            shouldUpdate = shouldUpdate || np[key] !== this.props[key];
        }
        return shouldUpdate;
    }

    _onAddContact() {
        AccountActions.addAccountContact(this.props.currentAccount);
    }

    _onRemoveContact() {
        AccountActions.removeAccountContact(this.props.currentAccount);
    }

    openBuyIco() {
      Notification.info({
          message: "This will activate on 23 AUG 2019, 0800HRS (GMT+8) in landing page"
      });
      return;
      var win = window.open('https://smartwallet.skyrus.io', '_blank');
      win.focus();
    }

    render() {
        const {
            dropdownActive,
            toggleLock,
            maxHeight,
            locked,
            active,
            passwordLogin,
            isMyAccount,
            showAccountLinks,
            tradeUrl,
            enableDepositWithdraw,
            currentAccount,
            contacts
        } = this.props;

        let isContact = contacts.has(currentAccount);

        return (
            <ul
                className="dropdown header-menu"
                style={{
                    left: -200,
                    top: 32,
                    maxHeight: !dropdownActive ? 0 : maxHeight,
                    overflowY: "auto"
                }}
            >
                <li
                    className={cnames({
                        active: true
                    })}
                    onClick={this.props.onNavigate.bind(this, "/land")}
                >
                    <div className="table-cell">
                        <Icon size="2x" name="ic-home" title="LandingPage" />
                    </div>
                    <div className="table-cell">
                        Landing Page
                    </div>
                </li>
                <li className="divider" onClick={toggleLock}>
                    <div className="table-cell">
                        <Icon size="2x" name="power" title="icons.power" />
                    </div>
                    <div className="table-cell">
                        <Translate
                            content={`header.${
                                this.props.locked
                                    ? "unlock_short"
                                    : "lock_short"
                            }`}
                        />
                    </div>
                </li>

                {locked ? (
                    <li
                        className={cnames({
                            active:
                                active.indexOf(
                                    `/create-account/${
                                        !passwordLogin ? "wallet" : "password"
                                    }`
                                ) !== -1
                        })}
                        onClick={this.props.onNavigate.bind(
                            this,
                            `/create-account/${
                                !passwordLogin ? "wallet" : "password"
                            }`
                        )}
                    >
                        <div className="table-cell">
                            <Icon
                                size="2x"
                                name="user"
                                title="icons.user.create_account"
                            />
                        </div>
                        <div className="table-cell">
                            <Translate content="header.create_account" />
                        </div>
                    </li>
                ) : null}

                {!this.props.locked ? (
                    <li
                        className={cnames({
                            active: active.indexOf("/account") !== -1
                        })}
                        onClick={this.props.onNavigate.bind(
                            this,
                            `/`
                        )}
                    >
                        <div className="table-cell">
                            <Icon
                                size="2x"
                                name="dashboard"
                                title="icons.dasboard"
                            />
                        </div>
                        <div className="table-cell">
                            <Translate content="header.dashboard" />
                        </div>
                    </li>
                ) : null}

                {!isMyAccount && showAccountLinks ? (
                    <li
                        className="divider"
                        onClick={this[
                            isContact ? "_onRemoveContact" : "_onAddContact"
                        ].bind(this)}
                    >
                        <div className="table-cell">
                            <Icon
                                size="2x"
                                name={`${isContact ? "minus" : "plus"}-circle`}
                                title={
                                    isContact
                                        ? "icons.minus_circle.remove_contact"
                                        : "icons.plus_circle.add_contact"
                                }
                            />
                        </div>
                        <div className="table-cell">
                            <Translate
                                content={`account.${
                                    isContact ? "unfollow" : "follow"
                                }`}
                            />
                        </div>
                    </li>
                ) : null}

                <li
                    className={cnames(
                        {
                            active: active.indexOf("/market/") !== -1
                        },
                        "column-show-small"
                    )}
                    onClick={this.props.onNavigate.bind(this, tradeUrl)}
                >
                    <div className="table-cell">
                        <Icon
                            size="2x"
                            name="trade"
                            title="icons.trade.exchange"
                        />
                    </div>
                    <div className="table-cell">
                        <Translate content="header.exchange" />
                    </div>
                </li>

                <li
                    className={cnames(
                        {
                            active: active.indexOf("/explorer") !== -1
                        },
                        "column-show-small"
                    )}
                    onClick={this.props.onNavigate.bind(
                        this,
                        "/explorer/blocks"
                    )}
                >
                    <div className="table-cell">
                        <Icon size="2x" name="server" title="icons.server" />
                    </div>
                    <div className="table-cell">
                        <Translate content="header.explorer" />
                    </div>
                </li>

                {[
                    {
                        icon: {
                            name: "transfer",
                            title: "icons.transfer"
                        },
                        disabled: !showAccountLinks,
                        mainText: "header.payments",
                        mainCallback: this.props.showSend,
                        //subText: "header.payments_legacy",
                        //subURL: "/transfer"
                    },
                    {
                        icon: {
                            name: "deposit",
                            title: "icons.deposit.deposit"
                        },
                        disabled: !enableDepositWithdraw,
                        mainText: "icons.deposit.deposit",
                        mainCallback: this.props.showDeposit,
                        //subText: "header.deposit_legacy",
                        //subURL: "/deposit-withdraw"
                    },
                    {
                        icon: {
                            name: "withdraw",
                            title: "icons.withdraw"
                        },
                        disabled: !enableDepositWithdraw,
                        mainText: "icons.withdraw",
                        mainCallback: this.props.showWithdraw,
                        //subText: "header.withdraw_legacy",
                        //subURL: "/deposit-withdraw"
                    }
                ].map(
                    (
                        {
                            icon,
                            subURL,
                            disabled,
                            mainText,
                            subText,
                            mainCallback
                        },
                        index
                    ) => (
                        <li
                            key={index}
                            className={cnames({
                                active: active.indexOf(subURL) !== -1,
                                disabled
                            })}
                            onClick={
                                disabled
                                    ? event => {
                                          event.stopPropagation();
                                      }
                                    : mainCallback
                            }
                        >
                            <div className="table-cell">
                                <Icon size="2x" {...icon} />
                            </div>
                            <div className="table-cell">
                                <Translate content={mainText} />{" "}
                                <span
                                    onClick={
                                        disabled
                                            ? () => {}
                                            : event => {
                                                  event.stopPropagation();
                                                  this.props.onNavigate.bind(
                                                      this,
                                                      subURL
                                                  )(event);
                                              }
                                    }
                                    className={cnames(
                                        "header-dropdown-sub-link",
                                        {enabled: !disabled}
                                    )}
                                >
                                    <Translate content={subText} />
                                </span>
                            </div>
                        </li>
                    )
                )}

                {/* <li
                    className={cnames(
                        {
                            active: active.indexOf("/settings") !== -1
                        },
                        "divider",
                        "desktop-only"
                    )}
                    onClick={this.props.onNavigate.bind(this, "/settings")}
                >
                    <div className="table-cell">
                        <Icon size="2x" name="cogs" title="icons.cogs" />
                    </div>
                    <div className="table-cell">
                        <Translate content="header.settings" />{" "}
                    </div>
                </li> */}

                {/* <li
                    className={cnames(
                        {
                            active: active.indexOf("/settings") !== -1
                        },
                        "divider",
                        "mobile-only",
                        "has-submenu"
                    )}
                    onClick={this.props.toggleDropdownSubmenu}
                >
                    <div className="table-cell">
                        <Icon size="2x" name="cogs" title="icons.cogs" />
                    </div>
                    <div className="table-cell">
                        <Translate content="header.settings" />{" "}
                    </div>
                </li> */}

                <li style={{display:"none"}}
                    className={cnames({
                        active: active.indexOf("/news") !== -1
                    })}
                    onClick={this.props.onNavigate.bind(this, "/news")}
                >
                    <div className="table-cell">
                        <Icon size="2x" name="news" title="icons.news" />
                    </div>
                    <div className="table-cell">
                        <Translate content="news.news" />
                    </div>
                </li>

                <li style={{display:"none"}}
                    className={cnames(
                        {
                            active:
                                active.indexOf(
                                    "/help/introduction/skyrus"
                                ) !== -1
                        },
                        "divider"
                    )}
                    onClick={this.props.onNavigate.bind(
                        this,
                        "/help/introduction/skyrus"
                    )}
                >
                    <div className="table-cell">
                        <Icon
                            size="2x"
                            name="question-circle"
                            title="icons.question_circle"
                        />
                    </div>
                    <div className="table-cell">
                        <Translate content="header.help" />
                    </div>
                </li>

                <li style={{display:"none"}}
                    className={cnames({
                        active: active.indexOf("/voting") !== -1,
                        disabled: !showAccountLinks
                    })}
                    onClick={this.props.onNavigate.bind(
                        this,
                        `/account/${currentAccount}/voting`
                    )}
                >
                    <div className="table-cell">
                        <Icon
                            size="2x"
                            name="thumbs-up"
                            title="icons.thumbs_up"
                        />
                    </div>
                    <div className="table-cell">
                        <Translate content="account.voting" />
                    </div>
                </li>

                <li style={{display:"none"}}
                    className={cnames({
                        active:
                            active.indexOf("/assets") !== -1 &&
                            active.indexOf("/account/") !== -1,
                        disabled: !showAccountLinks
                    })}
                    onClick={this.props.onNavigate.bind(
                        this,
                        `/account/${currentAccount}/assets`
                    )}
                >
                    <div className="table-cell">
                        <Icon size="2x" name="assets" title="icons.assets" />
                    </div>
                    <div className="table-cell">
                        <Translate content="explorer.assets.title" />
                    </div>
                </li>

                <li style={{display:"none"}}
                    className={cnames({
                        active: active.indexOf("/signedmessages") !== -1,
                        disabled: !showAccountLinks
                    })}
                    onClick={this.props.onNavigate.bind(
                        this,
                        `/account/${currentAccount}/signedmessages`
                    )}
                >
                    <div className="table-cell">
                        <Icon
                            size="2x"
                            name="text"
                            title="icons.text.signed_messages"
                        />
                    </div>
                    <div className="table-cell">
                        <Translate content="account.signedmessages.menuitem" />
                    </div>
                </li>

                <li style={{display:"none"}}
                    className={cnames({
                        active: active.indexOf("/member-stats") !== -1,
                        disabled: !showAccountLinks
                    })}
                    onClick={this.props.onNavigate.bind(
                        this,
                        `/account/${currentAccount}/member-stats`
                    )}
                >
                    <div className="table-cell">
                        <Icon
                            size="2x"
                            name="text"
                            title="icons.text.membership_stats"
                        />
                    </div>
                    <div className="table-cell">
                        <Translate content="account.member.stats" />
                    </div>
                </li>

                {isMyAccount ? (
                    <li style={{display:"none"}}
                        className={cnames({
                            active: active.indexOf("/vesting") !== -1
                        })}
                        onClick={this.props.onNavigate.bind(
                            this,
                            `/account/${currentAccount}/vesting`
                        )}
                    >
                        <div className="table-cell">
                            <Icon
                                size="2x"
                                name="hourglass"
                                title="icons.hourglass"
                            />
                        </div>
                        <div className="table-cell">
                            <Translate content="account.vesting.title" />
                        </div>
                    </li>
                ) : null}

                <li style={{display:"none"}}
                    className={cnames({
                        active: active.indexOf("/whitelist") !== -1,
                        disabled: !showAccountLinks
                    })}
                    onClick={this.props.onNavigate.bind(
                        this,
                        `/account/${currentAccount}/whitelist`
                    )}
                >
                    <div className="table-cell">
                        <Icon size="2x" name="list" title="icons.list" />
                    </div>
                    <div className="table-cell">
                        <Translate content="account.whitelist.title" />
                    </div>
                </li>

                <li style={{display:"none"}}
                    className={cnames("divider", {
                        active: active.indexOf("/permissions") !== -1,
                        disabled: !showAccountLinks
                    })}
                    onClick={this.props.onNavigate.bind(
                        this,
                        `/account/${currentAccount}/permissions`
                    )}
                >
                    <div className="table-cell">
                        <Icon size="2x" name="warning" title="icons.warning" />
                    </div>
                    <div className="table-cell">
                        <Translate content="account.permissions" />
                    </div>
                </li>

                {showAccountLinks ? (
                    <li style={{display:"none"}}
                        className={cnames(
                            {
                                active: active.indexOf("/accounts") !== -1
                            },
                            "divider"
                        )}
                        onClick={this.props.onNavigate.bind(this, "/accounts")}
                    >
                        <div className="table-cell">
                            <Icon
                                size="2x"
                                name="folder"
                                title="icons.folder"
                            />
                        </div>
                        <div className="table-cell">
                            <Translate content="explorer.accounts.title" />
                        </div>
                    </li>
                ) : null}


                <li
                    className={cnames({
                        active: true
                    })}
                    onClick={() => {this.openBuyIco();}}
                >
                    <div className="table-cell">
                        <Icon size="2x" name="ic-buy" title="Buy ICO" />
                    </div>
                    <div className="table-cell">
                        Buy ICO
                    </div>
                </li>
            </ul>
        );
    }
}
