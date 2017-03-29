import { loadWebView } from '../../helpers/webview';
import { initSession, deleteSession, MOCHA_TIMEOUT } from '../../helpers/session2';
import { SAFARI_CAPS } from '../../desired';


describe('safari - webview - alerts @skip-real-device', function () {
  this.timeout(MOCHA_TIMEOUT);

  let driver;
  before(async () => {
    driver = await initSession(SAFARI_CAPS);
  });
  after(async () => {
    await deleteSession();
  });
  beforeEach(async () => await loadWebView(SAFARI_CAPS, driver));

  it('should accept alert', async () => {
    let el = await driver.elementById('alert1');
    await el.click();
    await driver.acceptAlert();
    (await driver.title()).should.include('I am a page title');
  });

  it('should dismiss alert', async () => {
    let el = await driver.elementById('alert1');
    await el.click();
    await driver.dismissAlert();
    (await driver.title()).should.include('I am a page title');
  });

  it('should get text of alert', async () => {
    let el = await driver.elementById('alert1');
    await el.click();
    (await driver.alertText()).should.include('I am an alert');
    await driver.dismissAlert();
  });

  it('should not get text of alert that closed', async () => {
    let el = await driver.elementById('alert1');
    await el.click();
    await driver.acceptAlert();
    return driver.alertText()
      .should.be.rejectedWith(/An attempt was made to operate on a modal dialog when one was not open/);
  });

  it('should set text of prompt', async () => {
    let el = await driver.elementById('prompt1');
    await el.click();
    await driver.alertKeys('yes I do!');
    await driver.acceptAlert();

    el = await driver.elementById('promptVal');
    // TODO: avoiding flaky test case where value is 'yes I dO'.
    (await el.getAttribute('value')).toLowerCase().should.equal('yes i do!');
  });

  it('should fail to set text of alert', async () => {
    let el = await driver.elementById('alert1');
    await el.click();
    return driver.alertKeys('yes I do!')
      .should.be.rejectedWith(/Tried to set text of an alert that wasn't a prompt/);
  });
});
