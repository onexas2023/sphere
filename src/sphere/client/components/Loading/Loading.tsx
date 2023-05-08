/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import React from 'react';

// eslint-disable-next-line no-undef
export interface LoadingProps extends LoadableExport.LoadingComponentProps {
    msg?: string;
}

export default class Loading extends React.PureComponent<LoadingProps> {
    render() {
        if (this.props.error) {
            return (
                <span>
                    Could not load content. <button onClick={this.props.retry}>Retry</button>
                </span>
            );
        } else if (this.props.timedOut) {
            return (
                <span>
                    Taking longer than expected... <button onClick={this.props.retry}>Retry</button>
                </span>
            );
        } else if (this.props.pastDelay) {
            return <span>{this.props.msg ? this.props.msg : 'Loading...'}</span>;
        } else {
            return null;
        }
    }
}

export function LoadingLanguage(props: LoadingProps) {
    return <Loading {...props} msg="Loading language..." />;
}

export function LoadingModule(props: LoadingProps) {
    return <Loading {...props} msg="Loading module..." />;
}
