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
            path: '/profile',
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
            path: '/news/add',
            icon: <AiIcons.AiFillFileAdd/>,
            cName: 'nav-text'
        },
        {
            title: 'Anunțuri de vânzare',
            path: '/sellingAnnouncements',
            icon: <MdIcons.MdSell/>,
            cName: 'nav-text'
        },
        {
            title: 'Anunțuri de închiriere',
            path: '/rentalAnnouncements',
            icon: <MdIcons.MdCarRental/>,
            cName: 'nav-text'
        },
        {
            title: 'Anunțuri de aprobat',
            path: '/pendingAnnouncements',
            icon: <MdIcons.MdPendingActions/>,
            cName: 'nav-text'
        },
        {
            title: 'Organizații',
            path: '/organisations',
            icon: <CgIcons.CgOrganisation/>,
            cName: 'nav-text'
        },
        {
            title: 'Service-uri auto',
            path: '/autoServices',
            icon: <GiIcons.GiAutoRepair/>,
            cName: 'nav-text'
        },
        {
            title: 'Centre de închiriere',
            path: '/rentalCenters',
            icon: <GiIcons.GiHomeGarage/>,
            cName: 'nav-text'
        },
        {
            title: 'Managementul utilizatorilor',
            path: '/users/management',
            icon: <FaIcons.FaUsers/>,
            cName: 'nav-text'
        }
    ];
} else if(user !== null && user.roles.includes("ROLE_MODERATOR")) {
    SidebarData = [
        {
            title: 'Acasă',
            path: '/profile',
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
            path: '/news/add',
            icon: <AiIcons.AiFillFileAdd/>,
            cName: 'nav-text'
        },
        {
            title: 'Anunțuri de vânzare',
            path: '/sellingAnnouncements',
            icon: <MdIcons.MdSell/>,
            cName: 'nav-text'
        },
        {
            title: 'Anunțuri de închiriere',
            path: '/rentalAnnouncements',
            icon: <MdIcons.MdCarRental/>,
            cName: 'nav-text'
        },
        {
            title: 'Anunțuri de aprobat',
            path: '/pendingAnnouncements',
            icon: <MdIcons.MdPendingActions/>,
            cName: 'nav-text'
        }
    ];
} else if(user !== null && user.roles.includes("ROLE_ORGANISATION")) {
    SidebarData = [
        {
            title: 'Acasă',
            path: '/profile',
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
            path: '/myAutoServices',
            icon: <GiIcons.GiAutoRepair/>,
            cName: 'nav-text'
        },
        {
            title: 'Programări la service',
            path: '/myServiceAppointments',
            icon: <ImIcons.ImCalendar/>,
            cName: 'nav-text'
        },
        {
            title: 'Centre de închiriere',
            path: '/myRentalCenters',
            icon: <GiIcons.GiHomeGarage/>,
            cName: 'nav-text'
        },
        {
            title: 'Anunțuri de închiriere',
            path: '/myRentalAnnouncements',
            icon: <IoIcons.IoIosDocument/>,
            cName: 'nav-text'
        },
        {
            title: 'Cereri de închiriere',
            path: '/myRentalRequests',
            icon: <MdIcons.MdCarRental/>,
            cName: 'nav-text'
        },
        {
            title: 'Statistici',
            path: '/organisations/myStats',
            icon: <IoIcons.IoIosStats/>,
            cName: 'nav-text'
        }
    ];
} else if(user !== null && user.roles.length === 1) {
    SidebarData = [
        {
            title: 'Acasă',
            path: '/profile',
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
            path: '/mySellingAnnouncements',
            icon: <IoIcons.IoIosDocument/>,
            cName: 'nav-text'
        },
        {
            title: 'Postează anunț',
            path: '/sellingAnnouncements/add',
            icon: <AiIcons.AiFillFileAdd/>,
            cName: 'nav-text'
        },
        {
            title: 'Anunțuri de vânzare',
            path: '/sellingAnnouncements',
            icon: <MdIcons.MdSell/>,
            cName: 'nav-text'
        },
        {
            title: 'Anunțuri favorite',
            path: '/favoriteAnnouncements',
            icon: <BsIcons.BsHeartFill/>,
            cName: 'nav-text'
        },
        {
            title: 'Închiriază o mașină',
            path: '/rentalCenters',
            icon: <MdIcons.MdCarRental/>,
            cName: 'nav-text'
        }
    ];
}

export default SidebarData;