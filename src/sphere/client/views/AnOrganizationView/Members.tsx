/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */

import {
    OrganizationUserRelationType,
    UOrganizationUser,
    UOrganizationUserFilter,
    UUser,
} from '@onexas/sphere/client/api';
import ConfirmDlg from '@onexas/sphere/client/components/ConfirmDlg';
import EmptyTableFooter from '@onexas/sphere/client/components/EmptyTableFooter';
import { FlexGrow } from '@onexas/sphere/client/components/FlexContainer';
import SkeletonTable from '@onexas/sphere/client/components/SkeletonTable';
import { AppContext } from '@onexas/sphere/client/context';
import {
    fabBlackTie,
    fasPen,
    fasPlus,
    fasTimes,
    fasTrashAlt,
    fasUser,
    fasUserCog,
    FontAwesomeIcon,
} from '@onexas/sphere/client/icons';
import {
    AnOrganizationStore,
    WorkspaceStore,
} from '@onexas/sphere/client/stores';
import { EqualsSet } from '@onexas/sphere/client/utils/app';
import { typeOfObjectNotNull } from '@onexas/sphere/client/utils/object';
import { organizationUserRelationComparator } from '@onexas/sphere/client/utils/organizations';
import { contrastBg } from '@onexas/sphere/client/utils/theme';
import { Ally } from '@onexas/sphere/client/utils/ui';
import { organizationUserEquals } from '@onexas/sphere/client/utils/users';
import QueryUserDlg from '@onexas/sphere/client/views/components/QueryUserDlg';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableFooter from '@mui/material/TableFooter';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { action, makeObservable, observable } from 'mobx';
import { disposeOnUnmount, observer } from 'mobx-react';
import React from 'react';

interface MembersProps {
    anOrganizationStore: AnOrganizationStore;
    workspaceStore: WorkspaceStore;
}

@observer
class Members extends React.PureComponent<MembersProps> {
    static contextType = AppContext;
    declare context: React.ContextType<typeof AppContext>;

    private ally: Ally<MembersProps>;

    @observable
    orgMemberFilter: UOrganizationUserFilter;

    @observable
    selectedMembers: EqualsSet<UOrganizationUser>;

    @observable
    selectAllMode?: boolean;

    @observable
    editMode?: boolean;

    @observable
    openRemoveConfirm?: boolean;

    @observable
    openQueryMember?: boolean;

    @observable
    queryMemberRole?: OrganizationUserRelationType;

    constructor(props: MembersProps) {
        super(props);
        this.ally = new Ally(this).errorHandler(props.workspaceStore.errorHandler);

        this.orgMemberFilter = {
            pageIndex: 0,
            pageSize: props.workspaceStore.preferredPageSize,
            sortDesc: false,
            sortField: 'displayName',
            criteria: null,
            strContaining: true,
            strIgnoreCase: true,
        };
        this.selectedMembers = new EqualsSet<UOrganizationUser>(organizationUserEquals);

        makeObservable(this);
    }

    componentDidMount() {
        disposeOnUnmount(
            this,
            this.props.workspaceStore.registerFilterObserver(this.onFilterChange)
        );
        this.onPage(0);
    }

    onFilterChange = (filter: string) => {
        const { orgMemberFilter } = this;
        this.doFetch({ ...orgMemberFilter, criteria: filter, pageIndex: 0 });
    };

    onPage = (pageIndex: number) => {
        const { orgMemberFilter } = this;
        this.doFetch({ ...orgMemberFilter, pageIndex });
    };

    onToggleSort = () => {
        const { orgMemberFilter } = this;
        this.doFetch({ ...orgMemberFilter, sortDesc: !orgMemberFilter.sortDesc });
    };

    async doFetch(orgMemberFilter: UOrganizationUserFilter) {
        const { anOrganizationStore } = this.props;
        return this.ally.withProgress(
            anOrganizationStore.fetchMembers(orgMemberFilter).then((res) => {
                this.orgMemberFilter = orgMemberFilter;
                return res;
            })
        );
    }

    onToggleAll = () => {
        this.selectAllMode = !this.selectAllMode;
        this.selectedMembers = new EqualsSet<UOrganizationUser>(organizationUserEquals);
    };

    onToggleEdit = () => {
        this.editMode = !this.editMode;
        this.selectAllMode = false;
        this.selectedMembers = new EqualsSet<UOrganizationUser>(organizationUserEquals);
    };

    onClear = () => {
        this.selectAllMode = false;
        this.selectedMembers = new EqualsSet<UOrganizationUser>(organizationUserEquals);
    };

    onToggleOne = (member: UOrganizationUser) => {
        const selectedMembers = new EqualsSet<UOrganizationUser>(this.selectedMembers);
        if (!selectedMembers.delete(member)) {
            selectedMembers.add(member);
        }

        this.selectAllMode = false;
        this.selectedMembers = selectedMembers;
    };

    onChangeRole = (evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const { anOrganizationStore, workspaceStore } = this.props;
        const { i18n } = this.context;
        const { selectAllMode, selectedMembers } = this;
        const role = evt.target.value as OrganizationUserRelationType;
        if (selectAllMode || selectedMembers.size > 0) {
            this.ally.withProgress(
                anOrganizationStore
                    .updateMembers({
                        role: role,
                        aliasUids: selectAllMode
                            ? true
                            : selectedMembers.toArray().map((v) => v.aliasUid),
                        exceptAliasUid: workspaceStore.authentication.aliasUid,
                    })
                    .then((res) => {
                        workspaceStore.notify(
                            i18n.l('msg.updateSuccess', {
                                target: i18n.l('organization.members'),
                            }) +
                            (selectAllMode
                                ? ''
                                : ' ' +
                                selectedMembers
                                    .toArray()
                                    .map((u) => u.displayName)
                                    .join(', '))
                        );
                        if (this.ally.live) {
                            this.onPage(this.orgMemberFilter.pageIndex);
                        }
                        return res;
                    })
            );
        }
    };

    onRemoveMember = () => {
        const { anOrganizationStore, workspaceStore } = this.props;
        const { i18n } = this.context;
        const { selectAllMode, selectedMembers } = this;
        if (selectAllMode || selectedMembers.size > 0) {
            this.ally.withProgress(
                anOrganizationStore
                    .removeMembers({
                        aliasUids: selectAllMode
                            ? true
                            : selectedMembers.toArray().map((v) => v.aliasUid),
                        exceptAliasUid: workspaceStore.authentication.aliasUid,
                    })
                    .then((res) => {
                        this.onClear();
                        workspaceStore.notify(
                            i18n.l('msg.removeSuccess', {
                                target: i18n.l('organization.members'),
                            }) +
                            (selectAllMode
                                ? ''
                                : ' ' +
                                selectedMembers
                                    .toArray()
                                    .map((u) => u.displayName)
                                    .join(', '))
                        );
                        if (this.ally.live) {
                            this.onPage(this.orgMemberFilter.pageIndex);
                        }
                        return res;
                    })
            );
        }
    };

    onOpenRemoveConfirm = (openRemoveConfirm: boolean) => {
        this.openRemoveConfirm = openRemoveConfirm;
    };

    @action
    onOpenQueryUser = (openQueryMember: boolean) => {
        this.openQueryMember = openQueryMember;
        this.queryMemberRole = OrganizationUserRelationType.MEMBER;
    };

    onAddMember = (selectedMembers: EqualsSet<UUser>, role: OrganizationUserRelationType) => {
        if (!selectedMembers || selectedMembers.size === 0) return;

        const { anOrganizationStore, workspaceStore } = this.props;
        const { i18n } = this.context;
        this.ally.withProgress(
            anOrganizationStore
                .addMembers({
                    aliasUids: selectedMembers.toArray().map((u) => u.aliasUid),
                    role,
                })
                .then((res) => {
                    this.onClear();
                    workspaceStore.notify(
                        i18n.l('msg.addSuccess', {
                            target:
                                i18n.l('organization.role.' + role) +
                                ' ' +
                                selectedMembers
                                    .toArray()
                                    .map((u) => u.displayName)
                                    .join(', '),
                        })
                    );
                    if (this.ally.live) {
                        this.onPage(this.orgMemberFilter.pageIndex);
                    }
                    return res;
                })
        );
    };

    onChangeQueryMemberRole = (evt: React.ChangeEvent<HTMLInputElement>) => {
        this.queryMemberRole = evt.target.value as OrganizationUserRelationType;
    };

    render() {
        const {
            anOrganizationStore: { organization, members },
            workspaceStore: { authentication },
        } = this.props;
        const {
            appTheme: { classes, theme },
            i18n,
        } = this.context;

        // just in case
        if (!typeOfObjectNotNull(organization)) {
            return <span />;
        }

        if (!members) {
            return <SkeletonTable />;
        }

        const {
            orgMemberFilter: { pageSize, sortDesc },
            selectedMembers,
            selectAllMode,
            selectedMembers: { size: selectedSize },
            editMode,
            openRemoveConfirm,
            openQueryMember,
            queryMemberRole,
        } = this;

        const org = organization;

        const { pageIndex, items, pageTotal, itemTotal } = members;

        let orgEditable = false;
        if (
            organizationUserRelationComparator(
                org.relationType,
                OrganizationUserRelationType.ADVANCED_MEMBER
            ) >= 0
        ) {
            orgEditable = true;
        }

        const selectionInfo = selectAllMode
            ? i18n.l('allExceptYou')
            : selectedSize > 0 &&
            i18n.l('msg.nSelectedWithInfo', {
                n: selectedSize,
                info: selectedMembers
                    .toArray()
                    .map((v) => v.displayName)
                    .join(', '),
            });
        return (
            <div className={classes.form}>
                {orgEditable && (
                    <Toolbar className={classes.toolbar}>
                        <FlexGrow />
                        {editMode && (
                            <>
                                {(selectAllMode || selectedSize > 0) && (
                                    <>
                                        <div className={classes.pamaMr2} />

                                        <TextField select value={0} onChange={this.onChangeRole}>
                                            <MenuItem value={0} disabled>
                                                {i18n.l('organization.action.setRole')}
                                            </MenuItem>
                                            {Object.values(OrganizationUserRelationType).map(
                                                (e: string) => {
                                                    return (
                                                        <MenuItem key={e} value={e}>
                                                            {i18n.l('organization.role.' + e)}
                                                        </MenuItem>
                                                    );
                                                }
                                            )}
                                        </TextField>

                                        <IconButton
                                            color="primary"
                                            onClick={() => {
                                                this.onOpenRemoveConfirm(true);
                                            }}
                                            size="medium">
                                            <Tooltip title={i18n.l('action.remove')}>
                                                <FontAwesomeIcon icon={fasTrashAlt} />
                                            </Tooltip>
                                        </IconButton>
                                    </>
                                )}
                                <div className={classes.pamaMr2} />
                            </>
                        )}
                        <IconButton
                            onClick={this.onToggleEdit}
                            color={editMode ? 'secondary' : 'primary'}
                            size="medium">
                            <Tooltip title={i18n.l('action.edit')}>
                                <FontAwesomeIcon icon={fasPen} />
                            </Tooltip>
                        </IconButton>
                        <IconButton
                            color="primary"
                            onClick={() => {
                                this.onOpenQueryUser(true);
                            }}
                            size="medium">
                            <Tooltip title={i18n.l('action.add')}>
                                <FontAwesomeIcon icon={fasPlus} />
                            </Tooltip>
                        </IconButton>
                    </Toolbar>
                )}
                <Table className={editMode ? classes.tableClickable : null}>
                    <TableHead>
                        <TableRow>
                            {editMode && (
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={
                                            !selectAllMode &&
                                            selectedSize > 0 &&
                                            selectedSize < itemTotal
                                        }
                                        checked={
                                            selectAllMode ||
                                            (selectedSize > 0 && selectedSize === itemTotal)
                                        }
                                        onChange={this.onToggleAll}
                                    />
                                </TableCell>
                            )}
                            <TableCell colSpan={2}>
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
                                            color: contrastBg(
                                                theme,
                                                theme.palette.secondary.main
                                            ).string(),
                                        }}
                                        active={false}
                                        IconComponent={() => (
                                            <FontAwesomeIcon
                                                icon={fasTimes}
                                                style={{ marginLeft: theme.spacing(0.5) }}
                                            />
                                        )}
                                        onClick={this.onClear}
                                    >
                                        <Typography variant="body2">({selectionInfo})</Typography>
                                    </TableSortLabel>
                                )}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    {items.length === 0 ? (
                        <EmptyTableFooter colSpan={editMode ? 3 : 2} />
                    ) : (
                        <TableBody>
                            {items.map((m) => {
                                const isYou = m.aliasUid === authentication.aliasUid;
                                const isSelected =
                                    (selectAllMode || selectedMembers.has(m)) && !isYou;
                                const toggle = () => {
                                    this.onToggleOne(m);
                                };
                                return (
                                    <TableRow
                                        key={m.aliasUid}
                                        hover
                                        selected={isSelected}
                                        onClick={!isYou && editMode ? toggle : null}
                                    >
                                        {editMode && (
                                            <TableCell padding="checkbox">
                                                <Checkbox checked={isSelected} disabled={isYou} />
                                            </TableCell>
                                        )}
                                        <TableCell>
                                            <Typography variant="body2">
                                                {m.displayName}{' '}
                                                {isYou && '(' + i18n.l('isYou') + ')'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                className={classes.textCenter}
                                            >
                                                {(() => {
                                                    let icon = fasUser;
                                                    switch (m.relationType) {
                                                        case OrganizationUserRelationType.SUPERVISOR:
                                                            icon = fabBlackTie;
                                                            break;
                                                        case OrganizationUserRelationType.ADVANCED_MEMBER:
                                                            icon = fasUserCog;
                                                            break;
                                                    }
                                                    return (
                                                        <FontAwesomeIcon
                                                            icon={icon}
                                                            className={clsx(
                                                                classes.pamaMr1,
                                                                classes.textColorSecondary
                                                            )}
                                                            size="sm"
                                                        />
                                                    );
                                                })()}
                                                {i18n.l('organization.role.' + m.relationType)}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    )}
                    {pageTotal > 1 && (
                        <TableFooter>
                            <TableRow>
                                <TablePagination
                                    colSpan={3}
                                    rowsPerPageOptions={[]}
                                    count={itemTotal}
                                    rowsPerPage={pageSize}
                                    page={pageIndex}
                                    onPageChange={(evt, page) => {
                                        this.onPage(page);
                                    }}
                                />
                            </TableRow>
                        </TableFooter>
                    )}
                </Table>
                {openRemoveConfirm && (
                    <ConfirmDlg
                        open
                        disableBackdropClick
                        description={i18n.l('organization.msg.confirmRemoveMember', {
                            info: selectionInfo,
                        })}
                        onOk={() => {
                            this.onOpenRemoveConfirm(false);
                            this.onRemoveMember();
                        }}
                        onCancel={() => {
                            this.onOpenRemoveConfirm(false);
                        }}
                    />
                )}
                {openQueryMember && (
                    <QueryUserDlg
                        open
                        disableBackdropClick
                        ignoreYou
                        workspaceStore={this.props.workspaceStore}
                        onOk={(selectedMembers) => {
                            const role = this.queryMemberRole;
                            this.onOpenQueryUser(false);
                            this.onAddMember(selectedMembers, role);
                        }}
                        onCancel={() => {
                            this.onOpenQueryUser(false);
                        }}
                    >
                        <>
                            <Typography variant="subtitle1" className={classes.pamaMr1}>
                                {i18n.l('organization.role')}:
                            </Typography>

                            <TextField select 
                                value={queryMemberRole}
                                onChange={this.onChangeQueryMemberRole}
                            >
                                {Object.values(OrganizationUserRelationType).map((e: string) => {
                                    return (
                                        <MenuItem key={e} value={e}>
                                            {i18n.l('organization.role.' + e)}
                                        </MenuItem>
                                    );
                                })}
                            </TextField>
                        </>
                    </QueryUserDlg>
                )}
            </div>
        );
    }
}

export default Members;
