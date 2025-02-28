import Cookies from 'js-cookie';

export const clearCookies = () => {
    Cookies.remove('jwt');
    Cookies.remove('PHPSESSID');
    window.location.reload();
};
