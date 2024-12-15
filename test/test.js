import app from '../src/server.mjs'; 
import { expect, use } from 'chai';
import chaiHttp from 'chai-http';

const server = use(chaiHttp)

describe('API Endpoints', () => {
  // Test the `/data` endpoint
  describe('GET /data', () => {
    it('should return 200 and write data successfully to the database', (done) => {
      server.request.execute(app)
        .get('/data?value=25.5')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.text).to.equal('Temperature data is valid and Data written successfully to Database!');
          done();
        });
    });
  });

  // Test the `/temp` endpoint
  describe('GET /temp', () => {
    it('should return 200 and return queried data successfully', (done) => {
      server.request.execute(app)
        .get('/temp')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array'); // Expecting an array of data points
          done();
        });
    });
  });
});

describe('Express API Endpoints', () => {
  let server;

  before((done) => {
    server = app.listen(ENV.PORT, ENV.HOST, () => {
      console.log(`Test server running on http://${ENV.HOST}:${ENV.PORT}`);
      done();
    });
  });

  after((done) => {
    server.close(() => {
      console.log('Test server closed');
      done();
    });
  });

  // Test Root endpoint
  it('GET / - should return OK', (done) => {
    server.request.execute(app)
    .get('/')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.text).to.equal('OK');
        done();
      });
  });

  // Test Health Check Endpoint
  it('GET /api/v1/ - should return 200 status', (done) => {
    server.request.execute(app)
    .get('/api/v1/')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  // Test /test endpoint with query parameters
  it('GET /test?param=123 - should log query parameters', (done) => {
    server.request.execute(app)
      .get('/test')
        .query({ param: '123' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.text).to.equal('received queryparams!');
          done();
        });
  });

  // Test /api/v1/embed endpoint with a value query parameter
  it('GET /api/v1/embed?value=42.5 - should write data and return a success message', (done) => {
    server.request.execute(app)
      .get('/api/v1/embed')
        .query({ value: '42.5' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.text).to.equal(`Value: '42.5' written.`);
          done();
        });
  });

  // Test /api/v1/embed with invalid query parameter
  it('GET /api/v1/embed?value=notanumber - should return 500 on invalid input', (done) => {
    server.request.execute(app)
      .get('/api/v1/embed')
        .query({ value: 'notanumber' })
        .end((err, res) => {
          expect(res).to.have.status(500);
          done();
        });
  });
});
