'use strict';

const threads = []; // Store threads in memory for this example
const replies = []; // Store replies in memory for this example

module.exports = function (app) {

  // POST request to create a new thread
  app.post('/api/threads/:board', (req, res) => {
    const { text, delete_password } = req.body;
    
    if (!text || !delete_password) {
      return res.status(400).send('Missing required fields');
    }

    // Creating a new thread with necessary fields
    const newThread = {
      _id: threads.length + 1,
      text,
      created_on: new Date().toString(), // Ensure correct date format
      bumped_on: new Date().toString(), // Bumped on same as created_on
      reported: false,
      delete_password,
      replies: [] // Empty replies initially
    };

    threads.push(newThread);
    res.status(200).json(newThread); // Return the newly created thread
  });

  // POST request to create a reply to a thread
  app.post('/api/replies/:board', (req, res) => {
    const { text, delete_password, thread_id } = req.body;
    
    console.log('Creating reply for thread_id:', thread_id); // Debugging line
    if (!text || !delete_password || !thread_id) {
      return res.status(400).send('Missing required fields');
    }

    // Find the thread by ID
    const thread = threads.find(t => t._id == thread_id);
    if (!thread) {
      return res.status(404).send('Thread not found');
    }

    // Create a new reply with necessary fields
    const newReply = {
      _id: thread.replies.length + 1, // Incremental ID for the reply
      text,
      created_on: new Date().toString(), // Ensure the date format is correct
      delete_password,
      reported: false
    };

    // Add the reply to the thread
    thread.replies.push(newReply);
    
    // Update the bumped_on field of the thread to the current time when a new reply is added
    thread.bumped_on = new Date().toString();

    res.status(200).json(newReply); // Return the newly created reply
  });

  // GET request to get threads with the most recent 3 replies
  app.get('/api/threads/:board', (req, res) => {
    const { board } = req.params;

    // Return the 10 most recent threads with 3 replies each, excluding delete_password and reported
    const recentThreads = threads.slice(0, 10).map(thread => {
      const { delete_password, reported, ...threadData } = thread; // Exclude sensitive fields
      threadData.replies = thread.replies.slice(0, 3).map(reply => {
        const { delete_password, reported, ...replyData } = reply; // Exclude sensitive fields
        return replyData;
      });
      return threadData;
    });

    res.status(200).json(recentThreads);
  });

  // GET request to get a single thread with all replies
  app.get('/api/replies/:board', (req, res) => {
    const { thread_id } = req.query;
    const thread = threads.find(t => t._id == thread_id);
    if (!thread) {
      return res.status(404).send('Thread not found');
    }

    // Exclude delete_password and reported fields for the thread and replies
    const { delete_password, reported, ...threadData } = thread;
    threadData.replies = thread.replies.map(reply => {
      const { delete_password, reported, ...replyData } = reply; // Exclude sensitive fields
      return replyData;
    });

    res.status(200).json(threadData);
  });

  // PUT request to report a thread
  app.put('/api/threads/:board', (req, res) => {
    const { thread_id } = req.body;
    console.log('Reporting thread, thread_id:', thread_id); // Debugging line
    const thread = threads.find(t => t._id == thread_id);
    if (!thread) {
      return res.status(404).send('Thread not found');
    }

    thread.reported = true;
    res.status(200).send('reported');
  });

  // PUT request to report a reply
  app.put('/api/replies/:board', (req, res) => {
    const { thread_id, reply_id } = req.body;
    const thread = threads.find(t => t._id == thread_id);
    if (!thread) {
      return res.status(404).send('Thread not found');
    }

    const reply = thread.replies.find(r => r._id == reply_id);
    if (!reply) {
      return res.status(404).send('Reply not found');
    }

    reply.reported = true;
    res.status(200).send('reported');
  });

  // DELETE request to delete a thread
  app.delete('/api/threads/:board', (req, res) => {
    const { thread_id, delete_password } = req.body;
    const thread = threads.find(t => t._id == thread_id);
    if (!thread) {
      return res.status(404).send('Thread not found');
    }

    if (thread.delete_password !== delete_password) {
      return res.status(400).send('incorrect password');
    }

    const index = threads.indexOf(thread);
    threads.splice(index, 1);
    res.status(200).send('success');
  });

  // DELETE request to delete a reply
  app.delete('/api/replies/:board', (req, res) => {
    const { thread_id, reply_id, delete_password } = req.body;
    const thread = threads.find(t => t._id == thread_id);
    if (!thread) {
      return res.status(404).send('Thread not found');
    }

    const reply = thread.replies.find(r => r._id == reply_id);
    if (!reply) {
      return res.status(404).send('Reply not found');
    }

    if (reply.delete_password !== delete_password) {
      return res.status(400).send('incorrect password');
    }

    reply.text = '[deleted]'; // Set text to '[deleted]' when deleted
    res.status(200).send('success');
  });
};
