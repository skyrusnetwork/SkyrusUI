import React, {Component}  from "react";
import PropTypes from "prop-types";
import counterpart from "counterpart";
import {Modal, Button} from "bitshares-ui-style-guide";
import Video from "../Video"

class ScreensaverModal extends React.Component {
    static propTypes = {};
    constructor() {
        super();

        this.state = {open: false};
    }

    onClose() {
        this.props.hideModal();
    }

    confirmClicked(callback, e) {
        e.preventDefault();
        setTimeout(() => {
            this.props.hideModal();
        }, 500);
        callback();
    }

    render() {
        const footer = [];
        footer.push(
            <Button key="cancel" onClick={this.props.hideModal}>
                {counterpart.translate("modal.cancel")}
            </Button>
        );

        return (
            <Modal
                width={"100vw"}
                style = {{top: 0, opacity: 0.5, position: "fixed"}}
                title={""}
                id={this.props.modalId}
                className={this.props.modalId}
                visible={this.props.visible}
                onCancel={this.props.hideModal}
                footer={null}
            >
                <div className="grid-block vertical" style = {{height: "100vh"}}>
                     {/*<Video videoUrl={"http://api.skyrus.io/fish.mp4"}></Video>*/}
                     {/*<Video videoUrl={require('../../assets/fish.mp4')}></Video>*/}
                </div>
            </Modal>
        );
    }
}

export default ScreensaverModal;
