import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the notification context
const NotificationContext = createContext();

// Custom hook to use the notification context
export const useNotification = () => useContext(NotificationContext);

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [settings, setSettings] = useState({
    enabled: true,
    sound: true,
    desktop: true,
    mutedChats: []
  });
  
  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);
  
  // Request notification permission
  const requestPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        return permission;
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return 'denied';
      }
    }
    return 'unsupported';
  };
  
  // Show a notification
  const showNotification = (title, options = {}) => {
    if (!settings.enabled) return null;
    
    // Check if the chat is muted
    if (options.chatId && settings.mutedChats.includes(options.chatId)) {
      return null;
    }
    
    if (notificationPermission !== 'granted') {
      requestPermission().then(permission => {
        if (permission === 'granted') {
          createNotification(title, options);
        }
      });
      return null;
    }
    
    return createNotification(title, options);
  };
  
  // Create and return a notification
  const createNotification = (title, options) => {
    if (!('Notification' in window)) return null;
    
    const notification = new Notification(title, {
      icon: '/logo192.png',
      badge: '/logo192.png',
      ...options
    });
    
    // Play sound if enabled
    if (settings.sound) {
      playNotificationSound();
    }
    
    // Handle notification click
    notification.onclick = () => {
      window.focus();
      notification.close();
      if (options.onClick) options.onClick();
    };
    
    return notification;
  };
  
  // Play notification sound
  const playNotificationSound = () => {
    // In a real app, we would have an audio file
    // For demo purposes, we'll just log it
    console.log('Playing notification sound');
    
    // Uncomment this to actually play a sound
    // const audio = new Audio('/notification.mp3');
    // audio.play();
  };
  
  // Update notification settings
  const updateSettings = (newSettings) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };
  
  // Mute/unmute a chat
  const toggleMuteChat = (chatId) => {
    setSettings(prev => {
      const mutedChats = [...prev.mutedChats];
      const index = mutedChats.indexOf(chatId);
      
      if (index === -1) {
        mutedChats.push(chatId);
      } else {
        mutedChats.splice(index, 1);
      }
      
      return {
        ...prev,
        mutedChats
      };
    });
  };
  
  // Check if a chat is muted
  const isChatMuted = (chatId) => {
    return settings.mutedChats.includes(chatId);
  };
  
  // Context value
  const value = {
    notificationPermission,
    settings,
    requestPermission,
    showNotification,
    updateSettings,
    toggleMuteChat,
    isChatMuted
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;

