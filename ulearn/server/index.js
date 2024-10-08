const express = require("express");
const mongoose = require("mongoose");
const UserModel = require("./models/User");
const path = require("path");
const cors = require("cors");
const TutorModel = require("./models/Tutor");
const { StreamClient } = require("@stream-io/node-sdk");
require("dotenv").config({ path: "../.env.local" });
const ReviewModel = require("./models/Review");
const AppointmentModel = require("./models/Appointment");
const AvailabilityModel = require("./models/Availability");
const { DayPilot } = require("@daypilot/daypilot-lite-react");
const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://ulearncc:aammmulearn@ulearn.jjcv6kg.mongodb.net/users?retryWrites=true&w=majority&appName=ULearn",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => console.log(err));

/**
 * @route POST /login
 * @access Public
 * @description Log in an existing user with their email address and password
 */
app.post("/login", (req, res) => {
  const { email } = req.body;
  UserModel.findOne({ email: email }).then((user) => {
    if (user) {
      res.json(user);
    } else {
      res.json("not found");
    }
  });
});

/**
 * @route POST /findTutor
 * @access Public
 * @description Find a tutor by their email address
 */
app.post("/findTutor", (req, res) => {
  const { email } = req.body;
  TutorModel.findOne({ email: email }).then((tutor) => {
    if (tutor) {
      res.json("found");
    } else {
      res.json("not found");
    }
  });
});

/**
 * @route GET /getTutorByEmail
 * @access Public
 * @description Get a tutor by their email address
 */
app.get("/getTutorByEmail", async (req, res) => {
  const { email } = req.query; // Use req.query to extract email from query parameters
  try {
    const tutor = await TutorModel.findOne({ email: email });
    if (tutor) {
      res.status(200).json(tutor);
    } else {
      res.status(404).json({ message: "Tutor not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching tutor or not found" });
  }
});

/**
 * @route POST /bookAppointment
 * @access Public
 * @description Creates an appointment in the database. This object represents a request to book a tutoring session.
 */
app.post("/bookAppointment", async (req, res) => {
  const { userClerkId, userName, appointments } = req.body;
  try {
    const existingAppointment = await AppointmentModel.findOne({ userClerkId });
    if (existingAppointment) {
      existingAppointment.appointments.push(...appointments);
      await existingAppointment.save();
    } else {
      const newAppointment = new AppointmentModel({
        userClerkId,
        userName,
        appointments,
      });
      await newAppointment.save();
    }

    res.status(200).json({ message: "Appointment saved successfully" });
  } catch (error) {
    console.error("Error saving appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @route GET /appointments/:userClerkId
 * @access Public
 * @description Fetch all appointments for a user
 * @param {String} clerkId - The clerkId of the user
 */
app.get("/appointments/:userClerkId", async (req, res) => {
  const { userClerkId } = req.params;
  try {
    const appointments = await AppointmentModel.find({ userClerkId });
    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @route GET /getAvailability
 * @access Public
 * @description Fetch all availabilities for a tutor
 * @param {String} email - The email of the tutor
 */
app.get("/getAvailability", async (req, res) => {
  const { tutoremail } = req.query;

  if (!tutoremail) {
    return res.status(400).send({ error: "Tutor email is required" });
  }

  try {
    const tutor = await AvailabilityModel.findOne({ tutorEmail: tutoremail });
    if (tutor) {
      res.json(tutor);
    } else {
      console.log("Tutor not found");
      res.status(404).json({ message: "Error: Tutor not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching availabilities" });
  }
});

/**
 * @route POST /updatePersonalInfo
 * @access Public
 * @description Update personal information for a user or create a new user if not found
 */
app.post("/updatePersonalInfo", (req, res) => {
  const {
    clerkId,
    email,
    name,
    university,
    year,
    languages,
    image,
    finishedSignUp,
  } = req.body;

  UserModel.findOneAndUpdate(
    { email: email },
    { clerkId, name, university, year, languages, image, finishedSignUp },
    { new: true, upsert: true } // upsert: true will create a new document if no document matches the query
  )
    .then((user) => res.json(user), console.log("User found successfully"))
    .catch((err) => {
      console.error("Error during registration:", err);
      res.status(500).json({ error: "Internal server error" });
    });
});

/**
 * @route POST /updateTutorInfo
 * @access Public
 * @description Update tutor-specific information when editing a tutor profile
 */
app.post("/updateTutorInfo", (req, res) => {
  const { email, description, rate, verifiedCourses } = req.body;
  TutorModel.findOneAndUpdate(
    { email: email },
    { description: description, rate: rate, verifiedCourses: verifiedCourses },
    { new: true },
    { returnOriginal: false }
  )
    .then((tutor) => res.json(tutor))
    .catch((err) => {
      console.error("Tutor not updated:", err);
      res.status(500).json({ error: "Internal server error" });
    });
});

/**
 * @route POST /tutor
 * @access Public
 * @description Register a new tutor and save their info to MongoDB
 */
app.post("/tutors", (req, res) => {
  TutorModel.create(req.body)
    .then((tutors) => res.json(tutors))
    .catch((err) => res.json(err));
});

/**
 * @route POST /register
 * @access Public
 * @description Register a new user and save their info to MongoDB
 */
app.post("/register", (req, res) => {
  UserModel.create(req.body)
    .then((users) => res.json(users))
    .catch((err) => res.json(err));
});

/**
 * @route GET /gettutors
 * @access Public
 * @description Fetch all tutors from the tutor collection
 */
app.get("/gettutors", async (req, res) => {
  try {
    const tutors = await TutorModel.find();
    res.json(tutors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tutors" });
  }
});

/**
 * @route GET /getUserByEmail
 * @access Public
 * @description Get a user by their email address
 */
app.get("/getUserByEmail", async (req, res) => {
  const { email } = req.query; // Use req.query to extract email from query parameters
  try {
    const user = await UserModel.findOne({ email: email });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching user or not found" });
  }
});

const STREAM_VIDEO_API_KEY = process.env.VITE_STREAM_VIDEO_API_KEY;
const STREAM_VIDEO_SECRET_KEY = process.env.STREAM_VIDEO_SECRET_KEY;

/**
 * @route POST /getVideoToken
 * @access Public
 * @type {StreamClient}
 * @description Generate a token for a user to join a new video call
 **/
app.post("/getVideoToken", (req, res) => {
  const user = req.body;
  if (!user) {
    throw new Error("User not found");
  }
  if (!STREAM_VIDEO_API_KEY || !STREAM_VIDEO_SECRET_KEY) {
    throw new Error("Missing API Key");
  }
  const client = new StreamClient(
    STREAM_VIDEO_API_KEY,
    STREAM_VIDEO_SECRET_KEY
  );
  const date = new Date().getTime();
  const exp = Math.round(date / 1000) + 60 * 60;
  const issued = Math.floor(date / 1000) - 60;
  const token = client.createToken(user.id, exp, issued);
  res.send(token);
});

/**
 * @route POST /getChatToken
 * @access Public
 * @type {StreamClient}
 * @description Generate a token for the user to start a new chat channel
 **/
app.post("/getChatToken", (req, res) => {
  const user = req.body;
  if (!user) {
    throw new Error("User not found");
  }
  if (!STREAM_VIDEO_API_KEY || !STREAM_VIDEO_SECRET_KEY) {
    throw new Error("Missing API Key");
  }
  const client = new StreamClient(
    STREAM_VIDEO_API_KEY,
    STREAM_VIDEO_SECRET_KEY
  );
  const token = client.createToken(user.id);
  res.send(token);
});

/**
 * @route POST /reviews
 * @access Public
 * @description add a review of a tutor
 */
app.post("/reviews", async (req, res) => {
  const { tutorEmail, studentEmail, rate, description } = req.body;

  try {
    // Extract the actual email address if studentEmail is an object
    const email =
      typeof studentEmail === "object"
        ? studentEmail.emailAddress
        : studentEmail;

    // Check if the user trying to post a review exists
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newReview = {
      studentEmail: email,
      user: user._id, // Using user._id to reference the user
      rate,
      description,
      createdAt: new Date(),
    };

    // Find the tutor and update the review and starCountArray
    const tutor = await ReviewModel.findOne({ tutorEmail: tutorEmail });

    if (tutor) {
      // Tutor exists, update the reviews and starCountArray
      tutor.reviews.push(newReview);
      tutor.starCountArray[rate - 1] =
        (tutor.starCountArray[rate - 1] || 0) + 1;

      // Update average rating
      //const tutorSchema = await TutorModel.findOne({ tutorEmail: tutorEmail });

      const totalReviews = tutor.reviews.length;
      const totalStars = tutor.starCountArray.reduce(
        (sum, count, index) => sum + count * (index + 1),
        0
      );
      //tutorSchema.averageRating = totalReviews > 0 ? totalStars / totalReviews : 0;

      // Find the tutor and update the review reference
      const tutorSchema = await TutorModel.findOneAndUpdate(
        { email: tutorEmail },
        { $set: { starCountArray: tutor.starCountArray } }, // Update or add the reference field
        { new: true, upsert: true } // Return the updated document, create if not exists
      );
      await tutor.save();

      await tutorSchema.save();
      res.json(tutor);
    } else {
      // Tutor does not exist, create a new document with the review and starCountArray
      const newTutor = new ReviewModel({
        tutorEmail: tutorEmail,
        starCountArray: Array(5).fill(0), // Initialize with zeros
        reviews: [newReview],
      });
      newTutor.starCountArray[rate - 1] = 1;

      // Find the tutor and update the review reference
      const tutorSchema = await TutorModel.findOneAndUpdate(
        { email: tutorEmail },
        { $set: { starCountArray: newTutor.starCountArray } }, // Update or add the reference field
        { new: true, upsert: true } // Return the updated document, create if not exists
      );

      await newTutor.save();
      await tutorSchema.save();

      res.json(newTutor);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @route GET /reviews/:tutorEmail
 * @access Public
 * @description get all reviews for a tutor
 */

app.get("/reviews/:tutorEmail", async (req, res) => {
  const { tutorEmail } = req.params;
  try {
    const reviews = await ReviewModel.find({ tutorEmail }).populate(
      "reviews.user"
    );
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @route GET /aggregatedTutors
 * @access Public
 * @description Get all aggregated tutor data, including user details and reviews.
 */
app.get("/aggregatedTutors", async (req, res) => {
  try {
    // Fetch all tutors
    const tutors = await TutorModel.find();

    // Fetch user details and reviews for each tutor
    const aggregatedTutors = await Promise.all(
      tutors.map(async (tutor) => {
        const user = await UserModel.findOne({ email: tutor.email });
        //const review = await ReviewModel.findOne({ tutorEmail: tutor.email });
        // Ensure starCountArray is defined and initialized
        let starCountArray = tutor.starCountArray ?? [];

        // If starCountArray is still empty, initialize it with 0s
        if (starCountArray.length === 0) {
          starCountArray = Array(5).fill(0);
        }

        const totalStars = starCountArray.reduce(
          (sum, count, index) => sum + count * (index + 1),
          0
        );
        const totalReviews = starCountArray.reduce(
          (sum, count) => sum + count,
          0
        );
        const rating =
          totalReviews > 0 ? Math.floor(totalStars / totalReviews) : 0; // if tutors have no reviews, set rating to 0, else take the average and round it down to the nearest integer

        return {
          name: user.name,
          email: user.email,
          image: user.image,
          courses: tutor.verifiedCourses,
          price: tutor.rate,
          rating: rating || 0,
          languages: user.languages || [],
        };
      })
    );

    res.json(aggregatedTutors);
  } catch (error) {
    console.error("Error aggregating tutor data:", error);
    res.status(500).send("Server error");
  }
});

/**
 * @route POST /availability
 * @access Public
 * @description Add availability for a tutor
 */
app.post('/availability', async (req, res) => {
  const { tutorEmail, eventID, startTime, endTime } = req.body;

  const newAvailability = {
      eventID: eventID,
      startTime: startTime,
      endTime: endTime,
  };

  try {
      // Find the tutor and update the availability
      const tutor = await AvailabilityModel.findOne({ tutorEmail: tutorEmail });

      if (tutor) {
          // Tutor exists, update the availability
          tutor.availableTimes.push(newAvailability);

          await tutor.save();
          res.json(tutor);
      } else {
          // Tutor does not exist, create a new document with the availability
          const newTutor = new AvailabilityModel({
              tutorEmail,
              availableTimes: [newAvailability],
          });

          await newTutor.save();
          res.json(newTutor);
      }
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @route GET /availability/:tutorEmail
 * @access Public
 * @description gets all the availabilities for a given tutor
 */
app.get('/availability/:tutorEmail', async (req, res) => {
  const { tutorEmail } = req.params;

  try {
      const tutor = await AvailabilityModel.findOne({ tutorEmail });

      if (!tutor) {
          return res.status(404).json({ message: 'Tutor not found' });
      }

      res.json(tutor.availableTimes);
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @route DELETE /availability/:tutorEmail/:eventID
 * @access Public
 * @description deletes a given event for a selected tutor
 */
app.delete('/availability/:tutorEmail/:eventID', async (req, res) => {
  const { tutorEmail, eventID } = req.params;

  try {
      const tutor = await AvailabilityModel.findOneAndUpdate(
          { tutorEmail: tutorEmail },
          { $pull: { availableTimes: { eventID: eventID } } },
          { new: true }
      );

      if (!tutor) {
          return res.status(404).json({ message: 'Tutor or event not found' });
      }

      res.json({ message: 'Event deleted successfully' });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
  }
});


/**
 * @route PUT /availability/:tutorEmail/:eventID
 * @access Public
 * @description updates a given event for a selected tutor
 */
app.put('/availability/:tutorEmail/:eventID', async (req, res) => {
  const { tutorEmail, eventID } = req.params;
  const { newStart, newEnd } = req.body;

  try {
      const tutor = await AvailabilityModel.findOneAndUpdate(
          { tutorEmail: tutorEmail, 'availableTimes.eventID': eventID },
          { $set: { 'availableTimes.$.startTime': newStart, 'availableTimes.$.endTime': newEnd } },
          { new: true }
      );

      if (!tutor) {
          return res.status(404).json({ message: 'Tutor or event not found' });
      }

      res.json({ message: 'Event updated successfully', updatedEvent: tutor });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
  }
});


/**
 * @route PATCH /updateAppointmentStatus
 * @access Public
 * @description Updates an appointment's status.
 */
app.patch('/updateAppointmentStatus', async (req, res) => {
  const { clerkId, otherId, status } = req.body;
  try {
    const appointment = await AppointmentModel.findOne({ userClerkId: clerkId }); 
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    
    const appointmentToUpdate = appointment.appointments.find(app => app.otherClerkId === otherId);
    if (!appointmentToUpdate) {
      return res.status(404).json({ error: "Appointment with specified otherClerkId not found" });
    }

    appointmentToUpdate.status = status;
    await appointment.save();
    
    res.json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @route POST /updateAvailabilityAfterAccept
 * @access Public
 * @description Updates a tutor's availability after accepting an appointment.
 */
app.post('/updateAvailabilityAfterAccept', async (req, res) => {
  const { newAppointmentStartTime, newAppointmentEndTime, tutorEmail } = req.body;
  const startTime = new Date(newAppointmentStartTime);
  const endTime = new Date(newAppointmentEndTime);
  try {
    const user = await AvailabilityModel.findOne({ tutorEmail: tutorEmail });
    if (user) {
      const availableTimeIndex = user.availableTimes.findIndex(time =>
        new Date(time.startTime).getTime() <= startTime.getTime() &&
        new Date(time.endTime).getTime() >= endTime.getTime()
      );
      if (availableTimeIndex !== -1) {
        const availableTime = user.availableTimes[availableTimeIndex];
        if (availableTime.startTime.getTime() === startTime.getTime() &&
            availableTime.endTime.getTime() === endTime.getTime()) {
          user.availableTimes.splice(availableTimeIndex, 1);
        } else if (availableTime.startTime.getTime() === startTime.getTime()) {
          user.availableTimes[availableTimeIndex].startTime = endTime;
        } else if (availableTime.endTime.getTime() === endTime.getTime()) {
          user.availableTimes[availableTimeIndex].endTime = startTime;
        } else {
          user.availableTimes.splice(availableTimeIndex, 1, 
            { 
              eventID: DayPilot.guid(),
              startTime: availableTime.startTime, 
              endTime: startTime 
            },
            {
              eventID: DayPilot.guid(),
              startTime: endTime,
              endTime: availableTime.endTime
            }
          );
        }
        await user.save();
        res.status(200).json({ message: 'Availability updated successfully' });
      } else {
        res.status(404).json({ message: 'No matching available time found for the new appointment' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ message: 'Error updating availability', error: error.message });
  }
});

/**
 * @route POST /deleteAppointment
 * @access Public
 * @description Deletes an appointment.
 */
app.post('/deleteAppointment', async (req, res) => {

  const { clerkId, otherId } = req.body;
 
    try {
      const appointment = await AppointmentModel.findOne({ userClerkId: clerkId });
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }
  
      const appointmentIndex = appointment.appointments.findIndex(app => app.otherClerkId === otherId);
      if (appointmentIndex === -1) {
        return res.status(404).json({ error: "Appointment with specified otherClerkId not found" });
      }
  
      appointment.appointments.splice(appointmentIndex, 1);
      await appointment.save();
  
      res.json({ message: "Appointment deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  
});


app.listen("3001", () => {
  console.log(`Server started on port 3001`);
});
