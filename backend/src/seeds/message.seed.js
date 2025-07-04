import dotenv from "dotenv";
import {connectDB} from "../lib/db.js";
import {User} from "../models/user.model.js";
import Message from "../models/message.model.js";
import path from "path";

// Load .env from the backend directory
dotenv.config({ path: path.join(process.cwd(), ".env") });

// Sample conversation topics and messages
const conversationTopics = [
  {
    topic: "Weekend Plans",
    messages: [
      "Hey, what are your plans for the weekend?",
      "Not sure yet. Thinking about going hiking. You?",
      "I'm planning to catch up on some reading and maybe watch a movie.",
      "That sounds relaxing! Any book in particular?",
      "I just got 'The Midnight Library'. Heard good things about it.",
      "Oh, I read that last month! You'll love it.",
      "Great! Maybe we can discuss it after I finish."
    ]
  },
  {
    topic: "Project Collaboration",
    messages: [
      "Hi there! How's the project coming along?",
      "It's going well. I've finished the first phase.",
      "That's great news! Need any help with the next steps?",
      "Actually, yes. Could you review the documentation I sent?",
      "Sure thing. I'll take a look at it today.",
      "Thanks! Let me know if you have any questions.",
      "Will do. Let's catch up tomorrow to discuss feedback."
    ]
  },
  {
    topic: "Coffee Meetup",
    messages: [
      "Hey! Want to grab coffee sometime this week?",
      "I'd love to! How about Wednesday afternoon?",
      "Wednesday works for me. 3 PM at the usual place?",
      "Perfect. Looking forward to catching up!",
      "Me too! It's been too long.",
      "By the way, I found this new coffee blend you might like.",
      "Sounds interesting! Bring some details and we can try it."
    ]
  },
  {
    topic: "Tech Discussion",
    messages: [
      "Did you see the announcement about the new tech release?",
      "Yes! I'm really excited about the new features.",
      "Which one is your favorite?",
      "Definitely the improved performance metrics. Game changer!",
      "I'm more impressed with the UI redesign, personally.",
      "That's fair. The whole package is pretty impressive.",
      "We should try building something with it soon."
    ]
  },
  {
    topic: "Movie Recommendations",
    messages: [
      "I'm looking for a good movie to watch tonight. Any recommendations?",
      "What genre are you in the mood for?",
      "Something with suspense, maybe a thriller?",
      "You should check out 'The Prestige' if you haven't seen it.",
      "I've heard of it but never watched it. What's it about?",
      "It's about rival magicians in the late 1800s. Really clever plot twists!",
      "Sounds perfect! I'll watch it tonight. Thanks!"
    ]
  },
  {
    topic: "Travel Plans",
    messages: [
      "I'm thinking about planning a trip next month. Any suggestions?",
      "That sounds exciting! Are you looking for somewhere relaxing or adventurous?",
      "A bit of both, actually. I want to explore but also have time to unwind.",
      "Have you considered Costa Rica? Great beaches and rainforest adventures.",
      "That's a great idea! Have you been there before?",
      "Yes, last year. I can send you some recommendations if you're interested.",
      "That would be amazing! Thanks for the help."
    ]
  },
  {
    topic: "Recipe Exchange",
    messages: [
      "I tried that pasta recipe you shared. It was delicious!",
      "I'm so glad you liked it! Did you make any modifications?",
      "Added some sun-dried tomatoes and extra basil. Worked really well.",
      "That sounds like a great addition. I'll try that next time.",
      "Do you have any other recipes you'd recommend?",
      "Actually, I just found this amazing risotto recipe. I'll send it to you.",
      "Perfect! I've been wanting to try making risotto."
    ]
  },
  {
    topic: "Fitness Goals",
    messages: [
      "How's your new workout routine going?",
      "It's challenging but I'm starting to see results!",
      "That's awesome! What's been the hardest part?",
      "Definitely the early morning sessions. I'm not a morning person.",
      "I can relate to that. Have you tried evening workouts instead?",
      "I might switch to that. What time do you usually go?",
      "Around 6pm. It's a good way to decompress after work."
    ]
  }
];

// Function to generate random date within the last 30 days
const getRandomDate = () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return new Date(thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime()));
};

// Function to create messages between two users
const createConversation = (senderId, receiverId, topic) => {
  const messages = [];
  const { messages: messageTexts } = topic;

  // Base time - start from a random date within the last 30 days
  // Create a more realistic WhatsApp-like conversation flow
  let currentTime = getRandomDate();
  let currentSender = Math.random() > 0.5 ? senderId : receiverId; // Randomly choose who starts
  let consecutiveMessages = 0;
  let lastResponseTime = 0;

  messageTexts.forEach((text, index) => {
    // Determine if we should switch senders
    if (index > 0) {
      // After 1-3 consecutive messages, switch sender (with higher probability as count increases)
      const switchProbability = 0.3 + (consecutiveMessages * 0.2);
      if (Math.random() < switchProbability) {
        currentSender = currentSender === senderId ? receiverId : senderId;
        consecutiveMessages = 0;

        // Add a longer delay when switching senders (someone is "responding")
        // Longer messages take longer to read and respond to
        const responseDelay = 1 + Math.floor(Math.random() * 5) + (messageTexts[index-1].length / 20);
        lastResponseTime = responseDelay * 60 * 1000; // Convert to milliseconds
        currentTime = new Date(currentTime.getTime() + lastResponseTime);
      } else {
        consecutiveMessages++;

        // Quick succession for messages from the same sender (typing delay)
        const typingDelay = 0.2 + (text.length / 100) + (Math.random() * 0.5);
        currentTime = new Date(currentTime.getTime() + typingDelay * 60 * 1000);
      }
    }

    // Occasionally add a longer gap (1-4 hours) to simulate breaks in conversation
    if (index > 0 && Math.random() < 0.15) {
      const breakHours = 1 + Math.floor(Math.random() * 3);
      currentTime = new Date(currentTime.getTime() + breakHours * 60 * 60 * 1000);
    }

    messages.push({
      senderId: currentSender,
      receiverId: currentSender === senderId ? receiverId : senderId,
      text,
      createdAt: new Date(currentTime)
    });
  });

  return messages;
};

const seedDatabase = async () => {
  try {
    await connectDB();

    // Get all users from the database
    const users = await User.find({});

    if (users.length < 2) {
      console.error("Not enough users in the database. Please run the user seed first.");
      process.exit(1);
    }

    console.log(`Found ${users.length} users. Creating conversations...`);

    let allMessages = [];

    // Create conversations between every pair of users
    for (let i = 0; i < users.length; i++) {
      for (let j = 0; j < users.length; j++) {
        // Skip creating conversation with self
        if (i === j) continue;

        // Select a topic based on user pair to ensure different conversations
        // Use a combination of user indices to select a topic
        const topicIndex = (i * users.length + j) % conversationTopics.length;
        const selectedTopic = conversationTopics[topicIndex];

        // Create messages for this conversation
        const conversationMessages = createConversation(
          users[i]._id,
          users[j]._id,
          selectedTopic
        );

        allMessages = [...allMessages, ...conversationMessages];
      }
    }

    // Sort messages by createdAt date
    allMessages.sort((a, b) => a.createdAt - b.createdAt);

    // Delete existing messages
    await Message.deleteMany({});

    // Insert all messages
    await Message.insertMany(allMessages);

    console.log(`Database seeded with ${allMessages.length} messages successfully`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

// Call the function
seedDatabase();
