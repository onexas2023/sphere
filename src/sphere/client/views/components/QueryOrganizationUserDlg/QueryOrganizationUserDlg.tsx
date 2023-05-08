/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */

import { UOrganizationUser, UOrganizationUserFilter } from '@onexas/sphere/client/api';
import EmptyTableFooter from '@onexas/sphere/client/components/EmptyTableFooter';
import { NoPermissionPage, NotFoundPage } from '@onexas/sphere/client/components/ErrorPage';
import { FlexContainer, FlexGrow } from '@onexas/sphere/client/components/FlexContainer';
import SkeletonTable from '@onexas/sphere/client/components/SkeletonTable';
import { AppContext } from '@onexas/sphere/client/context';
import { fasSearch, fasTimes, FontAwesomeIcon } from '@onexas/sphere/client/icons';
import { WorkspaceStore } from '@onexas/sphere/client/stores';
import { EqualsSet, PromiseProcess } from '@onexas/sphere/client/utils/app';
import { typeOfObjectNotNull } from '@onexas/sphere/client/utils/object';
import { contrastPaper } from '@onexas/sphere/client/utils/theme';
import { Ally } from '@onexas/sphere/client/utils/ui';
import { organizationUserEquals } from '@onexas/sphere/client/utils/users';
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
import clsx from 'clsx';
import { observer } from 'mobx-react';
import React from 'react';

import {
    buildApiConfiguration,
    UDomain,
    UOrganizationUserListPage,
    UUserOrganization,
    CoordinateMetainfoApi,
    CoordinateOrganizationApi,
} from '@onexas/sphere/client/api';
import { DEFAULT_SKIPPABLE_DEFERRED } from '@onexas/sphere/client/constants';
import { SkippablePromiseQueue } from '@onexas/sphere/client/utils/app';
import { action, makeObservable, observable, runInAction } from 'mobx';

interface QueryOrganizationUserDlgProps {
    open: boolean;
    onOk: (selectedUsers: EqualsSet<UOrganizationUser>) => void;
    onCancel?: () => void;
    title?: string;
    disableBackdropClick?: boolean;
    disableEscapeKeyDown?: boolean;
    workspaceStore: WorkspaceStore;
    ignoreYou?: boolean;
    organizationCode: string;
    children?: React.ReactNode;
}

@observer
class QueryOrganizationUserDlg extends React.PureComponent<QueryOrganizationUserDlgProps> {
    static contextType = AppContext;
    declare context: React.ContextType<typeof AppContext>;

    private searchRef: React.RefObject<any>;

    private ally: Ally<QueryOrganizationUserDlgProps>;

    @observable
    userFilter: UOrganizationUserFilter;
    @observable
    criteria: string;
    @observable
    selectedUsers: EqualsSet<UOrganizationUser>;

    @observable
    organization: UUserOrganization | 404 | 403;

    @observable
    users: UOrganizationUserListPage;

    @observable
    domainMap: Map<string, UDomain>;

    private fetchUserQueue: SkippablePromiseQueue;

    constructor(props: QueryOrganizationUserDlgProps) {
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
        this.selectedUsers = new EqualsSet<UOrganizationUser>(organizationUserEquals);

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
        this.initFetch();
    }
    componentDidUpdate() {
        this.initFetch();
    }

    private initFetch() {
        const { ally } = this;
        ally.initFetch(() => {
            const processes: PromiseProcess<any>[] = [];
            const { organization, domainMap } = this;
            if (!domainMap) {
                processes.push(() => new CoordinateMetainfoApi(buildApiConfiguration(this.context.storeHolder))
                    .listDomain()
                    .then((res) => {
                        this.domainMap = new Map<string, UDomain>(res.map((d) => [d.code, d]));
                        return res;
                    }));
            }

            const { organizationCode } = this.props;
            if (!organization || typeOfObjectNotNull(organization) && organization.code !== organizationCode) {
                processes.push(() =>
                    new CoordinateOrganizationApi(buildApiConfiguration(this.context.storeHolder))
                        .getOrganization({
                            code: organizationCode,
                        })
                        .then((res) => {
                            if (this.props.organizationCode === organizationCode) {
                                this.organization = res;
                            }
                            return res;
                        })
                        .catch((err) => {
                            if (err.status === 403 || err.status === 404) {
                                this.organization = err.status;
                                return this.organization;
                            }
                            throw err;
                        }).then((res) => {
                            if (ally.live && typeOfObjectNotNull(res)) {
                                this.onPage(0);
                            }
                            return res;
                        })
                );
            }
            return processes;
        });
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

    async doFetch(userFilter: UOrganizationUserFilter) {
        const { organization } = this;
        const code = typeOfObjectNotNull(organization) && organization.code;
        return code && this.ally.withProgress(
            this.fetchUserQueue.queue(() => {
                return new CoordinateOrganizationApi(buildApiConfiguration(this.context.storeHolder))
                    .listOrganizationUser({
                        code,
                        filter: userFilter,
                    })
                    .then((res) => {
                        if (typeOfObjectNotNull(this.organization)
                            && this.organization.code === code) {
                            this.users = res;
                        }
                        return res;
                    });
            }).then((res) => {
                this.userFilter = userFilter;
                return res;
            })
        );
    }

    onClear = () => {
        this.selectedUsers = new EqualsSet<UOrganizationUser>(organizationUserEquals);
    };

    onToggleOne = (user: UOrganizationUser) => {
        const selectedUsers = new EqualsSet<UOrganizationUser>(this.selectedUsers);
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
        const { organization, users } = this;
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
                            {title
                                ? title
                                : i18n.l('title.queryOrganizationUsers', {
                                    name: typeOfObjectNotNull(organization)
                                        ? organization.name
                                        : '',
                                })}
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
                                if (organization === 403) {
                                    return <NoPermissionPage i18n={i18n} />;
                                } else if (organization === 404) {
                                    return <NotFoundPage i18n={i18n} />;
                                } else if (!organization) {
                                    return <SkeletonTable />;
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
                                                                    {isYou &&
                                                                        ' (' +
                                                                        i18n.l('isYou') +
                                                                        ')'}
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
                        if (!users) {
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
export default QueryOrganizationUserDlg;
