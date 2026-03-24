import { useState, useRef, useCallback } from 'react';
import { Mic, Square, Loader, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { diseaseService } from '../../services/diseaseService';
import MarketplaceRecommendations from './MarketplaceRecommendations';

const LANGUAGES = [
  { code: 'en-US', label: 'English', flag: '🇬🇧' },
  { code: 'hi-IN', label: 'हिन्दी',  flag: '🇮🇳' },
  { code: 'bn-IN', label: 'বাংলা',   flag: '🇮🇳' },
];

const DISEASE_KEYWORDS = [
  {
    disease: 'Tomato Yellow Leaf Curl Virus',
    class: 'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
    keywords: [
      // English
      'yellow', 'curl', 'curling', 'virus', 'leaf curl',
      // Hindi
      'पीला', 'पीली', 'मुड़ना', 'मुड़', 'वायरस', 'पत्ती मुड़ना',
      // Bengali
      'হলুদ', 'কুঁকড়ে', 'ভাইরাস', 'পাতা কুঁকড়ে',
    ],
  },
  {
    disease: 'Early Blight',
    class: 'Potato___Early_blight',
    keywords: [
      'blight', 'spot', 'brown', 'spots on leaves',
      'झुलसा', 'धब्बा', 'भूरा', 'भूरे धब्बे', 'पत्तों पर धब्बे',
      'পাতায় দাগ', 'বাদামী', 'ঝলসানো', 'দাগ',
    ],
  },
  {
    disease: 'Black Rot',
    class: 'Apple___Black_rot',
    keywords: [
      'rot', 'black', 'rotting', 'decay',
      'सड़न', 'काला', 'काली सड़न', 'गलना',
      'কালো', 'পচা', 'পচন', 'কালো পচন',
    ],
  },
  {
    disease: 'Powdery Mildew',
    class: 'Squash___Powdery_mildew',
    keywords: [
      'powdery', 'white', 'mildew', 'white powder', 'white coating',
      'सफेद', 'चूर्णी', 'फफूंदी', 'सफेद पाउडर', 'सफ़ेद',
      'সাদা', 'গুঁড়ো', 'ছত্রাক', 'সাদা গুঁড়ো',
    ],
  },
  {
    disease: 'Cedar Apple Rust',
    class: 'Apple___Cedar_apple_rust',
    keywords: [
      'rust', 'orange', 'rusty',
      'जंग', 'नारंगी', 'गेरुआ',
      'মরিচা', 'কমলা', 'মরচে',
    ],
  },
  {
    disease: 'Tomato Mosaic Virus',
    class: 'Tomato___Tomato_mosaic_virus',
    keywords: [
      'mosaic', 'pattern', 'mottled', 'streaks',
      'मोज़ेक', 'धारियां', 'चितकबरा',
      'মোজাইক', 'ডোরা', 'ছোপ',
    ],
  },
  {
    disease: 'Bacterial Wilt',
    class: 'Bacterial_Wilt',
    keywords: [
      'wilt', 'droop', 'wilting', 'drooping', 'dying',
      'मुरझाना', 'सूखना', 'झुकना', 'कुम्हलाना', 'मर रहा',
      'নেতিয়ে', 'শুকিয়ে', 'ঝুলে পড়া', 'মরে যাচ্ছে', 'ম্লান',
    ],
  },
  {
    disease: 'Leaf Miner',
    class: 'Leaf_Miner',
    keywords: [
      'miner', 'tunnel', 'lines on leaf', 'worm inside',
      'सुरंग', 'पत्ती में कीड़ा', 'लकीरें',
      'সুড়ঙ্গ', 'পাতায় পোকা', 'দাগ',
    ],
  },
  {
    disease: 'Healthy Plant',
    class: 'Healthy',
    keywords: [
      'healthy', 'good', 'fine', 'normal', 'no problem',
      'स्वस्थ', 'ठीक', 'अच्छा', 'कोई समस्या नहीं', 'सामान्य',
      'সুস্থ', 'ভালো', 'ঠিক আছে', 'কোনো সমস্যা নেই', 'স্বাভাবিক',
    ],
  },
];

function matchDisease(text) {
  const lower = text.toLowerCase();
  for (const entry of DISEASE_KEYWORDS) {
    for (const kw of entry.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        return { diseaseName: entry.disease, predictedClass: entry.class };
      }
    }
  }
  return { diseaseName: 'General Pest Infection', predictedClass: 'General_Pest' };
}

export default function VoiceScanner() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [lang, setLang] = useState('en-US');
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');

  const analyzeTranscript = useCallback((text) => {
    if (!text.trim()) {
      toast.error('No speech detected. Please try again.');
      return;
    }
    setAnalyzing(true);

    setTimeout(() => {
      const matched = matchDisease(text);
      setResult(matched);
      setAnalyzing(false);
      toast.success('Audio analysis complete!');
    }, 1500);
  }, []);

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice recognition is not supported in this browser. Please use Google Chrome.');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;
      recognition.maxAlternatives = 1;

      const selectedLang = LANGUAGES.find(l => l.code === lang);

      recognition.onstart = () => {
        setIsRecording(true);
        setTranscript('');
        setResult(null);
        transcriptRef.current = '';
        toast(`🎤 Listening in ${selectedLang?.label || 'English'}... Speak now!`, { duration: 2000 });
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = 0; i < event.results.length; i++) {
          const r = event.results[i];
          if (r.isFinal) {
            finalTranscript += r[0].transcript;
          } else {
            interimTranscript += r[0].transcript;
          }
        }

        const combined = finalTranscript || interimTranscript;
        transcriptRef.current = combined;
        setTranscript(combined);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);

        switch (event.error) {
          case 'not-allowed':
            toast.error('Microphone access denied. Please allow microphone permission.');
            break;
          case 'no-speech':
            toast.error('No speech detected. Please try again and speak clearly.');
            break;
          case 'network':
            toast.error('Network error. Speech recognition requires an internet connection.');
            break;
          case 'aborted':
            break;
          default:
            toast.error('Speech recognition error: ' + event.error);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      toast.error('Failed to start voice recognition. Please try again.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      const finalText = transcriptRef.current;
      if (finalText) {
        analyzeTranscript(finalText);
      } else {
        toast.error('No speech detected. Please try again.');
      }
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>Voice Symptoms Scanner</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '.88rem', marginBottom: '20px', textAlign: 'center' }}>
        Describe your plant's symptoms in your preferred language.
      </p>

      {/* Language Selector */}
      <div style={{ 
        display: 'flex', gap: '6px', marginBottom: '24px', 
        background: 'var(--surface-low)', padding: '4px', borderRadius: 'var(--radius-full, 999px)' 
      }}>
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            disabled={isRecording}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full, 999px)',
              border: 'none',
              cursor: isRecording ? 'not-allowed' : 'pointer',
              fontSize: '.82rem',
              fontWeight: lang === l.code ? 700 : 500,
              fontFamily: "'Inter', sans-serif",
              background: lang === l.code ? 'var(--primary)' : 'transparent',
              color: lang === l.code ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.2s ease',
              opacity: isRecording ? 0.5 : 1,
            }}
          >
            {l.flag} {l.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="btn btn-primary"
            style={{ borderRadius: '99px', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Mic size={28} />
          </button>
        ) : (
          <button
            onClick={stopRecording}
            style={{
              borderRadius: '99px', width: '64px', height: '64px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: '#ef4444', color: 'white', border: 'none', cursor: 'pointer',
              animation: 'pulse-soft 1.5s infinite',
              boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.4)'
            }}
          >
            <Square size={24} fill="currentColor" />
          </button>
        )}
      </div>

      <div style={{
        width: '100%', minHeight: '80px',
        backgroundColor: 'var(--surface-low)', borderRadius: 'var(--radius)',
        padding: '16px', marginBottom: '20px', border: '1px solid var(--border)'
      }}>
        {isRecording && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '.8rem', marginBottom: '8px', fontWeight: 'bold' }}>
            <span style={{
              width: '8px', height: '8px', backgroundColor: '#ef4444',
              borderRadius: '50%', display: 'inline-block', animation: 'pulse-soft 1s infinite'
            }}></span>
            Recording ({LANGUAGES.find(l => l.code === lang)?.label})...
          </div>
        )}
        <p style={{ color: transcript ? 'var(--text)' : 'var(--text-muted)', fontSize: '.9rem', margin: 0 }}>
          {transcript || (isRecording ? 'Listening...' : 'Click the microphone to start recording.')}
        </p>
      </div>

      {analyzing && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
          <Loader className="spinner" size={18} /> Analyzing symptoms...
        </div>
      )}

      {result && !analyzing && (
        <div style={{ width: '100%' }}>
          <div style={{
            padding: '16px', backgroundColor: 'var(--surface-low)',
            borderRadius: 'var(--radius)', border: '1px solid var(--primary)', marginBottom: '16px'
          }}>
            <h4 style={{ margin: '0 0 8px', color: 'var(--primary)', fontSize: '1rem' }}>Detected Issue</h4>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text)' }}>{result.diseaseName}</p>
          </div>
          <MarketplaceRecommendations diseaseName={result.diseaseName} predictedClass={result.predictedClass} />
        </div>
      )}
    </div>
  );
}
