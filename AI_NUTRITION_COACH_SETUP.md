# AI Nutrition Coach Setup

Your diet recommendations page now features a real AI chatbot powered by Hugging Face! Here's how to set it up:

## 1. Get a Hugging Face API Key

1. Go to [Hugging Face](https://huggingface.co/) and create a free account
2. Navigate to your [Access Tokens page](https://huggingface.co/settings/tokens)
3. Click "New token" and create a token with "Read" permissions
4. Copy your API key

## 2. Configure Your Environment

1. Open your `.env` file
2. Replace `your_huggingface_api_key_here` with your actual API key:
   ```
   VITE_HUGGINGFACE_API_KEY=hf_your_actual_api_key_here
   ```

## 3. Features

### AI Nutrition Coach

- **Smart Conversations**: Uses Hugging Face's BlenderBot model for natural, helpful responses
- **Personalized Advice**: Incorporates your fitness profile (age, weight, height, BMI)
- **Safety First**: Built-in disclaimers and reminders to consult healthcare professionals
- **Fallback System**: Works even without API key using intelligent rule-based responses

## 4. Safety & Disclaimers

The AI coach includes multiple safety measures:

- **Prominent Warning**: Clear disclaimer on the page about AI limitations
- **Built-in Reminders**: AI responses include reminders about professional consultation
- **General Advice Only**: Emphasizes that advice is for general information only
- **Healthcare Referrals**: Consistently recommends consulting registered dietitians and healthcare providers

## 5. Usage Tips

### For Best AI Results:

- Ask specific questions: "Create a 1800-calorie meal plan for muscle gain"
- Mention your preferences: "I'm vegetarian and need high-protein meals"
- Be conversational: "What should I eat before workouts?"

### Example Questions:

- "How many calories should I eat to lose weight?"
- "Suggest high-protein vegetarian meals"
- "Create a meal plan for my goals"
- "What foods help with muscle building?"
- "I have a nut allergy, what protein sources can I use?"

## 6. Models Used

- **Primary**: `facebook/blenderbot-400M-distill` - Optimized for conversational AI
- **Fallback**: Intelligent rule-based responses when API is unavailable

## 7. Privacy & Safety

- Your conversations are not stored permanently
- The AI provides general nutrition advice only with clear disclaimers
- Always emphasizes consulting healthcare professionals for medical conditions
- API calls are made directly to Hugging Face (no data stored on our servers)

## 8. Troubleshooting

### No API Key

- The chatbot will use intelligent fallback responses
- You'll still get helpful nutrition advice with safety disclaimers
- Consider getting a free API key for enhanced responses

### API Errors

- Automatic fallback to rule-based responses
- Check your API key is valid and has sufficient quota
- Hugging Face free tier includes generous usage limits

## 9. What Changed

- **Removed**: Old guided setup questionnaire
- **Added**: Full AI-powered conversation interface
- **Enhanced**: Safety disclaimers and professional consultation reminders
- **Improved**: More natural, conversational experience

Enjoy your new AI nutrition coach! 🤖🥗

**Remember**: This is an AI assistant for general information only. Always consult qualified healthcare professionals for personalized medical advice.
