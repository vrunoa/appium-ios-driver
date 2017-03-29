/* globals expect */
import { loadWebView, spinTitle, spinWait } from '../../helpers/webview';
import B from 'bluebird';
import { initSession, deleteSession, MOCHA_TIMEOUT } from '../../helpers/session2';
import { SAFARI_CAPS } from '../../desired';
import env from '../../helpers/env';
import _ from 'lodash';


describe('safari - webview ', function () {
  this.timeout(MOCHA_TIMEOUT);

  describe('basics', () => {
    let driver;
    before(async () => {
      driver = await initSession(SAFARI_CAPS);
    });
    after(async () => {
      await deleteSession();
    });
    beforeEach(async () => await loadWebView(SAFARI_CAPS, driver));

    describe('context', function () {
      it('getting current context should work initially', async () => {
        await B.delay(500);
        (await driver.currentContext()).should.be.ok;
      });
    });

    describe('implicit wait', function () {
      it('should set the implicit wait for finding web elements', async () => {
        await driver.setImplicitWaitTimeout(7 * 1000);

        let before = new Date().getTime() / 1000;
        let hasThrown = false;

        /**
         * we have to use try catch to actually halt the process here
         */
        try {
          await driver.elementByTagName('notgonnabethere');
        } catch (e) {
          hasThrown = true;
        } finally {
          hasThrown.should.be.ok;
        }

        let after = new Date().getTime() / 1000;
        ((after - before) > 7).should.be.ok;
        await driver.setImplicitWaitTimeout(0);
      });
    });

    describe('window title', function () {
      beforeEach(async () => await loadWebView(SAFARI_CAPS, driver));

      it('should return a valid title on web view', async () => {
        (await driver.title()).should.include("I am a page title");
      });
    });

    describe('element handling', function () {
      beforeEach(async () => await loadWebView(SAFARI_CAPS, driver));

      it('should find a web element in the web view', async () => {
        (await driver.elementById('i_am_an_id')).should.exist;
      });

      it('should find multiple web elements in the web view', async () => {
        (await driver.elementsByTagName('a')).should.have.length.above(0);
      });

      it('should fail gracefully to find multiple missing web elements in the web view', async () => {
        (await driver.elementsByTagName('blar')).should.have.length(0);
      });

      it('should find element from another element', async () => {
        let el = await driver.elementByClassName('border');
        (await el.elementByXPath('./form')).should.exist;
      });

      it('should be able to click links', async () => {
        let el = await driver.elementByLinkText('i am a link');
        await el.click();
        await spinTitle('I am another page title', driver);
      });

      it('should retrieve an element attribute', async () => {
        let el = await driver.elementById('i_am_an_id');
        (await el.getAttribute('id')).should.be.equal('i_am_an_id');
        expect(await el.getAttribute('blar')).to.be.null;
      });

      it('should retrieve implicit attributes', async () => {
        let els = await driver.elementsByTagName('option');
        els.should.have.length(3);

        (await els[2].getAttribute('index')).should.be.equal('2');
      });

      it('should retrieve an element text', async () => {
        let el = await driver.elementById('i_am_an_id');
        (await el.text()).should.be.equal('I am a div');
      });

      it.skip('should check if two elements are equals', async () => {
        let el1 = await driver.elementById('i_am_an_id');
        let el2 = await driver.elementByCssSelector('#i_am_an_id');
        el1.should.be.equal(el2);
      });

      it('should return the page source', async () => {
        let source = await driver.source();
        source.should.include('<html');
        source.should.include('I am a page title');
        source.should.include('i appear 3 times');
        source.should.include('</html>');
      });

      it('should get current url', async () => {
        (await driver.url()).should.include('test/guinea-pig');
      });

      it('should get updated URL without breaking window handles', async () => {
        let el = await driver.elementByLinkText('i am an anchor link');
        await el.click();
        (await driver.url()).should.contain('#anchor');
        (await driver.windowHandles()).should.be.ok;
      });

      it('should send keystrokes to specific element', async () => {
        let el = await driver.elementById('comments');
        await el.clear();
        await el.sendKeys('hello world');
        (await el.getAttribute('value')).should.be.equal('hello world');
      });

      it('should send keystrokes to active element', async () => {
        let el = await driver.elementById('comments');
        await el.clear();
        await el.click();
        await driver.keys('hello world');
        (await el.getAttribute('value')).should.be.equal('hello world');
      });

      it('should clear element', async () => {
        let el = await driver.elementById('comments');
        await el.type('hello world');
        (await el.getAttribute('value')).should.have.length.above(0);
        await el.clear();
        (await el.getAttribute('value')).should.be.equal('');
      });

      it('should say whether an input is selected', async () => {
        let el = await driver.elementById('unchecked_checkbox');
        (await el.selected()).should.not.be.ok;
        await el.click();
        (await el.selected()).should.be.ok;
      });

      it('should be able to retrieve css properties', async () => {
        let el = await driver.elementById('fbemail');
        (await el.getComputedCss('background-color', el.ELEMENT)).should.be.equal('rgba(255, 255, 255, 1)');
      });

      it('should retrieve an element size', async () => {
        let el = await driver.elementById('i_am_an_id');
        let size = await el.getSize();
        size.width.should.be.above(0);
        size.height.should.be.above(0);
      });

      it('should get location of an element', async () => {
        let el = await driver.elementById('fbemail');
        let loc = await el.getLocation();
        loc.x.should.be.above(0);
        loc.y.should.be.above(0);
      });

      /**
       * getTagName not supported by mjwp
       */
      it.skip('should retrieve tag name of an element', async () => {
        let el = await driver.elementById('fbemail');
        let a = await driver.elementByCssSelector('a');
        (await el.getTagName()).should.be.equal('input');
        (await a.getTagName()).should.be.equal('a');
      });

      it('should retrieve a window size', async () => {
        let size = await driver.getWindowSize();
        size.height.should.be.above(0);
        size.width.should.be.above(0);
      });

      it('should move to an arbitrary x-y element and click on it', async () => {
        let el = await driver.elementByLinkText('i am a link');
        await el.moveTo(5, 15);
        await el.click();
        await spinTitle('I am another page title', driver);
      });

      it('should submit a form', async () => {
        let el = await driver.elementById('comments');
        let form = await driver.elementById('jumpContact');
        await el.sendKeys('This is a comment');
        await form.submit();
        await spinWait(async () => {
          let el = await driver.elementById('your_comments');
          (await el.text()).should.be.equal('Your comments: This is a comment');
        });
      });

      it('should return true when the element is displayed', async () => {
        let el = await driver.elementByLinkText('i am a link');
        (await el.isDisplayed()).should.be.ok;
      });

      it('should return false when the element is not displayed', async () => {
        let el = await driver.elementById('invisible div');
        (await el.isDisplayed()).should.not.be.ok;
      });

      it('should return true when the element is enabled', async () => {
        let el = await driver.elementById('i am a link');
        (await el.isEnabled()).should.be.ok;
      });

      it('should return false when the element is not enabled', async () => {
        let el = await driver.elementById('fbemail');
        await driver.execute(`$('#fbemail').attr('disabled', 'disabled');`);
        (await el.isEnabled()).should.not.be.ok;
      });

      it('should return the active element', async () => {
        let testText = 'hi there';
        let el = await driver.elementById('i_am_a_textbox');
        await el.sendKeys(testText);
        let activeEl = await driver.active();
        (await activeEl.getAttribute('value')).should.be.equal(testText);
      });

      it('should properly navigate to anchor', async () => {
        let curl = await driver.url();
        await driver.get(curl);
      });

      it('should be able to refresh', async () => {
        await driver.refresh();
      });
    });
  });

  describe('safariIgnoreFraudWarning', function () {
    describe('true', function () {
      let driver;
      before(async () => {
        driver = await initSession(_.defaults({
          safariIgnoreFraudWarning: true,
        }, SAFARI_CAPS));
      });
      after(async () => {
        await deleteSession();
      });
      beforeEach(async () => await loadWebView(_.SAFARI_CAPS, driver));


      // iOS8 currently does not disable the phishing warning for foo:bar@ type
      // addresses, even when running the sim manually
      // TODO: find another way to trigger the phishing warning that IS disabled
      // by the pref on iOS8
      it('should not display a phishing warning with safariIgnoreFraudWarning @skip-ios8', async () => {
        await driver.get(`${env.PHISHING_END_POINT}guinea-pig2.html`);
        await spinWait(async () => {
          (await driver.title()).should.contain("I am another page title");
        });
      });
    });

    describe('false', function () {
      let driver;
      before(async () => {
        driver = await initSession(_.defaults({
          safariIgnoreFraudWarning: false,
        }, SAFARI_CAPS));
      });
      after(async () => {
        await deleteSession();
      });
      beforeEach(async () => await loadWebView(_.SAFARI_CAPS, driver));

      // iOS8 currently does not disable the phishing warning for foo:bar@ type
      // addresses, even when running the sim manually
      // TODO: find another way to trigger the phishing warning that IS disabled
      // by the pref on iOS8
      it('should display a phishing warning with safariIgnoreFraudWarning @skip-ios8', async () => {
        await driver.get(`${env.PHISHING_END_POINT}guinea-pig2.html`);
        await spinWait(async () => {
          (await driver.title()).toLowerCase().should.contain("phishing");
        });
      });
    });
  });
});
