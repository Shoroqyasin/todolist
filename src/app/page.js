"use client";
import React, { useState, useEffect } from "react";
import * as toxicity from "@tensorflow-models/toxicity";
import "@tensorflow/tfjs";
import { supabase } from "../supabaseClient";
import { negativeKeywords, positiveKeywords } from "../../sentimentKeywords";

export default function Home() {
  const [session, setSession] = useState(null);
  const [focus, setFocus] = useState("");
  const [mood, setMood] = useState("");
  const [quote, setQuote] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [model, setModel] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const loadModel = async () => {
      const toxicityModel = await toxicity.load();
      setModel(toxicityModel);
    };
    loadModel();
  }, []);

  const keywordSentiment = (text) => {
    const lower = text.toLowerCase();
    if (negativeKeywords.some((kw) => lower.includes(kw))) return "negative";
    if (positiveKeywords.some((kw) => lower.includes(kw))) return "positive";
    return null;
  };

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

  const handleAnalyzeClick = async () => {
    setAnalyzing(true);
    const sentiment = await checkSentiment(focus);

    // Deep keyword match (optional refinement)
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
        setAiResponse("Thanks for sharing. Let’s make the most of today. 🌱");
      }
    }

    setAnalyzing(false);
  };

  const moods = ["😊", "😐", "😔"];
  const quotes = [
    "Stay focused and never give up.",
    "Today is a new chance to grow.",
    "Small steps every day lead to big changes.",
    "Discipline is the bridge between goals and accomplishment.",
    "You are capable of amazing things.",
  ];

  useEffect(() => {
    const getSessionAndUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      setSession(sessionData.session);
    };
    getSessionAndUser();
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto font-sans">
      <h1 className="text-4xl font-bold mb-4">📋 Task Manager</h1>

      {!session ? (
        <p>Please log in to continue.</p>
      ) : (
        <>
          <p className="text-xl mb-2 font-semibold">Welcome back!</p>
          <blockquote className="italic text-gray-600 mb-4">
            “{quote}”
          </blockquote>

          <div className="mt-8">
            <label className="text-lg font-semibold">
              🎯 What's your focus for today?
            </label>
            <input
              type="text"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="E.g., Study for exam"
              className="w-full p-3 mt-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAnalyzeClick}
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {analyzing ? "Analyzing..." : "Analyze Input"}
            </button>

            <div className="mt-6">
              <label className="text-lg font-semibold">
                😊 How are you feeling today?
              </label>
              <div className="mt-2">
                {moods.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setMood(emoji)}
                    className={`text-3xl mr-3 p-2 rounded-full focus:outline-none ${
                      mood === emoji ? "bg-gray-300" : ""
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {aiResponse && (
              <div className="mt-6 p-4 rounded-lg shadow-md">
                <strong className="text-xl">AI Response:</strong>
                <p className="mt-2 text-lg">{aiResponse}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
