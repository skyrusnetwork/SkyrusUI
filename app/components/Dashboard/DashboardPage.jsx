import React from "react";
import {connect} from "alt-react";

import LoadingIndicator from "../LoadingIndicator";
import LoginSelector from "../LoginSelector";
import AccountStore from "stores/AccountStore";
import SettingsStore from "stores/SettingsStore";

import {Tabs, Tab} from "../Utility/Tabs";
import {StarredMarkets, FeaturedMarkets} from "./Markets";
import {getPossibleGatewayPrefixes} from "common/gateways";
import WalletDb from "stores/WalletDb";

import MarketsBox from "./MarketsBox";
import HelpContent from "../Utility/HelpContent";
import {toPairs} from "lodash-es";
import {Link} from "react-router-dom";
class DashboardPage extends React.Component {

    componentWillUpdate(nextProps, nextState) {
      let {
          myActiveAccounts,
          myHiddenAccounts,
          accountsReady,
          passwordAccount,
          preferredBases
      } = this.props;
      if(accountsReady) {
        let accountCount =
            myActiveAccounts.size +
            myHiddenAccounts.size +
            (passwordAccount ? 1 : 0);
        myActiveAccounts = nextProps.myActiveAccounts;
        myHiddenAccounts = nextProps.myHiddenAccounts;
        accountsReady = nextProps.accountsReady;
        passwordAccount = nextProps.passwordAccount;
        preferredBases = nextProps.preferredBases;
        if(accountsReady) {
          let accountCountNew =
              myActiveAccounts.size +
              myHiddenAccounts.size +
              (passwordAccount ? 1 : 0);
          if(accountCount == 0 && accountCountNew > 0 || (!WalletDb.isLocked() && window.location.href.indexOf("/land") > -1)) {
            console.log("Login Success");
            this.props.history.push("/market/SKYRUS.BTC_SKX");
          }
        }
      }
    }

    render() {
        let {
            myActiveAccounts,
            myHiddenAccounts,
            accountsReady,
            passwordAccount,
            preferredBases
        } = this.props;
        if (!accountsReady) {
            return <LoadingIndicator />;
        }

        let accountCount =
            myActiveAccounts.size +
            myHiddenAccounts.size +
            (passwordAccount ? 1 : 0);
	    if (window.location.href.indexOf("/policy") > -1) {
          let path = toPairs(this.props.match.params)
              .map(p => p[1])
              .join("/");
          return (
            <div className="grid-block page-layout" style={{padding:30}}>
              <HelpContent path={"policy/"+path} />
              <Link
                style={{color: "#049cce"}}
                to="/land"
              >
                  Go to Home
              </Link>
            </div>
          );
        }
        if (!accountCount || window.location.href.indexOf("/land") > -1) {
            return <LoginSelector />;
        }
        

        return (
            <div className="grid-block page-layout">
                <div className="grid-block no-padding">
                    <div
                        className="grid-content app-tables no-padding"
                        ref="appTables"
                    >
                        <div className="small-12" style={{padding:20}}>
                            <h3 style={{margin:0}}>{"SKX Market"}</h3>
                            <div className="grid-block">
                                <div className="small-12 medium-6 large-6">
                                    <MarketsBox
                                      base={"SKX"}
                                      quote={"SKYRUS.BTC"}
                                    />
                                </div>
                                <div className="small-12 medium-6 large-6">
                                    <MarketsBox
                                      base={"SKX"}
                                      quote={"SKYRUS.ETH"}
                                    />
                                </div>
                            </div>
                            <h3 style={{margin:0}}>{"Top Markets"}</h3>
                            <div className="grid-block">
                                <div className="small-12 medium-6 large-3">
                                    <MarketsBox
                                      base={"SKYRUS.ETH"}
                                      quote={"SKX"}
                                    />
                                </div>
                                <div className="small-12 medium-6 large-3">
                                    <MarketsBox
                                      base={"SKYRUS.BTC"}
                                      quote={"SKX"}
                                    />
                                </div>
                                <div className="small-12 medium-6 large-3">
                                    <MarketsBox
                                      base={"SKYRUS.BTC"}
                                      quote={"SKYRUS.ETH"}
                                    />
                                </div>
                                <div className="small-12 medium-6 large-3">
                                    <MarketsBox
                                      base={"SKYRUS.ETH"}
                                      quote={"SKYRUS.BTC"}
                                    />
                                </div>
                            </div>
                            <div className="tabs-container generic-bordered-box">
                                <Tabs
                                    defaultActiveTab={1}
                                    segmented={false}
                                    setting="dashboardTab"
                                    className="account-tabs"
                                    tabsClass="account-overview no-padding bordered-header content-block"
                                >
                                    <Tab title="dashboard.starred_markets">
                                        <StarredMarkets />
                                    </Tab>
                                    {preferredBases.sort().map(q => {
                                      let title = (
                                          <span>
                                              <img
                                                  className="column-hide-small"
                                                  style={{
                                                      maxWidth: 30,
                                                      marginRight: 5
                                                  }}
                                                  src={`${__BASE_URL__}asset-symbols/${q
                                                      .replace(
                                                          /^BTC/,
                                                          "OPEN.BTC"
                                                      )
                                                      .toLowerCase()}.png`}
                                              />
                                              &nbsp;
                                              {q}
                                          </span>
                                      );

                                      return (
                                          <Tab key={q} title={title}>
                                              <FeaturedMarkets
                                                  quotes={[q].concat(
                                                      getPossibleGatewayPrefixes(
                                                          [q]
                                                      )
                                                  )}
                                              />
                                          </Tab>
                                      );

                                    })}
                                </Tabs>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(
    DashboardPage,
    {
        listenTo() {
            return [AccountStore, SettingsStore];
        },
        getProps() {
            let {
                myActiveAccounts,
                myHiddenAccounts,
                passwordAccount,
                accountsLoaded,
                refsLoaded
            } = AccountStore.getState();

            return {
                myActiveAccounts,
                myHiddenAccounts,
                passwordAccount,
                accountsReady: accountsLoaded && refsLoaded,
                preferredBases: SettingsStore.getState().preferredBases
            };
        }
    }
);
