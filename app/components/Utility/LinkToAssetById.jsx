import React from "react";
import {Link} from "react-router-dom";
import AssetWrapper from "./AssetWrapper";
import AssetName from "./AssetName";

class LinkToAssetById extends React.Component {
    render() {
        const symbol = this.props.asset.get("symbol");
        const assetName = <AssetName name={symbol} noTip />;
        return this.props.noLink ? (
            assetName
        ) : (
            <span>{assetName}</span>
        );
    }
}

export default AssetWrapper(LinkToAssetById);
