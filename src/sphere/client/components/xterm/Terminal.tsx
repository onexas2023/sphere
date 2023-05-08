/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import { LoadingModule } from '@onexas/sphere/client/components/Loading';
import { hasWindow } from '@onexas/sphere/client/types';
import { Ally, loadStyles } from '@onexas/sphere/client/utils/ui';
import Loadable from '@onexas/react-loadable';
import React from 'react';

export interface TerminalProps {
    className?: string;
    style?: React.CSSProperties;
    webSocketUrl?: string;
    fit?: number;
    onCloseWebSockect?: () => void;
    welcome?: string;
}

interface XTerminalProps extends TerminalProps {
    xterm: typeof import('xterm').Terminal;
    xtermFit: typeof import('xterm-addon-fit').FitAddon;
    xtermAttach: typeof import('xterm-addon-attach').AttachAddon;
}

class XTerminal extends React.PureComponent<XTerminalProps> {
    private terminal: import('xterm').Terminal;
    private terminalFit: import('xterm-addon-fit').FitAddon;
    private terminalAttach: import('xterm-addon-attach').AttachAddon;
    private lastWebSocketUrl: string;
    private connectedWebSocket: WebSocket;
    private fit: number;

    ref: React.RefObject<any>;

    private ally: Ally<XTerminalProps>;

    constructor(props: XTerminalProps) {
        super(props);
        this.ref = React.createRef();
        this.ally = new Ally(this);
    }

    componentDidMount() {
        const { xterm, xtermFit, fit, webSocketUrl } = this.props;
        const t = (this.terminal = new xterm());
        if (xtermFit) {
            t.loadAddon((this.terminalFit = new xtermFit()));
        }
        if (this.ref.current) {
            t.open(this.ref.current);
        }
        if (hasWindow) {
            window.addEventListener('resize', this.onSize);
        }
        this.onSize();
        this.fit = fit ? fit : 0;

        if (this.lastWebSocketUrl !== webSocketUrl) {
            this.connect(webSocketUrl);
        }

        this.clear();
    }

    componentDidUpdate() {
        const { webSocketUrl } = this.props;
        if (this.lastWebSocketUrl !== webSocketUrl) {
            this.connect(webSocketUrl);
        }

        if (this.fit !== this.props.fit) {
            this.onSize();
            this.fit = this.props.fit;
        }
    }

    componentWillUnmount() {
        if (hasWindow) {
            window.removeEventListener('resize', this.onSize);
        }
        if (this.terminalAttach) {
            this.terminalAttach.dispose();
            this.terminalAttach = null;
        }
        if (this.terminalFit) {
            this.terminalFit.dispose();
            this.terminalFit = null;
        }
        this.terminal.dispose();
        this.terminal = null;
    }

    clear() {
        if (this.terminal) {
            this.terminal.clear();
            // this.terminal.write('\x1b[H\x1b[2J');
            if (this.props.welcome) {
                this.terminal.write(this.props.welcome);
                this.terminal.write('\n\r');
            }
        }
    }

    newline() {
        this.write('\n\r');
    }

    write(text: string) {
        if (this.terminal) {
            this.terminal.write(text);
        }
    }

    connect(webSocketUrl: string, options?: { bidirectional?: boolean }) {
        const { xtermAttach } = this.props;
        this.disconnect();
        if (xtermAttach && webSocketUrl) {
            this.lastWebSocketUrl = webSocketUrl;
            const socket = (this.connectedWebSocket = new WebSocket(webSocketUrl));
            socket.onerror = () => {
                if (this.ally.live) {
                    this.newline();
                    this.write('Connection error.');
                }
            };
            socket.onclose = () => {
                if (this.ally.live) {
                    this.newline();
                    this.write('Connection closed.');
                    if (this.props.onCloseWebSockect) {
                        this.props.onCloseWebSockect();
                    }
                }
            };
            this.terminal.loadAddon((this.terminalAttach = new xtermAttach(socket, options)));
            this.write('Connected.');
            this.newline();
        }
    }

    disconnect() {
        if (this.terminalAttach) {
            this.terminalAttach.dispose();
            this.terminalAttach = null;
        }
        if (this.connectedWebSocket) {
            this.connectedWebSocket.close();
            this.connectedWebSocket = null;
            this.newline();
        }
    }

    onSize = () => {
        if (this.terminalFit) {
            this.terminalFit.fit();
        }
    };

    render() {
        const { style, className } = this.props;
        return <div ref={this.ref} style={style} className={className}></div>;
    }
}

//use our local xterm css to prevent webpack load xterm module always by require declaration
loadStyles(require('./xterm.css'));

const XTerminalLoadable = Loadable({
    loader: () => {
        if (hasWindow) {
            return Promise.all([
                import('xterm'),
                import('xterm-addon-fit'),
                import('xterm-addon-attach'),
            ]);
        } else {
            return Promise.all([]);
        }
    },
    render: (loaded, props: any) => {
        if (hasWindow) {
            return (
                <XTerminal
                    xterm={loaded[0].Terminal}
                    xtermFit={loaded[1].FitAddon}
                    xtermAttach={loaded[2].AttachAddon}
                    {...props}
                />
            );
        } else {
            return <span>Not supported</span>;
        }
    },
    loading: LoadingModule,
    modules: ['xterm'],
});

export default XTerminalLoadable as React.ComponentType<TerminalProps>;
