/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import { OrganizationUserRelationType, UUserOrganization } from '@onexas/sphere/client/api';
import EmptyTableFooter from '@onexas/sphere/client/components/EmptyTableFooter';
import SkeletonContainer from '@onexas/sphere/client/components/SkeletonContainer';
import { AppContext } from '@onexas/sphere/client/context';
import {
    fabBlackTie,
    fasUniversity,
    fasUser,
    fasUserCog,
    FontAwesomeIcon,
} from '@onexas/sphere/client/icons';
import { buildPath, PATH_AN_ORGANIZATION } from '@onexas/sphere/client/routes';
import { MyAccountStore, WorkspaceStore } from '@onexas/sphere/client/stores';
import { withProgress } from '@onexas/sphere/client/utils/ui';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { makeObservable, observable } from 'mobx';
import { disposeOnUnmount, observer } from 'mobx-react';
import React from 'react';

interface OrganizationsProps {
    myAccountStore: MyAccountStore;
    workspaceStore: WorkspaceStore;
}

@observer
class Organizations extends React.PureComponent<OrganizationsProps> {
    static contextType = AppContext;
    declare context: React.ContextType<typeof AppContext>;

    @observable
    sortDirection: 'asc' | 'desc' = 'asc';

    constructor(props: OrganizationsProps) {
        super(props);

        makeObservable(this);
    }

    componentDidMount() {
        const { myAccountStore, workspaceStore } = this.props;
        disposeOnUnmount(this, workspaceStore.registerFilterObserver());
        withProgress(myAccountStore.fetchOrganizations()).catch(workspaceStore.errorHandler);
    }

    onToggleSort = () => {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    };

    onClickProject = (evt: React.MouseEvent, organization: UUserOrganization, member?: boolean) => {
        const { workspaceStore } = this.props;
        evt.stopPropagation();
        workspaceStore.reroute(
            buildPath(
                PATH_AN_ORGANIZATION,
                {
                    organizationCode: organization.code,
                },
                member ? 'tab=members' : ''
            ),
            evt
        );
    };

    render() {
        const { myAccountStore, workspaceStore } = this.props;
        const {
            appTheme: { classes },
            i18n,
        } = this.context;
        const { sortDirection } = this;
        let { organizations } = myAccountStore;
        let { filter } = workspaceStore;

        if (!organizations) {
            return <SkeletonContainer />;
        }

        if (filter) {
            filter = filter.toLocaleLowerCase();
            organizations = organizations.filter((o) => {
                return (
                    o.code.toLocaleLowerCase().indexOf(filter) !== -1 ||
                    o.name.toLocaleLowerCase().indexOf(filter) !== -1
                );
            });
        }
        if (sortDirection !== null) {
            organizations = organizations.slice().sort((o1, o2) => {
                switch (sortDirection) {
                    case 'asc':
                        return o1.name.localeCompare(o2.name);
                    default:
                        return o2.name.localeCompare(o1.name);
                }
            });
        }

        return (
            <div className={classes.form}>
                <Table className={classes.tableClickable}>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <TableSortLabel
                                    active={sortDirection !== null ? true : false}
                                    direction={sortDirection}
                                    onClick={this.onToggleSort}
                                >
                                    {i18n.l('organization')}
                                </TableSortLabel>
                            </TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    {organizations.length === 0 ? (
                        <EmptyTableFooter colSpan={3} />
                    ) : (
                        <TableBody>
                            {organizations.map((org) => (
                                <TableRow
                                    key={org.code}
                                    hover
                                    onClick={(evt: React.MouseEvent) => {
                                        this.onClickProject(evt, org);
                                    }}
                                >
                                    <TableCell>
                                        <Typography variant="body2">{org.name}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" className={classes.textCenter}>
                                            {(() => {
                                                let icon = fasUser;
                                                switch (org.relationType) {
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
                                            {i18n.l('organization.role.' + org.relationType)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right" padding="checkbox">
                                        <IconButton
                                            className={classes.hoverTextPrimary}
                                            onClick={(evt: React.MouseEvent) => {
                                                this.onClickProject(evt, org, true);
                                            }}
                                            size="small">
                                            <FontAwesomeIcon icon={fasUniversity} />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    )}
                </Table>
            </div>
        );
    }
}

export default Organizations;
