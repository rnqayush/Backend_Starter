import React, { createContext, useState, useContext, useEffect } from 'react';
import { stories as initialStoriesRaw, currentUser, getContactById } from '../data/mockData';
import { isStoryExpired, getTimeRemaining } from '../utils/statusUtils';

// Create the story context
const StoryContext = createContext();

// Custom hook to use the story context
export const useStory = () => useContext(StoryContext);

// Story provider component
export const StoryProvider = ({ children }) => {
  // Transform the initial stories to match our structure and filter out expired content
  const initialStories = initialStoriesRaw.map(story => {
    // Filter out expired content
    const validContent = story.content
      .filter(item => !isStoryExpired(item.timestamp))
      .map(item => {
        return {
          ...item,
          content: item.url || item.text,
          type: item.type,
          backgroundColor: item.backgroundColor,
          textColor: item.fontColor,
          fontFamily: 'Arial, sans-serif',
          timeRemaining: getTimeRemaining(item.timestamp)
        };
      });
      
    // Only include stories that have valid content
    if (validContent.length === 0) {
      return null;
    }
    
    return {
      ...story,
      content: validContent,
      privacy: story.privacy || 'my_contacts', // Default privacy setting
      muted: story.muted || false, // Default mute setting
      replies: story.replies || [] // Initialize replies array
    };
  }).filter(Boolean); // Remove null stories (those with all expired content)
  
  const [stories, setStories] = useState(initialStories);
  const [activeStory, setActiveStory] = useState(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [showStoryCreator, setShowStoryCreator] = useState(false);

  // Function to add a new story
  const addStory = (content, privacy = 'my_contacts', selectedContacts = []) => {
    // Find if the user already has a story
    const userStory = stories.find(story => story.userId === currentUser.id);
    
    const timestamp = new Date().toISOString();
    const newContent = {
      id: userStory ? userStory.content.length + 1 : 1,
      ...content,
      timestamp: timestamp,
      viewers: [],
      timeRemaining: getTimeRemaining(timestamp)
    };
    
    if (userStory) {
      // Add content to existing story
      const updatedStories = stories.map(story => {
        if (story.userId === currentUser.id) {
          return {
            ...story,
            content: [...story.content, newContent],
            privacy: privacy,
            selectedContacts: selectedContacts,
            lastUpdated: timestamp
          };
        }
        return story;
      });
      
      setStories(updatedStories);
    } else {
      // Create a new story for the user
      const newStory = {
        id: stories.length + 1,
        userId: currentUser.id,
        content: [newContent],
        privacy: privacy,
        selectedContacts: selectedContacts,
        lastUpdated: timestamp,
        replies: [],
        muted: false
      };
      
      setStories([...stories, newStory]);
    }
  };

  // Function to view a story
  const viewStory = (storyId, contentId) => {
    // Mark the story as viewed by the current user
    const updatedStories = stories.map(story => {
      if (story.id === storyId) {
        const updatedContent = story.content.map(item => {
          if (item.id === contentId && !item.viewers.includes(currentUser.id)) {
            return {
              ...item,
              viewers: [...item.viewers, currentUser.id]
            };
          }
          return item;
        });
        
        return {
          ...story,
          content: updatedContent
        };
      }
      return story;
    });
    
    setStories(updatedStories);
  };

  // Function to delete a story content
  const deleteStoryContent = (contentId) => {
    // Only allow deletion of the current user's stories
    const updatedStories = stories.map(story => {
      if (story.userId === currentUser.id) {
        const updatedContent = story.content.filter(item => item.id !== contentId);
        
        // If no content left, remove the entire story
        if (updatedContent.length === 0) {
          return null;
        }
        
        return {
          ...story,
          content: updatedContent
        };
      }
      return story;
    }).filter(Boolean); // Remove null entries
    
    setStories(updatedStories);
    
    // If the active story was deleted, close the viewer
    if (activeStory && activeStory.userId === currentUser.id) {
      setShowStoryViewer(false);
      setActiveStory(null);
    }
  };

  // Function to get all contacts with stories
  const getContactsWithStories = () => {
    const storyUserIds = stories.map(story => story.userId);
    return storyUserIds.map(id => {
      if (id === currentUser.id) {
        return { ...currentUser, hasStory: true };
      }
      const contact = getContactById(id);
      return contact ? { ...contact, hasStory: true } : null;
    }).filter(Boolean);
  };

  // Function to check if a user has unviewed stories
  const hasUnviewedStories = (userId) => {
    const userStory = stories.find(story => story.userId === userId);
    if (!userStory) return false;
    
    return userStory.content.some(item => !item.viewers.includes(currentUser.id));
  };
  
  // Function to update story time remaining
  const updateTimeRemaining = () => {
    const updatedStories = stories.map(story => {
      // Skip if story is null
      if (!story) return null;
      
      // Update time remaining for each content item
      const updatedContent = story.content.map(item => ({
        ...item,
        timeRemaining: getTimeRemaining(item.timestamp)
      }));
      
      // Filter out expired content
      const validContent = updatedContent.filter(item => !isStoryExpired(item.timestamp));
      
      // If no valid content, return null to filter out the story
      if (validContent.length === 0) return null;
      
      return {
        ...story,
        content: validContent
      };
    }).filter(Boolean); // Remove null stories
    
    setStories(updatedStories);
  };
  
  // Update time remaining every minute
  useEffect(() => {
    const interval = setInterval(updateTimeRemaining, 60000);
    return () => clearInterval(interval);
  }, [stories]);
  
  // Function to add a reply to a story
  const addReply = (storyId, contentId, replyText) => {
    const updatedStories = stories.map(story => {
      if (story.id === storyId) {
        const reply = {
          id: story.replies ? story.replies.length + 1 : 1,
          userId: currentUser.id,
          contentId: contentId,
          text: replyText,
          timestamp: new Date().toISOString()
        };
        
        return {
          ...story,
          replies: [...(story.replies || []), reply]
        };
      }
      return story;
    });
    
    setStories(updatedStories);
  };
  
  // Function to mute/unmute a user's stories
  const toggleMuteStory = (userId) => {
    const updatedStories = stories.map(story => {
      if (story.userId === userId) {
        return {
          ...story,
          muted: !story.muted
        };
      }
      return story;
    });
    
    setStories(updatedStories);
  };
  
  // Function to update privacy settings
  const updatePrivacySettings = (privacy, selectedContacts = []) => {
    const updatedStories = stories.map(story => {
      if (story.userId === currentUser.id) {
        return {
          ...story,
          privacy: privacy,
          selectedContacts: selectedContacts
        };
      }
      return story;
    });
    
    setStories(updatedStories);
  };
  
  // Function to get replies for a story
  const getStoryReplies = (storyId) => {
    const story = stories.find(s => s.id === storyId);
    return story?.replies || [];
  };

  // Context value
  const value = {
    stories,
    activeStory,
    setActiveStory,
    activeStoryIndex,
    setActiveStoryIndex,
    showStoryViewer,
    setShowStoryViewer,
    showStoryCreator,
    setShowStoryCreator,
    addStory,
    viewStory,
    deleteStoryContent,
    getContactsWithStories,
    hasUnviewedStories,
    addReply,
    getStoryReplies,
    toggleMuteStory,
    updatePrivacySettings,
    updateTimeRemaining
  };

  return (
    <StoryContext.Provider value={value}>
      {children}
    </StoryContext.Provider>
  );
};

export default StoryContext;
