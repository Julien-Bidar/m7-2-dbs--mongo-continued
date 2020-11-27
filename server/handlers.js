"use strict";
const { MongoClient } = require("mongodb");
require("dotenv").config();
const assert = require("assert");

const { MONGO_URI } = process.env;
const options = { useNewUrlParser: true, useUnifiedTopology: true };

const getSeats = async (req, res) => {
  const client = await MongoClient(MONGO_URI, options);
  try {
    await client.connect();
    const db = client.db("m7-2");
    const results = await db.collection("seats").find().toArray();

    const seats = {};
    results.forEach((seat) => {
      seats[seat._id] = seat;
    });
    if (results.length > 0) {
      res.status(200).json({
        seats: seats,
        numOfRows: 8,
        seatsPerRow: 12,
      });
    } else {
      res.status(400).json({ status: 400 });
    }
  } catch (err) {
    console.log(err);
  }
  client.close();
};

const bookSeat = async (req, res) => {
  const client = await MongoClient(MONGO_URI, options);
  const { seatId, creditCard, expiration, fullName, email } = req.body;
  const _id = seatId;
  let lastBookingAttemptSucceeded = false;
  const query = { _id };
  const newValue = {
    $set: { isBooked: true, fullName: fullName, email: email },
  };
  //   console.log({ body: req.body });
  //   console.log(creditCard.length);
  //   console.log({ newValue: newValue });

  if (!creditCard || !expiration) {
    res.status(400).json({
      status: 400,
      message: "Please provide credit card information!",
    });
  }

  if (lastBookingAttemptSucceeded) {
    lastBookingAttemptSucceeded = !lastBookingAttemptSucceeded;

    res.status(500).json({
      message: "An unknown error has occurred. Please try your request again.",
    });
  }
  lastBookingAttemptSucceeded = !lastBookingAttemptSucceeded;

  try {
    await client.connect();
    const db = client.db("m7-2");

    const check = await db.collection("seats").findOne(query);
    console.log(check.isBooked);

    if (check.isBooked === false) {
      const result = await db.collection("seats").updateOne(query, newValue);
      assert.equal(1, result.matchedCount);

      res.status(201).json({ status: 201, seatId, success: true });
    }
  } catch (err) {
    console.log(err);
  }
  client.close();
};

const updateSeat = async (req, res) => {
  const client = await MongoClient(MONGO_URI, options);
  const { _id, fullName, isBooked, email } = req.body;
  const query = { _id };
  const newValue = {
    $set: { isBooked: isBooked, fullName: fullName, email: email },
  };
  try {
    await client.connect();
    const db = client.db("m7-2");
    const result = await db.collection("seats").updateOne(query, newValue);
    assert.strictEqual(1, result.matchedCount);
    res.status(201).json({ status: 201, _id, success: true });
  } catch (err) {
    console.log(err);
  }
};

module.exports = { getSeats, bookSeat, updateSeat };
