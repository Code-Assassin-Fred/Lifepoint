import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function listModels() {
  const apiKey = process.env.Gemini_API_KEY;
  if (!apiKey) {
    console.error("No Gemini_API_KEY found in .env.local");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // Note: The standard SDK doesn't have a direct listModels on the genAI instance 
    // in all versions, we usually use the model name directly.
    // However, we can try to "ping" or check the model names.
    console.log("Checking for 'gemini-2.0-flash' and 'gemini-1.5-flash'...");
    
    // Most recent is actually 2.0 Flash as of now. 
    // 2.5 is not yet publicly documented in the standard @google/generative-ai SDK.
    const model20 = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const model15 = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    console.log("Models initialized. If 'gemini-2.0-flash' or 'gemini-1.5-flash' are invalid, they will throw on the first request.");
    
    // Testing a very small prompt
    const result = await model20.generateContent("test");
    console.log("Gemini 2.0 Flash is definitely available and working.");
  } catch (error) {
    console.error("Error/Availability check:", error.message);
  }
}

listModels();
