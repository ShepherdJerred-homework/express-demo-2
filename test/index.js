const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/index');

chai.should();
let url = 'http://localhost:8000';

chai.use(chaiHttp);

describe('Static Files', () => {
  it('Should load static files correctly', () => {
    chai.request(url)
      .get('/index.html')
      .then(res => {
        res.status.should.equal(200);
      });
    chai.request(url)
      .get('/login.html')
      .then(res => {
        res.status.should.equal(200);
      });
  });
});

describe('Authentication', () => {
  it('Should login correctly', () => {
    chai.request(url)
      .post('/login')
      .field('username', 'root')
      .field('password', 'password')
      .then(res => {
        res.should.have.cookie('connect.sid');
      });
  });

  it('Should not login with incorrect credentials', () => {
    chai.request(url)
      .post('/login')
      .field('username', 'root')
      .field('password', 'wrongpassword')
      .then(res => {
        res.status.should.equal(401);
      });
  });

  it('Should not block logged in users from private static files', () => {
    let agent = chai.request.agent(url);
    agent
      .post('/login')
      .field('username', 'root')
      .field('password', 'password')
      .then(res => {
        return agent.get('/private/secret.html')
          .then(res => {
            res.status.should.equal(200);
          });
      });
  });

  it('Should block guests from private static files', () => {
    chai.request(url)
      .get('/private/secret.html')
      .then(res => {
        res.status.should.equal(401);
      });
  });
});
