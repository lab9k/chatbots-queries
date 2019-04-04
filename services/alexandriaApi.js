var nodeFetch = require('node-fetch');

class AlexandriaApi {
  constructor() {
    this.baseUrl = 'https://digipolis-poc.alexandria.works/v0.1';
  }

  query(question) {
    return nodeFetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'AW-API-KEY': `${this.getCredentials()}`
      },
      body: JSON.stringify({
        query: question,
        type: 'query'
      })
    })
      .then(res => res.json())
      .catch(err => {
        throw err;
      });
  }

  getCredentials() {
    const key = process.env.AW_API_KEY;
    if (!key) {
      throw 'No Alexandria Works credentials provided in env';
    }
    console.log(key);
    return key;
  }
}

module.exports = new AlexandriaApi();
