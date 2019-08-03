import React, {Component}  from "react";
import PropTypes from "prop-types";
import counterpart from "counterpart";
import {Modal, Button} from "bitshares-ui-style-guide";

class NewsModal extends React.Component {
    static propTypes = {};
    constructor() {
        super();
        this.state = {
          open: false,
        };

    }

    componentWillMount() {

    }

    componentDidMount() {

    }

    componentDidUpdate() {

    }

    onClose() {
        this.props.hideModal();
    }

    render() {
        const footer = [];
        footer.push(
            <Button key="cancel" onClick={this.props.hideModal}>
                {counterpart.translate("modal.cancel")}
            </Button>
        );
        let newText = this.props.newsContent.split('<br>').map((item, i) => {
            return <p key={i}>{item}</p>;
        });
        return (
            <Modal
                title={this.props.news['content']}
                id={this.props.modalId}
                className={this.props.modalId}
                visible={this.props.visible}
                onCancel={this.props.hideModal}
                footer={null}
            >
                <div className="">
                    <span style={{display:"block"}}>{this.props.news['date']}</span>
                    <span style={{display:"block"}}>{newText}</span>
                </div>
            </Modal>
        );
    }
}

export default NewsModal;
