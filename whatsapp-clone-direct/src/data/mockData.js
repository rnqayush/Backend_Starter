// Mock data for the WhatsApp clone

// User profile data
export const currentUser = {
  id: 1,
  name: "John Doe",
  avatar: "https://randomuser.me/api/portraits/men/1.jpg",
  status: "Available",
  phone: "+1 (555) 123-4567"
};

// Contacts list
export const contacts = [
  {
    id: 2,
    name: "Sarah Johnson",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    status: "At work",
    phone: "+1 (555) 234-5678",
    lastSeen: "today at 12:30 PM",
    isOnline: true
  },
  {
    id: 3,
    name: "Michael Brown",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    status: "Battery about to die",
    phone: "+1 (555) 345-6789",
    lastSeen: "today at 10:45 AM",
    isOnline: false
  },
  {
    id: 4,
    name: "Emily Davis",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    status: "In a meeting",
    phone: "+1 (555) 456-7890",
    lastSeen: "yesterday at 8:20 PM",
    isOnline: false
  },
  {
    id: 5,
    name: "David Wilson",
    avatar: "https://randomuser.me/api/portraits/men/5.jpg",
    status: "Available",
    phone: "+1 (555) 567-8901",
    lastSeen: "today at 1:15 PM",
    isOnline: true
  },
  {
    id: 6,
    name: "Jessica Taylor",
    avatar: "https://randomuser.me/api/portraits/women/6.jpg",
    status: "Busy",
    phone: "+1 (555) 678-9012",
    lastSeen: "yesterday at 6:30 PM",
    isOnline: false
  },
  {
    id: 7,
    name: "Work Group",
    avatar: "https://randomuser.me/api/portraits/men/7.jpg",
    status: "8 members",
    phone: "",
    lastSeen: "",
    isGroup: true,
    members: [2, 3, 4, 5, 1, 8, 9, 10]
  },
  {
    id: 8,
    name: "James Anderson",
    avatar: "https://randomuser.me/api/portraits/men/8.jpg",
    status: "At the gym",
    phone: "+1 (555) 789-0123",
    lastSeen: "today at 9:00 AM",
    isOnline: false
  },
  {
    id: 9,
    name: "Sophia Martinez",
    avatar: "https://randomuser.me/api/portraits/women/9.jpg",
    status: "On vacation",
    phone: "+1 (555) 890-1234",
    lastSeen: "Monday at 3:45 PM",
    isOnline: false
  },
  {
    id: 10,
    name: "Daniel Thompson",
    avatar: "https://randomuser.me/api/portraits/men/10.jpg",
    status: "Available",
    phone: "+1 (555) 901-2345",
    lastSeen: "today at 2:00 PM",
    isOnline: true
  },
  {
    id: 11,
    name: "Family Group",
    avatar: "https://randomuser.me/api/portraits/women/11.jpg",
    status: "5 members",
    phone: "",
    lastSeen: "",
    isGroup: true,
    members: [1, 2, 5, 9, 10]
  }
];

// Chat history
export const chats = [
  {
    id: 1,
    contactId: 2,
    messages: [
      {
        id: 1,
        senderId: 2,
        text: "Hey, how are you doing?",
        timestamp: "2023-08-18T10:30:00",
        status: "read"
      },
      {
        id: 2,
        senderId: 1,
        text: "I'm good, thanks! How about you?",
        timestamp: "2023-08-18T10:32:00",
        status: "read"
      },
      {
        id: 3,
        senderId: 2,
        text: "Doing well! Just wanted to check if we're still on for dinner tonight?",
        timestamp: "2023-08-18T10:33:00",
        status: "read"
      },
      {
        id: 4,
        senderId: 1,
        text: "Absolutely! Let's meet at the Italian place at 7.",
        timestamp: "2023-08-18T10:35:00",
        status: "read"
      },
      {
        id: 5,
        senderId: 2,
        text: "Perfect! See you then.",
        timestamp: "2023-08-18T10:36:00",
        status: "read"
      }
    ],
    unreadCount: 0,
    lastMessageTimestamp: "2023-08-18T10:36:00"
  },
  {
    id: 2,
    contactId: 3,
    messages: [
      {
        id: 1,
        senderId: 1,
        text: "Hey Michael, did you get the project files I sent?",
        timestamp: "2023-08-17T14:20:00",
        status: "read"
      },
      {
        id: 2,
        senderId: 3,
        text: "Yes, I got them. I'll review them today.",
        timestamp: "2023-08-17T14:25:00",
        status: "read"
      },
      {
        id: 3,
        senderId: 1,
        text: "Great! Let me know if you have any questions.",
        timestamp: "2023-08-17T14:26:00",
        status: "read"
      },
      {
        id: 4,
        senderId: 3,
        text: "Will do. Thanks!",
        timestamp: "2023-08-17T14:27:00",
        status: "read"
      }
    ],
    unreadCount: 0,
    lastMessageTimestamp: "2023-08-17T14:27:00"
  },
  {
    id: 3,
    contactId: 4,
    messages: [
      {
        id: 1,
        senderId: 4,
        text: "Hi John! Are you coming to the meeting tomorrow?",
        timestamp: "2023-08-18T09:15:00",
        status: "read"
      },
      {
        id: 2,
        senderId: 1,
        text: "Yes, I'll be there. What time is it again?",
        timestamp: "2023-08-18T09:17:00",
        status: "read"
      },
      {
        id: 3,
        senderId: 4,
        text: "It's at 10 AM in the main conference room.",
        timestamp: "2023-08-18T09:18:00",
        status: "read"
      },
      {
        id: 4,
        senderId: 1,
        text: "Perfect, thanks for the reminder!",
        timestamp: "2023-08-18T09:20:00",
        status: "read"
      },
      {
        id: 5,
        senderId: 4,
        text: "No problem! See you there.",
        timestamp: "2023-08-18T09:21:00",
        status: "read"
      },
      {
        id: 6,
        senderId: 4,
        text: "Also, don't forget to bring your laptop for the presentation.",
        timestamp: "2023-08-18T09:22:00",
        status: "delivered"
      }
    ],
    unreadCount: 1,
    lastMessageTimestamp: "2023-08-18T09:22:00"
  },
  {
    id: 4,
    contactId: 7,
    messages: [
      {
        id: 1,
        senderId: 2,
        text: "Hey everyone, welcome to our work group!",
        timestamp: "2023-08-16T11:00:00",
        status: "read"
      },
      {
        id: 2,
        senderId: 3,
        text: "Thanks for setting this up!",
        timestamp: "2023-08-16T11:02:00",
        status: "read"
      },
      {
        id: 3,
        senderId: 1,
        text: "Great to have everyone here. Let's use this for project updates.",
        timestamp: "2023-08-16T11:05:00",
        status: "read"
      },
      {
        id: 4,
        senderId: 4,
        text: "Sounds good to me!",
        timestamp: "2023-08-16T11:07:00",
        status: "read"
      },
      {
        id: 5,
        senderId: 5,
        text: "I've shared the latest project timeline in our shared folder.",
        timestamp: "2023-08-16T11:10:00",
        status: "read"
      },
      {
        id: 6,
        senderId: 2,
        text: "Thanks David! Everyone please review it by tomorrow.",
        timestamp: "2023-08-16T11:12:00",
        status: "read"
      }
    ],
    unreadCount: 0,
    lastMessageTimestamp: "2023-08-16T11:12:00"
  },
  {
    id: 5,
    contactId: 5,
    messages: [
      {
        id: 1,
        senderId: 5,
        text: "John, do you have the login details for the client portal?",
        timestamp: "2023-08-18T13:40:00",
        status: "read"
      },
      {
        id: 2,
        senderId: 1,
        text: "Let me check and get back to you.",
        timestamp: "2023-08-18T13:42:00",
        status: "read"
      },
      {
        id: 3,
        senderId: 1,
        text: "I've sent them to your email just now.",
        timestamp: "2023-08-18T13:45:00",
        status: "read"
      },
      {
        id: 4,
        senderId: 5,
        text: "Got it, thanks!",
        timestamp: "2023-08-18T13:46:00",
        status: "read"
      },
      {
        id: 5,
        senderId: 5,
        text: "By the way, are you joining us for lunch?",
        timestamp: "2023-08-18T13:47:00",
        status: "delivered"
      }
    ],
    unreadCount: 1,
    lastMessageTimestamp: "2023-08-18T13:47:00"
  }
];

// Function to get chat by contact ID
export const getChatByContactId = (contactId) => {
  return chats.find(chat => chat.contactId === contactId) || {
    id: Math.max(...chats.map(c => c.id)) + 1,
    contactId,
    messages: [],
    unreadCount: 0,
    lastMessageTimestamp: new Date().toISOString()
  };
};

// Function to get contact by ID
export const getContactById = (contactId) => {
  return contacts.find(contact => contact.id === contactId);
};

// Function to format timestamp
export const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Function to format date for chat list
export const formatChatListDate = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

