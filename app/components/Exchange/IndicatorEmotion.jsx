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
      emotion: 0
    };
  }

  componentDidMount() {
    if( this.props != null ) {
      this.setState({
        title : this.props.indicator
      });
    }

    let emotion = '';
    var value = 0;
    var valueText = '';
    var http = new XMLHttpRequest();
    var url = "https://api.skyrus.io/api/emotion/emotion";
    var params = "";

    http.open("GET", url, true);
    http.setRequestHeader("Content-type", "application/json; charset=utf-8");
    let _this = this;

    http.onreadystatechange = function() {
      if(http.readyState == 4 && http.status == 200) {
          emotion = JSON.parse(http.responseText);
          valueText = emotion['data'][0]['value'];
          value = parseInt(valueText);
          _this.setState({
            value : value
          });
      }
    }
    http.send(params);
  }

  componentWillReceiveProps(nextProps) {

  }

  render() {
    let minValue = 0;
    let maxValue= 100;
    let value= 0;
    let valueText = "0.00";
    let startColor = "red";
    let endColor = "green";
    let segment = 4;
    let maxSegmentLabels = 0;
    value = this.state.value;

    return (
        <div className="grid-content no-overflow no-padding middle-content" style={{}}>
            <div style={{ width: '300px',height: '180px'}}>
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
