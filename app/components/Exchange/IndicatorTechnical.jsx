import {Apis} from "bitsharesjs-ws";
import {ChainStore, FetchChain} from "bitsharesjs";

import React from "react";
import {connect} from "alt-react";

import utils from "common/utils";
import SettingsStore from "stores/SettingsStore";
import ReactSpeedometer from "react-d3-speedometer";


class IndicatorGaugeChart extends React.Component {
  constructor() {
    //charts(FusionCharts);
    super();
    this.state = {
      title : '',
      emotion: 0,
      marketHistory: {},
      buy_val: 0,
      sell_val: 0,
      buy_sell: 0,
      total: 0
    };
  }

  componentDidMount() {
    if( this.props != null ) {
      let promise = this._getMarketHistory(this.props.base_symbol, this.props.quote_symbol,3600*4,200);
      let _this = this;
      promise.then(function(data){
        if(data.length > 0){
          let currentPrice = (data[data.length-1]['close_base']/data[data.length-1]['close_quote'])
            *Math.pow(10,(_this._getDecimal(data[data.length-1]['key']['quote'])-_this._getDecimal(data[data.length-1]['key']['base'])));
          let sell = 0;
          let buy = 0;

          let period=[5,10,20,30,50,100,150];
          period.forEach(function(element) {
            let tmp = _this._getSMA(data, element);
            if(tmp){
              if(tmp > currentPrice){
                sell += 1;
              }else{
                buy += 1;
              }
            }
            tmp = _this._getEMA(data, element);
            if(tmp){
              if(tmp > currentPrice){
                sell += 1;
              }else{
                buy += 1;
              }
            }
          });
          if(_this._getAssetId(_this.props.base_symbol) == data[0]['key']['base']){
            let tmp = buy;
            buy = sell;
            sell = tmp;
          }
          let total = buy + sell;
          _this.setState({
              buy_val: buy,
              sell_val: sell,
              total: total,
              buy_sell: buy
          });
        }
      });
    }
  }

  componentWillReceiveProps(nextProps) {

  }

  _getDecimal(assetId){
    let asset_decimal = {
      "1.3.0":5,
      "1.3.2":6,
      "1.3.3":6,
      "1.3.5":8,
      "1.3.6":8,
      "1.3.7":6,
    };
    return asset_decimal[assetId];
  }

  _getAssetId(symbol){
    let asset_id = {
      "SKX":'1.3.0',
      "BTC":'1.3.2',
      "ETH":'1.3.3',
      "LTC":'1.3.5',
      "BCH":'1.3.6',
      "USDT":'1.3.7',
    };
    return asset_id[symbol];
  }

  _getSMA(data, period){
    if(period > 0 && data != null){
      let  dataLength = data.length;
      if(period < dataLength){
        let average = 0;
        for(var i=dataLength-1; i>dataLength-period-1; i--){
          average += (data[i]['close_base']/data[i]['close_quote'])
            *Math.pow(10,(this._getDecimal(data[i]['key']['quote'])-this._getDecimal(data[i]['key']['base'])));
        }
        average = average/period;
        return average;
      }else{
        return null;
      }
    }else{
      return null;
    }
  }

  _getEMA(data, period){
    if(period > 0 && data != null){
      let  dataLength = data.length;
      if(period < dataLength){
        let price = 0;
        let average = 0;
        for(var i=0; i<dataLength; i++){
          price = (data[i]['close_base']/data[i]['close_quote'])
            *Math.pow(10,(this._getDecimal(data[i]['key']['quote'])-this._getDecimal(data[i]['key']['base'])));
          if(i<period){
            average += price;
          }else if(i==period){
            average /= period;
          }else{
            average = (price-average)*(2/(period+1))+average;
          }
        }
        return average;
      }else{
        return null;
      }
    }else{
      return null;
    }
  }

  _getWMA(data, period){
    if(period > 0 && data != null){
      let  dataLength = data.length;
      let total = 0;
      for(var i=1; i<period+1; i++){
        total += i;
      }
      if(period < dataLength){
        let average = 0;
        let weight = 0;
        for(var i=dataLength-1; i>dataLength-period-1; i--){
          weight = (i-(dataLength-period-1))/total;
          average += (data[i]['close_base']/data[i]['close_quote'])
            *Math.pow(10,(this._getDecimal(data[i]['key']['quote'])-this._getDecimal(data[i]['key']['base'])))*weight;
        }
        return average;
      }else{
        return null;
      }
    }else{
      return null;
    }
  }


  _getMarketHistory(base_symbol, quote_symbol, bucketCount, limit) {
    let startDate = new Date();
    let endDate = new Date();

    startDate = new Date(
        startDate.getTime() - limit * bucketCount * 1000
    );

    let _this = this;
    let promise = new Promise( (resolve, reject) => {
        Apis.instance()
            .history_api()
            .exec("get_market_history", [
                _this._getAssetId(quote_symbol),
                _this._getAssetId(base_symbol),
                //"1.3.2",
                //"1.3.0",
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
    let minValue = 0;
    let maxValue= 100;
    let value = 50;
    if(this.state.total > 0){
      value= this.state.buy_sell*80/this.state.total+10;
    }
    let valueText = "0.00";
    let startColor = "red";
    let endColor = "green";
    let segment = 4;
    let maxSegmentLabels = 0;
    let bgColors = { "Default": "#191a1f",
                    "Blue": "#00B1E1",
                    "Cyan": "#37BC9B",
                    "Green": "#8CC152",
                    "Red": "#E9573F",
                    "Yellow": "#F6BB42",
};

    return (
        <div className="grid-content no-overflow no-padding middle-content" style={{  position: 'relative', marginBottom: '0px', marginTop: '20px'}}>
            <div style={{backgroundColor: bgColors.Default, width: '150px', height: '20px', top: '80px', position: 'absolute'}}>
              <div style={{float:"left", color:"#777777"}}>sell</div>
              <div style={{float:"right", color:"#777777"}}>buy</div>
            </div>
            <div style={{backgroundColor: bgColors.Default, width: '70px', height: '15px', left:'40px', top: '0px', position: 'absolute'}}>
              <div style={{color:"#777777"}}>neutral</div>
            </div>
            <div style={{backgroundColor: bgColors.Default, width: '15px', height: '15px', left:'0px', top: '65px', position: 'absolute'}}> </div>
            <div style={{backgroundColor: bgColors.Default, width: '15px', height: '15px', left:'135px', top: '65px', position: 'absolute'}}> </div>
            <div style={{ width: '150px',height: '100px'}}>
                <ReactSpeedometer
                  fluidWidth
            		  minValue={minValue}
            		  maxValue={maxValue}
            		  value={value}
            		  needleColor="gray"
            		  needleHeightRatio = {0.5}
            			needleTransitionDuration={5000}
            			needleTransition="easeElastic"
            		  startColor={startColor}
            		  segments={segment}
            		  endColor={endColor}
                  ringWidth = {20}
                  maxSegmentLabels = {2}
            		/>
            </div>
        </div>
    );
  }
}
export default IndicatorGaugeChart;
