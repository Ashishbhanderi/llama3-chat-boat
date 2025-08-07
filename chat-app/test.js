#!/usr/bin/env node

// Test script for the consolidated server
const axios = require('axios');

const BASE_URL = 'http://localhost:3001'; // Updated port

async function testAPI() {
  console.log('🧪 Testing Chat Application API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    console.log('');

    // Test Ollama connection
    console.log('2. Testing Ollama connection...');
    const ollamaResponse = await axios.get(`${BASE_URL}/api/test-ollama`);
    console.log('✅ Ollama test passed:', ollamaResponse.data);
    console.log('');

    // Test chat endpoint
    console.log('3. Testing chat endpoint...');
    const chatResponse = await axios.post(`${BASE_URL}/api/chat`, {
      prompt: 'Hello, how are you?',
      apiKey: 'test-key'
    });
    console.log('✅ Chat test passed:', chatResponse.data);
    console.log('');

    console.log('🎉 All tests passed! The server is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAPI();