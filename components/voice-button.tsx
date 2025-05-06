"use client"

import { useState, useEffect } from "react"
import { Mic, MicOff } from "lucide-react"
import { motion } from "framer-motion"

interface VoiceButtonProps {
  onTranscript: (text: string) => void
}

export default function VoiceButton({ onTranscript }: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const [transcript, setTranscript] = useState("")

  useEffect(() => {
    // Check if SpeechRecognition is supported
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setIsSupported(false)
    }
  }, [])

  const toggleListening = () => {
    if (!isSupported) return

    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const startListening = () => {
    setIsListening(true)
    setTranscript("")

    // @ts-ignore - TypeScript doesn't know about webkitSpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onresult = (event: any) => {
      let interimTranscript = ""
      let finalTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      setTranscript(finalTranscript || interimTranscript)
    }

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      if (transcript) {
        onTranscript(transcript)
      }
    }

    recognition.start()

    // Store recognition instance to stop it later
    // @ts-ignore
    window.recognitionInstance = recognition
  }

  const stopListening = () => {
    setIsListening(false)
    // @ts-ignore
    if (window.recognitionInstance) {
      // @ts-ignore
      window.recognitionInstance.stop()
    }

    if (transcript) {
      onTranscript(transcript)
    }
  }

  if (!isSupported) {
    return (
      <button
        className="p-3 bg-gray-200 text-gray-500 rounded-full opacity-50 cursor-not-allowed"
        disabled
        title="Voice input not supported in this browser"
      >
        <MicOff size={20} />
      </button>
    )
  }

  return (
    <motion.button
      className={`p-3 rounded-full ${
        isListening ? "bg-red-500 text-white" : "bg-blue-500 text-white hover:bg-blue-600"
      }`}
      onClick={toggleListening}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.1 }}
      title={isListening ? "Stop recording" : "Start voice input"}
    >
      {isListening ? (
        <div className="relative">
          <Mic size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping"></span>
        </div>
      ) : (
        <Mic size={20} />
      )}
    </motion.button>
  )
}
