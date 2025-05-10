"use client";
import React, { useState, useEffect } from "react";
import * as toxicity from "@tensorflow-models/toxicity";
import "@tensorflow/tfjs";
import { supabase } from "../supabaseClient";
import { negativeKeywords, positiveKeywords } from "../../sentimentKeywords";

export default function Home() {
  // State variables
  const [session, setSession] = useState(null);
  const [focus, setFocus] = useState("");
  const [quote, setQuote] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [model, setModel] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Load toxicity model on component mount
  useEffect(() => {
    const loadModel = async () => {
      const toxicityModel = await toxicity.load();
      setModel(toxicityModel);
    };
    loadModel();
  }, []);

  // Check for keywords in text to determine sentiment
  const keywordSentiment = (text) => {
    const lower = text.toLowerCase();
    if (negativeKeywords.some((kw) => lower.includes(kw))) return "negative";
    if (positiveKeywords.some((kw) => lower.includes(kw))) return "positive";
    return null;
  };

  // Analyze text using rule-based approach or ML model
  const checkSentiment = async (text) => {
    const ruleBased = keywordSentiment(text);
    if (ruleBased) return ruleBased;

    if (model) {
      const predictions = await model.classify(text);
      const toxic = predictions.find((p) => p.label === "toxicity");
      return toxic?.results[0]?.match ? "negative" : "positive";
    }
    return "neutral";
  };

  // Handle analyze button click
  const handleAnalyzeClick = async () => {
    setAnalyzing(true);
    const sentiment = await checkSentiment(focus);

    // Deep keyword match for customized responses
    const lowerFocus = focus.toLowerCase();

    if (sentiment === "positive") {
      if (lowerFocus.includes("productive") || lowerFocus.includes("study")) {
        setAiResponse("Awesome! You're in the zone. 📚 Keep pushing forward!");
      } else if (
        lowerFocus.includes("happy") ||
        lowerFocus.includes("excited")
      ) {
        setAiResponse("Love the vibe! Keep spreading that positive energy. ✨");
      } else {
        setAiResponse("Glad to hear that! Keep up the good energy today. 💪");
      }
    } else if (sentiment === "negative") {
      if (
        lowerFocus.includes("die") ||
        lowerFocus.includes("worthless") ||
        lowerFocus.includes("end it")
      ) {
        setAiResponse(
          "I'm really concerned about how you're feeling. Please consider talking to someone you trust or reaching out to a mental health professional. You matter. ❤️"
        );
      } else if (
        lowerFocus.includes("sad") ||
        lowerFocus.includes("depressed")
      ) {
        setAiResponse(
          "I'm here for you. It's okay to feel this way—you're not alone. 💙 Take it one step at a time."
        );
      } else {
        setAiResponse(
          "Feeling low happens, but you're stronger than you think. Let's turn this day around together. 🌈"
        );
      }
    } else {
      if (!focus.trim()) {
        setAiResponse("Please enter something so I can help you better. 🤔");
      } else {
        setAiResponse("Thanks for sharing. Let's make the most of today. 🌱");
      }
    }

    setAnalyzing(false);
  };

  useEffect(() => {
    const quotes = [
      "Stay focused and never give up.",
      "Today is a new chance to grow.",
      "Small steps every day lead to big changes.",
      "Discipline is the bridge between goals and accomplishment.",
      "You are capable of amazing things.",
    ];

    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

    const getSessionAndUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      setSession(sessionData.session);
    };

    getSessionAndUser();
  }, []); // Empty dependency array means this only runs once

  return (
    <div className="min-h-screen w-full bg-gray-100">
      {/* Main Content */}
      <div className="max-w-5xl mx-auto py-12 px-8">
        {!session ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">
              Welcome to Todo App
            </h2>
            <div className="text-gray-600 text-lg mb-6">
              Please log in to continue and manage your tasks.
            </div>
            <button className="bg-blue-900 text-white px-6 py-3 rounded-md hover:bg-blue-800 transition">
              Login to Continue
            </button>
          </div>
        ) : (
          <>
            {/* About Section */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-3xl font-bold text-blue-900 mb-4">
                ABOUT Todo App
              </h2>

              <div className="flex flex-col md:flex-row gap-8 items-center">
                {/* Left side - illustration */}
                <div className="md:w-1/3">{/* Removed Skeleton here */}</div>

                {/* Right side - text content */}
                <div className="md:w-2/3">
                  <div className="text-lg text-gray-700 mb-4">
                    {quote && (
                      <blockquote className="italic text-gray-600 mb-4 border-l-4 border-blue-900 pl-4 py-2">
                        "{quote}"
                      </blockquote>
                    )}
                  </div>
                  <p className="text-gray-700">
                    {quote
                      ? "Our advanced AI helps you manage your tasks while providing motivation and support tailored to your mood and needs."
                      : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Task Focus Section */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold text-blue-900 mb-6">
                🎯 WHAT'S YOUR FOCUS FOR TODAY?
              </h2>

              <div className="mb-6">
                <input
                  type="text"
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  placeholder="Study for exam, complete project, exercise..."
                  className="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                />
                <button
                  onClick={handleAnalyzeClick}
                  className="mt-4 bg-blue-900 text-white px-6 py-3 rounded-md hover:bg-blue-800 transition w-full md:w-auto"
                >
                  {analyzing ? "Analyzing..." : "Analyze Input"}
                </button>
              </div>

              {/* AI Response Section */}
              {aiResponse && (
                <div className="mt-8 p-6 rounded-lg bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg">
                  <h3 className="text-xl font-bold mb-3">Our RESPONSE:</h3>
                  <p className="text-lg">{aiResponse}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
