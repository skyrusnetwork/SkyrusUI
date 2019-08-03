import React, {Component} from "react";
import PropTypes from "prop-types";
import HelpContent from "./Utility/HelpContent";
import ReactPlayer from "react-player";
import styled from "styled-components";

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  position: fixed;
`;
class Video extends React.Component {
    static propTypes = {
        videoUrl: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            playing: true
        };
        this.handleOnReady = this.handleOnReady.bind(this);
    }

    handleOnReady = () => {
      //setTimeout(() => this.setState({ playing: true }), 1000);
      this.timer = setTimeout(() => {
        this.setState({ playing: true });
      }, 100);
    };

    render() {
        const { videoUrl } = this.props;

        return (
            <Container>
                <ReactPlayer
                    width={'100%'}
                    height={'auto'}
                    playing={this.state.playing?this.state.playing:true}
                    loop
                    url={videoUrl}
                    onReady={this.handleOnReady}
                    muted
                    config={{ file: { attributes: {
                      autoPlay: true,
                      muted: true
                    }}}}
                />
            </Container>
        );
    }
}

export default Video;
