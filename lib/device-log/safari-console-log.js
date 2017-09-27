import _ from 'lodash';
import logger from './logger';


class SafariConsoleLog {
  constructor (showLogs) {
    this.showLogs = showLogs;
    this.logs = [];
    this.start = 0;

    this.capture = false;
  }

  async startCapture () {
    this.capture = true;
  }

  async stopCapture () {
    this.capture = false;
  }

  addLogLine (out) {
    if (this.capture) {
      this.logs.push(out);
    }

    if (this.showLogs) {
      let level = 'debug';
      if (out.level && (out.level === 'warn' || out.level === 'error')) {
        level = out.level;
      }
      for (let line of out.text.split('\n')) {
        logger[level](`[JS CONSOLE ${level.toUpperCase()}][${out.url} ${out.line}:${out.column}] ${line}`);
      }
    }
  }

  async getLogs () {
    let logs = this.logs.slice(this.start);
    this.start = this.logs.length;
    return logs;
  }

  async getAllLogs () {
    return _.clone(this.logs);
  }
}

export { SafariConsoleLog };
export default SafariConsoleLog;
