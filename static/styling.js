// https://attacomsian.com/blog/javascript-detect-mobile-device#:~:text=To%20detect%20if%20the%20user,and%20platform%20of%20the%20browser.
const deviceType = () => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return "tablet";
    }
    else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return "mobile";
    }
    return "desktop";
};

var theme = document.getElementsByTagName('link')[2];

var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

if (deviceType() != "desktop" || width < 900)
{
    theme.setAttribute('href', '/static/styles2.css');
    
}
else if (width < 900)
{
    theme.setAttribute('href', '/static/styles2.css');
}