import { loadWebView } from '../../helpers/webview';
import env from '../../helpers/env';
import { initSession, deleteSession, MOCHA_TIMEOUT } from '../../helpers/session2';
import { SAFARI_CAPS } from '../../desired';


const GET_ELEM_SYNC = `return document.getElementsByTagName('h1')[0].innerHTML;`;
const GET_ELEM_ASYNC = `arguments[arguments.length - 1](document.getElementsByTagName('h1')[0].innerHTML);`;

describe('safari - webview -', function () {
  this.timeout(MOCHA_TIMEOUT);

  let driver;
  before(async () => {
    driver = await initSession(SAFARI_CAPS);
  });
  after(async () => {
    await deleteSession();
  });


  describe('frames', function () {
    beforeEach(async () => {
      await loadWebView(SAFARI_CAPS, driver,
        `${env.TEST_END_POINT}frameset.html`,
        'Frameset guinea pig'
      );
      await driver.frame();
    });

    it('should switch to frame by name', async () => {
      await driver.frame('first');
      (await driver.title()).should.be.equal('Frameset guinea pig');

      let h1 = await driver.elementByTagName('h1');
      (await h1.text()).should.be.equal('Sub frame 1');
    });

    it('should switch to frame by index', async () => {
      await driver.frame(1);
      (await driver.title()).should.be.equal('Frameset guinea pig');

      let h1 = await driver.elementByTagName('h1');
      (await h1.text()).should.be.equal('Sub frame 2');
    });

    it('should switch to frame by id', async () => {
      await driver.frame('frame3');
      (await driver.title()).should.be.equal('Frameset guinea pig');

      let h1 = await driver.elementByTagName('h1');
      (await h1.text()).should.be.equal('Sub frame 3');
    });

    it('should switch back to default content from frame', async () => {
      await driver.frame('first');
      (await driver.title()).should.be.equal('Frameset guinea pig');

      let h1 = await driver.elementByTagName('h1');
      (await h1.text()).should.be.equal('Sub frame 1');

      await driver.frame(null);
      (await driver.elementByTagName('frameset')).should.exist;
    });

    it('should switch to child frames', async () => {
      await driver.frame('third');
      (await driver.title()).should.be.equal('Frameset guinea pig');

      await driver.frame('childframe');
      (await driver.elementById('only_on_page_2')).should.exist;
    });

    it('should execute javascript in frame', async () => {
      await driver.frame('first');
      (await driver.execute(GET_ELEM_SYNC)).should.be.equal('Sub frame 1');
    });

    it('should execute async javascript in frame', async () => {
      await driver.frame('first');
      (await driver.executeAsync(GET_ELEM_ASYNC)).should.be.equal('Sub frame 1');
    });
  });

  describe('iframes', function () {
    beforeEach(async () => {
      await loadWebView(SAFARI_CAPS, driver,
        `${env.TEST_END_POINT}iframes.html`,
        'Iframe guinea pig'
      );
    });

    it('should switch to iframe by name', async () => {
      await driver.frame('iframe1');
      (await driver.title()).should.be.equal('Iframe guinea pig');

      let h1 = await driver.elementByTagName('h1');
      (await h1.text()).should.be.equal('Sub frame 1');
    });

    it('should switch to iframe by index', async () => {
      await driver.frame(1);
      (await driver.title()).should.be.equal('Iframe guinea pig');

      let h1 = await driver.elementByTagName('h1');
      (await h1.text()).should.be.equal('Sub frame 2');
    });

    it('should switch to iframe by id', async () => {
      await driver.frame('id-iframe3');
      (await driver.title()).should.be.equal('Iframe guinea pig');

      let h1 = await driver.elementByTagName('h1');
      (await h1.text()).should.be.equal('Sub frame 3');
    });

    it('should switch to iframe by element', async () => {
      let frame = await driver.elementById('id-iframe3');
      await driver.frame(frame);
      (await driver.title()).should.be.equal('Iframe guinea pig');

      let h1 = await driver.elementByTagName('h1');
      (await h1.text()).should.be.equal('Sub frame 3');
    });

    it('should not switch to iframe by element of wrong type', async () => {
      let h1 = await driver.elementByTagName('h1');
      await driver.frame(h1).should.eventually.be.rejected;
    });

    it('should switch back to default content from iframe', async () => {
      await driver.frame('iframe1');
      (await driver.title()).should.be.equal('Iframe guinea pig');

      let h1 = await driver.elementByTagName('h1');
      (await h1.text()).should.be.equal('Sub frame 1');

      await driver.frame(null);
      (await driver.elementsByTagName('iframe')).should.have.length(3);
    });
  });
});
