/* global describe, it, api, expect, beforeEach */
const Record = require('../../models/record');

const recordData = [{
  artist: 'Test Artist',
  title: 'Test Album',
  image: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/da/MWSTWUS2.jpg/220px-MWSTWUS2.jpg',
  genres: ['Rock'],
  label: 'RCA',
  releaseDate: 1970,
  condition: 'Mint'
}];


describe('GET /records', ()=>{
  beforeEach(done => {
    Record
      .remove({})
      .then( () => Record.create(recordData))
      .then( () => done() );
  });

  it('should return a 200 response', done => {
    api.get('/api/records')
      .end((err, res) => {
        expect(res.status).to.eq(200);
        done();
      });
  });

  it('should return an array', done => {
    api.get('/api/records')
      .end((err, res) => {
        expect(res.body).to.be.an('array');
        done();
      });
  });

  it('should return an array of objects', done => {
    api.get('/api/records')
      .end((err, res) => {
        res.body.forEach(record => expect(record).to.be.an('object'));
        done();
      });
  });

  it('should return the correct data', done => {
    api.get('/api/records/')
      .end((err, res) => {
        res.body.forEach((record, index) => {
          expect(record.artist).to.eq(recordData[index].artist);
          expect(record.title).to.eq(recordData[index].title);
          expect(record.image).to.eq(recordData[index].image);
          expect(record.genres).to.deep.eq(recordData[index].genres);
          expect(record.label).to.eq(recordData[index].label);
          expect(record.releaseDate).to.eq(recordData[index].releaseDate);
          expect(record.condition).to.eq(recordData[index].condition);
          done();
        });
      });
  });
});
