import isMobile from 'ismobilejs'

function getScreenOrientation () {
  const orientation = window.screen.orientation || window.screen.mozOrientation;
    switch (orientation) {
      case 'landscape-primary':
        return 90;
      case 'landscape-secondary':
        return -90;
      case 'portrait-secondary':
        return 180;
      case 'portrait-primary':
        return 0;
      default:
        break;
    }
    if (window.orientation) {
      return window.orientation;
    }

  return 0;
}

export const isPortrait = () => {
  // ignore PC
  if (!isMobile.any) { 
  return false;
  }
  const orientation = getScreenOrientation();

  return Math.abs(orientation) !== 90; 
}

export const createNode = (str) => {
  var el = document.createElement('div')
  el.innerHTML = str;
  return el.children[0]
}