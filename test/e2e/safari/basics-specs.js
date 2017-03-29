import env from '../helpers/env';
import { startServer, HOST, PORT, MOCHA_TIMEOUT } from '../helpers/session2';
import wd from 'wd';
import { killAllSimulators } from 'appium-ios-simulator';
import { SAFARI_CAPS } from '../desired';
import _ from 'lodash';


describe('safari - basics @skip-real-device', function () {
  this.timeout(MOCHA_TIMEOUT);

  let server, driver;
  before(async () => {
    if (!process.env.REAL_DEVICE) {
      await killAllSimulators();
    }

    driver = wd.promiseChainRemote(HOST, PORT);
    server = await startServer(PORT, HOST);
  });

  after(async () => {
    if (server) {
      await server.close();
    }
  });

  afterEach(async function () {
    await driver.quit();
  });

  if (!(env.IOS8 || env.IOS9) && env.IOS80) {
    return describe('default init', () => {
      it('it should use safari default init page', async () => {
        await driver.init(SAFARI_CAPS);
        (await driver.source()).should.include('Apple');
      });
    });
  }

  describe('default init', function () {
    it('it should use appium default init page', async () => {
      await driver.init(SAFARI_CAPS);
      (await driver.source()).should.include('Let\'s browse!');
    });
  });

  describe('init with safariInitialUrl', function () {
    it('should go to the requested page', async () => {
      await driver.init(_.defaults({safariInitialUrl: env.GUINEA_TEST_END_POINT}, SAFARI_CAPS));
      (await driver.source()).should.include('I am some page content');
    });
  });
});
