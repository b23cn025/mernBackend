const { InferenceClient } = require("@huggingface/inference");

const hf = new InferenceClient(process.env.HF_TOKEN);
const AI_MODEL = process.env.AI_MODEL || "meta-llama/Llama-3.1-8B-Instruct";

// Existing/simple AI test
const generateTestResponse = async () => {
    try {
        const response = await hf.chatCompletion({
            model: AI_MODEL,
            messages: [
                {
                    role: "user",
                    content: "Create a simple 3-day beginner workout plan."
                }
            ],
            max_tokens: 500,
            temperature: 0.7
        });

        return response.choices[0].message.content;

    } catch (error) {
        console.error("Hugging Face Error:", error);
        throw error;
    }
};


// AI TRAINER
const generateTrainerResponse = async (userData, message, conversation = []) => {
    try {

        const systemPrompt = `
You are FitnessPass AI Trainer, a virtual fitness coach.

Your job is to help users with:
- Workout recommendations
- Exercise guidance
- Workout modifications
- General nutrition guidance
- Diet suggestions
- Fitness motivation
- Recovery and rest guidance
- Progress-related advice

User information:
Age: ${userData.age || "Not provided"}
Gender: ${userData.gender || "Not provided"}
Height: ${userData.height || "Not provided"} cm
Weight: ${userData.weight || "Not provided"} kg
Fitness Goal: ${userData.goal || "Not provided"}
Experience Level: ${userData.experience || "Not provided"}
Available Equipment: ${userData.equipment || "Not provided"}
Diet Preference: ${userData.diet || "Not provided"}

Important rules:
1. Give practical and understandable fitness advice.
2. Adapt workouts to the user's goal and experience.
3. Consider the available equipment.
4. Give general nutrition guidance when asked.
5. Do not diagnose diseases or medical conditions.
6. Do not prescribe treatment or medication.
7. If the user asks about a medical condition or injury, recommend consulting a qualified healthcare professional.
8. Be encouraging but do not make unrealistic promises.
9. Keep answers reasonably concise.
`;

        const messages = [
            {
                role: "system",
                content: systemPrompt
            },

            // Previous conversation
            ...conversation,

            // Current user question
            {
                role: "user",
                content: message
            }
        ];

        const response = await hf.chatCompletion({
            model: AI_MODEL,
            messages: messages,
            max_tokens: 1000,
            temperature: 0.7
        });

        return response.choices[0].message.content;

    } catch (error) {
        console.error("AI Trainer Error:", error);
        throw error;
    }
};


module.exports = {
    generateTestResponse,
    generateTrainerResponse
};