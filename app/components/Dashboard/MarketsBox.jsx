import React from "react";
import {Apis} from "bitsharesjs-ws";
import {connect} from "alt-react";
import MarketsStore from "stores/MarketsStore";

import utils from "common/utils";
import SettingsStore from "stores/SettingsStore";
import ReactHighchart from "react-highcharts";
import {FetchChain} from "bitsharesjs";
import {cloneDeep} from "lodash-es";

import colors from "assets/colors";

class MarketsBox extends React.Component {

  constructor() {
    super();
    this.state = {
      title : null,
      base : null,
      quote : null,
      data : null,
      asks : [],
      bids : [],
      ticker: []
    };
  }

  componentDidMount() {
    let bids = [];
    let asks = [];
    this.getOrderBook( this.props.base, this.props.quote, 50 ).then( (results) => {
      for (var i = 0; i < results.bids.length; i++) {
        bids.push(results.bids[ results.bids.length - 1 - i]);
      }
      asks = results.asks;
      bids[bids.length-1] = [ parseFloat(bids[bids.length-1].price), parseFloat(bids[bids.length-1].base)];
      for( var i = bids.length-2 ; i >= 0  ; i -- ) {
        bids[i] = [ parseFloat(bids[i].price), parseFloat(bids[i].base) + parseFloat(bids[parseInt(i) + 1][1]) ];
      }
      asks[0] = [ parseFloat(asks[0].price), parseFloat(asks[0].base)];
      for( var i = 1 ; i < asks.length  ; i ++ ) {
        asks[i] = [ parseFloat(asks[i].price), parseFloat(asks[i].base) + parseFloat(asks[parseInt(i) - 1][1]) ];
      }
      this.setState( { bids : bids, asks : asks } );
    } ).catch( (err) => {
      console.log(err);
    } );

    let ticker = [];
    this.getTicker( this.props.base, this.props.quote).then( (results) => {
      ticker = results;
      this.setState( { ticker : ticker } );
    } ).catch( (err) => {
      console.log(err);
    } );
  }

  componentWillReceiveProps(nextProps) {
    if( this.props != null ) {
      this.setState( { title : this.props.base + this.props.quote,
        base : this.props.base,
        quote : this.props.quote
      } );
      //this.getMarketPriceHistory( this.state.quote, this.state.base, 100 );
    }
  }

  _getThemeColors() {
      return colors.midnightTheme;
  }

  getMarketPriceHistory( baseAsset, quoteAsset, limit ) {
    const bucketCount = 2000;
    let startDate = new Date();
    let startDate2 = new Date();
    let startDate3 = new Date();
    let endDate = new Date();
    startDate = new Date(
        startDate.getTime() - limit * bucketCount * 1000
    );
    startDate2 = new Date(
        startDate2.getTime() - limit * bucketCount * 2000
    );
    startDate3 = new Date(
        startDate3.getTime() -  limit * bucketCount * 5000
    );
    endDate.setDate(endDate.getDate()-10);

    let promise = new Promise( (resolve, reject) => {
      Apis.instance()
          .db_api()
          .exec("get_trade_history", [
            baseAsset,
            quoteAsset,
            startDate,
            endDate,
            limit
          ]).then( (results) => {
            resolve(results);
          }).catch( (err) => {
            reject(err);
          });
    });
    return promise;
  }

  getOrderBook( base, quote, limit ){
    let promise = new Promise( (resolve, reject) => {
      Apis.instance()
          .db_api()
          .exec("get_order_book", [
            base,
            quote,
            limit
          ]).then( (results) => {
            resolve(results);
          }).catch( (err) => {
            reject(err);
          });
    });
    return promise;
  }

  getTicker( base, quote){
    let promise = new Promise( (resolve, reject) => {
      Apis.instance()
          .db_api()
          .exec("get_ticker", [
            base,
            quote
          ]).then( (results) => {
            resolve(results);
          }).catch( (err) => {
            reject(err);
          });
    });
    return promise;
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

    let bids = this.state.bids;
    let asks = this.state.asks;
    let ticker = this.state.ticker;
    asks = cloneDeep(asks);
    bids = cloneDeep(bids);
    let config = {
        chart: {
            type: "area",
            backgroundColor: "rgba(255, 0, 0, 0)",
            spacing: [10, 0, 5, 0]
        },
        title: {
            text: null
        },
        credits: {
            enabled: false
        },
        legend: {
            enabled: false
        },
        rangeSelector: {
            enabled: false
        },
        navigator: {
            enabled: false
        },
        scrollbar: {
            enabled: false
        },
        dataGrouping: {
            enabled: false
        },
        tooltip: {
            enabled: false
        },
        series: [],
        xAxis: {
            gridLineWidth: 0,
            labels: {
                style: {
                    color: "#555555"
                }
                // formatter: function() {
                //     return this.value / power;
                // }
            },
            ordinal: false,
            lineColor: "#000000",
            title: {
                text: null
            },
            plotLines: []
        },
        series: [],
        yAxis: {
            gridLineWidth: 0,
            labels: {
                style: {
                    color: "#555555"
                }
                // formatter: function() {
                //     return this.value / power;
                // }
            },
            ordinal: false,
            lineColor: "#000000",
            title: {
                text: null
            },
            plotLines: []
        },
        plotOptions: {
            area: {
                animation: false,
                marker: {
                    enabled: false
                },
                series: {
                    enableMouseTracking: false
                }
            }
        }
    };
    if (bids.length) {
        config.series.push({
            step: "right",
            name: `Bid ${this.state.quote}`,
            data: bids,
            color: bidColor,
            fillColor: bidFillColor
        });
    }

    if (asks.length) {
        config.series.push({
            step: "left",
            name: `Ask ${this.state.quote}`,
            data: asks,
            color: askColor,
            fillColor: askFillColor
        });
    }
    config.chart.height = "150px";
    return (
        <div className="grid-content no-overflow no-padding middle-content generic-bordered-box" style={{margin:20}}>
          <div className="exchange-bordered" style={{margin: 0}}>
              <div>
                <div style={{display:"inline-grid"}}>
                  <img
                      className="column-hide-small_"
                      style={{maxWidth: 35, marginRight: 10}}
                      src={`${__BASE_URL__}asset-symbols/${this.props.base.toLowerCase().slice(-3)}.png`}
                  />
                </div>
                <div  className="grid-content app-tables no-padding" style={{display:"inline-block", width:"80%"}}>
                  <div style={{paddingTop:"5px"}}>
                    <span>
                      {this.props.base.slice(-3) + "/" + this.props.quote.slice(-3)}
                    </span>
                    <span style={{float:"right", color:"#22bb22"}}>
                      {ticker.latest? ticker.latest.substr(0,7): ""}
                    </span>
                  </div>
                  <div style={{paddingTop:"5px", fontSize:"14px"}}>
                    <span>
                      {"Volume: "+ ticker.base_volume+" "+this.props.base.slice(-3)}
                    </span>
                    {ticker.percent_change && parseFloat(ticker.percent_change)>=0?
                      <span style={{float:"right", color:"#22bb22"}}>
                        {ticker.percent_change? ticker.percent_change+"%": ""}
                      </span>
                    :
                      <span style={{float:"right", color:"#bb2222"}}>
                        {ticker.percent_change? ticker.percent_change+"%": ""}
                      </span>
                    }
                  </div>
                </div>
              </div>

              <div>
                {bids || asks? (
                    <ReactHighchart ref="depthChart" config={config} />
                ) : null}
              </div>
          </div>
        </div>
    );
  }
}
export default MarketsBox;
