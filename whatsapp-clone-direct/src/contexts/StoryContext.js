import React, { createContext, useState, useContext, useEffect } from 'react';
import { stories as initialStories, currentUser, getContactById } from '../data/mockData';

// Create the story context
const StoryContext = createContext();

// Custom hook to use the story context
export const useStory = () => useContext(StoryContext);

// Story provider component
export const StoryProvider = ({ children }) => {
  const [stories, setStories] = useState(initialStories);
  const [activeStory, setActiveStory] = useState(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [showStoryCreator, setShowStoryCreator] = useState(false);

  // Function to add a new story
  const addStory = (content) => {
    // Find if the user already has a story
    const userStory = stories.find(story => story.userId === currentUser.id);
    
    if (userStory) {
      // Add content to existing story
      const updatedStories = stories.map(story => {
        if (story.userId === currentUser.id) {
          return {
            ...story,
            content: [
              ...story.content,
              {
                id: story.content.length + 1,
                ...content,
                timestamp: new Date().toISOString(),
                viewers: []
              }
            ]
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
        content: [
          {
            id: 1,
            ...content,
            timestamp: new Date().toISOString(),
            viewers: []
          }
        ]
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
    hasUnviewedStories
  };

  return (
    <StoryContext.Provider value={value}>
      {children}
    </StoryContext.Provider>
  );
};

export default StoryContext;

