'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define schemas
const replySchema = new Schema({
  text: String,
  created_on: Date,
  delete_password: String,
  reported: Boolean,
});

const threadSchema = new Schema({
  board: String,
  text: String,
  created_on: Date,
  bumped_on: Date,
  delete_password: String,
  reported: Boolean,
  replies: [replySchema],
});

// Models
const Thread = mongoose.model('Thread', threadSchema);

module.exports = function (app) {
  // Create a new thread
  app.route('/api/threads/:board').post(async (req, res) => {
    try {
      const { text, delete_password } = req.body;
      const board = req.params.board;

      const thread = new Thread({
        board,
        text,
        created_on: new Date(),
        bumped_on: new Date(),
        delete_password,
        reported: false,
        replies: [],
      });

      await thread.save();
      res.status(200).json(thread);
    } catch (error) {
      res.status(500).json({ error: 'Unable to create thread' });
    }
  });

  // Retrieve the 10 most recent threads with the 3 most recent replies
  app.route('/api/threads/:board').get(async (req, res) => {
    try {
      const board = req.params.board;
      const threads = await Thread.find({ board })
        .sort({ bumped_on: -1 })
        .limit(10)
        .select('-delete_password -reported')
        .lean();

      threads.forEach((thread) => {
        thread.replies = thread.replies
          .slice(-3)
          .map(({ delete_password, reported, ...reply }) => reply);
      });

      res.json(threads);
    } catch (error) {
      res.status(500).json({ error: 'Unable to fetch threads' });
    }
  });

  // Delete a thread
  app.route('/api/threads/:board').delete(async (req, res) => {
    try {
      const { thread_id, delete_password } = req.body;

      const thread = await Thread.findById(thread_id);
      if (!thread || thread.delete_password !== delete_password) {
        return res.send('incorrect password');
      }

      await Thread.findByIdAndDelete(thread_id);
      res.send('success');
    } catch (error) {
      res.status(500).json({ error: 'Unable to delete thread' });
    }
  });

  // Report a thread
  app.route('/api/threads/:board').put(async (req, res) => {
    try {
      const { thread_id } = req.body;

      await Thread.findByIdAndUpdate(thread_id, { reported: true });
      res.send('reported');
    } catch (error) {
      res.status(500).json({ error: 'Unable to report thread' });
    }
  });

  // Add a reply to a thread
  app.route('/api/replies/:board').post(async (req, res) => {
    try {
      const { thread_id, text, delete_password } = req.body;

      const reply = {
        text,
        created_on: new Date(),
        delete_password,
        reported: false,
      };

      const thread = await Thread.findById(thread_id);
      if (!thread) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      thread.replies.push(reply);
      thread.bumped_on = new Date();
      await thread.save();

      res.status(200).json(thread);
    } catch (error) {
      res.status(500).json({ error: 'Unable to add reply' });
    }
  });

  // Retrieve a single thread with all replies
  app.route('/api/replies/:board').get(async (req, res) => {
    try {
      const { thread_id } = req.query;

      const thread = await Thread.findById(thread_id)
        .select('-delete_password -reported')
        .lean();

      if (!thread) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      thread.replies = thread.replies.map(({ delete_password, reported, ...reply }) => reply);

      res.json(thread);
    } catch (error) {
      res.status(500).json({ error: 'Unable to fetch thread' });
    }
  });

  // Delete a reply
  app.route('/api/replies/:board').delete(async (req, res) => {
    try {
      const { thread_id, reply_id, delete_password } = req.body;

      const thread = await Thread.findById(thread_id);
      if (!thread) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      const reply = thread.replies.id(reply_id);
      if (!reply || reply.delete_password !== delete_password) {
        return res.send('incorrect password');
      }

      reply.text = '[deleted]';
      await thread.save();

      res.send('success');
    } catch (error) {
      res.status(500).json({ error: 'Unable to delete reply' });
    }
  });

  // Report a reply
  app.route('/api/replies/:board').put(async (req, res) => {
    try {
      const { thread_id, reply_id } = req.body;

      const thread = await Thread.findById(thread_id);
      if (!thread) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      const reply = thread.replies.id(reply_id);
      if (!reply) {
        return res.status(404).json({ error: 'Reply not found' });
      }

      reply.reported = true;
      await thread.save();

      res.send('reported');
    } catch (error) {
      res.status(500).json({ error: 'Unable to report reply' });
    }
  });
};
