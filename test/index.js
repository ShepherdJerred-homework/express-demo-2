const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/index');

var expect = chai.expect;
let url = 'http://localhost:8000';

chai.use(chaiHttp);

describe('Static Files', () => {
  it('Should load static files correctly', () => {
    chai.request(url)
      .get('/index.html')
      .then(res => {
        expect(res.status).to.equal(200);
      })
      .catch(err => err.response);
  });
});

describe('Authentication', () => {
  it('Should login correctly', () => {
    chai.request(url)
      .post('/login')
      .type('form')
      .send({
        username: 'root',
        password: 'password'
      })
      .then(res => {
        expect(res).to.have.cookie('connect.sid');
      })
      .catch(err => err.response);
  });

  it('Should not login with incorrect credentials', () => {
    chai.request(url)
      .post('/login')
      .type('form')
      .send({
        username: 'root',
        password: 'wrongpassword'
      })
      .catch(err => err.response)
      .then(res => {
        expect(res).to.have.status(401);
      });
  });

  it('Should not block logged in users from private static files', () => {
    let agent = chai.request.agent(url);
    agent
      .post('/login')
      .type('form')
      .send({
        username: 'root',
        password: 'password'
      })
      .then(res => {
        return agent.get('/private/secret.html')
          .then(res => {
            return expect(res).to.have.status(200);
          })
          .catch(err => err.response);
      })
      .catch(err => err.response);
  });

  it('Should block guests from private static files', () => {
    chai.request(url)
      .get('/private/secret.html')
      .catch(err => err.response)
      .then(res => {
        expect(res).to.have.status(401);
      });
  });
});
