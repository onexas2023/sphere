/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */

import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import InputAdornment from '@mui/material/InputAdornment';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import {
    CoordinateMetainfoApi,
    CoordinateUserApi, UDomain, UUser, UUserFilter, UUserListPage, buildApiConfiguration
} from '@onexas/sphere/client/api';
import EmptyTableFooter from '@onexas/sphere/client/components/EmptyTableFooter';
import { NoPermissionPage } from '@onexas/sphere/client/components/ErrorPage';
import { FlexContainer, FlexGrow } from '@onexas/sphere/client/components/FlexContainer';
import SkeletonTable from '@onexas/sphere/client/components/SkeletonTable';
import { DEFAULT_SKIPPABLE_DEFERRED } from '@onexas/sphere/client/constants';
import { AppContext } from '@onexas/sphere/client/context';
import { FontAwesomeIcon, fasSearch, fasTimes } from '@onexas/sphere/client/icons';
import { WorkspaceStore } from '@onexas/sphere/client/stores';
import { EqualsSet, SkippablePromiseQueue } from '@onexas/sphere/client/utils/app';
import { typeOfBoolean } from '@onexas/sphere/client/utils/object';
import { contrastPaper } from '@onexas/sphere/client/utils/theme';
import { Ally } from '@onexas/sphere/client/utils/ui';
import { userEquals } from '@onexas/sphere/client/utils/users';
import clsx from 'clsx';
import { makeObservable, observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';

interface QueryUserDlgProps {
    open: boolean;
    onOk: (selectedUsers: EqualsSet<UUser>) => void;
    onCancel?: () => void;
    title?: string | boolean;
    disableBackdropClick?: boolean;
    disableEscapeKeyDown?: boolean;
    workspaceStore: WorkspaceStore;
    ignoreYou?: boolean;
    children?: React.ReactNode;
}

@observer
class QueryUserDlg extends React.PureComponent<QueryUserDlgProps> {
    static contextType = AppContext;
    declare context: React.ContextType<typeof AppContext>;

    private searchRef: React.RefObject<any>;

    private ally: Ally<QueryUserDlgProps>;

    @observable
    userFilter: UUserFilter;
    @observable
    criteria: string;
    @observable
    selectedUsers: EqualsSet<UUser>;

    @observable
    users: UUserListPage | 403;

    @observable
    domainMap: Map<string, UDomain>;

    private fetchUserQueue: SkippablePromiseQueue;

    constructor(props: QueryUserDlgProps) {
        super(props);
        this.searchRef = React.createRef();

        this.ally = new Ally(this).errorHandler(props.workspaceStore.errorHandler);

        this.userFilter = {
            pageIndex: 0,
            pageSize: props.workspaceStore.preferredPageSize,
            sortDesc: false,
            sortField: 'displayName',
            criteria: '',
            strContaining: true,
            strIgnoreCase: true,
        };
        this.criteria = '';
        this.selectedUsers = new EqualsSet<UUser>(userEquals);

        this.fetchUserQueue = new SkippablePromiseQueue({
            timeout: DEFAULT_SKIPPABLE_DEFERRED,
            last: true,
        });

        makeObservable(this);
    }

    onEntering = () => {
        if (this.searchRef.current !== null) {
            this.searchRef.current.focus();
        }
    };

    componentDidMount() {
        this.ally.withProgress(new CoordinateMetainfoApi(buildApiConfiguration(this.context.storeHolder))
            .listDomain()
            .then((res) => {
                this.domainMap = new Map<string, UDomain>(res.map((d) => [d.code, d]));
                if (this.ally.live) {
                    this.onPage(0);
                }
            }));
    }

    onChangeCriteria = (criteria: string) => {
        this.criteria = criteria;
        const { userFilter } = this;
        this.doFetch({ ...userFilter, criteria, pageIndex: 0 });
    };

    onPage = (pageIndex: number) => {
        const { userFilter } = this;
        this.doFetch({ ...userFilter, pageIndex });
    };

    onToggleSort = () => {
        const { userFilter } = this;
        this.doFetch({ ...userFilter, sortDesc: !userFilter.sortDesc });
    };

    async doFetch(userFilter: UUserFilter) {
        return this.ally.withProgress(
            this.fetchUserQueue.queue(() => {
                return new CoordinateUserApi(buildApiConfiguration(this.context.storeHolder))
                    .listUser({
                        filter: userFilter,
                    })
                    .then((res) => {
                        this.users = res;
                        return res;
                    })
                    .catch((err) => {
                        if (err.status === 403) {
                            this.users = err.status;
                            return this.users;
                        }
                        throw err;
                    });
            }).then((res) => {
                this.userFilter = userFilter;
                return res;
            })
        );
    }

    onClear = () => {
        this.selectedUsers = new EqualsSet<UUser>(userEquals);
    };

    onToggleOne = (user: UUser) => {
        const selectedUsers = new EqualsSet<UUser>(this.selectedUsers);
        if (!selectedUsers.delete(user)) {
            selectedUsers.add(user);
        }

        this.selectedUsers = selectedUsers;
    };

    getDomainLabel(domain: string) {
        if (this.domainMap && this.domainMap.has(domain)) {
            return this.domainMap.get(domain).name;
        }
        return domain;
    }

    render() {
        const {
            open,
            title,
            onOk,
            onCancel,
            disableEscapeKeyDown,
            disableBackdropClick,
            workspaceStore: { authentication },
            children,
            ignoreYou = false,
        } = this.props;

        if (!open) {
            return <span />;
        }
        const {
            i18n,
            appTheme: { classes, theme },
        } = this.context;
        const {
            userFilter: { pageSize, sortDesc },
            selectedUsers,
            selectedUsers: { size: selectedSize },
            criteria,
        } = this;
        const selectionInfo =
            selectedSize > 0 &&
            i18n.l('msg.nSelectedWithInfo', {
                n: selectedSize,
                info: selectedUsers
                    .toArray()
                    .map((v) => v.displayName)
                    .join(', '),
            });
        return (
            <Dialog
                disableEscapeKeyDown={disableEscapeKeyDown}
                className={classes.dlg}
                fullWidth={true}
                maxWidth="sm"
                open
                onClose={(evt, reason) => {
                    if (disableBackdropClick && reason === 'backdropClick') {
                        return;
                    }
                    if (disableEscapeKeyDown && reason === 'escapeKeyDown') {
                        return;
                    }
                    onCancel()
                }}
                TransitionProps={{
                    onEntering: this.onEntering
                }}>
                <DialogTitle>
                    <Toolbar className={classes.toolbar}>
                        <Typography variant="h6">
                            {typeOfBoolean(title)
                                ? title
                                    ? i18n.l('title.queryUsers')
                                    : ''
                                : title}
                        </Typography>
                        <FlexGrow />
                        <TextField
                            placeholder={i18n.l('search')}
                            type="search"
                            className={classes.breakpointTextField}
                            inputRef={this.searchRef}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <FontAwesomeIcon icon={fasSearch} />
                                    </InputAdornment>
                                ),
                            }}
                            value={criteria}
                            onChange={(e) => {
                                this.onChangeCriteria(e.target.value);
                            }}
                            autoComplete="off"
                        />
                    </Toolbar>
                </DialogTitle>
                <DialogContent dividers>
                    <div className={classes.form}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell className={classes.tableToolbarCell} colSpan={3}>
                                        <TableSortLabel
                                            active={true}
                                            direction={sortDesc ? 'desc' : 'asc'}
                                            onClick={this.onToggleSort}
                                        >
                                            {i18n.l('user.displayName')}
                                        </TableSortLabel>
                                        {selectionInfo && (
                                            <TableSortLabel
                                                style={{
                                                    color: contrastPaper(
                                                        theme,
                                                        theme.palette.secondary.main
                                                    ).string(),
                                                }}
                                                active={false}
                                                IconComponent={() => (
                                                    <FontAwesomeIcon icon={fasTimes} />
                                                )}
                                                onClick={this.onClear}
                                            >
                                                <Typography variant="body2">
                                                    ({selectionInfo})
                                                </Typography>
                                            </TableSortLabel>
                                        )}
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                        </Table>
                        <TableContainer style={{ height: 400 }}>
                            {(() => {
                                const { users } = this;

                                if (users === 403) {
                                    return <NoPermissionPage i18n={i18n} />;
                                }
                                if (!users) {
                                    return <SkeletonTable />;
                                }

                                const { items } = users;

                                return (
                                    <Table className={classes.tableSelectable}>
                                        {items.length === 0 ? (
                                            <EmptyTableFooter colSpan={2} />
                                        ) : (
                                            <TableBody>
                                                {items.map((m) => {
                                                    const isYou =
                                                        m.aliasUid === authentication.aliasUid;
                                                    const selectable = !(ignoreYou && isYou);
                                                    const selected = selectedUsers.has(m);
                                                    const toggle = selectable
                                                        ? () => {
                                                            this.onToggleOne(m);
                                                        }
                                                        : null;
                                                    return (
                                                        <TableRow
                                                            key={m.aliasUid}
                                                            hover
                                                            selected={selected}
                                                            onClick={toggle}
                                                        >
                                                            <TableCell padding="checkbox">
                                                                <Checkbox
                                                                    checked={selected}
                                                                    disabled={!selectable}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2">
                                                                    {m.displayName}
                                                                    {isYou
                                                                        ? ' (' +
                                                                        i18n.l('isYou') +
                                                                        ')'
                                                                        : ''}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2">
                                                                    {this.getDomainLabel(
                                                                        m.domain
                                                                    )}
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        )}
                                    </Table>
                                );
                            })()}
                        </TableContainer>
                    </div>
                </DialogContent>
                {!!children && (
                    <DialogContent dividers className={classes.dlgDividersBottom}>
                        <FlexContainer
                            direction="row"
                            className={clsx(classes.pamaMt1, classes.pamaMb1)}
                        >
                            {children}
                        </FlexContainer>
                    </DialogContent>
                )}
                <DialogActions>
                    {(() => {
                        const { users } = this;
                        if (users === 403 || !users) {
                            return null;
                        }
                        const { pageIndex, pageTotal, itemTotal } = users;
                        return pageTotal > 0 && (
                            <TablePagination
                                component="div"
                                className={classes.pamaMl1}
                                rowsPerPageOptions={[]}
                                count={itemTotal}
                                rowsPerPage={pageSize}
                                page={pageIndex}
                                onPageChange={(evt, page) => {
                                    this.onPage(page);
                                }}
                            />
                        );
                    })()}
                    <FlexGrow />
                    {!!onCancel && (
                        <Button autoFocus onClick={onCancel}>
                            {i18n.l('action.cancel')}
                        </Button>
                    )}
                    <Button
                        onClick={() => {
                            const { selectedUsers } = this;
                            onOk(selectedUsers);
                        }}
                        variant="contained"
                        color="primary"
                        {...(!onCancel ? { autoFocus: true } : {})}
                    >
                        {i18n.l('action.ok')}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}
export default QueryUserDlg;
