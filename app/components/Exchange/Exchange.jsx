import {Apis} from "bitsharesjs-ws";
import {ChainStore, FetchChain} from "bitsharesjs";
import {Tabs, Collapse, Icon as AntIcon} from "bitshares-ui-style-guide";
import cnames from "classnames";
import translator from "counterpart";
import guide from "intro.js";
import {debounce} from "lodash-es";
import moment from "moment";
import Ps from "perfect-scrollbar";
import React from "react";
import PropTypes from "prop-types";
import SettingsActions from "actions/SettingsActions";
import MarketsActions from "actions/MarketsActions";
import assetUtils from "common/asset_utils";
import market_utils from "common/market_utils";
import {Asset, Price, LimitOrderCreate} from "common/MarketClasses";
import {checkFeeStatusAsync} from "common/trxHelper";
import utils from "common/utils";
import BuySell from "./BuySell";
import BuySellMarket from "./BuySellMarket";
import ExchangeHeader from "./ExchangeHeader";
import {MyOpenOrders} from "./MyOpenOrders";
import {OrderBook} from "./OrderBook";
import MarketHistory from "./MarketHistory";
import MyMarkets from "./MyMarkets";
import MarketPicker from "./MarketPicker";
import ConfirmOrderModal from "./ConfirmOrderModal";
import Personalize from "./Personalize";
import TradingViewPriceChart from "./TradingViewPriceChart";
import DepthHighChart from "./DepthHighChart";
import LoadingIndicator from "../LoadingIndicator";
import BorrowModal from "../Modal/BorrowModal";
import AccountNotifications from "../Notifier/NotifierContainer";
import TranslateWithLinks from "../Utility/TranslateWithLinks";
import SimpleDepositWithdraw from "../Dashboard/SimpleDepositWithdraw";
import SimpleDepositBlocktradesBridge from "../Dashboard/SimpleDepositBlocktradesBridge";
import {Notification} from "bitshares-ui-style-guide";
import PriceAlert from "./PriceAlert";
import counterpart from "counterpart";
import {updateGatewayBackers} from "common/gatewayUtils";
import {Modal, Button} from "bitshares-ui-style-guide";

import ChatBox from "../Chat/ChatBox";
import Posts from "../Community/Posts";
import Community from "../Community/Community";
import LiveFeed from "./LiveFeed";
import IndicatorGaugeChart from "./IndicatorGaugeChart";
import IndicatorTechnicalBox from "./IndicatorTechnicalBox";
import AccountWallet from "../../components/Account/AccountWallet";
import AccountStore from "stores/AccountStore";
import {connect} from "alt-react";
import {withRouter} from "react-router-dom";

class Exchange extends React.Component {
    static propTypes = {
        marketCallOrders: PropTypes.object.isRequired,
        activeMarketHistory: PropTypes.object.isRequired,
        viewSettings: PropTypes.object.isRequired
    };

    static defaultProps = {
        marketCallOrders: [],
        activeMarketHistory: {},
        viewSettings: {}
    };

    constructor(props) {
        super();
        this.state = {
            ...this._initialState(props),
            expirationType: {
                bid: props.exchange.getIn(["lastExpiration", "bid"]) || "YEAR",
                ask: props.exchange.getIn(["lastExpiration", "ask"]) || "YEAR"
            },
            expirationCustomTime: {
                bid: moment().add(1, "day"),
                ask: moment().add(1, "day")
            },
            feeStatus: {},
            centerContent: "Exchange",
            marketHistory: {}
        };

        this._getWindowSize = debounce(this._getWindowSize.bind(this), 150);
        this._checkFeeStatus = this._checkFeeStatus.bind(this);

        this._handleExpirationChange = this._handleExpirationChange.bind(this);
        this._handleCustomExpirationChange = this._handleCustomExpirationChange.bind(
            this
        );

        this.showPersonalizeModal = this.showPersonalizeModal.bind(this);
        this.hidePersonalizeModal = this.hidePersonalizeModal.bind(this);

        this.showConfirmSellOrderModal = this.showConfirmSellOrderModal.bind(
            this
        );
        this.hideConfirmSellOrderModal = this.hideConfirmSellOrderModal.bind(
            this
        );

        this.showConfirmBuyOrderModal = this.showConfirmBuyOrderModal.bind(
            this
        );
        this.hideConfirmBuyOrderModal = this.hideConfirmBuyOrderModal.bind(
            this
        );

        this.showMarketPickerModal = this.showMarketPickerModal.bind(this);
        this.hideMarketPickerModal = this.hideMarketPickerModal.bind(this);

        this.showDepositBridgeModal = this.showDepositBridgeModal.bind(this);
        this.hideDepositBridgeModal = this.hideDepositBridgeModal.bind(this);

        this.showDepositModal = this.showDepositModal.bind(this);
        this.hideDepositModal = this.hideDepositModal.bind(this);

        this.showBorrowQuoteModal = this.showBorrowQuoteModal.bind(this);
        this.hideBorrowQuoteModal = this.hideBorrowQuoteModal.bind(this);

        this.showBorrowBaseModal = this.showBorrowBaseModal.bind(this);
        this.hideBorrowBaseModal = this.hideBorrowBaseModal.bind(this);

        this.showPriceAlertModal = this.showPriceAlertModal.bind(this);
        this.hidePriceAlertModal = this.hidePriceAlertModal.bind(this);

        this.handlePriceAlertSave = this.handlePriceAlertSave.bind(this);

        this.psInit = true;
        this.psleftInit = true;

        this.afterOpenBuyModal = this.afterOpenBuyModal.bind(this);
        this.closeBuyModal = this.closeBuyModal.bind(this);

        this.afterOpenSellModal = this.afterOpenSellModal.bind(this);
        this.closeSellModal = this.closeSellModal.bind(this);
    }

    handlePriceAlertSave(savedRules = []) {
        // add info about market asset pair
        savedRules = savedRules.map(rule => ({
            type: rule.type,
            price: rule.price,
            baseAssetSymbol: this.props.baseAsset.get("symbol"),
            quoteAssetSymbol: this.props.quoteAsset.get("symbol")
        }));

        // drop old rules for current market pair
        let rules = this.props.priceAlert.filter(rule => {
            return (
                rule &&
                this.props.baseAsset &&
                this.props.quoteAsset &&
                (rule.get("baseAssetSymbol") !==
                    this.props.baseAsset.get("symbol") ||
                    rule.get("quoteAssetSymbol") !==
                        this.props.quoteAsset.get("symbol"))
            );
        });

        // pushing new rules
        rules = [...rules, ...savedRules];

        // saving rules
        SettingsActions.setPriceAlert(rules);

        this.hidePriceAlertModal();
    }

    getPriceAlertRules() {
        //getting rules based on market pairs

        let rules = this.props.priceAlert.filter(rule => {
            return (
                rule &&
                this.props.baseAsset &&
                this.props.quoteAsset &&
                rule.get("baseAssetSymbol") ===
                    this.props.baseAsset.get("symbol") &&
                rule.get("quoteAssetSymbol") ===
                    this.props.quoteAsset.get("symbol")
            );
        });

        return rules.toJS();
    }

    _handleExpirationChange(type, e) {
        let expirationType = {
            ...this.state.expirationType,
            [type]: e.target.value
        };

        if (e.target.value !== "SPECIFIC") {
            SettingsActions.setExchangeLastExpiration({
                ...((this.props.exchange.has("lastExpiration") &&
                    this.props.exchange.get("lastExpiration").toJS()) ||
                    {}),
                [type]: e.target.value
            });
        }

        this.setState({
            expirationType: expirationType
        });
    }

    _handleCustomExpirationChange(type, time) {
        let expirationCustomTime = {
            ...this.state.expirationCustomTime,
            [type]: time
        };

        this.setState({
            expirationCustomTime: expirationCustomTime
        });
    }

    EXPIRATIONS = {
        HOUR: {
            title: "1 hour",
            get: () =>
                moment()
                    .add(1, "hour")
                    .valueOf()
        },
        "12HOURS": {
            title: "12 hours",
            get: () =>
                moment()
                    .add(12, "hour")
                    .valueOf()
        },
        "24HOURS": {
            title: "24 hours",
            get: () =>
                moment()
                    .add(1, "day")
                    .valueOf()
        },
        "7DAYS": {
            title: "7 days",
            get: () =>
                moment()
                    .add(7, "day")
                    .valueOf()
        },
        MONTH: {
            title: "30 days",
            get: () =>
                moment()
                    .add(30, "day")
                    .valueOf()
        },
        YEAR: {
            title: "1 year",
            get: () =>
                moment()
                    .add(1, "year")
                    .valueOf()
        },
        SPECIFIC: {
            title: "Specific",
            get: type => {
                return this.state.expirationCustomTime[type].valueOf();
            }
        }
    };

    _initialOrderState(props) {
        let bid = {
            forSaleText: "",
            toReceiveText: "",
            priceText: "",
            for_sale: new Asset({
                asset_id: props.baseAsset.get("id"),
                precision: props.baseAsset.get("precision")
            }),
            to_receive: new Asset({
                asset_id: props.quoteAsset.get("id"),
                precision: props.quoteAsset.get("precision")
            })
        };
        bid.price = new Price({base: bid.for_sale, quote: bid.to_receive});
        let ask = {
            forSaleText: "",
            toReceiveText: "",
            priceText: "",
            for_sale: new Asset({
                asset_id: props.quoteAsset.get("id"),
                precision: props.quoteAsset.get("precision")
            }),
            to_receive: new Asset({
                asset_id: props.baseAsset.get("id"),
                precision: props.baseAsset.get("precision")
            })
        };
        ask.price = new Price({base: ask.for_sale, quote: ask.to_receive});

        return {ask, bid};
    }

    _initialState(props) {
        let ws = props.viewSettings;
        let {ask, bid} = this._initialOrderState(props);

        let chart_height = ws.get("chartHeight", 650);
        if (chart_height == 650 && window.innerWidth < 640) {
            // assume user is on default setting, use smaller for mobile
            chart_height = 400;
        }
        if (window.innerWidth > 1500) {
            // assume user is on default setting, use smaller for mobile
            chart_height = 800;
        }

        return {
            isDepositBridgeModelLoaded: false,
            isDepositModalLoaded: false,
            isPersonalizeModalLoaded: false,
            isMarketPickerModalLoaded: false,
            isBorrowQuoteModalLoaded: false,
            isBorrowBaseModalLoaded: false,
            isDepositBridgeModalVisible: false,
            isDepositModalVisible: false,
            isPersonalizeModalVisible: false,
            isMarketPickerModalVisible: false,
            isBorrowQuoteModalVisible: false,
            isBorrowBaseModalVisible: false,
            history: [],
            isConfirmBuyOrderModalVisible: false,
            isConfirmBuyOrderModalLoaded: false,
            isConfirmSellOrderModalVisible: false,
            isPriceAlertModalVisible: false,
            isConfirmSellOrderModalLoaded: false,
            tabVerticalPanel: ws.get("tabVerticalPanel", "my-market"),
            tabBuySell: ws.get("tabBuySell", "buy"),
            buySellOpen: ws.get("buySellOpen", true),
            bid,
            ask,
            height: window.innerHeight,
            width: window.innerWidth,
            favorite: false,
            buyDiff: false,
            sellDiff: false,
            autoScroll: ws.get("global_AutoScroll", true),
            buySellTop: ws.get("buySellTop", true),
            buyFeeAssetIdx: ws.get("buyFeeAssetIdx", 0),
            sellFeeAssetIdx: ws.get("sellFeeAssetIdx", 0),
            verticalOrderBook: ws.get("verticalOrderBook", true),
            verticalOrderForm: ws.get("verticalOrderForm", false),
            hidePanel: ws.get("hidePanel", false),
            hideScrollbars: ws.get("hideScrollbars", false),
            singleColumnOrderForm: ws.get("singleColumnOrderForm", true),
            flipOrderBook: ws.get("flipOrderBook", false),
            flipBuySell: ws.get("flipBuySell", false),
            orderBookReversed: ws.get("orderBookReversed", false),
            chartType: ws.get("chartType", "price_chart"),
            chartHeight: chart_height,
            chartZoom: ws.get("chartZoom", true),
            chartTools: ws.get("chartTools", true),
            hideFunctionButtons: ws.get("hideFunctionButtons", true),
            currentPeriod: ws.get("currentPeriod", 3600 * 24 * 30 * 3), // 3 months
            showMarketPicker: false,
            activePanels: ws.get("activePanels", ["left", "right"]),
            mobileKey: [""],
            forceReRender: 0,
            panelWidth: 0,
            mirrorPanels: ws.get("mirrorPanels", false),
            panelTabs: ws.get("panelTabs", {
                my_history: 1,
                history: 1,
                my_orders: 2,
                open_settlement: 2
            }),
            panelTabsActive: {
                1: "",
                2: ""
            },

            buyModalIsOpen: false,
            sellModalIsOpen: false,
            leftPanelContent: "market",
            rightPanelContent: "liveChat",
            selectedIndicator: ""
        };
    }

    afterOpenBuyModal() {
      // references are now sync'd and can be accessed.
      //this.subtitle.style.color = '#f00';
    }

    closeBuyModal() {
      this.props.closeBuyModal();
    }

    afterOpenSellModal() {
      // references are now sync'd and can be accessed.
      //this.subtitle.style.color = '#f00';
    }

    closeSellModal() {
      this.props.closeSellModal();
    }

    _setLeftPanel(content){
      this.setState(
        {leftPanelContent: content}
      );
    }

    _setRightPanel(content){
      this.setState(
        {rightPanelContent: content}
      );
    }

    _setIndicator(content){
      this.setState(
        {selectedIndicator: content}
      );
      this.setState({ chartType: "market_depth" }, () => {
          this.setState({ chartType: "price_chart" });
      });
    }

    showMarketPickerModal() {
        this.setState({
            isMarketPickerModalVisible: true,
            isMarketPickerModalLoaded: true
        });
    }

    hideMarketPickerModal() {
        this.setState({
            isMarketPickerModalVisible: false
        });
    }

    showPersonalizeModal() {
        this.setState({
            isPersonalizeModalVisible: true,
            isPersonalizeModalLoaded: true
        });
    }

    hidePersonalizeModal() {
        this.setState({
            isPersonalizeModalVisible: false
        });
    }

    showPriceAlertModal() {
        this.setState({
            isPriceAlertModalVisible: true
        });
    }

    hidePriceAlertModal() {
        this.setState({
            isPriceAlertModalVisible: false
        });
    }

    showBorrowQuoteModal() {
        this.setState({
            isBorrowQuoteModalVisible: true,
            isBorrowQuoteModalLoaded: true
        });
    }

    hideBorrowQuoteModal() {
        this.setState({
            isBorrowQuoteModalVisible: false
        });
    }

    showBorrowBaseModal() {
        this.setState({
            isBorrowBaseModalVisible: true,
            isBorrowBaseModalLoaded: true
        });
    }

    hideBorrowBaseModal() {
        this.setState({
            isBorrowBaseModalVisible: false
        });
    }

    showDepositBridgeModal() {
        this.setState({
            isDepositBridgeModalVisible: true,
            isDepositBridgeModalLoaded: true
        });
    }

    hideDepositBridgeModal() {
        this.setState({
            isDepositBridgeModalVisible: false
        });
    }

    showDepositModal() {
        this.setState({
            isDepositModalVisible: true,
            isDepositModalLoaded: true
        });
    }

    hideDepositModal() {
        this.setState({
            isDepositModalVisible: false
        });
    }

    _getLastMarketKey() {
        const chainID = Apis.instance().chain_id;
        return `lastMarket${chainID ? "_" + chainID.substr(0, 8) : ""}`;
    }

    showConfirmBuyOrderModal() {
        this.setState({
            isConfirmBuyOrderModalVisible: true,
            isConfirmBuyOrderModalLoaded: true
        });
    }

    hideConfirmBuyOrderModal() {
        this.setState({
            isConfirmBuyOrderModalVisible: false
        });
    }

    showConfirmSellOrderModal() {
        this.setState({
            isConfirmSellOrderModalVisible: true,
            isConfirmSellOrderModalLoaded: true
        });
    }

    hideConfirmSellOrderModal() {
        this.setState({
            isConfirmSellOrderModalVisible: false
        });
    }

    componentWillMount() {
        window.addEventListener("resize", this._setDimensions, {
            capture: false,
            passive: true
        });
        // updateGatewayBackers();
        this._checkFeeStatus();
    }

    componentDidMount() {
        MarketsActions.getTrackedGroupsConfig();

        SettingsActions.changeViewSetting.defer({
            [this._getLastMarketKey()]:
                this.props.quoteAsset.get("symbol") +
                "_" +
                this.props.baseAsset.get("symbol")
        });

        window.addEventListener("resize", this._getWindowSize, {
            capture: false,
            passive: true
        });
    }

    /*
    * Force re-rendering component when state changes.
    * This is required for an updated value of component width
    *
    * It will trigger a re-render twice
    * - Once when state is changed
    * - Once when forceReRender is set to false
    */
    _forceRender(np, ns) {
        if (this.state.forceReRender) {
            this.setState({
                forceReRender: false
            });
        }

        if (
            !utils.are_equal_shallow(
                this.state.activePanels,
                ns.activePanels
            ) ||
            !utils.are_equal_shallow(
                this.state.verticalOrderBook,
                ns.verticalOrderBook
            ) ||
            np.quoteAsset !== this.props.quoteAsset ||
            np.baseAsset !== this.props.baseAsset
        ) {
            this.setState({
                forceReRender: true
            });
        }
    }

    shouldComponentUpdate(np, ns) {
        this._forceRender(np, ns);

        if (!np.marketReady && !this.props.marketReady) {
            return false;
        }
        let propsChanged = false;
        let stateChanged = false;

        for (let key in np) {
            if (np.hasOwnProperty(key)) {
                propsChanged =
                    propsChanged ||
                    !utils.are_equal_shallow(np[key], this.props[key]);
                if (propsChanged) break;
            }
        }
        for (let key in ns.panelTabsActive) {
            stateChanged = !utils.are_equal_shallow(
                ns.panelTabsActive[key],
                this.state.panelTabsActive[key]
            );
        }
        return (
            propsChanged ||
            stateChanged ||
            !utils.are_equal_shallow(ns, this.state)
        );
    }

    _checkFeeStatus(
        assets = [
            this.props.coreAsset,
            this.props.baseAsset,
            this.props.quoteAsset
        ],
        account = this.props.currentAccount
    ) {
        let feeStatus = {};
        let p = [];
        assets.forEach(a => {
            p.push(
                checkFeeStatusAsync({
                    accountID: account.get("id"),
                    feeID: a.get("id"),
                    type: "limit_order_create"
                })
            );
        });
        Promise.all(p)
            .then(status => {
                assets.forEach((a, idx) => {
                    feeStatus[a.get("id")] = status[idx];
                });
                if (!utils.are_equal_shallow(this.state.feeStatus, feeStatus)) {
                    this.setState({
                        feeStatus
                    });
                }
            })
            .catch(err => {
                console.log("checkFeeStatusAsync error", err);
                this.setState({feeStatus: {}});
            });
    }

    componentDidUpdate(prevProps, prevState) {
        this._initPsContainer();
        if (
            !this.props.exchange.get("tutorialShown") &&
            prevProps.coreAsset &&
            prevState.feeStatus
        ) {
            if (!this.tutorialShown) {
                this.tutorialShown = true;
                const theme = this.props.settings.get("themes");

                // guide
                //     .introJs()
                //     .setOptions({
                //         tooltipClass: theme,
                //         highlightClass: theme,
                //         showBullets: false,
                //         hideNext: true,
                //         hidePrev: true,
                //         nextLabel: translator.translate(
                //             "walkthrough.next_label"
                //         ),
                //         prevLabel: translator.translate(
                //             "walkthrough.prev_label"
                //         ),
                //         skipLabel: translator.translate(
                //             "walkthrough.skip_label"
                //         ),
                //         doneLabel: translator.translate(
                //             "walkthrough.done_label"
                //         )
                //     })
                //     .start();

                SettingsActions.setExchangeTutorialShown.defer(true);
            }
        }
    }

    _getWindowSize() {
        let {innerHeight, innerWidth} = window;
        if (
            innerHeight !== this.state.height ||
            innerWidth !== this.state.width
        ) {
            this.setState({
                height: innerHeight,
                width: innerWidth
            });
            let centerContainer = this.refs.center;
            if (centerContainer) {
                Ps.update(centerContainer);
            }

            let leftcontainer = this.refs.leftPanel;
            if( leftcontainer ) {
                Ps.update(leftcontainer);
            }

        }
    }

    _initPsContainer() {
        if (this.refs.center && this.psInit) {
            let centerContainer = this.refs.center;
            if (centerContainer) {
                Ps.initialize(centerContainer);
                this.psInit = false;
            }
        }

        if( this.refs.leftPanel && this.psleftInit ) {
          let leftcontainer = this.refs.leftPanel;
          if( leftcontainer ) {
            Ps.initialize(leftcontainer);
            this.psleftInit = false;
          }
        }
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps && nextProps.content) {
          this.setState({leftPanelContent: nextProps.content});
        }
        if(nextProps && nextProps.rightContent) {
          this.setState({rightPanelContent: nextProps.rightContent});
        }
        this.setState({buyModalIsOpen: nextProps.buyModalIsOpen});
        this.setState({sellModalIsOpen: nextProps.sellModalIsOpen});
        this.setState({currentAccount: nextProps.currentAccount, centerContent: nextProps.centerContent});
        this._initPsContainer();
        if (
            nextProps.quoteAsset !== this.props.quoteAsset ||
            nextProps.baseAsset !== this.props.baseAsset ||
            nextProps.currentAccount !== this.props.currentAccount ||
            nextProps.rightPanelContent !== this.props.rightPanelContent ||
            nextProps.content !== this.props.content ||
            nextProps.buyModalIsOpen !== this.props.buyModalIsOpen ||
            nextProps.sellModalIsOpen !== this.props.sellModalIsOpen

        ) {
            this._checkFeeStatus(
                [
                    nextProps.coreAsset,
                    nextProps.baseAsset,
                    nextProps.quoteAsset
                ],
                nextProps.currentAccount
            );
        }
        if (
            nextProps.quoteAsset.get("symbol") !==
                this.props.quoteAsset.get("symbol") ||
            nextProps.baseAsset.get("symbol") !==
                this.props.baseAsset.get("symbol")
        ) {
            this.setState(this._initialState(nextProps));

            let _this = this;
            var promise = this._getMarketHistory(nextProps.baseAsset.get("id"),nextProps.quoteAsset.get("id"),3600*4,200);
            //var promise = this._getMarketHistory(nextProps.quoteAsset.get("symbol"),nextProps.baseAsset.get("symbol"),3600*4,101);
            promise.then(function(value){
              _this.setState({
                  marketHistory: value
              });
            });

            return SettingsActions.changeViewSetting({
                [this._getLastMarketKey()]:
                    nextProps.quoteAsset.get("symbol") +
                    "_" +
                    nextProps.baseAsset.get("symbol")
            });
        }
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this._getWindowSize);
    }

    _getFeeAssets(quote, base, coreAsset) {
        let {currentAccount} = this.props;
        const {feeStatus} = this.state;

        function addMissingAsset(target, asset) {
            if (target.indexOf(asset) === -1) {
                target.push(asset);
            }
        }

        function hasFeePoolBalance(id) {
            return feeStatus[id] && feeStatus[id].hasPoolBalance;
        }

        function hasBalance(id) {
            return feeStatus[id] && feeStatus[id].hasBalance;
        }

        let sellAssets = [coreAsset, quote === coreAsset ? base : quote];
        addMissingAsset(sellAssets, quote);
        addMissingAsset(sellAssets, base);
        // let sellFeeAsset;

        let buyAssets = [coreAsset, base === coreAsset ? quote : base];
        addMissingAsset(buyAssets, quote);
        addMissingAsset(buyAssets, base);
        // let buyFeeAsset;

        let balances = {};

        currentAccount
            .get("balances", [])
            .filter((balance, id) => {
                return (
                    ["1.3.0", quote.get("id"), base.get("id")].indexOf(id) >= 0
                );
            })
            .forEach((balance, id) => {
                let balanceObject = ChainStore.getObject(balance);
                balances[id] = {
                    balance: balanceObject
                        ? parseInt(balanceObject.get("balance"), 10)
                        : 0,
                    fee: this._getFee(ChainStore.getAsset(id))
                };
            });

        function filterAndDefault(assets, balances, idx) {
            let asset;
            /* Only keep assets for which the user has a balance larger than the fee, and for which the fee pool is valid */
            assets = assets.filter(a => {
                if (!balances[a.get("id")]) {
                    return false;
                }
                return (
                    hasFeePoolBalance(a.get("id")) && hasBalance(a.get("id"))
                );
            });

            /* If the user has no valid balances, default to core fee */
            if (!assets.length) {
                asset = coreAsset;
                assets.push(coreAsset);
                /* If the user has balances, use the stored idx value unless that asset is no longer available*/
            } else {
                asset = assets[Math.min(assets.length - 1, idx)];
            }

            return {assets, asset};
        }

        let {assets: sellFeeAssets, asset: sellFeeAsset} = filterAndDefault(
            sellAssets,
            balances,
            this.state.sellFeeAssetIdx
        );
        let {assets: buyFeeAssets, asset: buyFeeAsset} = filterAndDefault(
            buyAssets,
            balances,
            this.state.buyFeeAssetIdx
        );

        let sellFee = this._getFee(sellFeeAsset);
        let buyFee = this._getFee(buyFeeAsset);

        return {
            sellFeeAsset,
            sellFeeAssets,
            sellFee,
            buyFeeAsset,
            buyFeeAssets,
            buyFee
        };
    }

    _getFee(asset = this.props.coreAsset) {
        return (
            this.state.feeStatus[asset.get("id")] &&
            this.state.feeStatus[asset.get("id")].fee
        );
    }

    _verifyFee(fee, sell, sellBalance, coreBalance) {
        let coreFee = this._getFee();

        if (fee.asset_id === "1.3.0") {
            if (coreFee.getAmount() <= coreBalance) {
                return "1.3.0";
            } else {
                return null;
            }
        } else {
            let sellSum =
                sell.asset_id === fee.asset_id
                    ? fee.getAmount() + sell.getAmount()
                    : sell.getAmount();
            if (sellSum <= sellBalance) {
                // Sufficient balance in asset to pay fee
                return fee.asset_id;
            } else if (
                coreFee.getAmount() <= coreBalance &&
                fee.asset_id !== "1.3.0"
            ) {
                // Sufficient balance in core asset to pay fee
                return "1.3.0";
            } else {
                return null; // Unable to pay fee
            }
        }
    }

    _createLimitOrderConfirm(
        buyAsset,
        sellAsset,
        sellBalance,
        coreBalance,
        feeAsset,
        type,
        short = true,
        e
    ) {
        e.preventDefault();
        let {highestBid, lowestAsk} = this.props.marketData;
        let current = this.state[type === "sell" ? "ask" : "bid"];

        sellBalance = current.for_sale.clone(
            sellBalance
                ? parseInt(ChainStore.getObject(sellBalance).toJS().balance, 10)
                : 0
        );
        coreBalance = new Asset({
            amount: coreBalance
                ? parseInt(ChainStore.getObject(coreBalance).toJS().balance, 10)
                : 0
        });

        let fee = this._getFee(feeAsset);
        let feeID = this._verifyFee(
            fee,
            current.for_sale,
            sellBalance.getAmount(),
            coreBalance.getAmount()
        );
        if (!feeID) {
            return Notification.error({
                message: counterpart.translate(
                    "notifications.exchange_insufficient_funds_for_fees"
                )
            });
        }

        if (type === "buy" && lowestAsk) {
            let diff = this.state.bid.price.toReal() / lowestAsk.getPrice();
            if (diff > 1.2) {
                this.showConfirmBuyOrderModal();
                return this.setState({
                    buyDiff: diff
                });
            }
        } else if (type === "sell" && highestBid) {
            let diff =
                1 / (this.state.ask.price.toReal() / highestBid.getPrice());
            if (diff > 1.2) {
                this.showConfirmSellOrderModal();
                return this.setState({
                    sellDiff: diff
                });
            }
        }

        let isPredictionMarket = sellAsset.getIn([
            "bitasset",
            "is_prediction_market"
        ]);

        if (current.for_sale.gt(sellBalance) && !isPredictionMarket) {
            return Notification.error({
                message: counterpart.translate(
                    "notifications.exchange_insufficient_funds_to_place_order",
                    {
                        amount: current.for_sale.getAmount({real: true}),
                        symbol: sellAsset.get("symbol")
                    }
                )
            });
        }
        //
        if (
            !(
                current.for_sale.getAmount() > 0 &&
                current.to_receive.getAmount() > 0
            )
        ) {
            return Notification.warning({
                message: counterpart.translate(
                    "notifications.exchange_enter_valid_values"
                )
            });
        }
        //
        if (type === "sell" && isPredictionMarket && short) {
            return this._createPredictionShort(feeID);
        }

        this._createLimitOrder(type, feeID);
    }

    _createLimitOrder(type, feeID) {
        let actionType = type === "sell" ? "ask" : "bid";

        let current = this.state[actionType];

        let expirationTime = null;
        if (this.state.expirationType[actionType] === "SPECIFIC") {
            expirationTime = this.EXPIRATIONS[
                this.state.expirationType[actionType]
            ].get(actionType);
        } else {
            expirationTime = this.EXPIRATIONS[
                this.state.expirationType[actionType]
            ].get();
        }

        const order = new LimitOrderCreate({
            for_sale: current.for_sale,
            expiration: new Date(expirationTime || false),
            to_receive: current.to_receive,
            seller: this.props.currentAccount.get("id"),
            fee: {
                asset_id: feeID,
                amount: 0
            }
        });
        const {marketName, first} = market_utils.getMarketName(
            this.props.baseAsset,
            this.props.quoteAsset
        );
        const inverted = this.props.marketDirections.get(marketName);
        const shouldFlip =
            (inverted && first.get("id") !== this.props.baseAsset.get("id")) ||
            (!inverted && first.get("id") !== this.props.baseAsset.get("id"));
        if (shouldFlip) {
            let setting = {};
            setting[marketName] = !inverted;
            SettingsActions.changeMarketDirection(setting);
        }
        return MarketsActions.createLimitOrder2(order)
            .then(result => {
                if (result.error) {
                    if (result.error.message !== "wallet locked")
                        Notification.error({
                            message: counterpart.translate(
                                "notifications.exchange_unknown_error_place_order",
                                {
                                    amount: current.to_receive.getAmount({
                                        real: true
                                    }),
                                    symbol: current.to_receive.asset_id
                                }
                            )
                        });
                }
                console.log("order success");
                //this._clearForms();
            })
            .catch(e => {
                console.log("order failed:", e);
            });
    }

    /***
     * Clear forms
     * @string: type
     */
    _clearForms(type) {
        let {ask, bid} = this._initialOrderState(this.props);

        if (!type) {
            this.setState({
                bid,
                ask
            });
        } else if (type == "ask") {
            this.setState({ask});
        } else if (type == "bid") {
            this.setState({bid});
        }
    }

    _createPredictionShort(feeID) {
        let current = this.state.ask;
        const order = new LimitOrderCreate({
            for_sale: current.for_sale,
            to_receive: current.to_receive,
            seller: this.props.currentAccount.get("id"),
            fee: {
                asset_id: feeID,
                amount: 0
            }
        });

        Promise.all([
            FetchChain(
                "getAsset",
                this.props.quoteAsset.getIn([
                    "bitasset",
                    "options",
                    "short_backing_asset"
                ])
            )
        ]).then(assets => {
            let [backingAsset] = assets;
            let collateral = new Asset({
                amount: order.amount_for_sale.getAmount(),
                asset_id: backingAsset.get("id"),
                precision: backingAsset.get("precision")
            });

            MarketsActions.createPredictionShort(order, collateral).then(
                result => {
                    if (result.error) {
                        if (result.error.message !== "wallet locked")
                            Notification.error({
                                message: counterpart.translate(
                                    "notifications.exchange_unknown_error_place_order",
                                    {
                                        amount: buyAssetAmount,
                                        symbol: buyAsset.symbol
                                    }
                                )
                            });
                    }
                }
            );
        });
    }

    _forceBuy(type, feeAsset, sellBalance, coreBalance) {
        let current = this.state[type === "sell" ? "ask" : "bid"];
        // Convert fee to relevant asset fee and check if user has sufficient balance
        sellBalance = current.for_sale.clone(
            sellBalance
                ? parseInt(ChainStore.getObject(sellBalance).get("balance"), 10)
                : 0
        );
        coreBalance = new Asset({
            amount: coreBalance
                ? parseInt(ChainStore.getObject(coreBalance).toJS().balance, 10)
                : 0
        });
        let fee = this._getFee(feeAsset);
        let feeID = this._verifyFee(
            fee,
            current.for_sale,
            sellBalance.getAmount(),
            coreBalance.getAmount()
        );

        if (feeID) {
            this._createLimitOrder(type, feeID);
        } else {
            console.error("Unable to pay fees, aborting limit order creation");
        }
    }

    _forceSell(type, feeAsset, sellBalance, coreBalance) {
        let current = this.state[type === "sell" ? "ask" : "bid"];
        // Convert fee to relevant asset fee and check if user has sufficient balance
        sellBalance = current.for_sale.clone(
            sellBalance
                ? parseInt(ChainStore.getObject(sellBalance).get("balance"), 10)
                : 0
        );
        coreBalance = new Asset({
            amount: coreBalance
                ? parseInt(ChainStore.getObject(coreBalance).toJS().balance, 10)
                : 0
        });
        let fee = this._getFee(feeAsset);
        let feeID = this._verifyFee(
            fee,
            current.for_sale,
            sellBalance.getAmount(),
            coreBalance.getAmount()
        );

        if (feeID) {
            this._createLimitOrder(type, feeID);
        } else {
            console.error("Unable to pay fees, aborting limit order creation");
        }
    }

    _cancelLimitOrder(orderID, e) {
        e.preventDefault();
        let {currentAccount} = this.props;
        MarketsActions.cancelLimitOrder(
            currentAccount.get("id"),
            orderID // order id to cancel
        );
    }

    _changeZoomPeriod(size, e) {
        e.preventDefault();
        if (size !== this.state.currentPeriod) {
            this.setState({
                currentPeriod: size
            });
            SettingsActions.changeViewSetting({
                currentPeriod: size
            });
        }
    }

    _onGroupOrderLimitChange(e) {
        let groupLimit;

        if (typeof e == "object") {
            e.preventDefault();
            groupLimit = parseInt(e.target.value);
        }

        if (typeof e == "number") groupLimit = parseInt(e);

        MarketsActions.changeCurrentGroupLimit(groupLimit);

        if (groupLimit !== this.props.currentGroupOrderLimit) {
            MarketsActions.changeCurrentGroupLimit(groupLimit);
            let currentSub = this.props.sub.split("_");
            MarketsActions.unSubscribeMarket(currentSub[0], currentSub[1]).then(
                () => {
                    this.props.subToMarket(
                        this.props,
                        this.props.bucketSize,
                        groupLimit
                    );
                }
            );
        }
    }

    _depthChartClick(base, quote, e) {
        e.preventDefault();
        let {bid, ask} = this.state;

        bid.price = new Price({
            base: this.state.bid.for_sale,
            quote: this.state.bid.to_receive,
            real: e.xAxis[0].value
        });
        bid.priceText = bid.price.toReal();

        ask.price = new Price({
            base: this.state.ask.to_receive,
            quote: this.state.ask.for_sale,
            real: e.xAxis[0].value
        });
        ask.priceText = ask.price.toReal();
        let newState = {
            bid,
            ask,
            depthLine: bid.price.toReal()
        };

        this._setForSale(bid, true) || this._setReceive(bid, true);
        this._setReceive(ask) || this._setForSale(ask);

        this._setPriceText(bid, true);
        this._setPriceText(ask, false);
        // if (bid.for_sale.)
        this.setState(newState);
    }

    _setAutoscroll(value) {
        this.setState({
            autoScroll: value
        });
    }

    /**
     *
     * @param {string} panel - Panel to toggle
     */
    _togglePanel(panel) {
        if (!panel) return;

        let newState = [];

        this.state.activePanels.forEach(a => {
            if (a !== panel) {
                newState.push(a);
            }
        });

        if (!this.state.activePanels.includes(panel)) {
            newState.push(panel);
        }

        this.setState({
            activePanels: newState
        });

        SettingsActions.changeViewSetting({
            activePanels: newState
        });
    }

    _toggleChart(value) {
        this.setState({
            chartType: value
        });

        SettingsActions.changeViewSetting({
            chartType: value
        });
    }

    _toggleCharts() {
      var chartType = this.props.viewSettings.get("chartType");
      if(chartType == "price_chart"){
        SettingsActions.changeViewSetting({
            chartType: "market_depth"
        });
        this.setState({ chartType: "market_depth" });
      }
      else{
        SettingsActions.changeViewSetting({
            chartType: "price_chart"
        });
        this.setState({ chartType: "price_chart" });
      }
    }

    _chartZoom = () => {
        SettingsActions.changeViewSetting({
            chartZoom: !this.state.chartZoom
        });

        let chartType = this.state.chartType;
        this.setState({
            chartZoom: !this.state.chartZoom,
            chartType: "hidden_chart"
        });
        // force reload
        setTimeout(() => {
            this.setState({
                chartType: chartType
            });
        }, 100);
    };

    _chartTools = () => {
        SettingsActions.changeViewSetting({
            chartTools: !this.state.chartTools
        });

        let chartType = this.state.chartType;
        this.setState({
            chartTools: !this.state.chartTools,
            chartType: "hidden_chart"
        });
        // force reload
        setTimeout(() => {
            this.setState({
                chartType: chartType
            });
        }, 100);
    };

    _flipBuySell() {
        this.setState({
            flipBuySell: !this.state.flipBuySell
        });

        SettingsActions.changeViewSetting({
            flipBuySell: !this.state.flipBuySell
        });
    }

    /***
     * Toggle Buy/Sell order UX
     * Horizontal order book only
     */
    _flipOrderBook = () => {
        SettingsActions.changeViewSetting({
            flipOrderBook: !this.state.flipOrderBook
        });

        this.setState({
            flipOrderBook: !this.state.flipOrderBook
        });
    };

    /***
     * Toggle order book to switch place of buy and sell orders
     * Vertical order book only
     */
    _orderBookReversed = () => {
        SettingsActions.changeViewSetting({
            orderBookReversed: !this.state.orderBookReversed
        });

        this.setState({
            orderBookReversed: !this.state.orderBookReversed
        });
    };

    _hideFunctionButtons = () => {
        SettingsActions.changeViewSetting({
            hideFunctionButtons: !this.state.hideFunctionButtons
        });

        this.setState({
            hideFunctionButtons: !this.state.hideFunctionButtons
        });
    };

    _toggleOpenBuySell() {
        SettingsActions.changeViewSetting({
            buySellOpen: !this.state.buySellOpen
        });

        this.setState({buySellOpen: !this.state.buySellOpen});
    }

    _toggleMarketPicker(asset) {
        let showMarketPicker = !!asset ? true : false;

        if (showMarketPicker) {
            this.showMarketPickerModal();
        }

        this.setState({
            showMarketPicker,
            marketPickerAsset: asset
        });
    }

    _moveOrderBook() {
        // Unpin OrderForm
        if (this.state.verticalOrderForm) {
            this._moveOrderForm();
        }

        SettingsActions.changeViewSetting({
            verticalOrderBook: !this.state.verticalOrderBook
        });

        this.setState({verticalOrderBook: !this.state.verticalOrderBook});
    }

    _moveOrderForm() {
        // Unpin OrderBook
        if (this.state.verticalOrderBook) {
            this._moveOrderBook();
        }

        SettingsActions.changeViewSetting({
            verticalOrderForm: !this.state.verticalOrderForm
        });

        this.setState({verticalOrderForm: !this.state.verticalOrderForm});
    }

    _togglePersonalize() {
        if (!this.state.isPersonalizeModalVisible) {
            this.setState({
                isPersonalizeModalVisible: !this.state
                    .isPersonalizeModalVisible,
                isPersonalizeModalLoaded: true
            });
        } else {
            this.setState({
                isPersonalizeModalVisible: !this.state.isPersonalizeModalVisible
            });
        }
    }

    _toggleScrollbars() {
        SettingsActions.changeViewSetting({
            hideScrollbars: !this.state.hideScrollbars
        });

        this.setState({
            hideScrollbars: !this.state.hideScrollbars
        });
    }

    _toggleSingleColumnOrderForm() {
        SettingsActions.changeViewSetting({
            singleColumnOrderForm: !this.state.singleColumnOrderForm
        });

        this.setState({
            singleColumnOrderForm: !this.state.singleColumnOrderForm
        });
    }

    _mirrorPanels() {
        this.setState({
            mirrorPanels: !this.state.mirrorPanels
        });

        SettingsActions.changeViewSetting({
            mirrorPanels: !this.state.mirrorPanels
        });
    }

    _currentPriceClick(type, price) {
        const isBid = type === "bid";
        let current = this.state[type];
        current.price = price[isBid ? "invert" : "clone"]();
        current.priceText = current.price.toReal();
        if (isBid) {
            this._setForSale(current, isBid) ||
                this._setReceive(current, isBid);
        } else {
            this._setReceive(current, isBid) ||
                this._setForSale(current, isBid);
        }
        this.forceUpdate();
    }

    _orderbookClick(order) {
        const isBid = order.isBid();
        /*
        * Because we are using a bid order to construct an ask and vice versa,
        * totalToReceive becomes forSale, and totalForSale becomes toReceive
        */
        let forSale = order.totalToReceive({noCache: true});
        // let toReceive = order.totalForSale({noCache: true});
        let toReceive = forSale.times(order.sellPrice());

        let newPrice = new Price({
            base: isBid ? toReceive : forSale,
            quote: isBid ? forSale : toReceive
        });

        let current = this.state[isBid ? "bid" : "ask"];
        current.price = newPrice;
        current.priceText = newPrice.toReal();

        let newState = {
            // If isBid is true, newState defines a new ask order and vice versa
            [isBid ? "ask" : "bid"]: {
                for_sale: forSale,
                forSaleText: forSale.getAmount({real: true}),
                to_receive: toReceive,
                toReceiveText: toReceive.getAmount({real: true}),
                price: newPrice,
                priceText: newPrice.toReal()
            }
        };

        if (isBid) {
            this._setForSale(current, isBid) ||
                this._setReceive(current, isBid);
        } else {
            this._setReceive(current, isBid) ||
                this._setForSale(current, isBid);
        }
        this.setState(newState);
    }

    _borrowQuote() {
        this.showBorrowQuoteModal();
    }

    _borrowBase() {
        this.showBorrowBaseModal();
    }

    _onDeposit(type) {
        this.setState({
            depositModalType: type
        });

        this.showDepositModal();
    }

    _onBuy(type) {
        this.setState({
            buyModalType: type
        });

        this.showDepositBridgeModal();
    }

    _getSettlementInfo() {
        let {lowestCallPrice, feedPrice, quoteAsset} = this.props;

        let showCallLimit = false;
        if (feedPrice) {
            if (feedPrice.inverted) {
                showCallLimit = lowestCallPrice <= feedPrice.toReal();
            } else {
                showCallLimit = lowestCallPrice >= feedPrice.toReal();
            }
        }
        return !!(
            showCallLimit &&
            lowestCallPrice &&
            !quoteAsset.getIn(["bitasset", "is_prediction_market"])
        );
    }

    _setTabVerticalPanel(tab) {
        this.setState({
            tabVerticalPanel: tab
        });
        SettingsActions.changeViewSetting({
            tabVerticalPanel: tab
        });
    }

    _setTabBuySell(tab) {
        this.setState({
            tabBuySell: tab
        });
        SettingsActions.changeViewSetting({
            tabBuySell: tab
        });
    }

    _setPanelTabInGroup(group, activetab) {
        let {panelTabsActive} = this.state;

        Object.keys(panelTabsActive).map(a => {
            if (a == group) {
                panelTabsActive[a] = activetab;
            }
        });

        this.setState({
            panelTabsActive: panelTabsActive,
            forceReRender: true // Requires to forcefully re-render for tab to stick
        });
    }

    _setPanelTabs(panelName, newTabsId) {
        let {panelTabs, panelTabsActive} = this.state;

        let newState = {
            panelTabs: panelTabs,
            panelTabsActive: panelTabsActive
        };

        // Set new Tabs ID for Panel
        Object.keys(panelTabs).map(thisPanelName => {
            newState.panelTabs[thisPanelName] =
                thisPanelName == panelName
                    ? newTabsId
                    : panelTabs[thisPanelName];
        });

        // Reset all Active Panel Tabs
        Object.keys(panelTabsActive).map(thisTabId => {
            newState.panelTabsActive[thisTabId] = "";
        });

        this.setState({
            newState
        });

        SettingsActions.changeViewSetting({
            newState
        });
    }

    onChangeFeeAsset(type, value) {
        if (type === "buy") {
            this.setState({
                buyFeeAssetIdx: value
            });

            SettingsActions.changeViewSetting({
                buyFeeAssetIdx: value
            });
        } else {
            this.setState({
                sellFeeAssetIdx: value
            });

            SettingsActions.changeViewSetting({
                sellFeeAssetIdx: value
            });
        }
    }

    onChangeChartHeight({value, increase}) {
        const newHeight = value
            ? value
            : this.state.chartHeight + (increase ? 20 : -20);
        this.setState({
            chartHeight: newHeight
        });

        SettingsActions.changeViewSetting({
            chartHeight: newHeight
        });
    }

    _toggleBuySellPosition() {
        this.setState({
            buySellTop: !this.state.buySellTop
        });

        SettingsActions.changeViewSetting({
            buySellTop: !this.state.buySellTop
        });
    }

    _setReceive(state, isBid) {
        if (state.price.isValid() && state.for_sale.hasAmount()) {
            state.to_receive = state.for_sale.times(state.price);
            state.toReceiveText = state.to_receive
                .getAmount({real: true})
                .toString();
            return true;
        }
        return false;
    }

    _setForSale(state, isBid) {
        if (state.price.isValid() && state.to_receive.hasAmount()) {
            state.for_sale = state.to_receive.times(state.price, true);
            state.forSaleText = state.for_sale
                .getAmount({real: true})
                .toString();
            return true;
        }
        return false;
    }

    _setPrice(state) {
        if (state.for_sale.hasAmount() && state.to_receive.hasAmount()) {
            state.price = new Price({
                base: state.for_sale,
                quote: state.to_receive
            });
            state.priceText = state.price.toReal().toString();
            return true;
        }
        return false;
    }

    _setPriceText(state, isBid) {
        const currentBase = state[isBid ? "for_sale" : "to_receive"];
        const currentQuote = state[isBid ? "to_receive" : "for_sale"];
        if (currentBase.hasAmount() && currentQuote.hasAmount()) {
            state.priceText = new Price({
                base: currentBase,
                quote: currentQuote
            })
                .toReal()
                .toString();
        }
    }

    _onInputPrice(type, e) {
        let current = this.state[type];
        const isBid = type === "bid";
        current.price = new Price({
            base: current[isBid ? "for_sale" : "to_receive"],
            quote: current[isBid ? "to_receive" : "for_sale"],
            real: parseFloat(e.target.value) || 0
        });

        if (isBid) {
            this._setForSale(current, isBid) ||
                this._setReceive(current, isBid);
        } else {
            this._setReceive(current, isBid) ||
                this._setForSale(current, isBid);
        }

        current.priceText = e.target.value;
        this.forceUpdate();
    }

    _onInputSell(type, isBid, e) {
        let current = this.state[type];
        // const isBid = type === "bid";
        current.for_sale.setAmount({real: parseFloat(e.target.value) || 0});
        if (current.price.isValid()) {
            this._setReceive(current, isBid);
        } else {
            this._setPrice(current);
        }

        current.forSaleText = e.target.value;
        this._setPriceText(current, type === "bid");

        this.forceUpdate();
    }

    _onInputReceive(type, isBid, e) {
        let current = this.state[type];
        // const isBid = type === "bid";
        current.to_receive.setAmount({real: parseFloat(e.target.value) || 0});

        if (current.price.isValid()) {
            this._setForSale(current, isBid);
        } else {
            this._setPrice(current);
        }

        current.toReceiveText = e.target.value;
        this._setPriceText(current, type === "bid");
        this.forceUpdate();
    }

    isMarketFrozen() {
        let {baseAsset, quoteAsset} = this.props;

        let baseWhiteList = baseAsset
            .getIn(["options", "whitelist_markets"])
            .toJS();
        let quoteWhiteList = quoteAsset
            .getIn(["options", "whitelist_markets"])
            .toJS();
        let baseBlackList = baseAsset
            .getIn(["options", "blacklist_markets"])
            .toJS();
        let quoteBlackList = quoteAsset
            .getIn(["options", "blacklist_markets"])
            .toJS();

        if (
            quoteWhiteList.length &&
            quoteWhiteList.indexOf(baseAsset.get("id")) === -1
        ) {
            return {isFrozen: true, frozenAsset: quoteAsset.get("symbol")};
        }
        if (
            baseWhiteList.length &&
            baseWhiteList.indexOf(quoteAsset.get("id")) === -1
        ) {
            return {isFrozen: true, frozenAsset: baseAsset.get("symbol")};
        }

        if (
            quoteBlackList.length &&
            quoteBlackList.indexOf(baseAsset.get("id")) !== -1
        ) {
            return {isFrozen: true, frozenAsset: quoteAsset.get("symbol")};
        }
        if (
            baseBlackList.length &&
            baseBlackList.indexOf(quoteAsset.get("id")) !== -1
        ) {
            return {isFrozen: true, frozenAsset: baseAsset.get("symbol")};
        }

        return {isFrozen: false};
    }

    _toggleMiniChart() {
        SettingsActions.changeViewSetting({
            miniDepthChart: !this.props.miniDepthChart
        });
    }

    _onChangeMobilePanel(val) {
        this.setState({
            mobileKey: val
        });
    }

    _getMarketHistory(base_id, quote_id, bucketCount, limit) {
      let startDate = new Date();
      let endDate = new Date();

      startDate = new Date(
          startDate.getTime() - limit * bucketCount * 1000
      );
      //endDate.setDate(endDate.getDate()-10);
      //console.log("-------"+startDate.toISOString().slice(0, -5)+"-----"+endDate.toISOString().slice(0, -5));

      let promise = new Promise( (resolve, reject) => {
          Apis.instance()
              .history_api()
              .exec("get_market_history", [
                  quote_id,
                  base_id,
                  bucketCount,
                  startDate.toISOString().slice(0, -5),
                  endDate.toISOString().slice(0, -5)
              ]).then( (results) => {
                resolve(results);
              }).catch( (err) => {
                reject(err);
              });
      });
      return promise;
    }

    render() {
        let {
            currentAccountName,
            currentAccount,
            marketLimitOrders,
            marketCallOrders,
            marketData,
            activeMarketHistory,
            invertedCalls,
            starredMarkets,
            quoteAsset,
            baseAsset,
            lowestCallPrice,
            marketStats,
            marketReady,
            marketSettleOrders,
            bucketSize,
            totals,
            feedPrice,
            buckets,
            coreAsset,
            trackedGroupsConfig,
            currentGroupOrderLimit
        } = this.props;
        const {
            combinedBids,
            combinedAsks,
            lowestAsk,
            highestBid,
            flatBids,
            flatAsks,
            flatCalls,
            flatSettles,
            groupedBids,
            groupedAsks
        } = marketData;

        let {
            bid,
            ask,
            verticalOrderBook,
            verticalOrderForm,
            chartHeight,
            chartType,
            flipBuySell,
            buyDiff,
            sellDiff,
            width,
            buySellTop,
            tabBuySell,
            tabVerticalPanel,
            hidePanel,
            hideScrollbars,
            buyModalType,
            depositModalType,
            autoScroll,
            activePanels,
            panelWidth,
            mirrorPanels,
            panelTabsActive,
            panelTabs,
            singleColumnOrderForm,
            flipOrderBook,
            orderBookReversed,
            chartZoom,
            chartTools,
            hideFunctionButtons
        } = this.state;
        const {isFrozen, frozenAsset} = this.isMarketFrozen();

        let centerContainerWidth = width;
        if (this.refs.center) {
            centerContainerWidth = this.refs.center.clientWidth;
        }

        let base = null,
            quote = null,
            accountBalance = null,
            quoteBalance = null,
            baseBalance = null,
            coreBalance = null,
            quoteSymbol,
            baseSymbol,
            showCallLimit = false,
            latest,
            changeClass;

        const showVolumeChart = this.props.viewSettings.get(
            "showVolumeChart",
            true
        );

        hideScrollbars = tinyScreen ? true : hideScrollbars;

        if (quoteAsset.size && baseAsset.size && currentAccount.size) {
            base = baseAsset;
            quote = quoteAsset;
            baseSymbol = base.get("symbol");
            quoteSymbol = quote.get("symbol");

            accountBalance = currentAccount.get("balances").toJS();

            if (accountBalance) {
                for (let id in accountBalance) {
                    if (id === quote.get("id")) {
                        quoteBalance = accountBalance[id];
                    }
                    if (id === base.get("id")) {
                        baseBalance = accountBalance[id];
                    }
                    if (id === "1.3.0") {
                        coreBalance = accountBalance[id];
                    }
                }
            }

            showCallLimit = this._getSettlementInfo();
        }

        let quoteIsBitAsset = quoteAsset.get("bitasset_data_id") ? true : false;
        let baseIsBitAsset = baseAsset.get("bitasset_data_id") ? true : false;

        let spread =
            lowestAsk && highestBid
                ? lowestAsk.getPrice() - highestBid.getPrice()
                : 0;

        // Latest price
        if (activeMarketHistory.size) {
            let latest_two = activeMarketHistory.take(2);
            latest = latest_two.first();
            let second_latest = latest_two.last();

            changeClass =
                latest.getPrice() === second_latest.getPrice()
                    ? ""
                    : latest.getPrice() - second_latest.getPrice() > 0
                        ? "change-up"
                        : "change-down";
        }

        // Fees
        if (!coreAsset || !Object.keys(this.state.feeStatus).length) {
            return null;
        }

        let {
            sellFeeAsset,
            sellFeeAssets,
            sellFee,
            buyFeeAsset,
            buyFeeAssets,
            buyFee
        } = this._getFeeAssets(quote, base, coreAsset);

        // Decimals
        let hasPrediction =
            base.getIn(["bitasset", "is_prediction_market"]) ||
            quote.getIn(["bitasset", "is_prediction_market"]);

        let description = null;

        if (hasPrediction) {
            description = quoteAsset.getIn(["options", "description"]);
            description = assetUtils.parseDescription(description).main;
        }

        let smallScreen = width < 1200 ? true : false;
        let tinyScreen = width < 640 ? true : false;

        const minChartHeight = 300;
        const thisChartHeight = Math.max(
            this.state.height > 1100 ? chartHeight : chartHeight - 125,
            minChartHeight
        );

        let expirationType = this.state.expirationType;
        let expirationCustomTime = this.state.expirationCustomTime;

        let isPanelActive = activePanels.length >= 1 ? true : false;
        let isPredictionMarket = base.getIn([
            "bitasset",
            "is_prediction_market"
        ]);

        /***
         * Generate layout cards
         */
        let actionCardIndex = 0;

        let buyLimitForm = isFrozen ? null : tinyScreen &&
        !this.state.mobileKey.includes("buySellTab") ? null : (
            <BuySell
                key={`actionCard_${actionCardIndex++}`}
                onBorrow={baseIsBitAsset ? this._borrowBase.bind(this) : null}
                onBuy={this._onBuy.bind(this, "bid")}
                onDeposit={this._onDeposit.bind(this, "bid")}
                currentAccount={currentAccount}
                backedCoin={this.props.backedCoins.find(
                    a => a.symbol === base.get("symbol")
                )}
                currentBridges={
                    this.props.bridgeCoins.get(base.get("symbol")) || null
                }
                isOpen={this.state.buySellOpen}
                onToggleOpen={this._toggleOpenBuySell.bind(this)}
                parentWidth={centerContainerWidth}
                styles={{padding: 5, paddingRight: mirrorPanels ? 15 : 5}}
                className={cnames(
                    verticalOrderForm && !smallScreen
                        ? ""
                        : centerContainerWidth > 1200
                            ? ""
                            : centerContainerWidth > 800
                                ? ""
                                : "",
                    "small-12 no-padding middle-content",
                    flipBuySell
                        ? `order-${buySellTop ? 2 : 3} large-order-${
                              buySellTop ? 2 : 5
                          } sell-form`
                        : `order-${buySellTop ? 1 : 2} large-order-${
                              buySellTop ? 1 : 4
                          } buy-form`
                )}
                type="bid"
                hideHeader={
                    tinyScreen || (!smallScreen && verticalOrderForm)
                        ? true
                        : false
                }
                expirationType={expirationType["bid"]}
                expirations={this.EXPIRATIONS}
                expirationCustomTime={expirationCustomTime["bid"]}
                onExpirationTypeChange={this._handleExpirationChange.bind(
                    this,
                    "bid"
                )}
                onExpirationCustomChange={this._handleCustomExpirationChange.bind(
                    this,
                    "bid"
                )}
                amount={bid.toReceiveText}
                price={bid.priceText}
                total={bid.forSaleText}
                quote={quote}
                base={base}
                amountChange={this._onInputReceive.bind(this, "bid", true)}
                priceChange={this._onInputPrice.bind(this, "bid")}
                setPrice={this._currentPriceClick.bind(this)}
                totalChange={this._onInputSell.bind(this, "bid", false)}
                clearForm={this._clearForms.bind(this, "bid")}
                balance={baseBalance}
                balanceId={base.get("id")}
                onSubmit={this._createLimitOrderConfirm.bind(
                    this,
                    quote,
                    base,
                    baseBalance,
                    coreBalance,
                    buyFeeAsset,
                    "buy"
                )}
                balancePrecision={base.get("precision")}
                quotePrecision={quote.get("precision")}
                totalPrecision={base.get("precision")}
                currentPrice={lowestAsk.getPrice()}
                currentPriceObject={lowestAsk}
                account={currentAccount.get("name")}
                fee={buyFee}
                hasFeeBalance={this.state.feeStatus[buyFee.asset_id].hasBalance}
                feeAssets={buyFeeAssets}
                feeAsset={buyFeeAsset}
                onChangeFeeAsset={this.onChangeFeeAsset.bind(this, "buy")}
                isPredictionMarket={base.getIn([
                    "bitasset",
                    "is_prediction_market"
                ])}
                onFlip={!flipBuySell ? this._flipBuySell.bind(this) : null}
                onTogglePosition={
                    this.state.buySellTop && !verticalOrderBook
                        ? this._toggleBuySellPosition.bind(this)
                        : null
                }
                moveOrderForm={
                    !smallScreen && (!flipBuySell || verticalOrderForm)
                        ? this._moveOrderForm.bind(this)
                        : null
                }
                verticalOrderForm={!smallScreen ? verticalOrderForm : false}
                isPanelActive={isPanelActive}
                activePanels={activePanels}
                singleColumnOrderForm={singleColumnOrderForm}
                hideFunctionButtons={hideFunctionButtons}
            />
        );

        let buyMarketForm = isFrozen ? null : tinyScreen &&
        !this.state.mobileKey.includes("buySellTab") ? null : (
            <BuySellMarket
                key={`actionCard_${actionCardIndex++}`}
                onBorrow={baseIsBitAsset ? this._borrowBase.bind(this) : null}
                onBuy={this._onBuy.bind(this, "bid")}
                onDeposit={this._onDeposit.bind(this, "bid")}
                currentAccount={currentAccount}
                backedCoin={this.props.backedCoins.find(
                    a => a.symbol === base.get("symbol")
                )}
                currentBridges={
                    this.props.bridgeCoins.get(base.get("symbol")) || null
                }
                isOpen={this.state.buySellOpen}
                onToggleOpen={this._toggleOpenBuySell.bind(this)}
                parentWidth={centerContainerWidth}
                styles={{padding: 5, paddingRight: mirrorPanels ? 15 : 5}}
                className={cnames(
                    verticalOrderForm && !smallScreen
                        ? ""
                        : centerContainerWidth > 1200
                            ? ""
                            : centerContainerWidth > 800
                                ? ""
                                : "",
                    "small-12 no-padding middle-content",
                    flipBuySell
                        ? `order-${buySellTop ? 2 : 3} large-order-${
                              buySellTop ? 2 : 5
                          } sell-form`
                        : `order-${buySellTop ? 1 : 2} large-order-${
                              buySellTop ? 1 : 4
                          } buy-form`
                )}
                type="bid"
                hideHeader={
                    tinyScreen || (!smallScreen && verticalOrderForm)
                        ? true
                        : false
                }
                expirationType={expirationType["bid"]}
                expirations={this.EXPIRATIONS}
                expirationCustomTime={expirationCustomTime["bid"]}
                onExpirationTypeChange={this._handleExpirationChange.bind(
                    this,
                    "bid"
                )}
                onExpirationCustomChange={this._handleCustomExpirationChange.bind(
                    this,
                    "bid"
                )}
                amount={bid.toReceiveText}
                price={bid.priceText}
                total={bid.forSaleText}
                quote={quote}
                base={base}
                amountChange={this._onInputReceive.bind(this, "bid", true)}
                priceChange={this._onInputPrice.bind(this, "bid")}
                setPrice={this._currentPriceClick.bind(this)}
                totalChange={this._onInputSell.bind(this, "bid", false)}
                clearForm={this._clearForms.bind(this, "bid")}
                balance={baseBalance}
                balanceId={base.get("id")}
                onSubmit={this._createLimitOrderConfirm.bind(
                    this,
                    quote,
                    base,
                    baseBalance,
                    coreBalance,
                    buyFeeAsset,
                    "buy"
                )}
                balancePrecision={base.get("precision")}
                quotePrecision={quote.get("precision")}
                totalPrecision={base.get("precision")}
                currentPrice={lowestAsk.getPrice()}
                currentPriceObject={lowestAsk}
                account={currentAccount.get("name")}
                fee={buyFee}
                hasFeeBalance={this.state.feeStatus[buyFee.asset_id].hasBalance}
                feeAssets={buyFeeAssets}
                feeAsset={buyFeeAsset}
                onChangeFeeAsset={this.onChangeFeeAsset.bind(this, "buy")}
                isPredictionMarket={base.getIn([
                    "bitasset",
                    "is_prediction_market"
                ])}
                onFlip={!flipBuySell ? this._flipBuySell.bind(this) : null}
                onTogglePosition={
                    this.state.buySellTop && !verticalOrderBook
                        ? this._toggleBuySellPosition.bind(this)
                        : null
                }
                moveOrderForm={
                    !smallScreen && (!flipBuySell || verticalOrderForm)
                        ? this._moveOrderForm.bind(this)
                        : null
                }
                verticalOrderForm={!smallScreen ? verticalOrderForm : false}
                isPanelActive={isPanelActive}
                activePanels={activePanels}
                singleColumnOrderForm={singleColumnOrderForm}
                hideFunctionButtons={hideFunctionButtons}
            />
        );

        let sellLimitForm = isFrozen ? null : tinyScreen &&
        !this.state.mobileKey.includes("buySellTab") ? null : (
            <BuySell
                key={`actionCard_${actionCardIndex++}`}
                onBorrow={quoteIsBitAsset ? this._borrowQuote.bind(this) : null}
                onBuy={this._onBuy.bind(this, "ask")}
                onDeposit={this._onDeposit.bind(this, "ask")}
                currentAccount={currentAccount}
                backedCoin={this.props.backedCoins.find(
                    a => a.symbol === quote.get("symbol")
                )}
                currentBridges={
                    this.props.bridgeCoins.get(quote.get("symbol")) || null
                }
                isOpen={this.state.buySellOpen}
                onToggleOpen={this._toggleOpenBuySell.bind(this)}
                parentWidth={centerContainerWidth}
                styles={{padding: 5, paddingRight: mirrorPanels ? 15 : 5}}
                className={cnames(
                    verticalOrderForm && !smallScreen
                        ? ""
                        : centerContainerWidth > 1200
                            ? ""
                            : centerContainerWidth > 800
                                ? ""
                                : "",
                    "small-12 no-padding middle-content",
                    flipBuySell
                        ? `order-${buySellTop ? 1 : 2} large-order-${
                              buySellTop ? 1 : 4
                          } buy-form`
                        : `order-${buySellTop ? 2 : 3} large-order-${
                              buySellTop ? 2 : 5
                          } sell-form`
                )}
                type="ask"
                hideHeader={
                    tinyScreen || (!smallScreen && verticalOrderForm)
                        ? true
                        : false
                }
                amount={ask.forSaleText}
                price={ask.priceText}
                total={ask.toReceiveText}
                quote={quote}
                base={base}
                expirationType={expirationType["ask"]}
                expirations={this.EXPIRATIONS}
                expirationCustomTime={expirationCustomTime["ask"]}
                onExpirationTypeChange={this._handleExpirationChange.bind(
                    this,
                    "ask"
                )}
                onExpirationCustomChange={this._handleCustomExpirationChange.bind(
                    this,
                    "ask"
                )}
                amountChange={this._onInputSell.bind(this, "ask", false)}
                priceChange={this._onInputPrice.bind(this, "ask")}
                setPrice={this._currentPriceClick.bind(this)}
                totalChange={this._onInputReceive.bind(this, "ask", true)}
                clearForm={this._clearForms.bind(this, "ask")}
                balance={quoteBalance}
                balanceId={quote.get("id")}
                onSubmit={this._createLimitOrderConfirm.bind(
                    this,
                    base,
                    quote,
                    quoteBalance,
                    coreBalance,
                    sellFeeAsset,
                    "sell"
                )}
                balancePrecision={quote.get("precision")}
                quotePrecision={quote.get("precision")}
                totalPrecision={base.get("precision")}
                currentPrice={highestBid.getPrice()}
                currentPriceObject={highestBid}
                account={currentAccount.get("name")}
                fee={sellFee}
                hasFeeBalance={
                    this.state.feeStatus[sellFee.asset_id].hasBalance
                }
                feeAssets={sellFeeAssets}
                feeAsset={sellFeeAsset}
                onChangeFeeAsset={this.onChangeFeeAsset.bind(this, "sell")}
                isPredictionMarket={quote.getIn([
                    "bitasset",
                    "is_prediction_market"
                ])}
                onFlip={flipBuySell ? this._flipBuySell.bind(this) : null}
                onTogglePosition={
                    this.state.buySellTop && !verticalOrderBook
                        ? this._toggleBuySellPosition.bind(this)
                        : null
                }
                moveOrderForm={
                    !smallScreen && (flipBuySell || verticalOrderForm)
                        ? this._moveOrderForm.bind(this)
                        : null
                }
                verticalOrderForm={!smallScreen ? verticalOrderForm : false}
                isPanelActive={isPanelActive}
                activePanels={activePanels}
                singleColumnOrderForm={singleColumnOrderForm}
                hideFunctionButtons={hideFunctionButtons}
            />
        );

        let sellMarketForm = isFrozen ? null : tinyScreen &&
        !this.state.mobileKey.includes("buySellTab") ? null : (
            <BuySellMarket
                key={`actionCard_${actionCardIndex++}`}
                onBorrow={quoteIsBitAsset ? this._borrowQuote.bind(this) : null}
                onBuy={this._onBuy.bind(this, "ask")}
                onDeposit={this._onDeposit.bind(this, "ask")}
                currentAccount={currentAccount}
                backedCoin={this.props.backedCoins.find(
                    a => a.symbol === quote.get("symbol")
                )}
                currentBridges={
                    this.props.bridgeCoins.get(quote.get("symbol")) || null
                }
                isOpen={this.state.buySellOpen}
                onToggleOpen={this._toggleOpenBuySell.bind(this)}
                parentWidth={centerContainerWidth}
                styles={{padding: 5, paddingRight: mirrorPanels ? 15 : 5}}
                className={cnames(
                    verticalOrderForm && !smallScreen
                        ? ""
                        : centerContainerWidth > 1200
                            ? ""
                            : centerContainerWidth > 800
                                ? ""
                                : "",
                    "small-12 no-padding middle-content",
                    flipBuySell
                        ? `order-${buySellTop ? 1 : 2} large-order-${
                              buySellTop ? 1 : 4
                          } buy-form`
                        : `order-${buySellTop ? 2 : 3} large-order-${
                              buySellTop ? 2 : 5
                          } sell-form`
                )}
                type="ask"
                hideHeader={
                    tinyScreen || (!smallScreen && verticalOrderForm)
                        ? true
                        : false
                }
                amount={ask.forSaleText}
                price={ask.priceText}
                total={ask.toReceiveText}
                quote={quote}
                base={base}
                expirationType={expirationType["ask"]}
                expirations={this.EXPIRATIONS}
                expirationCustomTime={expirationCustomTime["ask"]}
                onExpirationTypeChange={this._handleExpirationChange.bind(
                    this,
                    "ask"
                )}
                onExpirationCustomChange={this._handleCustomExpirationChange.bind(
                    this,
                    "ask"
                )}
                amountChange={this._onInputSell.bind(this, "ask", false)}
                priceChange={this._onInputPrice.bind(this, "ask")}
                setPrice={this._currentPriceClick.bind(this)}
                totalChange={this._onInputReceive.bind(this, "ask", true)}
                clearForm={this._clearForms.bind(this, "ask")}
                balance={quoteBalance}
                balanceId={quote.get("id")}
                onSubmit={this._createLimitOrderConfirm.bind(
                    this,
                    base,
                    quote,
                    quoteBalance,
                    coreBalance,
                    sellFeeAsset,
                    "sell"
                )}
                balancePrecision={quote.get("precision")}
                quotePrecision={quote.get("precision")}
                totalPrecision={base.get("precision")}
                currentPrice={highestBid.getPrice()}
                currentPriceObject={highestBid}
                account={currentAccount.get("name")}
                fee={sellFee}
                hasFeeBalance={
                    this.state.feeStatus[sellFee.asset_id].hasBalance
                }
                feeAssets={sellFeeAssets}
                feeAsset={sellFeeAsset}
                onChangeFeeAsset={this.onChangeFeeAsset.bind(this, "sell")}
                isPredictionMarket={quote.getIn([
                    "bitasset",
                    "is_prediction_market"
                ])}
                onFlip={flipBuySell ? this._flipBuySell.bind(this) : null}
                onTogglePosition={
                    this.state.buySellTop && !verticalOrderBook
                        ? this._toggleBuySellPosition.bind(this)
                        : null
                }
                moveOrderForm={
                    !smallScreen && (flipBuySell || verticalOrderForm)
                        ? this._moveOrderForm.bind(this)
                        : null
                }
                verticalOrderForm={!smallScreen ? verticalOrderForm : false}
                isPanelActive={isPanelActive}
                activePanels={activePanels}
                singleColumnOrderForm={singleColumnOrderForm}
                hideFunctionButtons={hideFunctionButtons}
            />
        );


        let exchangeHeader =
          (<ExchangeHeader
              hasAnyPriceAlert={this.props.hasAnyPriceAlert}
              showPriceAlertModal={this.showPriceAlertModal}
              account={this.props.currentAccount}
              quoteAsset={quoteAsset}
              baseAsset={baseAsset}
              hasPrediction={hasPrediction}
              starredMarkets={starredMarkets}
              lowestAsk={lowestAsk}
              highestBid={highestBid}
              lowestCallPrice={lowestCallPrice}
              showCallLimit={showCallLimit}
              feedPrice={feedPrice}
              marketReady={marketReady}
              latestPrice={latest && latest.getPrice()}
              marketStats={marketStats}
              selectedMarketPickerAsset={this.state.marketPickerAsset}
              onToggleMarketPicker={this._toggleMarketPicker.bind(this)}
              onTogglePersonalize={this._togglePersonalize.bind(this)}
              onToggleCharts={this._toggleCharts.bind(this)}
              showVolumeChart={showVolumeChart}
          />);

        let myMarkets =
            tinyScreen && !this.state.mobileKey.includes("myMarkets") ? null : (
                <MyMarkets
                    key={`actionCard_${actionCardIndex++}`}
                    className="left-order-book no-overflow order-9"
                    style={{
                        minWidth: 350,
                        height: smallScreen ? 680 : "calc(80vh - 215px)",
                        padding: smallScreen ? 10 : 0
                    }}
                    headerStyle={{
                        width: "100%",
                        display: !smallScreen ? "display: none" : ""
                    }}
                    noHeader={true}
                    listHeight={this.state.height - 450}
                    columns={[
                        {name: "star", index: 1},
                        {name: "market", index: 2},
                        {name: "vol", index: 3},
                        {name: "price", index: 4},
                        {name: "change", index: 5}
                    ]}
                    findColumns={[
                        {name: "market", index: 1},
                        {name: "issuer", index: 2},
                        {name: "vol", index: 3},
                        {name: "add", index: 4}
                    ]}
                    current={`${quoteSymbol}_${baseSymbol}`}
                    location={this.props.location}
                    history={this.props.history}
                    activeTab={
                        tabVerticalPanel ? tabVerticalPanel : "my-market"
                    }
                />
            );

        let orderBook =
            tinyScreen && !this.state.mobileKey.includes("orderBook") ? null : (
                <OrderBook
                    ref="order_book"
                    key={`actionCard_${actionCardIndex++}`}
                    latest={latest && latest.getPrice()}
                    changeClass={changeClass}
                    orders={marketLimitOrders}
                    calls={marketCallOrders}
                    invertedCalls={invertedCalls}
                    combinedBids={combinedBids}
                    combinedAsks={combinedAsks}
                    highestBid={highestBid}
                    lowestAsk={lowestAsk}
                    totalBids={totals.bid}
                    totalAsks={totals.ask}
                    base={base}
                    quote={quote}
                    baseSymbol={baseSymbol}
                    quoteSymbol={quoteSymbol}
                    onClick={this._orderbookClick.bind(this)}
                    horizontal={
                        !verticalOrderBook || smallScreen ? true : false
                    }
                    flipOrderBook={flipOrderBook}
                    orderBookReversed={orderBookReversed}
                    marketReady={marketReady}
                    wrapperClass={cnames(
                        centerContainerWidth > 1200
                            ? "xlarge-8"
                            : centerContainerWidth > 800
                                ? ""
                                : "",
                        "medium-12 large-12",
                        "small-12 grid-block orderbook no-padding align-spaced no-overflow wrap shrink",
                        `order-${buySellTop ? 3 : 1} xlarge-order-${
                            buySellTop ? 4 : 1
                        }`
                    )}
                    innerClass={cnames(
                        centerContainerWidth > 800 ? "medium-6" : "medium-12",
                        "large-6 xlarge-6",
                        "small-12 middle-content",
                        !tinyScreen ? "exchange-padded" : ""
                    )}
                    currentAccount={this.props.currentAccount.get("id")}
                    handleGroupOrderLimitChange={this._onGroupOrderLimitChange.bind(
                        this
                    )}
                    trackedGroupsConfig={trackedGroupsConfig}
                    currentGroupOrderLimit={currentGroupOrderLimit}
                    groupedBids={groupedBids}
                    groupedAsks={groupedAsks}
                    isPanelActive={activePanels.length >= 1}
                    onTogglePosition={
                        !this.state.buySellTop
                            ? this._toggleBuySellPosition.bind(this)
                            : null
                    }
                    moveOrderBook={
                        !smallScreen ? this._moveOrderBook.bind(this) : null
                    }
                    smallScreen={smallScreen}
                    hideScrollbars={hideScrollbars}
                    autoScroll={autoScroll}
                    onFlipOrderBook={this._flipOrderBook.bind(this)}
                    hideFunctionButtons={hideFunctionButtons}
                />
            );


        panelWidth = 367;

        let marketHistory =
            tinyScreen &&
            !this.state.mobileKey.includes("marketHistory") ? null : (
                <MarketHistory
                    key={`actionCard_${actionCardIndex++}`}
                    className={cnames(
                        panelTabs["history"] == 0
                            ? centerContainerWidth > 1200
                                ? "medium-6 large-6 xlarge-4"
                                : centerContainerWidth > 800
                                    ? "medium-6"
                                    : ""
                            : "medium-12",
                        "no-padding no-overflow middle-content small-12 order-6"
                    )}
                    innerClass={!tinyScreen ? "exchange-padded" : ""}
                    innerStyle={{paddingBottom: !tinyScreen ? "1.2rem" : "0"}}
                    noHeader={panelTabs["history"] == 0 ? false : true}
                    history={activeMarketHistory}
                    currentAccount={currentAccount}
                    myHistory={currentAccount.get("history")}
                    base={base}
                    quote={quote}
                    baseSymbol={baseSymbol}
                    quoteSymbol={quoteSymbol}
                    activeTab={"history"}
                    tinyScreen={tinyScreen}
                    isPanelActive={isPanelActive}
                    hideScrollbars={hideScrollbars}
                />
            );

        let myMarketHistory =
            tinyScreen &&
            !this.state.mobileKey.includes("myMarketHistory") ? null : (
                <MarketHistory
                    key={`actionCard_${actionCardIndex++}`}
                    className={cnames(
                        panelTabs["my_history"] == 0
                            ? centerContainerWidth > 1200
                                ? "medium-6 large-6 xlarge-4"
                                : centerContainerWidth > 800
                                    ? "medium-6"
                                    : ""
                            : "medium-12",
                        "no-padding no-overflow middle-content small-12 order-5"
                    )}
                    innerClass={!tinyScreen ? "exchange-padded" : ""}
                    innerStyle={{paddingBottom: !tinyScreen ? "1.2rem" : "0"}}
                    noHeader={panelTabs["my_history"] == 0 ? false : true}
                    history={activeMarketHistory}
                    currentAccount={currentAccount}
                    myHistory={currentAccount.get("history")}
                    base={base}
                    quote={quote}
                    baseSymbol={baseSymbol}
                    quoteSymbol={quoteSymbol}
                    activeTab={"my_history"}
                    tinyScreen={tinyScreen}
                    isPanelActive={isPanelActive}
                    hideScrollbars={hideScrollbars}
                />
            );

        let myOpenOrders =
            tinyScreen &&
            !this.state.mobileKey.includes("myOpenOrders") ? null : (
                <MyOpenOrders
                    key={`actionCard_${actionCardIndex++}`}
                    style={{marginBottom: !tinyScreen ? 15 : 0}}
                    className={cnames(
                        panelTabs["my_orders"] == 0
                            ? centerContainerWidth > 1200
                                ? "medium-6 large-6 xlarge-4"
                                : centerContainerWidth > 800
                                    ? "medium-6"
                                    : ""
                            : "medium-12",
                        "no-padding no-overflow middle-content small-12 order-7"
                    )}
                    innerClass={!tinyScreen ? "exchange-padded" : ""}
                    innerStyle={{paddingBottom: !tinyScreen ? "1.2rem" : "0"}}
                    noHeader={panelTabs["my_orders"] == 0 ? false : true}
                    orders={marketLimitOrders}
                    settleOrders={marketSettleOrders}
                    currentAccount={currentAccount}
                    base={base}
                    quote={quote}
                    baseSymbol={baseSymbol}
                    quoteSymbol={quoteSymbol}
                    activeTab={"my_orders"}
                    onCancel={this._cancelLimitOrder.bind(this)}
                    flipMyOrders={this.props.viewSettings.get("flipMyOrders")}
                    feedPrice={this.props.feedPrice}
                    smallScreen={smallScreen}
                    tinyScreen={tinyScreen}
                    hidePanel={hidePanel}
                    isPanelActive={isPanelActive}
                    hideScrollbars={hideScrollbars}
                />
            );

        let settlementOrders =
            marketSettleOrders.size === 0 ||
            (tinyScreen &&
                !this.state.mobileKey.includes("settlementOrders")) ? null : (
                <MyOpenOrders
                    key={`actionCard_${actionCardIndex++}`}
                    style={{marginBottom: !tinyScreen ? 15 : 0}}
                    className={cnames(
                        panelTabs["open_settlement"] == 0
                            ? centerContainerWidth > 1200
                                ? "medium-6 large-6 xlarge-4"
                                : centerContainerWidth > 800
                                    ? "medium-6"
                                    : ""
                            : "medium-12",
                        "no-padding no-overflow middle-content small-12 order-8"
                    )}
                    innerClass={!tinyScreen ? "exchange-padded" : ""}
                    innerStyle={{paddingBottom: !tinyScreen ? "1.2rem" : "0"}}
                    noHeader={panelTabs["open_settlement"] == 0 ? false : true}
                    orders={marketLimitOrders}
                    settleOrders={marketSettleOrders}
                    currentAccount={currentAccount}
                    base={base}
                    quote={quote}
                    baseSymbol={baseSymbol}
                    quoteSymbol={quoteSymbol}
                    activeTab={"open_settlement"}
                    onCancel={this._cancelLimitOrder.bind(this)}
                    flipMyOrders={this.props.viewSettings.get("flipMyOrders")}
                    feedPrice={this.props.feedPrice}
                    smallScreen={smallScreen}
                    tinyScreen={tinyScreen}
                    hidePanel={hidePanel}
                    isPanelActive={isPanelActive}
                    hideScrollbars={hideScrollbars}
                />
            );

        let tradingViewChart =
            (!tinyScreen && !(chartType == "price_chart")) ||
            (tinyScreen &&
                !this.state.mobileKey.includes("tradingViewChart")) ? null : (
                <TradingViewPriceChart
                    locale={this.props.locale}
                    dataFeed={this.props.dataFeed}
                    baseSymbol={baseSymbol}
                    quoteSymbol={quoteSymbol}
                    marketReady={marketReady}
                    theme={this.props.settings.get("themes")}
                    //theme={"midnightTheme"}
                    buckets={buckets}
                    bucketSize={bucketSize}
                    currentPeriod={this.state.currentPeriod}
                    chartHeight={thisChartHeight}
                    chartZoom={tinyScreen ? false : chartZoom}
                    chartTools={tinyScreen ? false : chartTools}
                    mobile={tinyScreen}
                    selectedIndicator={this.state.selectedIndicator}
                />
            );

        let deptHighChart =
            (!tinyScreen && !(chartType == "market_depth")) ||
            (tinyScreen &&
                !this.state.mobileKey.includes("deptHighChart")) ? null : (
                <DepthHighChart
                    marketReady={marketReady}
                    orders={marketLimitOrders}
                    showCallLimit={showCallLimit}
                    call_orders={marketCallOrders}
                    flat_asks={flatAsks}
                    flat_bids={flatBids}
                    flat_calls={showCallLimit ? flatCalls : []}
                    flat_settles={
                        this.props.settings.get("showSettles") && flatSettles
                    }
                    settles={marketSettleOrders}
                    invertedCalls={invertedCalls}
                    totalBids={totals.bid}
                    totalAsks={totals.ask}
                    base={base}
                    quote={quote}
                    height={thisChartHeight}
                    isPanelActive={isPanelActive}
                    onClick={this._depthChartClick.bind(this, base, quote)}
                    feedPrice={
                        !hasPrediction && feedPrice && feedPrice.toReal()
                    }
                    spread={spread}
                    LCP={showCallLimit ? lowestCallPrice : null}
                    hasPrediction={hasPrediction}
                    noFrame={false}
                    //theme={this.props.settings.get("themes")}
                    theme={"midnightTheme"}
                    centerRef={this.refs.center}
                    activePanels={activePanels}
                />
            );

        /***
         * Generate tabs based on Layout
         *
         */

        let buySellTab = (
            <div
                key={`actionCard_${actionCardIndex++}`}
                className={"left-order-book small-12"}
                style={{
                    paddingLeft: 5,
                    /*width: !smallScreen ? 300 : "auto"*/
                }}
            >
                <Tabs
                    defaultActiveKey="buy"
                    activeKey={tabBuySell}
                    onChange={this._setTabBuySell.bind(this)}
                    style={{
                        padding: "0px !important",
                        margin: "0px !important"
                    }}
                >
                    <Tabs.TabPane
                        tab={
                            <TranslateWithLinks
                                string="exchange.buysell_formatter"
                                noLink
                                noTip={false}
                                keys={[
                                    {
                                        type: "asset",
                                        value: quote.get("symbol"),
                                        arg: "asset"
                                    },
                                    {
                                        type: "translate",
                                        value: isPredictionMarket
                                            ? "exchange.short"
                                            : "exchange.buy",
                                        arg: "direction"
                                    }
                                ]}
                            />
                        }
                        key="buy"
                    >
                        {buyLimitForm}
                    </Tabs.TabPane>
                    <Tabs.TabPane
                        tab={
                            <TranslateWithLinks
                                string="exchange.buysell_formatter"
                                noLink
                                noTip={false}
                                keys={[
                                    {
                                        type: "asset",
                                        value: quote.get("symbol"),
                                        arg: "asset"
                                    },
                                    {
                                        type: "translate",
                                        value: isPredictionMarket
                                            ? "exchange.short"
                                            : "exchange.sell",
                                        arg: "direction"
                                    }
                                ]}
                            />
                        }
                        key="sell"
                    >
                        {sellLimitForm}
                    </Tabs.TabPane>
                </Tabs>
            </div>
        );

        // Generate Tabbed Groups
        let groupTabs = {1: [], 2: []};
        let groupStandalone = [];

        Object.keys(panelTabs).map(a => {
            if (panelTabs[a] == 0) {
                // Handle Standalone Settings
                if (a == "my_history") {
                    groupStandalone.push(myMarketHistory);
                }

                if (a == "history") {
                    groupStandalone.push(marketHistory);
                }

                if (a == "my_orders") {
                    groupStandalone.push(myOpenOrders);
                }

                if (a == "open_settlement" && settlementOrders !== null) {
                    groupStandalone.push(settlementOrders);
                }
            } else {
                if (a == "my_history") {
                    groupTabs[panelTabs[a]].push(
                        <Tabs.TabPane
                            tab={translator.translate("exchange.my_history")}
                            key="my_history"
                        >
                            {myMarketHistory}
                        </Tabs.TabPane>
                    );
                }

                if (a == "history") {
                    groupTabs[panelTabs[a]].push(
                        <Tabs.TabPane
                            tab={translator.translate("exchange.history")}
                            key="history"
                        >
                            {marketHistory}
                        </Tabs.TabPane>
                    );
                }

                if (a == "my_orders") {
                    groupTabs[panelTabs[a]].push(
                        <Tabs.TabPane
                            tab={translator.translate("exchange.my_orders")}
                            key="my_orders"
                        >
                            {myOpenOrders}
                        </Tabs.TabPane>
                    );
                }

                if (a == "open_settlement" && settlementOrders !== null) {
                    groupTabs[panelTabs[a]].push(
                        <Tabs.TabPane
                            tab={translator.translate("exchange.settle_orders")}
                            key="open_settlement"
                        >
                            {settlementOrders}
                        </Tabs.TabPane>
                    );
                }
            }
        });

        Object.keys(panelTabsActive).map(thisTabsId => {
            Object.keys(panelTabs).map(thisPanelName => {
                let stop = false;
                if (!stop && thisTabsId == panelTabs[thisPanelName]) {
                    panelTabsActive[thisTabsId] = !panelTabsActive[thisTabsId]
                        ? thisPanelName
                        : panelTabsActive[thisTabsId];
                    stop = true;
                }
            });
        });

        let groupTabsCount = groupStandalone.length;

        Object.keys(groupTabs).map(tab => {
            if (groupTabs[tab].length) {
                groupTabsCount++;
            }
        });

        let groupTabbed1 =
            groupTabs[1].length > 0 ? (
                <div
                    key={`actionCard_${actionCardIndex++}`}
                    className={cnames(
                        verticalOrderBook ? "xlarge-order-2" : "xlarge-order-2",
                        centerContainerWidth > 1200
                            ? groupTabsCount == 1
                                ? "medium-12 xlarge-4"
                                : "medium-6 xlarge-4 "
                            : centerContainerWidth > 800
                                ? groupTabsCount == 1
                                    ? "medium-12"
                                    : "medium-6"
                                : "",
                        "small-12 order-5"
                    )}
                    style={{paddingRight: 5}}
                >
                    <Tabs
                        activeKey={panelTabsActive[1]}
                        onChange={this._setPanelTabInGroup.bind(this, 1)}
                    >
                        {groupTabs[1]}
                    </Tabs>
                </div>
            ) : null;

        let groupTabbed2 =
            groupTabs[2].length > 0 ? (
                <div
                    key={`actionCard_${actionCardIndex++}`}
                    className={cnames(
                        centerContainerWidth > 1200
                            ? groupTabsCount == 1
                                ? "medium-12 xlarge-4"
                                : "medium-6 xlarge-4 "
                            : centerContainerWidth > 800
                                ? groupTabsCount == 1
                                    ? "medium-12"
                                    : "medium-6"
                                : "",
                        "small-12 order-6"
                    )}
                    style={{paddingRight: 5}}
                >
                    <Tabs
                        activeKey={panelTabsActive[2]}
                        onChange={this._setPanelTabInGroup.bind(this, 2)}
                    >
                        {groupTabs[2]}
                    </Tabs>
                </div>
            ) : null;

        let emptyDiv = (
            <div
                className={cnames(
                    centerContainerWidth > 1200
                        ? "xlarge-8"
                        : centerContainerWidth > 800
                            ? ""
                            : "",
                    "medium-12 large-12",
                    "small-12 grid-block orderbook no-padding align-spaced no-overflow wrap",
                    `order-${buySellTop ? 3 : 1} xlarge-order-${
                        buySellTop ? 4 : 1
                    }`
                )}
            >
                &nbsp;
            </div>
        );

        /**
         * Generate layout grid based on Screen Size
         */
        let actionCards = [];
        if (!smallScreen) {
            actionCards.push(
              <div key="actionCard1" style={{width: "100%",margin: 0, textAlign: "center"}}>
                <Modal
                  visible={this.state.buyModalIsOpen}
                  onAfterOpen={this.afterOpenBuyModal}
                  onRequestClose={this.closeBuyModal}
                  onCancel={this.closeBuyModal}
                  onOk={this.closeBuyModal}
                  contentLabel="Example Modal"
                  className = {"market-layout"}
                  footer={null}
                >
                    <Tabs
                        defaultActiveKey="buy"
                        activeKey={tabBuySell}
                        onChange={this._setTabBuySell.bind(this)}
                        style={{
                            padding: "0px !important",
                            margin: "0px !important"
                        }}
                    >
                        <Tabs.TabPane
                            tab={
                                <TranslateWithLinks
                                    string="exchange.limit_order"
                                    noLink
                                    noTip={false}
                                    keys={[
                                        {
                                            type: "asset",
                                            value: quote.get("symbol"),
                                            arg: "asset"
                                        },
                                        {
                                            type: "translate",
                                            value: isPredictionMarket
                                                ? "exchange.short"
                                                : "exchange.buy",
                                            arg: "direction"
                                        }
                                    ]}
                                />
                            }
                            key="buy"
                        >
                            {buyLimitForm}
                        </Tabs.TabPane>
                        <Tabs.TabPane
                            tab={
                                <TranslateWithLinks
                                    string="exchange.market_order"
                                    noLink
                                    noTip={false}
                                    keys={[
                                        {
                                            type: "asset",
                                            value: quote.get("symbol"),
                                            arg: "asset"
                                        },
                                        {
                                            type: "translate",
                                            value: isPredictionMarket
                                                ? "exchange.short"
                                                : "exchange.sell",
                                            arg: "direction"
                                        }
                                    ]}
                                />
                            }
                            key="sell"
                        >
                            {buyMarketForm}
                        </Tabs.TabPane>
                    </Tabs>
                </Modal>

                <Modal
                  visible={this.state.sellModalIsOpen}
                  onAfterOpen={this.afterOpenSellModal}
                  onRequestClose={this.closeSellModal}
                  onCancel={this.closeSellModal}
                  onOk={this.closeSellModal}
                  contentLabel="Example Modal"
                  className = {"market-layout"}
                  footer={null}
                >
                    <Tabs
                        defaultActiveKey="buy"
                        activeKey={tabBuySell}
                        onChange={this._setTabBuySell.bind(this)}
                        style={{
                            padding: "0px !important",
                            margin: "0px !important"
                        }}
                    >
                        <Tabs.TabPane
                            tab={
                                <TranslateWithLinks
                                    string="exchange.limit_order"
                                    noLink
                                    noTip={false}
                                    keys={[
                                        {
                                            type: "asset",
                                            value: quote.get("symbol"),
                                            arg: "asset"
                                        },
                                        {
                                            type: "translate",
                                            value: isPredictionMarket
                                                ? "exchange.short"
                                                : "exchange.buy",
                                            arg: "direction"
                                        }
                                    ]}
                                />
                            }
                            key="buy"
                        >
                            {sellLimitForm}
                        </Tabs.TabPane>
                        <Tabs.TabPane
                            tab={
                                <TranslateWithLinks
                                    string="exchange.market_order"
                                    noLink
                                    noTip={false}
                                    keys={[
                                        {
                                            type: "asset",
                                            value: quote.get("symbol"),
                                            arg: "asset"
                                        },
                                        {
                                            type: "translate",
                                            value: isPredictionMarket
                                                ? "exchange.short"
                                                : "exchange.sell",
                                            arg: "direction"
                                        }
                                    ]}
                                />
                            }
                            key="sell"
                        >
                            {sellMarketForm}
                        </Tabs.TabPane>
                    </Tabs>
                </Modal>
              </div>
            );
        } else if (!tinyScreen) {
            actionCards.push(buyLimitForm);
            actionCards.push(sellLimitForm);
            actionCards.push(orderBook);
            actionCards.push(groupStandalone);
            actionCards.push(groupTabbed1);
            actionCards.push(groupTabbed2);
            actionCards.push(
                <div className="order-10 small-12">
                    <Tabs
                        defaultActiveKey="my-market"
                        activeKey={tabVerticalPanel}
                        onChange={this._setTabVerticalPanel.bind(this)}
                    >
                        <Tabs.TabPane
                            tab={translator.translate("exchange.market_name")}
                            key="my-market"
                        />
                        <Tabs.TabPane
                            tab={translator.translate("exchange.more")}
                            key="find-market"
                        />
                    </Tabs>
                    {myMarkets}
                </div>
            );
        } else {
            actionCards = (
                <Collapse
                    activeKey={this.state.mobileKey}
                    onChange={this._onChangeMobilePanel.bind(this)}
                    style={{paddingRight: 1}}
                >
                    <Collapse.Panel
                        header={translator.translate("exchange.price_history")}
                        key="tradingViewChart"
                    >
                        {tradingViewChart}
                    </Collapse.Panel>
                    <Collapse.Panel
                        header={translator.translate("exchange.order_depth")}
                        key="deptHighChart"
                    >
                        {deptHighChart}
                    </Collapse.Panel>
                    <Collapse.Panel
                        header={translator.translate("exchange.buy_sell")}
                        key="buySellTab"
                    >
                        {buySellTab}
                    </Collapse.Panel>
                    <Collapse.Panel
                        header={translator.translate("exchange.order_book")}
                        key="orderBook"
                    >
                        {orderBook}
                    </Collapse.Panel>
                    <Collapse.Panel
                        header={translator.translate("exchange.history")}
                        key="marketHistory"
                    >
                        {marketHistory}
                    </Collapse.Panel>
                    {settlementOrders !== null ? (
                        <Collapse.Panel
                            header={translator.translate(
                                "exchange.settle_orders"
                            )}
                            key="settlementOrders"
                        >
                            {settlementOrders}
                        </Collapse.Panel>
                    ) : null}
                    <Collapse.Panel
                        header={translator.translate("exchange.my_history")}
                        key="myMarketHistory"
                    >
                        {myMarketHistory}
                    </Collapse.Panel>
                    <Collapse.Panel
                        header={translator.translate("exchange.my_orders")}
                        key="myOpenOrders"
                    >
                        {myOpenOrders}
                    </Collapse.Panel>
                    <Collapse.Panel
                        header={translator.translate("exchange.market_name")}
                        key="myMarkets"
                    >
                        <Tabs
                            defaultActiveKey="my-market"
                            activeKey={tabVerticalPanel}
                            onChange={this._setTabVerticalPanel.bind(this)}
                        >
                            <Tabs.TabPane
                                tab={translator.translate(
                                    "exchange.market_name"
                                )}
                                key="my-market"
                            />

                        </Tabs>
                        {myMarkets}
                    </Collapse.Panel>
                </Collapse>
            );
        }

        /***
         * Generate Panels
         */
        let leftPanel = null;
        let rightPanel = null;
        let leftPanelContainer = null;
        let rightPanelContainer = null;
        let centerPanelContainer = null;
        let enableToggleLeft = false;
        let enableToggleRight = false;

        if (!smallScreen) {
            if (verticalOrderBook) {
              if(this.state.leftPanelContent=="market"){
                leftPanel = (
                  <div
                      className="left-order-book no-padding no-overflow ps-container"
                      ref="leftPanel"
                      style={{display: "block", position: 'relative'}}
                      key={`actionCard_${actionCardIndex++}`}
                  >
                      {exchangeHeader}
                      <Collapse
                          activeKey={this.state.mobileKey}
                          onChange={this._onChangeMobilePanel.bind(this)}
                          style={{paddingRight: 1}}
                      >
                          <Collapse.Panel
                              header={translator.translate("exchange.market_name")+"    "}
                              key="myMarkets"
                          >
                            <div
                                className="left-order-book no-padding no-overflow"
                                style={{
                                    display: "block",
                                    height: "calc(50vh - 100px)",
                                    width: panelWidth
                                }}
                            >
                                {myMarkets}
                            </div>
                          </Collapse.Panel>
                          <Collapse.Panel
                              header={translator.translate("exchange.order_book")}
                              key="orderBook"
                          >
                            <div
                                className="left-order-book no-padding no-overflow"
                                style={{
                                    display: "block",
                                    height: "calc(50vh - 100px)",
                                    width: panelWidth
                                }}
                            >
                                {orderBook}
                            </div>
                          </Collapse.Panel>
                          <Collapse.Panel
                              header={translator.translate("exchange.history")}
                              key="marketHistory"
                          >
                            <div
                                className="left-order-book no-padding no-overflow"
                                style={{
                                    display: "block",
                                    //height: "calc(50vh - 170px)",
                                    width: panelWidth
                                }}
                            >
                                {marketHistory}
                            </div>
                          </Collapse.Panel>
                          {settlementOrders !== null ? (
                              <Collapse.Panel
                                  header={translator.translate(
                                      "exchange.settle_orders"
                                  )}
                                  key="settlementOrders"
                              >
                                <div
                                    className="left-order-book no-padding no-overflow"
                                    style={{
                                        display: "block",
                                        //height: "calc(50vh - 170px)",
                                        width: panelWidth
                                    }}
                                >
                                    {settlementOrders}
                                </div>
                              </Collapse.Panel>
                          ) : null}
                          <Collapse.Panel
                              header={translator.translate("exchange.my_history")}
                              key="myMarketHistory"
                          >
                            <div
                                className="left-order-book no-padding no-overflow"
                                style={{
                                    display: "block",
                                    //height: "calc(50vh - 170px)",
                                    width: panelWidth
                                }}
                            >
                                {myMarketHistory}
                            </div>
                          </Collapse.Panel>
                          <Collapse.Panel
                              header={translator.translate("exchange.my_orders")}
                              key="myOpenOrders"
                          >
                            <div
                                className="left-order-book no-padding no-overflow"
                                style={{
                                    display: "block",
                                    //height: "calc(50vh - 170px)",
                                    width: panelWidth
                                }}
                            >
                                {myOpenOrders}
                            </div>
                          </Collapse.Panel>
                      </Collapse>
                  </div>
                );
              }else if(this.state.leftPanelContent=="liveFeed") {
                leftPanel = (
                  <div
                      className="left-order-book no-padding no-overflow ps-container"
                      ref="leftPanel"
                      style={{display: "block", width: !smallScreen ? 378 : "auto", position: 'relative'}}
                      key={`actionCard_${actionCardIndex++}`}
                  >
                    <LiveFeed/>
                  </div>
                );
              }else{
                leftPanel = (
                  <div
                      className="left-order-book no-padding no-overflow ps-container"
                      ref="leftPanel"
                      style={{display: "block", position: 'relative'}}
                      key={`actionCard_${actionCardIndex++}`}
                  >
                  </div>
                );
              }
            }

            if (verticalOrderForm) {
                leftPanel = (
                    <div
                        className="left-order-book no-padding no-overflow"
                        style={{
                            display: "block",
                            height: "calc(100vh - 170px)",
                            width: 300
                        }}
                    >
                        {buySellTab}
                    </div>
                );
            }
            let defaultAvatar = require("assets/icons/pie.png");

            if(this.state.rightPanelContent == "liveChat"){
              rightPanel = (
                  <div
                      className="left-order-book no-padding no-overflow ps-container"
                      ref="rightPanel"
                      style={{display: "block"}}
                      key={`actionCard_${actionCardIndex++}`}
                  >
                      <div
                          className={"left-order-book small-12"}
                          style={{
                              paddingLeft: 5,
                              width: !smallScreen ? 378 : "auto",
                              height: '100%'
                          }}
                      >
                        <ChatBox
                          currentAccount={currentAccountName}
                        />
                      </div>
                  </div>
              );
            }
            else if(this.state.rightPanelContent == "alBot"){
              rightPanel = (
                  <div
                      className="left-order-book no-padding no-overflow ps-container"
                      ref="rightPanel"
                      style={{display: "block"}}
                      key={`actionCard_${actionCardIndex++}`}
                  >
                      <div
                          className={"left-order-book small-12"}
                          style={{
                              paddingLeft: 5,
                              width: !smallScreen ? 300 : "auto",
                              height: '100%'
                          }}
                      >

                      </div>
                  </div>
              );
            }
            else if(this.state.rightPanelContent == "marketPredict"){
              rightPanel = (
                  <div
                      className="left-order-book no-padding no-overflow ps-container"
                      ref="rightPanel"
                      style={{display: "block"}}
                      key={`actionCard_${actionCardIndex++}`}
                  >
                      <div
                          className={"left-order-book small-12"}
                          style={{
                              paddingLeft: 5,
                              width: !smallScreen ? 300 : "auto",
                              height: '100%'
                          }}
                      >

                      </div>
                  </div>
              );
            }
            else if(this.state.rightPanelContent == "Posts"){
              rightPanel = (
                  <div
                      className="left-order-book no-padding no-overflow ps-container"
                      ref="rightPanel"
                      style={{display: "block"}}
                      key={`actionCard_${actionCardIndex++}`}
                  >
                      <div
                          className={"left-order-book small-12"}
                          style={{
                              paddingLeft: 5,
                              width: !smallScreen ? 361 : "auto",
                              height: '100%'
                          }}
                      >
                        <Posts currentAccount={currentAccountName}/>
                      </div>
                  </div>
              );
            }
            else if(this.state.rightPanelContent == "actionCardPane") {
              rightPanel = (
                  <div
                      className="left-order-book no-padding no-overflow ps-container"
                      ref="rightPanel"
                      style={{display: "block"}}
                      key={`actionCard_${actionCardIndex++}`}
                  >
                      <div
                          className={"left-order-book small-12"}
                          style={{
                              paddingLeft: 5,
                              width: !smallScreen ? 378 : "auto",
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column'
                          }}
                      >
                        <div style={{width: '100%', height: '33.3%', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          <div style={{}} onClick={this._setIndicator.bind(this, "RSI")}>
                            <IndicatorGaugeChart
                              marketHistory = {this.state.marketHistory}
                              indicator={"RSI"}
                            />
                            <h5>RSI</h5>
                          </div>
                          <div style={{}} onClick={this._setIndicator.bind(this, "MA")}>
                            <IndicatorGaugeChart
                              marketHistory = {this.state.marketHistory}
                              indicator={"MO"}
                            />
                            <h5>MO</h5>
                          </div>
                        </div>
                        <div style={{width: '100%', height: '33.3%', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          <div style={{}} onClick={this._setIndicator.bind(this, "BB")}>
                            <IndicatorGaugeChart
                              marketHistory = {this.state.marketHistory}
                              indicator={"BB"}
                            />
                            <h5>BB</h5>
                          </div>
                          <div style={{}} onClick={this._setIndicator.bind(this, "MACD")}>
                            <IndicatorGaugeChart
                              marketHistory = {this.state.marketHistory}
                              indicator={"MACD"}
                            />
                            <h5>MACD</h5>
                          </div>
                        </div>
                        <div style={{width: '100%', height: '33.3%', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          <div style={{}} onClick={this._setIndicator.bind(this, "KO")}>
                            <IndicatorGaugeChart
                              marketHistory = {this.state.marketHistory}
                              indicator={"KO"}
                            />
                            <h5>KO</h5>
                          </div>
                          <div style={{}} onClick={this._setIndicator.bind(this, "OBV")}>
                            <IndicatorGaugeChart
                              marketHistory = {this.state.marketHistory}
                              indicator={"OBV"}
                            />
                            <h5>OBV</h5>
                          </div>
                        </div>

                      </div>
                  </div>
              );
            }
            else if(this.state.rightPanelContent == "emotionIndicator") {
              rightPanel = (
                  <div
                      className="left-order-book no-padding no-overflow ps-container"
                      ref="rightPanel"
                      style={{display: "block"}}
                      key={`actionCard_${actionCardIndex++}`}
                  >
                      <div
                          className={"left-order-book small-12"}
                          style={{
                              paddingLeft: 5,
                              width: !smallScreen ? 378 : "auto",
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column'
                          }}
                      >
                        <IndicatorTechnicalBox/>
                      </div>
                  </div>
              );
            }
            if ((!mirrorPanels && leftPanel) || (mirrorPanels && rightPanel)) {
                enableToggleLeft = true;
            }
            if ((!mirrorPanels && rightPanel) || (mirrorPanels && leftPanel)) {
                enableToggleRight = true;
            }

            leftPanelContainer = (
                <div className="grid-block left-column shrink no-overflow" style={this.state.activePanels.includes('left') ? {width: 378} : {width: 20}}>
                    {activePanels.includes("left")
                        ? mirrorPanels
                            ? rightPanel
                            : leftPanel
                        : null}
                    {enableToggleLeft ? (
                        <div
                            style={{
                                width: "auto",
                                paddingTop: "calc(50vh - 80px)"
                            }}
                            onClick={this._togglePanel.bind(this, "left")}
                        >
                            <AntIcon
                                data-intro={translator.translate(
                                    "walkthrough.panel_hide"
                                )}
                                type={
                                    activePanels.includes("left")
                                        ? "caret-left"
                                        : "caret-right"
                                }
                            />
                        </div>
                    ) : null}
                </div>
            );

            rightPanelContainer = (
                <div className="grid-block left-column shrink no-overflow" style={this.state.activePanels.includes('right') ? {width: 378} : {width: 20}}>
                    {enableToggleRight ? (
                        <div
                            style={{
                                width: "auto",
                                paddingTop: "calc(50vh - 80px)"
                            }}
                            onClick={this._togglePanel.bind(this, "right")}
                        >
                            <AntIcon
                                data-intro={translator.translate(
                                    "walkthrough.panel_hide"
                                )}
                                type={
                                    activePanels.includes("right")
                                        ? "caret-right"
                                        : "caret-left"
                                }
                            />
                        </div>
                    ) : null}
                    {activePanels.includes("right")
                        ? !mirrorPanels
                            ? rightPanel
                            : leftPanel
                        : null}
                </div>
            );
        }

        if(this.state.centerContent == 'Exchange') {
          centerPanelContainer = (
            <div
                style={{paddingTop: 0}}
                className={cnames(
                    "grid-block main-content vertical no-overflow"
                )}
            >
                <div
                    className="grid-block vertical no-padding ps-container"
                    id="CenterContent"
                    ref="center"
                    data-intro={
                        tinyScreen
                            ? translator.translate(
                                  "walkthrough.collapsed_items"
                              )
                            : null
                    }
                >
                    {!tinyScreen ? (
                        <div>
                            {/* Price history chart */}
                            {chartType && chartType == "price_chart" ? (
                                <div
                                    className="grid-block shrink no-overflow"
                                    id="market-charts"
                                >
                                    {tradingViewChart}
                                </div>
                            ) : null}

                            {/* Market depth chart */}
                            {chartType &&
                            chartType == "market_depth" ? (
                                <div className="grid-block vertical no-padding shrink">
                                    {deptHighChart}
                                </div>
                            ) : null}
                        </div>
                    ) : null}

                    <div className="grid-block no-overflow wrap shrink">
                        {actionCards}
                    </div>
                </div>
            </div>
          );
        } else if (this.state.centerContent == 'Wallet') {
          centerPanelContainer = (
            <AccountWallet {...this.props} account={currentAccount}/>
          );
        } else if (this.state.centerContent == 'Community') {
          centerPanelContainer = (
            <div
                style={{paddingTop: 0}}
                className={cnames(
                    "grid-block main-content vertical no-overflow"
                )}
            >
              <Community currentAccount={currentAccountName}/>
            </div>
          );
        } else {
          centerPanelContainer = (
            <div
                style={{paddingTop: 0}}
                className={cnames(
                    "grid-block main-content vertical no-overflow"
                )}
            >
            </div>
          );
        }

        return (
            <div className="grid-block vertical">
                {!this.props.marketReady ? <LoadingIndicator /> : null}


                <div className="grid-block page-layout market-layout no-overflow">
                    {this.state.isMarketPickerModalVisible ||
                    this.state.isMarketPickerModalLoaded ? (
                        <MarketPicker
                            visible={this.state.isMarketPickerModalVisible}
                            showModal={this.showMarketPickerModal}
                            hideModal={this.hideMarketPickerModal}
                            marketPickerAsset={this.state.marketPickerAsset}
                            onToggleMarketPicker={this._toggleMarketPicker.bind(
                                this
                            )}
                            {...this.props}
                        />
                    ) : null}

                    {this.state.isPersonalizeModalVisible ||
                    this.state.isPersonalizeModalLoaded ? (
                        <Personalize
                            visible={this.state.isPersonalizeModalVisible}
                            showModal={this.showPersonalizeModal}
                            hideModal={this.hidePersonalizeModal}
                            viewSettings={this.props.viewSettings}
                            chartType={chartType}
                            chartHeight={chartHeight}
                            onTogglePersonalize={this._togglePersonalize.bind(
                                this
                            )}
                            onChangeChartHeight={this.onChangeChartHeight.bind(
                                this
                            )}
                            handleGroupOrderLimitChange={this._onGroupOrderLimitChange.bind(
                                this
                            )}
                            trackedGroupsConfig={trackedGroupsConfig}
                            currentGroupOrderLimit={currentGroupOrderLimit}
                            verticalOrderBook={verticalOrderBook}
                            hideScrollbars={hideScrollbars}
                            mirrorPanels={mirrorPanels}
                            panelTabs={panelTabs}
                            singleColumnOrderForm={singleColumnOrderForm}
                            buySellTop={buySellTop}
                            flipBuySell={flipBuySell}
                            flipOrderBook={flipOrderBook}
                            tinyScreen={tinyScreen}
                            smallScreen={smallScreen}
                            orderBookReversed={orderBookReversed}
                            chartZoom={chartZoom}
                            chartTools={chartTools}
                            hideFunctionButtons={hideFunctionButtons}
                            onMoveOrderBook={this._moveOrderBook.bind(this)}
                            onMirrorPanels={this._mirrorPanels.bind(this)}
                            onToggleScrollbars={this._toggleScrollbars.bind(
                                this
                            )}
                            onSetAutoscroll={this._setAutoscroll.bind(this)}
                            onToggleChart={this._toggleChart.bind(this)}
                            onSetPanelTabs={this._setPanelTabs.bind(this)}
                            onToggleSingleColumnOrderForm={this._toggleSingleColumnOrderForm.bind(
                                this
                            )}
                            onToggleBuySellPosition={this._toggleBuySellPosition.bind(
                                this
                            )}
                            onFlipBuySell={this._flipBuySell.bind(this)}
                            onFlipOrderBook={this._flipOrderBook.bind(this)}
                            onOrderBookReversed={this._orderBookReversed.bind(
                                this
                            )}
                            onChartZoom={this._chartZoom.bind(this)}
                            onChartTools={this._chartTools.bind(this)}
                            onHideFunctionButtons={this._hideFunctionButtons.bind(
                                this
                            )}
                        />
                    ) : null}

                    <AccountNotifications />
                    {/* Main vertical block with content */}

                    {/* Left Column - Open Orders */}
                    {leftPanelContainer}

                    {/* Center Column */}
                    {centerPanelContainer}
                    {/* End of Main Content Column */}

                    {/* Right Column */}
                    {rightPanelContainer}

                    {/* End of Second Vertical Block */}
                </div>

                {quoteIsBitAsset &&
                (this.state.isBorrowQuoteModalVisible ||
                    this.state.isBorrowQuoteModalLoaded) ? (
                    <BorrowModal
                        visible={this.state.isBorrowQuoteModalVisible}
                        hideModal={this.hideBorrowQuoteModal}
                        quote_asset={quoteAsset.get("id")}
                        backing_asset={quoteAsset.getIn([
                            "bitasset",
                            "options",
                            "short_backing_asset"
                        ])}
                        account={currentAccount}
                    />
                ) : null}
                {baseIsBitAsset &&
                (this.state.isBorrowBaseModalVisible ||
                    this.state.isBorrowBaseModalLoaded) ? (
                    <BorrowModal
                        visible={this.state.isBorrowBaseModalVisible}
                        hideModal={this.hideBorrowBaseModal}
                        quote_asset={baseAsset.get("id")}
                        backing_asset={baseAsset.getIn([
                            "bitasset",
                            "options",
                            "short_backing_asset"
                        ])}
                        account={currentAccount}
                    />
                ) : null}

                {this.state.isDepositModalVisible ||
                this.state.isDepositModalLoaded ? (
                    <SimpleDepositWithdraw
                        visible={this.state.isDepositModalVisible}
                        hideModal={this.hideDepositModal}
                        ref="deposit_modal"
                        action="deposit"
                        fiatModal={false}
                        account={currentAccount.get("name")}
                        sender={currentAccount.get("id")}
                        asset={
                            depositModalType === "bid"
                                ? base.get("id")
                                : quote.get("id")
                        }
                        modalId={
                            "simple_deposit_modal" +
                            (depositModalType === "bid" ? "" : "_ask")
                        }
                        balance={
                            depositModalType === "bid"
                                ? baseBalance
                                : quoteBalance
                        }
                        {...this.props.backedCoins.find(
                            a =>
                                a.symbol ===
                                (depositModalType === "bid"
                                    ? base.get("symbol")
                                    : quote.get("symbol"))
                        )}
                    />
                ) : null}

                {/* Bridge modal */}
                {this.state.isDepositBridgeModalVisible ||
                this.state.isDepositBridgeModalLoaded ? (
                    <SimpleDepositBlocktradesBridge
                        visible={this.state.isDepositBridgeModalVisible}
                        hideModal={this.hideDepositBridgeModal}
                        ref="bridge_modal"
                        action="deposit"
                        account={currentAccount.get("name")}
                        sender={currentAccount.get("id")}
                        asset={
                            buyModalType === "bid"
                                ? base.get("id")
                                : quote.get("id")
                        }
                        modalId={
                            "simple_bridge_modal" +
                            (buyModalType === "bid" ? "" : "_ask")
                        }
                        balances={[
                            buyModalType === "bid" ? baseBalance : quoteBalance
                        ]}
                        bridges={
                            this.props.bridgeCoins.get(
                                buyModalType === "bid"
                                    ? base.get("symbol")
                                    : quote.get("symbol")
                            ) || null
                        }
                    />
                ) : null}

                {/* Confirm Modal */}
                {this.state.isConfirmBuyOrderModalVisible ||
                this.state.isConfirmBuyOrderModalLoaded ? (
                    <ConfirmOrderModal
                        visible={this.state.isConfirmBuyOrderModalVisible}
                        hideModal={this.hideConfirmBuyOrderModal}
                        type="buy"
                        onForce={this._forceBuy.bind(
                            this,
                            "buy",
                            buyFeeAsset,
                            baseBalance,
                            coreBalance
                        )}
                        diff={buyDiff}
                        hasOrders={combinedAsks.length > 0}
                    />
                ) : null}

                {this.state.isConfirmSellOrderModalVisible ||
                this.state.isConfirmSellOrderModalLoaded ? (
                    <ConfirmOrderModal
                        visible={this.state.isConfirmSellOrderModalVisible}
                        hideModal={this.hideConfirmSellOrderModal}
                        type="sell"
                        onForce={this._forceSell.bind(
                            this,
                            "sell",
                            sellFeeAsset,
                            quoteBalance,
                            coreBalance
                        )}
                        diff={sellDiff}
                        hasOrders={combinedBids.length > 0}
                    />
                ) : null}

                <PriceAlert
                    onSave={this.handlePriceAlertSave}
                    rules={this.getPriceAlertRules()}
                    latestPrice={latest && latest.getPrice()}
                    quoteAsset={this.props.quoteAsset.get("id")}
                    baseAsset={this.props.baseAsset.get("id")}
                    visible={this.state.isPriceAlertModalVisible}
                    showModal={this.showPriceAlertModal}
                    hideModal={this.hidePriceAlertModal}
                />
            </div>
        );
    }
}

Exchange = connect(
    Exchange,
    {
        listenTo() {
            return [
                AccountStore
            ];
        },
        getProps() {
            return {
                currentAccountName:
                    AccountStore.getState().currentAccount ||
                    AccountStore.getState().passwordAccount
            };
        }
    }
);

export default withRouter(Exchange);
