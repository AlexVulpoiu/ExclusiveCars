import React from 'react';
import * as FaIcons from 'react-icons/fa';
import * as CgIcons from 'react-icons/cg';
import * as AiIcons from 'react-icons/ai';
import * as IoIcons from 'react-icons/io';

import AuthService from "../../services/auth.service";

const user = AuthService.getCurrentUser();

export const SidebarData = [
    {
        title: 'Acasă',
        path: '/',
        icon: <AiIcons.AiFillHome />,
        cName: 'nav-text'
    },
    {
        title: 'Știri',
        path: '/news',
        icon: <IoIcons.IoIosPaper />,
        cName: 'nav-text'
    },
    ((user !== null && user.roles.includes('ROLE_ORGANISATION') && {
        title: 'Organizația mea',
        path: '/organisations/myOrganisation',
        icon: <CgIcons.CgOrganisation />,
        cName: 'nav-text'
    }) || (user !== null && {
        title: 'Creează organizație',
        path: '/organisations/add',
        icon: <CgIcons.CgAddR />,
        cName: 'nav-text'
    }))
];