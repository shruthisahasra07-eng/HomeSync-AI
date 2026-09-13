import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, Loader2, X } from 'lucide-react';

export default function VoiceInputButton({ onTranscript, disabled = false }) {
  const [isSupported, setIsSupported] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check browser compatibility for SpeechRecognition API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const handleStartRecording = () => {
    setErrorMessage('');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage("Voice input isn't supported in this browser. You can type your maintenance problem instead.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = navigator.language || 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setIsProcessing(false);
        setErrorMessage('');
      };

      recognition.onresult = (event) => {
        let currentInterim = '';
        let finalizedChunk = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalizedChunk += transcript + ' ';
          } else {
            currentInterim += transcript;
          }
        }

        if (finalizedChunk.trim()) {
          onTranscript(finalizedChunk.trim());
        }

        setInterimText(currentInterim);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition event error:', event.error);
        setIsListening(false);
        setIsProcessing(false);
        setInterimText('');

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorMessage('Microphone access was denied. You can type your maintenance problem instead.');
        } else if (event.error === 'no-speech') {
          setErrorMessage('No speech was detected. Please tap to speak again or type your complaint.');
        } else {
          setErrorMessage("Voice input isn't available right now. You can type your maintenance problem instead.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setIsProcessing(false);
        setInterimText('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to initialize speech recognition:', err);
      setIsListening(false);
      setIsProcessing(false);
      setErrorMessage("Voice input isn't available. You can type your maintenance problem instead.");
    }
  };

  const handleStopRecording = () => {
    setIsProcessing(true);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        setIsListening(false);
        setIsProcessing(false);
      }
    }
  };

  const toggleRecording = () => {
    if (isListening) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  return (
    <div className="flex flex-col items-end">
      {/* Voice Toggle Button */}
      {isListening ? (
        <button
          type="button"
          onClick={handleStopRecording}
          disabled={disabled}
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border border-red-300 bg-red-50 text-red-700 font-semibold text-xs shadow-xs hover:bg-red-100 transition-all cursor-pointer animate-pulse"
          title="Click to stop voice recording"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
          <span>🔴 Listening... Tap to stop</span>
        </button>
      ) : isProcessing ? (
        <button
          type="button"
          disabled
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border border-teal-200 bg-teal-50 text-teal-700 font-semibold text-xs opacity-80"
        >
          <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
          <span>Converting speech to text...</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={toggleRecording}
          disabled={disabled}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-teal-200/80 bg-teal-50/70 hover:bg-teal-100 text-teal-800 font-semibold text-xs shadow-xs transition-all cursor-pointer hover:shadow-sm disabled:opacity-50"
          title="Click to dictate your maintenance issue via voice"
        >
          <Mic className="w-3.5 h-3.5 text-teal-600" />
          <span>🎙️ Speak Your Problem</span>
        </button>
      )}

      {/* Live Interim Transcript Bubble while recording */}
      {isListening && interimText && (
        <div className="mt-2 p-2 bg-teal-50 border border-teal-200 rounded-xl text-xs text-navy-primary font-medium max-w-xs animate-in fade-in-50">
          <span className="text-[10px] uppercase font-bold text-teal-700 block mb-0.5">Hearing:</span>
          "{interimText}..."
        </div>
      )}

      {/* Graceful Error / Permission Notice */}
      {errorMessage && (
        <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900 font-medium flex items-start space-x-2 max-w-sm animate-in fade-in-50">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-[11px] leading-snug">{errorMessage}</div>
          <button
            type="button"
            onClick={() => setErrorMessage('')}
            className="text-amber-500 hover:text-amber-700 p-0.5"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
