// components/voice-button.tsx
"use client";

import { useState } from "react";
import { Mic, MicOff } from "lucide-react";

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
}

export default function VoiceButton({ onTranscript }: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Your browser does not support voice input.");
      return;
    }

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false; // Only one utterance
    recognition.interimResults = false; // No interim results

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      setIsListening(false); // Always stop UI state after recognition ends
    };

    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    // @ts-ignore
    if (window.recognitionInstance) {
      // @ts-ignore
      window.recognitionInstance.stop();
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`p-3 rounded-full ${
        isListening
          ? "bg-red-500 text-white"
          : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
      } hover:opacity-90 transition-opacity`}
      title={isListening ? "Stop recording" : "Start voice input"}
    >
      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
    </button>
  );
}
