const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server'); // Assuming you export your app from server.js

chai.use(chaiHttp);

suite('Functional Tests', function() {

  let threadId;
  let replyId;

  // Clear threads and replies before each test
  beforeEach(function(done) {
    // Reset the in-memory data to ensure clean state before each test
    server.threads = []; // Clear threads array
    server.replies = []; // Clear replies array
    done();
  });

  // Test 1: Creating a new thread
  test('Creating a new thread', function(done) {
    chai.request(server)
      .post('/api/threads/testBoard')
      .send({ text: 'Test Thread', delete_password: '1234' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, '_id');
        threadId = res.body._id; // Save the thread ID for later tests
        done();
      });
  });

  // Test 2: Viewing the 10 most recent threads with 3 replies each
  test('Viewing the 10 most recent threads with 3 replies each', function(done) {
    chai.request(server)
      .get('/api/threads/testBoard')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtMost(res.body.length, 10);
        res.body.forEach(thread => {
          assert.isArray(thread.replies);
          assert.isAtMost(thread.replies.length, 3);
        });
        done();
      });
  });

  // Test 3: Deleting a thread with the incorrect password
  test('Deleting a thread with the incorrect password', function(done) {
    chai.request(server)
      .delete('/api/threads/testBoard')
      .send({ thread_id: threadId, delete_password: 'wrong_password' })
      .end(function(err, res) {
        assert.equal(res.status, 400);
        assert.equal(res.text, 'incorrect password');
        done();
      });
  });

  // Test 4: Deleting a thread with the correct password
  test('Deleting a thread with the correct password', function(done) {
    chai.request(server)
      .delete('/api/threads/testBoard')
      .send({ thread_id: threadId, delete_password: '1234' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'success');
        done();
      });
  });

  // Test 5: Reporting a thread
  test('Reporting a thread', function(done) {
    chai.request(server)
      .put('/api/threads/testBoard')
      .send({ thread_id: threadId })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'reported');
        done();
      });
  });

  // Test 6: Creating a new reply
  test('Creating a new reply', function(done) {
    chai.request(server)
      .post('/api/replies/testBoard')
      .send({ text: 'Test Reply', delete_password: '1234', thread_id: threadId })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, '_id');
        replyId = res.body._id; // Save the reply ID for later tests
        done();
      });
  });

  // Test 7: Deleting a reply with the incorrect password
  test('Deleting a reply with the incorrect password', function(done) {
    chai.request(server)
      .delete('/api/replies/testBoard')
      .send({ thread_id: threadId, reply_id: replyId, delete_password: 'wrong_password' })
      .end(function(err, res) {
        assert.equal(res.status, 400);
        assert.equal(res.text, 'incorrect password');
        done();
      });
  });

  // Test 8: Deleting a reply with the correct password
  test('Deleting a reply with the correct password', function(done) {
    chai.request(server)
      .delete('/api/replies/testBoard')
      .send({ thread_id: threadId, reply_id: replyId, delete_password: '1234' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'success');
        done();
      });
  });

});
