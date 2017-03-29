import B from 'bluebird';
import https from 'https';
import { initSession, deleteSession, MOCHA_TIMEOUT } from '../../helpers/session2';
import { SAFARI_CAPS } from '../../desired';


const pem = B.promisifyAll(require('pem'));

describe('When accessing an HTTPS encrypted site in Safari', function () {
  this.timeout(MOCHA_TIMEOUT);

  let sslServer;
  let driver;
  let desired = Object.assign({}, SAFARI_CAPS);
  before(async function () {
    // Create an HTTPS server with a random pem certificate
    let privateKey = await pem.createPrivateKeyAsync();
    let keys = await pem.createCertificateAsync({days:1, selfSigned: true, serviceKey: privateKey.key});
    let pemCertificate = keys.certificate;

    sslServer = https.createServer({key: keys.serviceKey, cert: pemCertificate}, function (req, res) {
      res.end('Arbitrary text');
    }).listen(9758);
    desired.customSSLCert = pemCertificate;

    driver = await initSession(desired);
  });

  after(async () => {
    if (sslServer) {
      await sslServer.close();
    }
    await deleteSession();
  });

  it('should be able to access it as long the PEM certificate is provided as a capability', async () => {
    await B.delay(500);
    await driver.setUrl('https://localhost:9758');
    (await driver.getPageSource()).should.include('Arbitrary text');
  });
});
