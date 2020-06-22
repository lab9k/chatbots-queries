var nodeFetch = require('node-fetch');
var { URLSearchParams } = require('url');
var moment = require('moment');

class CitynetApi {
  constructor() {
    this.baseUrl = 'https://api.cloud.nalantis.com/api';
    this.login();
  }

  query(question) {
    this.login();

    return nodeFetch(`${this.baseUrl}/v2/documents/query/semantic/generic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${this.token.value}`,
      },
      body: JSON.stringify({
        query: question,
        targetDocumentType: 'citynet',
        resultDetailLevel: 9,
        rows: 10,
        inputLanguage: 'nl',
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        return res;
      })
      .catch((err) => {
        throw err;
      });
  }

  login() {
    if (!this.isTokenValid()) {
      const params = new URLSearchParams();
      params.append('login', this.getCredentials().login);
      params.append('password', this.getCredentials().password);
      return nodeFetch('https://api.cloud.nalantis.com/auth/v2/users/login', {
        method: 'POST',
        body: params,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }).then(({ headers }) => {
        const token = {
          value: headers.get('Authorization').split('Bearer ')[1],
          date: headers.get('date'),
        };
        this.token = token;
        return token;
      });
    }
    return this.token;
  }

  getCredentials() {
    const login = process.env.CITYNET_LOGIN;
    const password = process.env.CITYNET_PASSWORD;
    if (!login || !password) {
      throw 'No Citynet credentials provided in env';
    }
    return { login, password };
  }

  isTokenValid() {
    if (!this.token) return false;
    return moment(this.token.date).isAfter(moment().subtract(24, 'hours'));
  }
}
module.exports = new CitynetApi();
