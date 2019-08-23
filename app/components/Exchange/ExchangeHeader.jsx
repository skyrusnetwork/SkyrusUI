import React from "react";
import {Link} from "react-router-dom";
import Icon from "../Icon/Icon";
import AssetName from "../Utility/AssetName";
import MarketsActions from "actions/MarketsActions";
import SettingsActions from "actions/SettingsActions";
import PriceStatWithLabel from "./PriceStatWithLabel";
import Translate from "react-translate-component";
import counterpart from "counterpart";
import {ChainStore} from "bitsharesjs";
import ExchangeHeaderCollateral from "./ExchangeHeaderCollateral";
import {Icon as AntIcon} from "bitshares-ui-style-guide";

export default class ExchangeHeader extends React.Component {
    constructor(props) {
        super();

        this.state = {
            isModalVisible: false,
            volumeShowQuote: true,
            selectedMarketPickerAsset: props.selectedMarketPickerAsset,
            quotePrice: 0
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            selectedMarketPickerAsset: nextProps.selectedMarketPickerAsset
        });
        var quote_symbol = nextProps.quoteAsset.get("symbol");
        var symbollist = {
          'SKX':'SKX',
          'SKYRUS.BTC':'bitcoin',
          'SKYRUS.ETH':'ethereum',
          'SKYRUS.LTC':'litecoin',
          'SKYRUS.BCH':'bitcoin-cash',
          'SKYRUS.USDT':'tether'
        };
        if(symbollist[quote_symbol]){
          if(symbollist[quote_symbol]!='SKX'){
            var http = new XMLHttpRequest();
            var url = "https://api.coincap.io/v2/rates/"+symbollist[quote_symbol];
            var params = "";

            http.open("GET", url, true);
            http.setRequestHeader("Content-type", "text/html; charset=utf-8");
            let _this = this;
            http.onreadystatechange = function() {
              if(http.readyState == 4 && http.status == 200) {
                  var rate = JSON.parse(http.responseText)['data']['rateUsd'];
                  _this.setState({quotePrice: parseFloat(rate).toFixed(4)});
              }
            }
            http.send(params);
          }
          else{
            this.setState({quotePrice: parseFloat(0).toFixed(4)});
          }
        }

    }

    shouldComponentUpdate(nextProps) {
        if (!nextProps.marketReady) return false;
        return true;
    }

    _addMarket(quote, base) {

        let marketID = `${quote}_${base}`;
        if (!this.props.starredMarkets.has(marketID)) {
            SettingsActions.addStarMarket(quote, base);
        } else {
            SettingsActions.removeStarMarket(quote, base);
        }
    }

    changeVolumeBase() {
        this.setState({
            volumeShowQuote: !this.state.volumeShowQuote
        });
    }

    marketPicker(asset) {
        let {selectedMarketPickerAsset} = this.state;
        selectedMarketPickerAsset =
            !!selectedMarketPickerAsset && selectedMarketPickerAsset == asset
                ? null
                : asset;

        this.setState({
            selectedMarketPickerAsset
        });
        this.props.onToggleMarketPicker(selectedMarketPickerAsset);
    }

    render() {
        const {
            quoteAsset,
            baseAsset,
            starredMarkets,
            hasPrediction,
            feedPrice,
            showCallLimit,
            lowestCallPrice,
            marketReady,
            latestPrice,
            marketStats,
            account
        } = this.props;

        const baseSymbol = baseAsset.get("symbol");
        const quoteSymbol = quoteAsset.get("symbol");

        // Favorite star
        const marketID = `${quoteSymbol}_${baseSymbol}`;
        const starClass = starredMarkets.has(marketID)
            ? "gold-star"
            : "grey-star";

        // Market stats
        const dayChange = marketStats.get("change");

        const dayChangeClass =
            parseFloat(dayChange) === 0
                ? ""
                : parseFloat(dayChange) < 0
                    ? "negative"
                    : "positive";
        const volumeBase = marketStats.get("volumeBase");
        const volumeQuote = marketStats.get("volumeQuote");
        const dayChangeWithSign = dayChange > 0 ? "+" + dayChange : dayChange;

        const volume24h = this.state.volumeShowQuote ? volumeQuote : volumeBase;
        const volume24hAsset = this.state.volumeShowQuote
            ? quoteAsset
            : baseAsset;

        let showCollateralRatio = false;

        const quoteId = quoteAsset.get("id");
        const baseId = baseAsset.get("id");

        const lookForBitAsset =
            quoteId === "1.3.0" ? baseId : baseId === "1.3.0" ? quoteId : null;
        const possibleBitAsset = lookForBitAsset
            ? ChainStore.getAsset(lookForBitAsset)
            : null;
        const isBitAsset = possibleBitAsset
            ? !!possibleBitAsset.get("bitasset")
            : false;
        let collOrderObject = "";
        let settlePrice = null;

        if (isBitAsset) {
            if (account.toJS && account.has("call_orders")) {
                const call_orders = account.get("call_orders").toJS();

                for (let i = 0; i < call_orders.length; i++) {
                    let callID = call_orders[i];

                    let position = ChainStore.getObject(callID);
                    let debtAsset = position.getIn([
                        "call_price",
                        "quote",
                        "asset_id"
                    ]);

                    if (debtAsset === lookForBitAsset) {
                        collOrderObject = callID;
                        showCollateralRatio = true;
                        break;
                    }
                }
            }

            /* Settlment Offset */
            let settleAsset =
                baseId == "1.3.0"
                    ? quoteAsset
                    : quoteId == "1.3.0"
                        ? baseAsset
                        : quoteAsset;

            if (settleAsset && feedPrice) {
                let offset_percent = settleAsset
                    .getIn(["bitasset", "options"])
                    .toJS().force_settlement_offset_percent;
                settlePrice =
                    baseId == "1.3.0"
                        ? feedPrice.toReal() / (1 + offset_percent / 10000)
                        : feedPrice.toReal() * (1 + offset_percent / 10000);
            }
        }

        const translator = require("counterpart");

        let isQuoteSelected =
            !!this.state.selectedMarketPickerAsset &&
            this.state.selectedMarketPickerAsset == quoteSymbol;
        let isBaseSelected =
            !!this.state.selectedMarketPickerAsset &&
            this.state.selectedMarketPickerAsset == baseSymbol;

        let PriceAlertBellClassName = this.props.hasAnyPriceAlert
            ? "exchange--price-alert--show-modal--active"
            : "";

        return (
            <div className="grid-block shrink no-padding overflow-visible top-bar">
                <div className="grid-block overflow-visible">
                    <div className="grid-block shrink">
                        <div style={{padding: "25px 10px 10px 10px", borderRight:"1px solid rgba(255,255,255,0.3)"}}>
                            {!hasPrediction ? (
                                <div
                                    style={{
                                        padding: "0 5px",
                                        fontSize: this.props.tinyScreen
                                            ? "13px"
                                            : "18px",
                                        marginTop: "1px"
                                    }}
                                >
                                    <AntIcon
                                        onClick={this.props.showPriceAlertModal}
                                        type={"bell"} style={{display:"none"}}
                                        className={`exchange--price-alert--show-modal ${PriceAlertBellClassName}`}
                                    />
                                    <span
                                        className="underline___"
                                        style={{
                                            cursor: "pointer",
                                            color: isQuoteSelected
                                                ? "#2196f3"
                                                : "#4a90e2"
                                        }}
                                    >
                                        <AssetName
                                            name={quoteSymbol}
                                            replace={true}
                                            noTip
                                        />
                                    </span>
                                    <span style={{padding: "0 5px"}}>/</span>
                                    <span
                                        className="underline___"
                                        style={{
                                            cursor: "pointer",
                                            color: isBaseSelected
                                                ? "#2196f3"
                                                : "#4a90e2"
                                        }}
                                    >
                                        <AssetName
                                            name={baseSymbol}
                                            replace={true}
                                            noTip
                                        />
                                    </span>
                                    <span style={{fontSize:"12px",display:"block",marginTop:"10px"}}>$ {this.state.quotePrice}</span>
                                </div>
                            ) : (
                                <a className="market-symbol">
                                    <span
                                    >{`${quoteSymbol} : ${baseSymbol}`}</span>
                                </a>
                            )}

                            <div className="label-actions" style={{display:"none"}}>
                                <Translate
                                    component="span"
                                    style={{padding: "5px 0 0 5px"}}
                                    className="stat-text"
                                    content="exchange.trading_pair"
                                />
                                <Link
                                    onClick={() => {
                                        MarketsActions.switchMarket();
                                    }}
                                    to={`/market/${baseSymbol}_${quoteSymbol}`}
                                    data-intro={translator.translate(
                                        "walkthrough.switch_button"
                                    )}
                                >
                                    <Icon
                                        className="shuffle"
                                        name="shuffle"
                                        title="icons.shuffle"
                                    />
                                </Link>

                                <a
                                    onClick={() => {
                                        this._addMarket(
                                            this.props.quoteAsset.get("symbol"),
                                            this.props.baseAsset.get("symbol")
                                        );
                                    }}
                                    data-intro={translator.translate(
                                        "walkthrough.favourite_button"
                                    )}
                                >
                                    <Icon
                                        className={starClass}
                                        name="fi-star"
                                        title="icons.fi_star.market"
                                    />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div
                        className="grid-block vertical"
                        style={{overflow: "visible"}}
                    >
                        <div className="grid-block wrap market-stats-container">
                            <ul className="market-stats stats top-stats">
                                {latestPrice ? (
                                    <PriceStatWithLabel
                                        ignoreColorChange={true}
                                        ready={marketReady}
                                        price={latestPrice}
                                        quote={quoteAsset}
                                        base={baseAsset}
                                        market={marketID}
                                        content="exchange.latest"
                                    />
                                ) : null}

                                <li
                                    className={
                                        "hide-order-1 stressed-stat daily_change " +
                                        dayChangeClass
                                    }
                                >
                                    <Translate
                                        component="div"
                                        className="stat-text"
                                        content="account.hour_24"
                                    />
                                    <span>
                                        <b className="value">
                                            {marketReady
                                                ? dayChangeWithSign
                                                : 0}
                                        </b>
                                        <span> %</span>
                                    </span>
                                </li>

                                {volumeBase >= 0 ? (
                                    <PriceStatWithLabel
                                        ignoreColorChange={true}
                                        onClick={this.changeVolumeBase.bind(
                                            this
                                        )}
                                        ready={marketReady}
                                        decimals={0}
                                        volume={true}
                                        price={volume24h}
                                        className="hide-order-2 clickable"
                                        base={volume24hAsset}
                                        market={marketID}
                                        content="exchange.volume_24"
                                    />
                                ) : null}
                                {!hasPrediction && settlePrice ? (
                                    <PriceStatWithLabel
                                        ignoreColorChange={true}
                                        toolTip={counterpart.translate(
                                            "tooltip.feed_price"
                                        )}
                                        ready={marketReady}
                                        className="hide-order-3"
                                        price={feedPrice.toReal()}
                                        quote={quoteAsset}
                                        base={baseAsset}
                                        market={marketID}
                                        content="exchange.feed_price"
                                    />
                                ) : null}
                                {!hasPrediction && feedPrice ? (
                                    <PriceStatWithLabel
                                        ignoreColorChange={true}
                                        toolTip={counterpart.translate(
                                            "tooltip.settle_price"
                                        )}
                                        ready={marketReady}
                                        className="hide-order-4"
                                        price={settlePrice}
                                        quote={quoteAsset}
                                        base={baseAsset}
                                        market={marketID}
                                        content="exchange.settle"
                                    />
                                ) : null}
                                {showCollateralRatio ? (
                                    <ExchangeHeaderCollateral
                                        object={collOrderObject}
                                        account={account}
                                        className="hide-order-1"
                                    />
                                ) : null}
                                {lowestCallPrice && showCallLimit ? (
                                    <PriceStatWithLabel
                                        toolTip={counterpart.translate(
                                            "tooltip.call_limit"
                                        )}
                                        ready={marketReady}
                                        className="hide-order-5 is-call"
                                        price={lowestCallPrice}
                                        quote={quoteAsset}
                                        base={baseAsset}
                                        market={marketID}
                                        content="explorer.block.call_limit"
                                    />
                                ) : null}

                                {feedPrice && showCallLimit ? (
                                    <PriceStatWithLabel
                                        toolTip={counterpart.translate(
                                            "tooltip.margin_price"
                                        )}
                                        ready={marketReady}
                                        className="hide-order-6 is-call"
                                        price={feedPrice.getSqueezePrice({
                                            real: true
                                        })}
                                        quote={quoteAsset}
                                        base={baseAsset}
                                        market={marketID}
                                        content="exchange.squeeze"
                                    />
                                ) : null}
                            </ul>
                            <ul
                                className="market-stats stats top-stats" style={{display:"none"}}
                                data-position={"left"}
                                data-step="1"
                                data-intro={translator.translate(
                                    "walkthrough.personalize"
                                )}
                            >
                                <li
                                    className="stressed-stat input clickable"
                                    style={{padding: "16px 16px 16px 0px"}}
                                    onClick={this.props.onTogglePersonalize.bind(
                                        this
                                    )}
                                >
                                    <AntIcon
                                        type="setting"
                                        style={{paddingRight: 5}}
                                    />
                                    <Translate
                                        className="column-hide-xs"
                                        content="exchange.settings.header.title"
                                    />
                                </li>
                            </ul>
                            <ul
                                className="market-stats stats top-stats" style={{display:""}}
                                data-position={"left"}
                                data-step="1"
                                data-intro={translator.translate(
                                    "walkthrough.personalize"
                                )}
                            >
                                <li
                                    className="stressed-stat input clickable"
                                    style={{padding: "16px 16px 16px 0px"}}
                                    onClick={this.props.onToggleCharts}
                                >
                                    <Icon
                                        className="icon-20px"
                                        name="trade"
                                        title="icons.trade"
                                    />
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
