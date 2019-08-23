import React from "react";
import {connect} from "alt-react";
import counterpart from "counterpart";
import AccountStore from "stores/AccountStore";
import {Link} from "react-router-dom";
import Translate from "react-translate-component";
import TranslateWithLinks from "./Utility/TranslateWithLinks";
import {isIncognito} from "feature_detect";
import SettingsActions from "actions/SettingsActions";
import WalletUnlockActions from "actions/WalletUnlockActions";
import SettingsStore from "stores/SettingsStore";
import IntlActions from "actions/IntlActions";
import CreateAccount from "./Account/CreateAccount";
import CreateAccountPassword from "./Account/CreateAccountPassword";
import {Route} from "react-router-dom";
import {getWalletName, getLogo} from "branding";
import {Select, Row, Col, Icon as BitIcon, Button, Modal} from "bitshares-ui-style-guide";
import Icon from "./Icon/Icon";
import { SocialIcon } from 'react-social-icons';
import Video from "./Video"
import ReactImageVideoLightbox from 'react-image-video-lightbox';
import Popup from "reactjs-popup";
import fire from "./firebase";
import IntlStore from "../stores/IntlStore";
import PaginatedList from "./Utility/PaginatedList";
import AccountSelector from "./Account/AccountSelector";
import {ChainStore} from "bitsharesjs";
import {Notification} from "bitshares-ui-style-guide";
import Background from '../assets/pngs/referral_background.png';
const database = fire.database();

var logo = getLogo();

const FlagImage = ({flag, width = 50, height = 50}) => {
    return (
        <img
            height={height}
            width={width}
            src={`${__BASE_URL__}language-dropdown/${flag.toUpperCase()}.png`}
        />
    );
};

class LoginSelector extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            step: 1,
            locales: SettingsStore.getState().defaults.locale,
            currentLocale: SettingsStore.getState().settings.get("locale"),
            skyrus_visitors: 0,
            showReferralModal: false,
            myUsername: "",
            myTelegram: "",
            myTwitter: "",
            myCountry: "",
            myReferenceUsername: "",
            showCreateAccountModal: false
        };
        this.unmounted = false;

        this.handleLanguageSelect = this.handleLanguageSelect.bind(this);
        this.hideCreateAccountModal = this.hideCreateAccountModal.bind(this);
    }

    componentWillMount() {
        isIncognito(incognito => {
            if (!this.unmounted) {
                this.setState({incognito});
            }
        });
        // this.initVisitCounts();
    }

    componentWillUnmount() {
        this.unmounted = true;
    }

    initVisitCounts() {
      const countRef = database.ref('skyrus_visitors');
      countRef.once('value').then((snapshot) => {
        let count = 0;
        if(snapshot.val() !== null) {
          count = snapshot.val();
        }
        count ++;
        countRef.set(count);
      });
      countRef.on('value', snapshot => {
        if(snapshot.val() !== null) {
          this.setState({skyrus_visitors: snapshot.val()});
        }
      });
    }

    onSelect(route) {
        this.props.history.push("/create-account/" + route);
    }

    handleLanguageSelect(locale) {
        IntlActions.switchLocale(locale);
        this.setState({
            currentLocale: locale
        });
    }

    languagesFilter(input, option) {
        return (
            option.props.language.toLowerCase().indexOf(input.toLowerCase()) >=
            0
        );
    }

    openWhitePaper() {
      var win = window.open('https://whitepaper.skyrus.io', '_blank');
      win.focus();
    }

    openTelegramCommunity() {
        let win = window.open("https://t.me/SkyrusNet_Global", "_blank");
        win.focus();
    }

    renderCountries() {
      return(
        <div>
          <div style={{cursor: 'pointer', margin: 5, textAlign: 'left'}}>
            <Link
              to={"/Skyrus English Whitepaper.pdf"}
              target="_blank"
            >
                English
            </Link>
          </div>
          <div style={{cursor: 'pointer', margin: 5, textAlign: 'left'}}>
            <Link
              to={"/Skyrus Indonesian Whitepaper.pdf"}
              target="_blank"
            >
                Indonesian
            </Link>
          </div>
          <div style={{cursor: 'pointer', margin: 5, textAlign: 'left'}}>
            <Link
              to={"/Skyrus Korean Whitepaper.pdf"}
              target="_blank"
            >
                Korean
            </Link>
          </div>
          <div style={{cursor: 'pointer', margin: 5, textAlign: 'left'}}>
            <Link
              to={"/Skyrus Spanish Whitepaper.pdf"}
              target="_blank"
            >
                Spanish
            </Link>
          </div>
          <div style={{cursor: 'pointer', margin: 5, textAlign: 'left'}}>
            <Link
              to={"/Skyrus Vietnamese Whitepaper.pdf"}
              target="_blank"
            >
                Vietnamese
            </Link>
          </div>
        </div>
      );
    }

    closeReferralSubmitModal() {
      this.setState({
        showReferralModal: false,
        myUsername: "",
        myTelegram: "",
        myTwitter: "",
        myCountry: "",
        myReferenceUsername: ""});
    }

    openReferralSubmitForm() {
      this.setState({showReferralModal: true});
    }

    onMyUsernameChange = (account) => {
      this.setState({ myUsername: account });
    }

    myUserChange = (account) => {
    }

    onMyTelegramChange = (e) => {
      this.setState({ myTelegram: e.target.value });
    }

    onMyTwitterChange = (e) => {
      this.setState({ myTwitter: e.target.value });
    }

    onMyCountryChange = (e) => {
      this.setState({ myCountry: e.target.value });
    }

    onMyReferenceUsernameChange = (account) => {
      this.setState({ myReferenceUsername: account });
    }

    myReferenceUserChange = (account) => {
    }

    renderReferralInput() {
      return(
        [
          <tr key="input">
            <td>
              <AccountSelector
                ref="myAccountName"
                accountName={this.state.myUsername}
                onChange={this.onMyUsernameChange}
                onAccountChanged={this.myUserChange}
                account={this.state.myUsername}
                size={60}
                placeholder=" "
                hideImage
                />
            </td>
            <td>
              <input onChange={this.onMyTelegramChange} type="text" style={{backgroundColor: "#1b1c22", height: 38}} value={this.state.myTelegram}/>
            </td>
            <td>
              <input onChange={this.onMyTwitterChange} type="text" style={{backgroundColor: "#1b1c22", height: 38}} value={this.state.myTwitter}/>
            </td>
            <td>
              <input onChange={this.onMyCountryChange} type="text" style={{backgroundColor: "#1b1c22", height: 38}} value={this.state.myCountry}/>
            </td>
            <td>
              <AccountSelector
                ref="myAccountName"
                accountName={this.state.myReferenceUsername}
                onChange={this.onMyReferenceUsernameChange}
                onAccountChanged={this.myReferenceUserChange}
                account={this.state.myReferenceUsername}
                size={60}
                placeholder=" "
                hideImage
                />
            </td>
          </tr>
        ]
      );
    }

    renderReferralSubmitModal() {
      return(
        <PaginatedList
            style={{padding: 0}}
            className="table table-hover"
            rows={this.renderReferralInput()}
            header={
              <tr>
                  <th style={{textAlign: "center"}}>
                    {counterpart.translate("login.myUsername")}
                  </th>
                  <th style={{textAlign: "center"}}>
                    {counterpart.translate("login.myTelegram")}
                  </th>
                  <th style={{textAlign: "center"}}>
                    {counterpart.translate("login.myTwitter")}
                  </th>
                  <th style={{textAlign: "center"}}>
                    {counterpart.translate("login.CountryResidence")}
                  </th>
                  <th style={{textAlign: "center"}}>
                    {counterpart.translate("login.myReferralUsername")}
                  </th>
              </tr>
            }
            pageSize={20}
            label="utility.total_x_assets"
            leftPadding="1.5rem"
        >
        </PaginatedList>
      );
    }

    submitReferralInfo() {
      const ref = database.ref('referrals/' + this.state.myUsername);
      ref.once('value').then((snapshot) => {
        let reward = snapshot.val();
        if(reward !== null) {
          Notification.error({
              message: "You can't get referral reward twice."
          });
          this.closeReferralSubmitModal();
          return;
        }
        reward = {
          id: this.state.myUsername,
          telegram: this.state.myTelegram,
          twitter: this.state.myTwitter,
          country: this.state.myCountry,
          otherId: this.state.myReferenceUsername
        };
        ref.set(reward).then(() => {
          Notification.success({
              message: "You will get 5$ as referral reward."
          });
          this.closeReferralSubmitModal();
        }).catch(() => {
          this.closeReferralSubmitModal();
        });
      });
    }

    openPaperMoney() {
      Notification.info({
          message: "This will activate on 23 AUG 2019, 1400HRS (GMT+8)"
      });
      return;
      var win = window.open('https://papermoney.skyrus.io', '_blank');
      win.focus();
    }

    openCreateAccount() {
      Notification.info({
          message: "This will activate on 23 AUG 2019, 1400HRS (GMT+8)"
      });
      return;
      this.setState({showCreateAccountModal: true});
    }

    hideCreateAccountModal() {
      this.setState({showCreateAccountModal: false});
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
      if(this.state.showReferralModal) {
        return(
          <div style={{
              padding: 20,
              height: '100%',
              backgroundImage: "url(" + Background + ")",
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat'}}>
            <h5>
              <Translate content="login.referralDescription" />
            </h5>
            {this.renderReferralSubmitModal()}
            <div style={{marginTop: 30}}>
              <Button
                  disabled={!(this.state.myUsername && this.state.myTelegram && this.state.myTwitter && this.state.myCountry && this.state.myReferenceUsername && ChainStore.getAccount(this.state.myUsername) && ChainStore.getAccount(this.state.myReferenceUsername)) || this.state.myUsername === this.state.myReferenceUsername}
                  key="submit"
                  type="primary"
                  onClick={() => {this.submitReferralInfo();}}>
                  {counterpart.translate("login.submit")}
              </Button>
              <Button
                  key="cancel"
                  style={{marginLeft: "8px"}}
                  onClick={() => {this.closeReferralSubmitModal()}}
              >
                  {counterpart.translate("transfer.cancel")}
              </Button>
            </div>
          </div>
        );
      }
      const translator = require("counterpart");
      console.log(this.state.locales);
      const flagDropdown = (
          <Select
              showSearch
              filterOption={this.languagesFilter}
              value={this.state.currentLocale}
              onChange={this.handleLanguageSelect}
              style={{width: "150px", marginBottom: "16px"}}
          >
              {this.state.locales.map(locale => (
                  <Select.Option
                      key={locale}
                      language={counterpart.translate("languages." + locale)}
                  >
                    <img
                      style={{width: 32, marginRight: 4}}
                      src={require("assets/pngs/flags/" + locale + ".png")}
                    />
                    {counterpart.translate("languages." + locale)}
                  </Select.Option>
              ))}
          </Select>
      );
      const  langSelect = (
        <span
            style={{margin: "0 auto"}}
            data-intro={translator.translate(
                "walkthrough.language_flag"
            )}
        >
            {flagDropdown}
        </span>
      );
      let smallScreen = window.innerWidth < 850 ? true : false;
      let tinyScreen = window.innerWidth < 640 ? true : false;
      let topPaneContainer = null;
      let mainPaneContainer = null;
      let bottomPanContainer = null;
      let bottomBar = null;
      if(tinyScreen) {
        topPaneContainer = (
          <div style={{textAlign: 'right'}}>
            <Popup
              on={'hover'}
              position={['bottom left']}
              offsetX={-150}
              offsetY={85}
              closeOnDocumentClick
              mouseLeaveDelay={100}
              mouseEnterDelay={0}
              contentStyle={{ width: 150, padding: '10px', border: 'none', backgroundColor: "#2d2e37", borderRadius: 3}}
              arrow={false}
              trigger={
                <button className = "ant-btn" style={{marginRight: 10, borderRadius: 5, color: '#ffffff', borderColor: '#988989'}}>
                    <Translate content="login.pdfWhitepaper" />
                </button>}
              position="right center">
              <div>
                {this.renderCountries()}
              </div>
            </Popup>
            <a target="_blank" className = "ant-btn" style={{marginRight: 10, borderRadius: 5, color: '#ffffff', borderColor: '#988989'}} onClick={() => {this.openBuyIco();}}>
                <Translate content="login.buyIco" />
            </a>
            <button className = "ant-btn" style={{width: '100%', marginTop: 2, borderRadius: 5, color: '#ffffff', borderColor: '#988989'}} onClick={() => {this.openWhitePaper()}}>
                <Translate content="login.whitepaper" />
            </button>
            <button
              className = "ant-btn"
              style={{width: '100%', marginTop: 2, borderRadius: 5, color: '#ffffff', borderColor: '#988989'}}
              onClick={() => {
                  SettingsActions.changeSetting.defer({
                      setting: "passwordLogin",
                      value: true
                  });
                  WalletUnlockActions.unlock().catch(
                      () => {}
                  );
              }}>
                <Translate content="login.loginButton" />
            </button>
            <div
              style={{width: '100%', marginTop: 2, borderRadius: 5, color: '#ffffff', borderColor: '#988989'}}>
              {langSelect}
            </div>
          </div>
        );
        bottomPanContainer = (
          <div>
            <img style={{width: 300}} src={require("assets/icons/skyruslogo.png")} />
          </div>
        );
        mainPaneContainer = (
          <div style={{textAlign: 'center', marginTop: 50}}>
            <h1 style={{fontSize: 25, margin: 0}}>
              <Translate content="login.fillThePower" />
            </h1>
            <h4 style={{marginTop: 50, marginBottom: 0}}>
              <Translate content="login.theFastest" />
            </h4>
            <h4>
              <Translate content="login.joinUs" />
            </h4>
            <div style={{width: '100%', textAlign: 'center'}}>
              <button
                className = "primary"
                style={{width: '100%', borderRadius: 15, backgroundColor: '#3a3fca', height: 45}}
                onClick={() => {
                    this.openCreateAccount();
                }}
                >
                  <Translate content="account.create_account" />
              </button>
            </div>
            <div style={{width: '100%', textAlign: 'center'}}>
              <button
                className = "primary"
                style={{width: '100%', borderRadius: 15, backgroundColor: '#7577b9', height: 45, marginTop: 10}}
                onClick={() => {
                    this.openTelegramCommunity();
                }}
                >
                  Telegram Community
              </button>
            </div>
            <div style={{width: '100%', textAlign: 'left', marginTop: 10}}>
              <button className = "button primary" style={{width: '100%', borderRadius: 15}} onClick={() =>
                  {
                    this.openPaperMoney();
                  }}>
                  <Translate content="login.paperMoney" />
              </button>
            </div>
            <div style={{width: '100%', textAlign: 'center'}}>
              <button
                className = "primary"
                style={{width: '100%', borderRadius: 15, backgroundColor: '#7577b9', height: 45, marginTop: 10}}
                onClick={() => {
                    this.openReferralSubmitForm();
                }}
                >
                  Bonus Coin Referral
              </button>
            </div>
          </div>
        );
        bottomBar = (
          <div style={{width: '100%', backgroundColor: '#2d2e375c', textAlign: 'center'}}>
            <div style={{alignItems: 'center', display: 'flex', justifyContent: 'center', marginBottom: 4}}>
              <Link
                style={{marginLeft: 20, color: "#08458c"}}
                to={"/Terms and Conditions.pdf"}
                target="_blank"
              >
                  <Translate content="login.termsOfUse" />
              </Link>
              <span style={{marginLeft: 5, color: "#000000"}}> | </span>
              <Link
                style={{marginLeft: 5, color: "#08458c"}}
                to={"/Privacy Policy.pdf"}
                target="_blank"
              >
                  <Translate content="login.privacyPolicy" />
              </Link>
              <span style={{marginLeft: 5, color: "#000000"}}> | </span>
              <Link
                style={{marginLeft: 5, color: "#08458c"}}
                to={"/Cookies Policy.pdf"}
                target="_blank"
              >
                  <Translate content="login.cookiePolicy" />
              </Link>
            </div>
            <div>
              <SocialIcon style={{marginRight: 10, marginTop: 2, marginBottom: 2, width: 36, height: 36}} url="https://www.facebook.com/SkyrusWorld/" bgColor="#2c2e37" fgColor="#ffffff"/>
              <SocialIcon style={{marginRight: 10, marginTop: 2, marginBottom: 2, width: 36, height: 36}} url="https://twitter.com/skyrusNetwork" bgColor="#2c2e37" fgColor="#ffffff"/>
              <SocialIcon style={{marginRight: 10, marginTop: 2, marginBottom: 2, width: 36, height: 36}} url="https://www.instagram.com/skyrusNetwork/" bgColor="#2c2e37" fgColor="#ffffff"/>
              <SocialIcon style={{marginRight: 10, marginTop: 2, marginBottom: 2, width: 36, height: 36}} url="https://medium.com/@skyrusnetwork" bgColor="#2c2e37" fgColor="#ffffff"/>
              <SocialIcon style={{marginRight: 10, marginTop: 2, marginBottom: 2, width: 36, height: 36}} url="https://www.youtube.com/channel/UCePV0eel2m7oyaPshikALSQ" bgColor="#2c2e37" fgColor="#ffffff"/>
              <SocialIcon style={{marginRight: 10, marginTop: 2, marginBottom: 2, width: 36, height: 36}} url="https://www.linkedin.com/company/skyrusnetwork" bgColor="#2c2e37" fgColor="#ffffff"/>
              <SocialIcon style={{marginRight: 10, marginTop: 2, marginBottom: 2, width: 36, height: 36}} url="https://discord.gg/w9Kn65q" bgColor="#2c2e37" fgColor="#ffffff"/>
            </div>
          </div>
        );
      } else if (smallScreen) {
        topPaneContainer = (
          <div style={{textAlign: 'right'}}>
            <Popup
              on={'hover'}
              position={['bottom left']}
              offsetX={-150}
              offsetY={85}
              closeOnDocumentClick
              mouseLeaveDelay={100}
              mouseEnterDelay={0}
              contentStyle={{ width: 150, padding: '10px', border: 'none', backgroundColor: "#2d2e37", borderRadius: 3}}
              arrow={false}
              trigger={
                <button className = "ant-btn" style={{marginRight: 10, borderRadius: 5, color: '#ffffff', borderColor: '#988989'}}>
                    <Translate content="login.pdfWhitepaper" />
                </button>}
              position="right center">
              <div>
                {this.renderCountries()}
              </div>
            </Popup>
            <a target="_blank" className = "ant-btn" style={{marginRight: 10, borderRadius: 5, color: '#ffffff', borderColor: '#988989'}} onClick={() => {this.openBuyIco();}}>
                <Translate content="login.buyIco" />
            </a>
            <button className = "ant-btn" style={{marginRight: 10, borderRadius: 5, color: '#ffffff', borderColor: '#988989'}} onClick={() => {this.openWhitePaper()}}>
                <Translate content="login.whitepaper" />
            </button>
            <button
              className = "ant-btn"
              style={{marginRight: 10, borderRadius: 5, color: '#ffffff', borderColor: '#988989'}}
              onClick={() => {
                  SettingsActions.changeSetting.defer({
                      setting: "passwordLogin",
                      value: true
                  });
                  WalletUnlockActions.unlock().catch(
                      () => {}
                  );
              }}>
                <Translate content="login.loginButton" />
            </button>
            <span
              style={{borderRadius: 5, color: '#ffffff', borderColor: '#988989'}}>
              {langSelect}
            </span>
          </div>
        );
        bottomPanContainer = (
          <div>
            <img style={{width: 300}} src={require("assets/icons/skyruslogo.png")} />
          </div>
        );
        mainPaneContainer = (
          <div style={{textAlign: 'center', marginTop: 50}}>
            <h1 style={{fontSize: 45, margin: 0}}>
              <Translate content="login.fillThePower" />
            </h1>
            <h4 style={{marginTop: 70, marginBottom: 0}}>
              <Translate content="login.theFastest" />
            </h4>
            <h4>
              <Translate content="login.joinUs" />
            </h4>
            <div style={{width: '100%', textAlign: 'center'}}>
              <button
                className = "primary"
                style={{width: '100%', borderRadius: 15, backgroundColor: '#3a3fca', height: 45}}
                onClick={() => {
                    this.openCreateAccount();
                }}
                >
                  <Translate content="account.create_account" />
              </button>
            </div>
            <div style={{width: '100%', textAlign: 'center'}}>
              <button
                className = "primary"
                style={{width: '100%', borderRadius: 15, backgroundColor: '#7577b9', height: 45, marginTop: 10}}
                onClick={() => {
                    this.openTelegramCommunity();
                }}
                >
                  Telegram Community
              </button>
            </div>
            <div style={{width: '100%', textAlign: 'left', marginTop: 10}}>
              <button className = "button primary" style={{width: '100%', borderRadius: 15}} onClick={() =>
                  {
                    {
                      this.openPaperMoney();
                    }
                  }}>
                  <Translate content="login.paperMoney" />
              </button>
            </div>
            <div style={{width: '100%', textAlign: 'center'}}>
              <button
                className = "primary"
                style={{width: '100%', borderRadius: 15, backgroundColor: '#7577b9', height: 45, marginTop: 10}}
                onClick={() => {
                    this.openReferralSubmitForm();
                }}
                >
                  Bonus Coin Referral
              </button>
            </div>
          </div>
        );
        bottomBar = (
          <div style={{width: '100%', backgroundColor: '#2d2e375c', textAlign: 'center'}}>
            <div style={{alignItems: 'center', display: 'flex', justifyContent: 'center', marginBottom: 4}}>
              <Link
                style={{marginLeft: 20, color: "#08458c"}}
                to={"/Terms and Conditions.pdf"}
                target="_blank"
              >
                  <Translate content="login.termsOfUse" />
              </Link>
              <span style={{marginLeft: 5, color: "#000000"}}> | </span>
              <Link
                style={{marginLeft: 5, color: "#08458c"}}
                to={"/Privacy Policy.pdf"}
                target="_blank"
              >
                  <Translate content="login.privacyPolicy" />
              </Link>
              <span style={{marginLeft: 5, color: "#000000"}}> | </span>
              <Link
                style={{marginLeft: 5, color: "#08458c"}}
                to={"/Cookies Policy.pdf"}
                target="_blank"
              >
                  <Translate content="login.cookiePolicy" />
              </Link>
            </div>
            <div>
              <SocialIcon style={{marginRight: 10, marginTop: 2, marginBottom: 2, width: 36, height: 36}} url="https://www.facebook.com/SkyrusWorld/" bgColor="#2c2e37" fgColor="#ffffff"/>
              <SocialIcon style={{marginRight: 10, marginTop: 2, marginBottom: 2, width: 36, height: 36}} url="https://twitter.com/skyrusNetwork" bgColor="#2c2e37" fgColor="#ffffff"/>
              <SocialIcon style={{marginRight: 10, marginTop: 2, marginBottom: 2, width: 36, height: 36}} url="https://www.instagram.com/skyrusNetwork/" bgColor="#2c2e37" fgColor="#ffffff"/>
              <SocialIcon style={{marginRight: 10, marginTop: 2, marginBottom: 2, width: 36, height: 36}} url="https://medium.com/@skyrusnetwork" bgColor="#2c2e37" fgColor="#ffffff"/>
              <SocialIcon style={{marginRight: 10, marginTop: 2, marginBottom: 2, width: 36, height: 36}} url="https://www.youtube.com/channel/UCePV0eel2m7oyaPshikALSQ" bgColor="#2c2e37" fgColor="#ffffff"/>
              <SocialIcon style={{marginRight: 10, marginTop: 2, marginBottom: 2, width: 36, height: 36}} url="https://www.linkedin.com/company/skyrusnetwork" bgColor="#2c2e37" fgColor="#ffffff"/>
              <SocialIcon style={{marginRight: 10, marginTop: 2, marginBottom: 2, width: 36, height: 36}} url="https://discord.gg/w9Kn65q" bgColor="#2c2e37" fgColor="#ffffff"/>
            </div>
          </div>
        );
      } else {
        bottomBar = (
          <div style={{width: '100%', display: "flex", backgroundColor: '#2d2e375c'}}>
            <div style={{flex: 1, alignItems: 'center', display: 'flex'}}>
              <Link
                style={{marginLeft: 20, color: "#08458c"}}
                to={"/Terms and Conditions.pdf"}
                target="_blank"
              >
                  <Translate content="login.termsOfUse" />
              </Link>
              <span style={{marginLeft: 5, color: "#000000"}}> | </span>
              <Link
                style={{marginLeft: 5, color: "#08458c"}}
                to={"/Privacy Policy.pdf"}
                target="_blank"
              >
                  <Translate content="login.privacyPolicy" />
              </Link>
              <span style={{marginLeft: 5, color: "#000000"}}> | </span>
              <Link
                style={{marginLeft: 5, color: "#08458c"}}
                to={"/Cookies Policy.pdf"}
                target="_blank"
              >
                  <Translate content="login.cookiePolicy" />
              </Link>
            </div>
            <div>
              <SocialIcon style={{marginRight: 10, marginTop: 2, marginBottom: 2, width: 36, height: 36}} url="https://www.facebook.com/SkyrusWorld/" bgColor="#2c2e37" fgColor="#ffffff"/>
              <SocialIcon style={{marginRight: 10, marginTop: 2, marginBottom: 2, width: 36, height: 36}} url="https://twitter.com/skyrusNetwork" bgColor="#2c2e37" fgColor="#ffffff"/>
              <SocialIcon style={{marginRight: 10, marginTop: 2, marginBottom: 2, width: 36, height: 36}} url="https://www.instagram.com/skyrusNetwork/" bgColor="#2c2e37" fgColor="#ffffff"/>
              <SocialIcon style={{marginRight: 10, marginTop: 2, marginBottom: 2, width: 36, height: 36}} url="https://medium.com/@skyrusnetwork" bgColor="#2c2e37" fgColor="#ffffff"/>
              <SocialIcon style={{marginRight: 10, marginTop: 2, marginBottom: 2, width: 36, height: 36}} url="https://www.youtube.com/channel/UCePV0eel2m7oyaPshikALSQ" bgColor="#2c2e37" fgColor="#ffffff"/>
              <SocialIcon style={{marginRight: 10, marginTop: 2, marginBottom: 2, width: 36, height: 36}} url="https://www.linkedin.com/company/skyrusnetwork" bgColor="#2c2e37" fgColor="#ffffff"/>
              <SocialIcon style={{marginRight: 10, marginTop: 2, marginBottom: 2, width: 36, height: 36}} url="https://discord.gg/w9Kn65q" bgColor="#2c2e37" fgColor="#ffffff"/>
            </div>
          </div>
        );
        topPaneContainer = (
          <div style={{textAlign: 'right'}}>
            <Popup
              on={'click'}
              position={['bottom left']}
              offsetX={-150}
              offsetY={85}
              closeOnDocumentClick
              mouseLeaveDelay={100}
              mouseEnterDelay={0}
              contentStyle={{ width: 150, padding: '10px', border: 'none', backgroundColor: "#2d2e37", borderRadius: 3}}
              arrow={false}
              trigger={
                <button className = "ant-btn" style={{marginRight: 10, borderRadius: 5, color: '#ffffff', borderColor: '#988989'}}>
                    <Translate content="login.pdfWhitepaper" />
                </button>}
              position="right center">
              <div>
                {this.renderCountries()}
              </div>
            </Popup>
            <a target="_blank" className = "ant-btn" style={{marginRight: 10, borderRadius: 5, color: '#ffffff', borderColor: '#988989'}} onClick={() => {this.openBuyIco();}}>
                <Translate content="login.buyIco" />
            </a>
            <button className = "ant-btn" style={{marginRight: 10, borderRadius: 5, color: '#ffffff', borderColor: '#988989'}} onClick={() => {this.openWhitePaper()}}>
                <Translate content="login.whitepaper" />
            </button>
            <button
              className = "ant-btn"
              style={{marginRight: 10, borderRadius: 5, color: '#ffffff', borderColor: '#988989'}}
              onClick={() => {
                  SettingsActions.changeSetting.defer({
                      setting: "passwordLogin",
                      value: true
                  });
                  WalletUnlockActions.unlock().catch(
                      () => {}
                  );
              }}>
                <Translate content="login.loginButton" />
            </button>
            <span
              style={{borderRadius: 5, color: '#ffffff', borderColor: '#988989'}}>
              {langSelect}
            </span>
          </div>
        );
        bottomPanContainer = (
          <div>
            <img style={{width: 300}} src={require("assets/icons/skyruslogo.png")} />
          </div>
        );
        mainPaneContainer = (
          <div style={{textAlign: 'center', flex: 1, marginTop: 120}}>
            <div style={{width: 450, textAlign: 'center', margin: 'auto'}}>
              <h1 style={{fontSize: 45, margin: 0}}>
                <Translate content="login.fillThePower" />
              </h1>
              <h4 style={{marginTop: 70, marginBottom: 0}}>
                <Translate content="login.theFastest" />
              </h4>
              <h4>
                <Translate content="login.joinUs" />
              </h4>
              <div style={{width: '100%', textAlign: 'center'}}>
                <button
                  className = "primary"
                  style={{width: 250, borderRadius: 15, backgroundColor: '#3a3fca', height: 45}}
                  onClick={() => {
                      this.openCreateAccount();
                  }}
                  >
                    <Translate content="account.create_account" />
                </button>
                <button
                  className = "primary"
                  style={{width: 150, borderRadius: 15, backgroundColor: '#7577b9', height: 45, marginLeft: 10}}
                  onClick={() => {
                      this.openTelegramCommunity();
                  }}
                  >
                    Telegram Community
                </button>
              </div>
              <div style={{width: '100%', textAlign: 'center', marginTop: 10}}>
                <button className = "button primary" style={{width: 250, borderRadius: 15}} onClick={() =>
                    {
                      {
                        this.openPaperMoney();
                      }
                    }}>
                    <Translate content="login.paperMoney" />
                </button>
                <button
                  className = "primary"
                  style={{width: 150, borderRadius: 15, backgroundColor: '#7577b9', height: 45, marginLeft: 10}}
                  onClick={() => {
                      this.openReferralSubmitForm();
                  }}
                  >
                    Bonus Coin Referral
                </button>
              </div>
            </div>
          </div>
        );
      }

      return (
          <div className="grid-block align-center" id="accountForm">
            {window.innerWidth > 1199 ? (
                <Video videoUrl={require('../assets/landing.mp4')}></Video>
            ) : null}
            <div style={{width: '100%', display: 'flex', flexDirection: 'column', zIndex: 1}}>
                <div style={{display: 'flex', flexDirection: 'column', flex: 1, padding: 30}}>
                  {topPaneContainer}
                  <div style={window.innerWidth > 849 ? {textAlign: '-webkit-right', flex: 1, marginRight: 80, display: 'flex'} : {textAlign: 'center', flex: 1, display: 'flex'}}>
                    <div style={{flex: 1}}></div>
                    {mainPaneContainer}
                  </div>
                  {bottomPanContainer}
                </div>
                {bottomBar}
            </div>
            <Modal
                title={"CREATE ACCOUNT"}
                id={"create-account"}
                className={"create-account"}
                visible={this.state.showCreateAccountModal}
                onCancel={this.hideCreateAccountModal}
                footer={null}
            >
              <CreateAccountPassword></CreateAccountPassword>
            </Modal>
          </div>
      );
    }
}

export default connect(
    LoginSelector,
    {
        listenTo() {
            return [AccountStore];
        },
        getProps() {
            return {
                currentAccount:
                    AccountStore.getState().currentAccount ||
                    AccountStore.getState().passwordAccount
            };
        }
    }
);
