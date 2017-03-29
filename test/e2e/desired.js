import _ from 'lodash';


const PLATFORM_VERSION = process.env.PLATFORM_VERSION ? process.env.PLATFORM_VERSION : '9.3';
const DEVICE_NAME = process.env.DEVICE_NAME ? process.env.DEVICE_NAME : 'iPhone 6';

const REAL_DEVICE = !!process.env.REAL_DEVICE;

const REAL_DEVICE_CAPS = REAL_DEVICE ? {
  udid: 'auto',
} : {};

const GENERIC_CAPS = {
  platformName: 'iOS',
  platformVersion: PLATFORM_VERSION,
  deviceName: DEVICE_NAME,
  noReset: true,
};

const SAFARI_CAPS = _.defaults({
  browserName: 'Safari',
  nativeWebTap: true,
  safariAllowPopups: true,
}, GENERIC_CAPS, REAL_DEVICE_CAPS);

export { SAFARI_CAPS, PLATFORM_VERSION };
