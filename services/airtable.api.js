const Airtable = require('airtable');

module.exports = class AirtableApi {
  constructor() {
    this.API_KEY = process.env.AIRTABLE_API_KEY;
    if (!this.API_KEY) {
      throw 'No Airtable api key specified';
    }
    this.nalantis_base = Airtable.base('app26Szli30UQb1Xh');
    this.alexandria_base = Airtable.base('app4n7fT9HFiM0gwj');
  }

  /**
   *
   *
   * @param {{question:string,feedback:boolean,document:string,sessionid:string,provider:string,review:string}} options
   * @returns
   * @memberof AirtableApi
   */
  addLine(options) {
    if (options.provider === 'nalantis') {
      return this.nalantis_base('Sessions').create(
        {
          sessionid: options.sessionid,
          question: options.question,
          Date: new Date(Date.now()).toISOString(),
          'document returned': options.document,
          Feedback: options.feedback ? 'Good' : 'Bad',
          review: options.review
        },
        (err, record) => {
          if (err) {
            console.log('error creating airtable record');
            console.error(err);
            return;
          }
          console.log('airtable record successfully created');
          console.log(`airtable record id: ${record.getId()}`);
        }
      );
    }
    return this.alexandria_base('Sessions').create(
      {
        sessionid: options.sessionid,
        question: options.question,
        Date: new Date(Date.now()).toISOString(),
        'document returned': options.document,
        Feedback: options.feedback ? 'Good' : 'Bad',
        review: options.review
      },
      (err, record) => {
        if (err) {
          console.log('error creating airtable record');
          console.error(err);
          return;
        }
        console.log('airtable record successfully created');
        console.log(`airtable record id: ${record.getId()}`);
      }
    );
  }
};
