import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../../firebase/firebaseconfig';
import { collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { Box, Typography, TextField, Button, Paper, List, ListItem, Avatar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';


const preprocess = (text) => {
  // Convert to lowercase
  text = text.toLowerCase();
  
  // Remove punctuation using regex
  text = text.replace(/[^\w\s]/g, "");
  
  // Tokenize by splitting on whitespace
  const tokens = text.split(/\s+/);
  
  // Filter out common stop words
  const stopWords = ['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 
                    'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 
                    'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 
                    'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 
                    'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 
                    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 
                    'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 
                    'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 
                    'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 
                    'through', 'during', 'before', 'after', 'above', 'below', 'to', 
                    'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 
                    'again', 'further', 'then', 'once'];
  
  return tokens.filter(word => !stopWords.includes(word));
};

// Response patterns
const responses = {
  "hello": ["Hi there! How can I assist you today?", "Hello! Welcome to our customer support.", "Hey there! What can I help you with?"],
  "hi": ["Hello! How can I help you today?", "Hi there! What brings you to our support?"],
  "help": ["I'm here to help! What issue are you experiencing?", "I'd be happy to assist you. Could you describe your problem?"],
  "product": ["Our products come with a 1-year warranty. What specific product do you have questions about?", "We offer various products. Could you specify which one you're interested in?"],
  "order": ["To check your order status, please provide your order number.", "Is there an issue with your recent order? I can help track it."],
  "return": ["Our return policy allows returns within 30 days of purchase. Would you like more details?", "To process a return, you'll need your order confirmation and the item in its original packaging."],
  "shipping": ["Standard shipping takes 3-5 business days. Express shipping is 1-2 business days.", "Shipping is free for orders over $50. Is your order not arriving on time?"],
  "payment": ["We accept all major credit cards, PayPal, and Apple Pay.", "Is there an issue with your payment? I can help resolve that."],
  "price": ["Our prices are competitive and we often have seasonal discounts.", "Are you looking for information about pricing on a specific item?"],
  "discount": ["You can use code WELCOME10 for 10% off your first purchase!", "We send exclusive discount codes to our newsletter subscribers."],
  "contact": ["You can reach our customer service at support@example.com or call 1-800-123-4567.", "Would you like me to connect you with a human representative?"],
  "speak": ["I'll connect you with a human representative shortly. Please stay online.", "Would you like me to transfer you to a customer service agent?"],
  "human": ["I'll connect you with a human representative shortly. Please stay online.", "I understand you'd like to speak with a person. I'll arrange that for you."],
  "thanks": ["You're welcome! Is there anything else I can help with?", "Happy to help! Don't hesitate to reach out if you need anything else."],
  "thank": ["You're welcome! Is there anything else I can help with?", "Happy to help! Don't hesitate to reach out if you need anything else."],
  "bye": ["Thank you for chatting with us today! Have a great day.", "Goodbye! Feel free to return if you have more questions."],
  "default": ["I'm not sure I understand. Could you please rephrase that?", "I'd like to help, but I'm not sure what you're asking. Could you provide more details?", "I'm still learning! Could you try asking in a different way?"]
};

const ChatbotAssistant = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your virtual assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const user = auth.currentUser;

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, [messages]);
  

  // Save chat to Firestore
  const saveChat = async (userMessage, botResponse) => {
    try {
      if (user) {
        await addDoc(collection(db, "chat_history"), {
          userId: user.uid,
          userEmail: user.email || "",
          userMessage,
          botResponse,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error("Error saving chat:", error);
    }
  };
  


  // Generate bot response
  const getBotResponse = (userInput) => {
    const tokens = preprocess(userInput);
    
    // Check for keywords in the processed tokens
    for (const token of tokens) {
      if (responses[token]) {
        return responses[token][Math.floor(Math.random() * responses[token].length)];
      }
    }
    
    // If no specific keywords match, check for partial matches
    for (const keyword in responses) {
      if (userInput.toLowerCase().includes(keyword)) {
        return responses[keyword][Math.floor(Math.random() * responses[keyword].length)];
      }
    }
    
    // Default response if no matches
    return responses["default"][Math.floor(Math.random() * responses["default"].length)];
  };

  const handleSend = async () => {
    if (input.trim() === '') return;
    
    // Add user message
    const userMessage = input.trim();
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setInput('');
    setLoading(true);
    
    // Simulate processing time
    setTimeout(async () => {
      const botResponse = getBotResponse(userMessage);
      setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
      setLoading(false);
      
      // Save the conversation to Firestore
      await saveChat(userMessage, botResponse);
      
      // If user wants to speak to a human, create an assistance request
      if (userMessage.toLowerCase().includes('human') || 
          userMessage.toLowerCase().includes('speak to someone') ||
          userMessage.toLowerCase().includes('real person')) {
        try {
          await addDoc(collection(db, "assistance_requests"), {
            userId: user?.uid || "anonymous",
            email: user?.email || "anonymous",
            issue: "Customer requested human assistance: " + userMessage,
            timestamp: new Date()
          });
          setMessages(prev => [...prev, { 
            text: "I've created an assistance request. A customer service representative will contact you soon.", 
            sender: 'bot' 
          }]);
        } catch (error) {
          console.error("Error creating assistance request:", error);
        }
      }
    }, 1000);
  };

  return (
    <Box sx={{ 
      backgroundColor: '#fff', 
      borderRadius: '20px', 
      boxShadow: '0px 8px 20px rgba(0,0,0,.12)',
      padding: '30px',
      height: '500px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Typography variant="h5" sx={{ 
        marginBottom: '20px', 
        fontWeight: 'bold',
        color: '#4A90E2'
      }}>
        Virtual Assistant
      </Typography>
      
      <Paper elevation={0} sx={{ 
        flex: 1, 
        overflow: 'auto',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '15px',
        marginBottom: '20px'
      }}>
        <List>
          {messages.map((message, index) => (
            <ListItem 
              key={index} 
              sx={{ 
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                padding: '5px 0'
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'flex-start',
                flexDirection: message.sender === 'user' ? 'row-reverse' : 'row'
              }}>
                <Avatar sx={{ 
                  bgcolor: message.sender === 'user' ? '#c9e4ca' : '#4A90E2',
                  marginRight: message.sender === 'user' ? 0 : '10px',
                  marginLeft: message.sender === 'user' ? '10px' : 0
                }}>
                  {message.sender === 'user' ? <PersonIcon /> : <SmartToyIcon />}
                </Avatar>
                <Paper sx={{ 
                  padding: '10px 15px',
                  borderRadius: '18px',
                  maxWidth: '70%',
                  backgroundColor: message.sender === 'user' ? '#c9e4ca' : '#e3f2fd',
                  boxShadow: '0px 2px 5px rgba(0,0,0,0.05)'
                }}>
                  <Typography variant="body1">{message.text}</Typography>
                </Paper>
              </Box>
            </ListItem>
          ))}
          {loading && (
            <ListItem sx={{ justifyContent: 'flex-start' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: '#4A90E2', marginRight: '10px' }}>
                  <SmartToyIcon />
                </Avatar>
                <Paper sx={{ 
                  padding: '10px 15px',
                  borderRadius: '18px',
                  backgroundColor: '#e3f2fd'
                }}>
                  <Typography>Typing...</Typography>
                </Paper>
              </Box>
            </ListItem>
          )}
          <div ref={messagesEndRef} />
        </List>
      </Paper>
      
      <Box sx={{ display: 'flex', gap: '10px' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          sx={{ 
            '& .MuiOutlinedInput-root': {
              borderRadius: '25px',
              backgroundColor: '#f5f5f5'
            }
          }}
        />
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSend}
          disabled={loading || input.trim() === ''}
          sx={{ 
            borderRadius: '50%', 
            minWidth: '50px',
            width: '50px',
            height: '50px',
            backgroundColor: '#4A90E2'
          }}
        >
          <SendIcon />
        </Button>
      </Box>
    </Box>
  );
};

export default ChatbotAssistant;