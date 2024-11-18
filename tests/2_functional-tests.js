const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  let threadId;
  let replyId;

  // Creating a new thread
  test('POST /api/threads/:board - Create a new thread', function (done) {
    chai
      .request(server)
      .post('/api/threads/testboard')
      .send({ text: 'Test Thread', delete_password: 'password123' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, '_id');
        assert.property(res.body, 'text');
        assert.property(res.body, 'created_on');
        assert.property(res.body, 'bumped_on');
        threadId = res.body._id; // Save for later tests
        done();
      });
  });

  // Viewing the 10 most recent threads with 3 replies each
  test('GET /api/threads/:board - View threads', function (done) {
    chai
      .request(server)
      .get('/api/threads/testboard')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtMost(res.body.length, 10);
        assert.property(res.body[0], 'text');
        assert.property(res.body[0], 'replies');
        assert.isArray(res.body[0].replies);
        assert.isAtMost(res.body[0].replies.length, 3);
        done();
      });
  });

  // Reporting a thread
  test('PUT /api/threads/:board - Report a thread', function (done) {
    chai
      .request(server)
      .put('/api/threads/testboard')
      .send({ thread_id: threadId })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'reported');
        done();
      });
  });

  // Deleting a thread with the incorrect password
  test('DELETE /api/threads/:board - Incorrect delete_password', function (done) {
    chai
      .request(server)
      .delete('/api/threads/testboard')
      .send({ thread_id: threadId, delete_password: 'wrongpassword' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'incorrect password');
        done();
      });
  });

  // Deleting a thread with the correct password
  test('DELETE /api/threads/:board - Correct delete_password', function (done) {
    chai
      .request(server)
      .delete('/api/threads/testboard')
      .send({ thread_id: threadId, delete_password: 'password123' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'success');
        done();
      });
  });

  // Creating a new reply
  test('POST /api/replies/:board - Create a new reply', function (done) {
    chai
      .request(server)
      .post('/api/replies/testboard')
      .send({
        thread_id: threadId,
        text: 'Test Reply',
        delete_password: 'replypassword',
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'replies');
        assert.isArray(res.body.replies);
        replyId = res.body.replies[0]._id; // Save for later tests
        done();
      });
  });

  // Viewing a single thread with all replies
  test('GET /api/replies/:board - View a single thread', function (done) {
    chai
      .request(server)
      .get(`/api/replies/testboard?thread_id=${threadId}`)
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, '_id');
        assert.property(res.body, 'text');
        assert.property(res.body, 'replies');
        assert.isArray(res.body.replies);
        done();
      });
  });

  // Reporting a reply
  test('PUT /api/replies/:board - Report a reply', function (done) {
    chai
      .request(server)
      .put('/api/replies/testboard')
      .send({ thread_id: threadId, reply_id: replyId })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'reported');
        done();
      });
  });

  // Deleting a reply with the incorrect password
  test('DELETE /api/replies/:board - Incorrect delete_password', function (done) {
    chai
      .request(server)
      .delete('/api/replies/testboard')
      .send({
        thread_id: threadId,
        reply_id: replyId,
        delete_password: 'wrongpassword',
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'incorrect password');
        done();
      });
  });

  // Deleting a reply with the correct password
  test('DELETE /api/replies/:board - Correct delete_password', function (done) {
    chai
      .request(server)
      .delete('/api/replies/testboard')
      .send({
        thread_id: threadId,
        reply_id: replyId,
        delete_password: 'replypassword',
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'success');
        done();
      });
  });
});
