const express = require("express");

const router = express.Router();

const {
    generateTestResponse,
    generateTrainerResponse
} = require("../services/aiService");


// ------------------------------------
// TEST AI
// GET /api/ai/test
// ------------------------------------

router.get("/test", async (req, res) => {

    try {

        const result = await generateTestResponse();

        res.status(200).json({
            success: true,
            message: result
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "AI test failed"
        });

    }

});


// ------------------------------------
// AI TRAINER
// POST /api/ai/chat
// ------------------------------------

router.post("/chat", async (req, res) => {

    try {

        const {
            user,
            message,
            conversation
        } = req.body;


        // Validate message

        if (!message || message.trim() === "") {

            return res.status(400).json({
                success: false,
                message: "Message is required"
            });

        }


        // Generate AI response

        const reply = await generateTrainerResponse(
            user || {},
            message,
            conversation || []
        );


        // Send response

        res.status(200).json({
            success: true,
            reply: reply
        });


    } catch (error) {

        console.error("AI Trainer Route Error:", error);

        res.status(500).json({
            success: false,
            message: "AI Trainer failed to generate a response"
        });

    }

});


module.exports = router;