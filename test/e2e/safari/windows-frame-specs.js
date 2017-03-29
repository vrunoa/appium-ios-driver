import env from '../helpers/env';
import { loadWebView, spinTitle } from "../helpers/webview";
import B from 'bluebird';
import { initSession, deleteSession, MOCHA_TIMEOUT } from '../helpers/session2';
import { SAFARI_CAPS } from '../desired';
import _ from 'lodash';
import { killAllSimulators } from 'appium-ios-simulator';


describe(`safari - windows and frames (${env.DEVICE})`, function () {
  this.timeout(MOCHA_TIMEOUT);

  let driver;
  before(async () => {
    if (!process.env.REAL_DEVICE) {
      await killAllSimulators();
    }
  });

  describe('with safariAllowPopups', () => {
    describe('within webview', function () {
      before(async () => {
        driver = await initSession(SAFARI_CAPS);
        // minimize waiting if something goes wrong
        await driver.setImplicitWaitTimeout(1000);
      });
      after(async () => {
        await deleteSession();
      });
      beforeEach(() => loadWebView("safari", driver));

      it("should throw nosuchwindow if there's not one", () => {
        return driver.window('noexistman').should.be.rejectedWith(/window could not be found/);
      });

      // unfortunately, iOS8 doesn't respond to the close() method on window
      // the way iOS7 does
      it("should be able to open and close windows @skip-ios8", async () => {
        let el = await driver.elementById('blanklink');
        await el.click();
        await spinTitle("I am another page title", driver);

        await B.delay(2000);
        await driver.close();
        await B.delay(3000);
        await spinTitle("I am a page title", driver);
      });

      it('should be able to go back and forward', async () => {
        let link = await driver.elementByLinkText('i am a link');
        await link.click();
        await driver.elementById('only_on_page_2');
        await driver.back();
        await driver.elementById('i_am_a_textbox');
        await driver.forward();
        await driver.elementById('only_on_page_2');
      });

      // broken on real devices, see https://github.com/appium/appium/issues/5167
      it("should be able to open js popup windows with safariAllowPopups set to true @skip-real-device", async () => {
        let link = await driver.elementByLinkText('i am a new window link');
        await link.click();
        await spinTitle("I am another page title", driver, 30);
      });
    });
  });

  describe(`without safariAllowPopups`, function () {
    before(async () => {
      driver = await initSession(_.defaults({safariAllowPopups: false}, SAFARI_CAPS));
      // minimize waiting if something goes wrong
      await driver.setImplicitWaitTimeout(5000);
    });
    after(async () => {
      await deleteSession();
    });
    beforeEach(async () => await loadWebView("safari", driver));

    it("should not be able to open js popup windows", async () => {
      await driver.execute("window.open('/test/guinea-pig2.html', null)");
      await spinTitle("I am another page title", driver, 5).should.eventually.be.rejected;
    });
  });
});
