import React from 'react';
import * as CgIcons from 'react-icons/cg';
import * as AiIcons from 'react-icons/ai';
import * as GiIcons from 'react-icons/gi';
import * as IoIcons from 'react-icons/io';
import * as ImIcons from 'react-icons/im';
import * as BsIcons from 'react-icons/bs';
import * as MdIcons from 'react-icons/md';
import * as FaIcons from 'react-icons/fa';

import AuthService from "../../services/auth.service";

const user = AuthService.getCurrentUser();

let SidebarData = [];

if(user !== null && user.roles.includes("ROLE_ADMIN")) {
    SidebarData = [
        {
            title: 'Acasă',
            path: '/',
            icon: <AiIcons.AiFillHome/>,
            cName: 'nav-text'
        },
        {
            title: 'Știri',
            path: '/news',
            icon: <IoIcons.IoIosPaper/>,
            cName: 'nav-text'
        },
        {
            title: 'Adaugă o știre',
            path: '/organisations/add',
            icon: <AiIcons.AiFillFileAdd/>,
            cName: 'nav-text'
        },
        {
            title: 'Anunțuri de vânzare',
            path: '/organisations/add',
            icon: <MdIcons.MdSell/>,
            cName: 'nav-text'
        },
        {
            title: 'Anunțuri de închiriere',
            path: '/serviceAppointments',
            icon: <MdIcons.MdCarRental/>,
            cName: 'nav-text'
        },
        {
            title: 'Anunțuri de aprobat',
            path: '/organisations/add',
            icon: <MdIcons.MdPendingActions/>,
            cName: 'nav-text'
        },
        {
            title: 'Organizații',
            path: '/organisations/add',
            icon: <CgIcons.CgOrganisation/>,
            cName: 'nav-text'
        },
        {
            title: 'Service-uri auto',
            path: '/organisations/add',
            icon: <GiIcons.GiAutoRepair/>,
            cName: 'nav-text'
        },
        {
            title: 'Centre de închiriere',
            path: '/organisations/add',
            icon: <GiIcons.GiHomeGarage/>,
            cName: 'nav-text'
        },
        {
            title: 'Managementul utilizatorilor',
            path: '/organisations/add',
            icon: <FaIcons.FaUsers/>,
            cName: 'nav-text'
        }
    ];
} else if(user !== null && user.roles.includes("ROLE_MODERATOR")) {
    SidebarData = [
        {
            title: 'Acasă',
            path: '/',
            icon: <AiIcons.AiFillHome/>,
            cName: 'nav-text'
        },
        {
            title: 'Știri',
            path: '/news',
            icon: <IoIcons.IoIosPaper/>,
            cName: 'nav-text'
        },
        {
            title: 'Adaugă o știre',
            path: '/organisations/add',
            icon: <AiIcons.AiFillFileAdd/>,
            cName: 'nav-text'
        },
        {
            title: 'Anunțuri de vânzare',
            path: '/organisations/add',
            icon: <MdIcons.MdSell/>,
            cName: 'nav-text'
        },
        {
            title: 'Anunțuri de închiriere',
            path: '/serviceAppointments',
            icon: <MdIcons.MdCarRental/>,
            cName: 'nav-text'
        },
        {
            title: 'Anunțuri de aprobat',
            path: '/organisations/add',
            icon: <MdIcons.MdPendingActions/>,
            cName: 'nav-text'
        }
    ];
} else if(user !== null && user.roles.includes("ROLE_ORGANISATION")) {
    SidebarData = [
        {
            title: 'Acasă',
            path: '/',
            icon: <AiIcons.AiFillHome/>,
            cName: 'nav-text'
        },
        {
            title: 'Știri',
            path: '/news',
            icon: <IoIcons.IoIosPaper/>,
            cName: 'nav-text'
        },
        {
            title: 'Organizația mea',
            path: '/organisations/myOrganisation',
            icon: <CgIcons.CgOrganisation/>,
            cName: 'nav-text'
        },
        {
            title: 'Service-urile mele',
            path: '/organisations/add',
            icon: <GiIcons.GiAutoRepair/>,
            cName: 'nav-text'
        },
        {
            title: 'Programări la service',
            path: '/serviceAppointments',
            icon: <ImIcons.ImCalendar/>,
            cName: 'nav-text'
        },
        {
            title: 'Centre de închiriere',
            path: '/organisations/add',
            icon: <GiIcons.GiHomeGarage/>,
            cName: 'nav-text'
        },
        {
            title: 'Anunțuri de închiriere',
            path: '/serviceAppointments',
            icon: <IoIcons.IoIosDocument/>,
            cName: 'nav-text'
        },
        {
            title: 'Cereri de închiriere',
            path: '/organisations/add',
            icon: <MdIcons.MdCarRental/>,
            cName: 'nav-text'
        },
        {
            title: 'Statistici',
            path: '/organisations/add',
            icon: <IoIcons.IoIosStats/>,
            cName: 'nav-text'
        }
    ];
} else if(user !== null && user.roles.length === 1) {
    SidebarData = [
        {
            title: 'Acasă',
            path: '/',
            icon: <AiIcons.AiFillHome/>,
            cName: 'nav-text'
        },
        {
            title: 'Știri',
            path: '/news',
            icon: <IoIcons.IoIosPaper/>,
            cName: 'nav-text'
        },
        {
            title: 'Creează organizație',
            path: '/organisations/add',
            icon: <CgIcons.CgAddR/>,
            cName: 'nav-text'
        },
        {
            title: 'Programările mele',
            path: '/serviceAppointments',
            icon: <ImIcons.ImCalendar/>,
            cName: 'nav-text'
        },
        {
            title: 'Anunțurile mele',
            path: '/serviceAppointments',
            icon: <IoIcons.IoIosDocument/>,
            cName: 'nav-text'
        },
        {
            title: 'Postează anunț',
            path: '/serviceAppointments',
            icon: <AiIcons.AiFillFileAdd/>,
            cName: 'nav-text'
        },
        {
            title: 'Anunțuri de vânzare',
            path: '/serviceAppointments',
            icon: <MdIcons.MdSell/>,
            cName: 'nav-text'
        },
        {
            title: 'Anunțuri favorite',
            path: '/serviceAppointments',
            icon: <BsIcons.BsHeartFill/>,
            cName: 'nav-text'
        },
        {
            title: 'Închiriază o mașină',
            path: '/serviceAppointments',
            icon: <MdIcons.MdCarRental/>,
            cName: 'nav-text'
        }
    ];
}

export default SidebarData;