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
      title : null,
      data : []
    };
  }

  componentDidMount() {
    if( this.props != null ) {
      this.setState({
        title : this.props.indicator,
        data : this.props.marketHistory
      });
    }
  }

  componentWillReceiveProps(nextProps) {

  }

  render() {
    let data = this.state.data;
    let indicator = this.state.title;

    let minValue = -200;
    let maxValue= 50;
    let value= 40;
    let valueText = "0.00";
    let startColor = "rgb(0, 255, 0)";
    let endColor = "#ff0000";
    let segment = 3;
    let maxSegmentLabels = 0;

    let dataLength = 0;

    if(indicator == null) {
      return null;
    }
    else if(indicator == "RSI"){
      minValue = 0;
      maxValue = 100;
      value = 20;
      startColor = "rgb(0, 255, 0)";
      endColor = "rgb(255, 0, 0)";
      segment = 3;

      if(data!=null){
        dataLength = data.length;
      }
      let period = dataLength>14?14:dataLength;
      if(period == 14){
        let gain = 0;
        let lose = 0;
        let i = 0;

        for(i=dataLength-1; i>=dataLength-period; i--){
          if(data[i]['close_base']/data[i]['close_quote'] > data[i-1]['close_base']/data[i-1]['close_quote']){
            gain += (data[i]['close_base']/data[i]['close_quote'] - data[i-1]['close_base']/data[i-1]['close_quote']);
          }
          else{
            lose += (data[i-1]['close_base']/data[i-1]['close_quote'] - data[i]['close_base']/data[i]['close_quote']);
          }
        }
        gain /= period;
        lose /= period;
        value = (100-(100/(1+gain/lose))).toFixed(3);
        valueText = value.toString();
      }
    }
    else if(indicator == "MO"){
      minValue = -100;
      maxValue = 100;
      value = 0;
      startColor = "green";
      endColor = "red";
      segment = 2;

      if(data!=null){
        dataLength = data.length;
      }
      let momentum = [];
      let period = dataLength>10?10:dataLength;
      if(period == 10){
        let i = 0;
        for(i=0; i<dataLength; i++){
          if(i<period){
            momentum[i]=0;
          }
          else{
            momentum[i]=((data[i]['close_base']/data[i]['close_quote'])-(data[i-period]['close_base']/data[i-period]['close_quote']));
          }
        }

        let val = momentum[dataLength-1];

        let minData=Math.min(...momentum);
        let maxData=Math.max(...momentum);
        if (Math.abs(maxData) > Math.abs(minData)){
          minData = -Math.abs(maxData);
          maxData = Math.abs(maxData);
        }else{
          minData = -Math.abs(minData);
          maxData = Math.abs(minData);
        }
        let balance = maxData/maxValue;
        value = val/balance;
        valueText = val.toFixed(3);
        maxSegmentLabels = 4;
      }
      else{
        value = 0;
      }
    }
    else if(indicator == "BB"){
      minValue = 0;
      maxValue = 100;
      value = 0;
      startColor = "rgb(0, 255, 0)";
      endColor = "rgb(255, 0, 0)";
      segment = 3;

      if(data!=null){
        dataLength = data.length;
      }
      let period = dataLength>20?20:dataLength;
      if(period == 20){
        let i = 0;
        let tmp = 0;
        for(i=dataLength-1; i>=dataLength-period; i--){
          tmp += data[i]['close_base']/data[i]['close_quote'];
        }
        tmp /= period;
        let avg = tmp;
        tmp = 0;
        for(i=dataLength-1; i>=dataLength-period; i--){
          tmp += Math.pow((avg - data[i]['close_base']/data[i]['close_quote']), 2);
        }
        tmp/=period;
        tmp = Math.sqrt(tmp);

        let valU= avg+(2*tmp);
        let valL= avg-(2*tmp);


        let minD = valL-(valU-valL);
        let maxD = valU+(valU-valL);

        let val = data[dataLength-1]['close_base']/data[dataLength-1]['close_quote'];
        let balance = (maxD-minD)/100;
        value = (val-minD)/balance;

        valueText = val.toFixed(3);
      }
      else{
        value = 0;
      }
    }
    else if(indicator == "MACD"){
      minValue = 0;
      maxValue = 100;
      value = 0;
      startColor = "green";
      endColor = "red";
      segment = 2;

      if(data==null){
        value = 0;
      }
      else{
        dataLength = data.length;
        let periodLong = 26;
        let periodShort = 12;
        let periodSignal = 9;

        let emaLong = [];
        let emaShort = [];
        let macd = [];
        let signal = [];

        if(dataLength > periodLong + periodSignal){
            let i = 0;
            let tmp0 = 0;
            let tmp1 = 0;
            let tmp2 = 0;

            for(i=0; i<dataLength; i++){
              if(i<periodShort){
                tmp0 += data[i]['close_base']/data[i]['close_quote'];
                emaShort[i] = 0;
              }
              else if(i==periodShort){
                tmp0 /= periodShort;
                emaShort[i-1] = tmp0;
                emaShort[i] = (data[i]['close_base']/data[i]['close_quote'])*(2/(periodShort+1))+tmp0*(1-(2/(periodShort+1)));
              }
              else{
                emaShort[i] = (data[i]['close_base']/data[i]['close_quote'])*(2/(periodShort+1))+emaShort[i-1]*(1-(2/(periodShort+1)));
              }

              if(i<periodLong){
                tmp1 += data[i]['close_base']/data[i]['close_quote'];
                emaLong[i] = 0;
                macd[i] = 0;
                signal[i] = 0;
              }
              else if(i==periodLong){
                tmp1 /= periodLong;
                emaLong[i-1] = tmp0;
                macd[i-1] = emaShort[i-1] - emaLong[i-1] ;
                emaLong[i] = (data[i]['close_base']/data[i]['close_quote'])*(2/(periodLong+1))+tmp1*(1-(2/(periodLong+1)));
                macd[i] = emaShort[i] - emaLong[i] ;
                tmp2 = macd[i-1] + macd[i];
                signal[i] = 0;
              }
              else{
                emaLong[i] = (data[i]['close_base']/data[i]['close_quote'])*(2/(periodLong+1))+emaLong[i-1]*(1-(2/(periodLong+1)));
                macd[i] = emaShort[i] - emaLong[i] ;
                if(i < periodLong+periodSignal){
                  tmp2 += macd[i];
                  signal[i] = 0;
                }
                else if(i == periodLong+periodSignal){
                  tmp2 /= periodSignal;
                  signal[i-1] = tmp2;
                  signal[i] =  macd[i]*(2/(periodSignal+1))+signal[i-1]*(1-(2/(periodSignal+1)));
                }
                else{
                  signal[i] =  macd[i]*(2/(periodSignal+1))+signal[i-1]*(1-(2/(periodSignal+1)));
                }
              }
            }

            let diff = [];
            for(i=0; i<dataLength; i++){
              diff[i] = Math.abs(signal[i] - macd[i]);
            }

            let maxData=Math.max(...diff);
            let minD = signal[dataLength-1]-maxData;
            let maxD = signal[dataLength-1]+maxData;

            let val = macd[dataLength-1];
            let balance = (maxD-minD)/100;
            value = (val-minD)/balance;
            valueText = val.toFixed(3);
        }
        else{
          value = 0;
        }
      }

    }
    else if(indicator == "KO"){
      minValue = 0;
      maxValue = 100;
      value = 0;
      startColor = "green";
      endColor = "red";
      segment = 2;

      if(data==null){
        value = 0;
      }
      else{
        dataLength = data.length;
        let periodLong = 55;
        let periodShort = 34;
        let periodSignal = 13;

        let hlc = [];
        let dm = [];
        let cm = [];
        let trend = [];
        let emaLong = [];
        let emaShort = [];
        let vf = [];
        let signal = [];
        let kvo = [];

        if(dataLength > periodLong + periodSignal){
            let i = 0;
            let tmp0 = 0;
            let tmp1 = 0;
            let tmp2 = 0;

            cm[0] = 0;
            dm[0] = 0;
            trend[0] = 0;
            vf[0] = 0;

            for(i=0; i< dataLength; i++){
              hlc[i] = data[i]['high_base']/data[i]['high_quote'] + data[i]['low_base']/data[i]['low_quote'] + data[i]['close_base']/data[i]['close_quote'];
              dm[i] = data[i]['high_base']/data[i]['high_quote'] - data[i]['low_base']/data[i]['low_quote'];

              if(i>0){
                if(hlc[i]>hlc[i-1]){
                  trend[i]=1;
                }
                else if(hlc[i]<hlc[i-1]){
                  trend[i]=-1;
                }
                else{
                  trend[i]=trend[i-1];
                }

                if(trend[i]!=trend[i-1]){
                  cm[i]=dm[i-1]+dm[i];
                }
                else{
                  cm[i]=cm[i-1]+dm[i];
                }

                vf[i] = 100*data[i]['base_volume']*trend[i]*(2*(dm[i]/cm[i]-1));
              }
            }

            for(i=0; i<dataLength; i++){
              if(i<periodShort){
                tmp0 += vf[i];
                emaShort[i] = 0;
              }
              else if(i==periodShort){
                tmp0 /= periodShort;
                emaShort[i-1] = tmp0;
                emaShort[i] = (vf[i])*(2/(periodShort+1))+emaShort[i-1]*(1-(2/(periodShort+1)));
              }
              else{
                emaShort[i] = (vf[i])*(2/(periodShort+1))+emaShort[i-1]*(1-(2/(periodShort+1)));
              }

              if(i<periodLong){
                tmp1 += vf[i];
                emaLong[i] = 0;
                kvo[i] = 0;
                signal[i] = 0;
              }
              else if(i==periodLong){
                tmp1 /= periodLong;
                emaLong[i-1] = tmp0;
                kvo[i-1] = emaShort[i-1] - emaLong[i-1] ;
                emaLong[i] = (vf[i])*(2/(periodLong+1))+emaLong[i-1]*(1-(2/(periodLong+1)));
                kvo[i] = emaShort[i] - emaLong[i] ;
                tmp2 = kvo[i-1] + kvo[i];
                signal[i] = 0;
              }
              else{
                emaLong[i] = (vf[i])*(2/(periodLong+1))+emaLong[i-1]*(1-(2/(periodLong+1)));
                kvo[i] = emaShort[i] - emaLong[i] ;
                if(i < periodLong+periodSignal){
                  tmp2 += kvo[i];
                  signal[i] = 0;
                }
                else if(i == periodLong+periodSignal){
                  tmp2 /= periodSignal;
                  signal[i-1] = tmp2;
                  signal[i] =  kvo[i]*(2/(periodSignal+1))+signal[i-1]*(1-(2/(periodSignal+1)));
                }
                else{
                  signal[i] =  kvo[i]*(2/(periodSignal+1))+signal[i-1]*(1-(2/(periodSignal+1)));
                }
              }
            }

            let diff = [];
            for(i=0; i<dataLength; i++){
              diff[i] = Math.abs(signal[i] - kvo[i]);
            }

            let maxData=Math.max(...diff);
            let minD = signal[dataLength-1]-maxData;
            let maxD = signal[dataLength-1]+maxData;

            let val = kvo[dataLength-1];
            let balance = (maxD-minD)/100;
            value = (val-minD)/balance;
            valueText = (val/1000000).toFixed(3);
        }
        else{
          value = 0;
        }
      }
    }
    else if(indicator == "OBV"){
      minValue = 0;
      maxValue = 100;
      value = 0;
      startColor = "red";
      endColor = "green";
      segment = 2;

      if(data==null){
        value = 0;
      }
      else{
        dataLength = data.length;
        let periodLong = 55;
        let periodShort = 34;
        let periodSignal = 13;

        let close = [];
        let obv = [];

        if(dataLength > periodLong + periodSignal){
            let i = 0;
            obv[0] = 0;
            for(i=0; i< dataLength; i++){
              close[i] = data[i]['close_base']/data[i]['close_quote'];
              if(i>0){
                if(close[i]>close[i-1]){
                  obv[i]=data[i]['base_volume'];
                }
                else if(close[i]<close[i-1]){
                  obv[i]=-data[i]['base_volume'];
                }
                else{
                  obv[i]=0;
                }
              }
            }

            let maxData=Math.max(...obv);
            let minData=Math.min(...obv);
            let minD = minData;
            let maxD = maxData;

            let val = obv[dataLength-1];
            let balance = (maxD-minD)/100;
            value = (val-minD)/balance;
            valueText = (val/1000000).toFixed(3);
            maxSegmentLabels = 0;
            //console.log(obv);
        }
        else{
          value = 0;
        }
      }
    }

    return (
        <div className="grid-content no-overflow no-padding middle-content" style={{}}>
            <div style={{ width: '150px',height: '100px'}}>
                <ReactSpeedometer
                  fluidWidth
            		  minValue={minValue}
            		  maxValue={maxValue}
            		  value={value}
                  currentValueText = {valueText}
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
