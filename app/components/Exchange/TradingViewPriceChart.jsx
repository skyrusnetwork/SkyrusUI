import React from "react";
const TradingView = require("../../../charting_library/charting_library.min.js");
import colors from "assets/colors";
import {getResolutionsFromBuckets, getTVTimezone} from "./tradingViewClasses";

// import {connect} from "alt-react";
// import MarketsStore from "stores/MarketsStore";

export default class TradingViewPriceChart extends React.Component {
    loadTradingView(props) {
        const {dataFeed} = props;
        let themeColors = colors[props.theme];

        if (!dataFeed) return;
        if (!!this.tvWidget) return;

        if (__DEV__)
            console.log(
                "currentResolution",
                getResolutionsFromBuckets([props.bucketSize])[0],
                "symbol",
                props.quoteSymbol + "_" + props.baseSymbol,
                "timezone:",
                getTVTimezone()
            );

        dataFeed.update({
            resolutions: props.buckets,
            ticker: props.quoteSymbol + "_" + props.baseSymbol,
            interval: getResolutionsFromBuckets([props.bucketSize])[0]
        });

        let disabled_features = [
            "header_saveload",
            "symbol_info",
            "symbol_search_hot_key",
            "border_around_the_chart",
            "header_symbol_search",
            "header_compare"
        ];
        disabled_features.push("left_toolbar");
        disabled_features.push("study_templates");
        disabled_features.push("volume_force_overlay"); //Volume indicator on the same pane
        //disabled_features.push("header_widget_dom_node");

        let enabled_features = [];

        if (this.props.mobile || !this.props.chartZoom) {
            disabled_features.push("chart_scroll");
            disabled_features.push("chart_zoom");
        }

        if (this.props.mobile || !this.props.chartTools) {
            disabled_features.push("left_toolbar");
            disabled_features.push("chart_crosshair_menu");
            disabled_features.push("chart_events");
            disabled_features.push("footer_share_buttons");
            disabled_features.push("footer_screenshot");
            disabled_features.push("footer_publish_idea_button");
            disabled_features.push("caption_buttons_text_if_possible");
            disabled_features.push("line_tool_templates");
            disabled_features.push("widgetbar_tabs");
            disabled_features.push("support_manage_drawings");
            disabled_features.push("support_multicharts");
            disabled_features.push("right_bar_stays_on_scroll");
            disabled_features.push("charts_auto_save");
            disabled_features.push("edit_buttons_in_legend");
            disabled_features.push("context_menus");
            disabled_features.push("control_bar");
            disabled_features.push("header_fullscreen_button");
            disabled_features.push("header_widget");
            disabled_features.push("symbollist_context_menu");
            disabled_features.push("show_pro_features");
        } else {
            //enabled_features.push("study_templates");
            enabled_features.push("keep_left_toolbar_visible_on_small_screens");
        }

        if (__DEV__) console.log("*** Load Chart ***");
        if (__DEV__) console.time("*** Chart load time: ");

        this.tvWidget = new TradingView.widget({
            fullscreen: false,
            symbol: props.quoteSymbol + "_" + props.baseSymbol,
            interval: getResolutionsFromBuckets([props.bucketSize])[0],
            library_path: `${
                __ELECTRON__ ? __BASE_URL__ : ""
            }/charting_library/`,
            datafeed: dataFeed,
            container_id: "tv_chart",
            charts_storage_url: "https://saveload.tradingview.com",
            charts_storage_api_version: "1.1",
            client_id: "tradingview.com",
            user_id: "public_user_id",
            autosize: true,
            locale: props.locale,
            timezone: getTVTimezone(),
            toolbar_bg: themeColors.bgColor,
            overrides: {
                "paneProperties.background": themeColors.bgColor,
                "paneProperties.horzGridProperties.color":
                    themeColors.axisLineColor,
                "paneProperties.vertGridProperties.color":
                    themeColors.axisLineColor,
                "scalesProperties.lineColor": themeColors.axisLineColor,
                "scalesProperties.textColor": themeColors.textColor
            },
            custom_css_url: props.theme + ".css",
            enabled_features: enabled_features,
            disabled_features: disabled_features,
            debug: false,
            preset: this.props.mobile ? "mobile" : "",
            studies_overrides: {
                "relative strength index.length": 14,
                "relative strength index.plot.color": "#EEEE33",

                "moving average.plot.color": "#5555FF",
                "moving average.length": 50,

                "bollinger bands.median.color": "#FF5555",
                "bollinger bands.upper.color": "#5555FF",
                "bollinger bands.lower.color": "#5555FF",

                "macd.histogram.color": "#FF5555",
                "macd.macd.color": "#5555FF",
                "macd.signal.color": "#5599AA",
                "macd.fastlength": 12,
                "macd.slowlength": 26,
                "macd.signallength": 9,

                "klinger oscillator.plot.color": "#5555FF",

                "on balance volume.plot.color": "#EEEE33",
            }
        });

        this.tvWidget.onChartReady(() => {
            if (__DEV__) console.log("*** Chart Ready ***");
            if (__DEV__) console.timeEnd("*** Chart load time: ");
            dataFeed.update({
                onMarketChange: this._setSymbol.bind(this)
            });
            if(this.props.selectedIndicator == "RSI") this.tvWidget.chart().createStudy("relative strength index");
            else if(this.props.selectedIndicator == "MA") this.tvWidget.chart().createStudy("moving average");
            else if(this.props.selectedIndicator == "BB") this.tvWidget.chart().createStudy("bollinger bands");
            else if(this.props.selectedIndicator == "MACD") this.tvWidget.chart().createStudy("MACD");
            else if(this.props.selectedIndicator == "KO") this.tvWidget.chart().createStudy("klinger oscillator");
            else if(this.props.selectedIndicator == "OBV") this.tvWidget.chart().createStudy("on balance volume");
        });

        this._onWheel = this._onWheel.bind(this);
    }

    componentWillReceiveProps(np) {
        if (!np.marketReady) return;
        if (!this.props.dataFeed && np.dataFeed) {
            loadTradingView(np);
        }
    }

    _setSymbol(ticker) {
        if (this.tvWidget) {
            this.tvWidget.setSymbol(
                ticker,
                getResolutionsFromBuckets([this.props.bucketSize])[0]
            );
        }
    }

    componentDidMount() {
        this.loadTradingView(this.props);

        // continue investigating how to disable mouse wheel, here are the containted docs
        // document.getElementById("tv_chart").children[0].contentWindow
        // document.getElementById("tv_chart").children[0].contentDocument
    }

    componentWillUnmount() {
        this.props.dataFeed.clearSubs();
    }

    shouldComponentUpdate(np) {
        if (np.chartHeight !== this.props.chartHeight) return true;
        if (!!this.tvWidget) return false;
        if (!np.marketReady) return false;
        return true;
    }

    _onWheel(e) {
        console.log("Test wheel interception");
    }

    render() {
        return (
            <div className="small-12">
                <div
                    className="exchange-bordered"
                    style={{
                        margin: 0,
                        height: this.props.chartHeight + "px"
                    }}
                    id="tv_chart"
                />
            </div>
        );
    }
}
