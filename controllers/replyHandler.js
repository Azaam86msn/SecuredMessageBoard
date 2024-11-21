let mongoose = require("mongoose");
let Message = require("../models/message").Message;

exports.postReply = async (req, res, next) => {
  try {
    let board = req.params.board;
    let foundBoard = await Message.findById(req.body.thread_id);
    foundBoard.bumped_on = new Date().toUTCString();
    foundBoard.replies.push({
      text: req.body.text,
      created_on: new Date().toUTCString(),
      delete_password: req.body.delete_password,
      reported: false
    });

    await foundBoard.save();
    return res.redirect("/b/" + board + "/" + req.body.thread_id);
  } catch (err) {
    res.json("error");
  }
};

exports.getReply = async (req, res) => {
    try {
      let board = req.params.board;
      await Message.findById(req.query.thread_id, async (err, thread) => {
        if (!err && thread) {
          // Remove delete_password and reported fields
          thread.delete_password = undefined;
          thread.reported = undefined;
          thread.replycount = thread.replies.length;
  
          thread.replies.forEach(reply => {
            reply.delete_password = undefined;
            reply.reported = undefined;
          });
  
          return res.json(thread);
        }
      });
    } catch (err) {
      res.json("error");
    }
  };

exports.deleteReply = async (req, res) => {
  try {
    let foundThread = await Message.findById(req.body.thread_id);
    let reply = foundThread.replies.id(req.body.reply_id);
    if (reply && reply.delete_password === req.body.delete_password) {
      reply.text = "[deleted]";
      await foundThread.save();
      return res.send("success");
    } else {
      return res.send("incorrect password");
    }
  } catch (err) {
    res.json("error");
  }
};

exports.putReply = async (req, res) => {
    try {
      let foundThread = await Message.findById(req.body.thread_id);
      let reply = foundThread.replies.id(req.body.reply_id);
      if (reply) {
        reply.reported = true;
        await foundThread.save();
        return res.send("reported");  // Return "reported" instead of "success"
      }
    } catch (err) {
      res.json("error");
    }
  };
