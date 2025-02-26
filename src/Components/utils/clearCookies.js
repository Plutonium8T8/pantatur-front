import Cookies from 'js-cookie';

export const clearCookie = () => {
    Cookies.remove('jwt');
    Cookies.remove('PHPSESSID');
    window.location.reload();
};
