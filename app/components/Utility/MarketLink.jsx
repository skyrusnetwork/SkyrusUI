import React from "react";
import {Link} from "react-router-dom";
import ChainTypes from "./ChainTypes";
import AssetWrapper from "./AssetWrapper";
import AssetName from "./AssetName";

/**
 *  Given a base and quote asset, render a link to that market
 *
 *  Expected Properties:
 *     base:  asset id, which will be fetched from the ChainStore
 *     quote: either an asset id or a balance id
 *
 */

class MarketLink extends React.Component {
    render() {
        let {base, quote} = this.props;
        if (base.get("id") === quote.get("id")) {
            return null;
        }
        let marketID = quote.get("symbol") + "_" + base.get("symbol");
        let marketName = (
            <span>
                <AssetName name={quote.get("symbol")} /> /{" "}
                <AssetName name={base.get("symbol")} />
            </span>
        );
        return <Link to={`/market/${marketID}`}>{marketName}</Link>;
    }
}

MarketLink = AssetWrapper(MarketLink, {
    propNames: ["quote", "base"],
    defaultProps: {base: "1.3.0"}
});

/*
This hangs the page on MarketLink import with firefox 62.0

class ObjectWrapper extends React.Component {
    static propTypes = {
        object: ChainTypes.ChainObject.isRequired
    };

    render() {
        let {object} = this.props;
        let quoteAsset = object.has("asset_type")
            ? object.get("asset_type")
            : object.get("id");

        return <MarketLink quote={quoteAsset} />;
    }
}
ObjectWrapper = BindToChainState(ObjectWrapper);

MarketLink.ObjectWrapper = ObjectWrapper;
*/

export default MarketLink;
