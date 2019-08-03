import React from "react";
import colors from "assets/colors";
import Video from "../Video"
import NewsModal from "../Modal/NewsModal";

class LiveFeed extends React.Component {

  constructor() {
    super();
    this.state = {
      messages: [],
      news_list: [],
      isNewsModalVisible: false,
      news: [],
      newsContent: '',
    };
    this.getList = this.getList.bind(this);
    this._getContent = this._getContent.bind(this);
    this.showNewsModal = this.showNewsModal.bind(this);
    this.hideNewsModal = this.hideNewsModal.bind(this);
  }

  componentWillMount() {

  }

  componentDidMount() {
    this.getList();
  }

  componentDidUpdate() {

  }

  showNewsModal() {
      this.setState({
          isNewsModalVisible: true
      });
  }

  hideNewsModal() {
      this.setState({
          isNewsModalVisible: false
      });
  }

  getList() {
    var news_list = new Array();
    var http = new XMLHttpRequest();
    var url = "https://api.skyrus.io/api/news/newslist";
    var params = "";

    http.open("GET", url, true);
    http.setRequestHeader("Content-type", "text/html; charset=utf-8");
    let _this = this;

    http.onreadystatechange = function() {
      if(http.readyState == 4 && http.status == 200) {
          news_list = JSON.parse(http.responseText);
          _this.setState({news_list: news_list});
      }
    }
    http.send(params);
  }

  _getContent(newsUrl) {
    var newsContent = "";
    var http = new XMLHttpRequest();
    var url = "https://api.skyrus.io/api/news/newscontent";
    //var url = "http://192.168.5.117/fileupload.php";
    var params = "url="+encodeURIComponent(newsUrl);

    http.open("GET", url+'?'+params, true); console.log(url+'?'+params);
    http.setRequestHeader("Content-type", "text/html; charset=utf-8");
    let _this = this;

    http.onreadystatechange = function() {
      if(http.readyState == 4 && http.status == 200) {
          newsContent = http.responseText;
          _this.setState({newsContent: newsContent});
      }
    }
    http.send();
  }

  _showNewsModal(news, e) {
      e.preventDefault();
      this._getContent(news['link']);
      this.setState({news: news}, () => {
          this.showNewsModal();
      });
  }

  _getThemeColors() {
      return colors.midnightTheme;
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

    return (
      <div style={{width: "100%", padding: "5px"}}>
        <div className="">
          <iframe src="https://www.youtube.com/embed/JvZVnBn6zEI?autoplay=1" style={{width: "100%", height:"200px"}}></iframe>
        </div>
        {this.state.news_list.map((news) => {
           return (
             <div
                key={news['link']}
                className="exchange-bordered"
                style={{margin: 0, padding: "5px", marginTop:"2px", cursor:'pointer'}}
                onClick={this._showNewsModal.bind(this, news)}
                title = {news['summary']}
                >
                    <span style={{fontSize: "12px", display:'block'}}>{news['date']}</span>
                    <span style={{fontSize: "14px", display:'block', marginLeft:"5px"}}>{news['content']}</span>
             </div>
           );
        })}
        <NewsModal
            visible={this.state.isNewsModalVisible}
            showModal={this.showNewsModal}
            hideModal={this.hideNewsModal}
            news={this.state.news}
            newsContent={this.state.newsContent}
        />
      </div>
    );
  }
}
export default LiveFeed;
