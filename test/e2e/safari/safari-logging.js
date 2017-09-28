import setup from './safari-setup';
import { MOCHA_SAFARI_TIMEOUT } from '../helpers/session';
import _ from 'lodash';


describe.only('safari - logging', function () { // eslint-disable-line
  this.timeout(MOCHA_SAFARI_TIMEOUT);

  describe('default init', function () {
    const driver = setup(this, {
      browserName: 'safari',
      noReset: true,
      showSafariConsoleLog: true,
    }).driver;

    it('should get safari console logs', async () => {
      let logs = await driver.getLog('safariConsole');
      logs.should.have.length(5);

      await driver.execute('console.log("HELLO WORLD")');

      // new logs should _just_ be the above statement
      let logs2 = await driver.getLog('safariConsole');
      logs2.should.have.length(1);

      // there should be no overlap
      _.intersection(logs, logs2).should.have.length(0);
    });
  });
});
