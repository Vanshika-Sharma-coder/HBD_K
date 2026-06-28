import { useState, useEffect, useRef } from 'react';
import './App.css';

// Memory timeline items leading up to July 18th
const MEMORIES = [
  {
    date: 'June 28',
    title: 'The Countdown Begins',
    desc: 'The start of our sweet anticipation. A special journey in time, counting down to the day the world became a brighter place because of you.',
    icon: '✨',
    image: '', // Replace with actual photo URL e.g. '/photos/img1.jpg'
    top: '15%',
    left: '10%',
    planetClass: 'planet-1',
    unlockedAtStart: true
  },
  {
    date: 'July 01',
    title: 'Late Night Chats',
    desc: 'Conversations that stretched into the early morning hours, sharing dreams, secrets, and silences. Finding comfort in every word we spoke.',
    icon: '💬',
    image: '', 
    top: '30%',
    left: '25%',
    planetClass: 'planet-2',
    unlockedAtStart: true
  },
  {
    date: 'July 05',
    title: 'Echoes of Laughter',
    desc: 'Those silly inside jokes, shared smiles, and the beautiful warmth of laughing together. You make the ordinary feel completely extraordinary.',
    icon: '😊',
    image: '', 
    top: '65%',
    left: '15%',
    planetClass: 'planet-3',
    unlockedAtStart: true
  },
  {
    date: 'July 10',
    title: 'A Warm Promise',
    desc: 'Through every twist and turn, finding a safe harbor in our connection. A quiet reminder that I am always in your corner, cheering you on.',
    icon: '🤝',
    image: '', 
    top: '80%',
    left: '35%',
    planetClass: 'planet-4',
    unlockedAtStart: true
  },
  {
    date: 'July 15',
    title: 'Quiet Anticipation',
    desc: 'Holding all these beautiful memories close as we draw nearer to your special day. The excitement builds, and the countdown ticks closer.',
    icon: '💫',
    image: '', 
    top: '45%',
    left: '80%',
    planetClass: 'planet-5',
    unlockedAtStart: true
  },
  {
    date: 'July 18',
    title: 'The Grand Celebration',
    desc: 'Happy Birthday to the most special person! Today, we celebrate your light, your heart, and the sheer joy you bring to everyone around you.',
    icon: '🎂',
    image: '', 
    top: '75%',
    left: '75%',
    planetClass: 'planet-6',
    unlockedAtStart: false // Only unlocks on the actual date or in simulation mode
  }
];

function App() {
  // Target date: July 18, 2026 00:00:00 (local time)
  const targetDate = new Date('2026-07-18T00:00:00');

  // Time remaining state
  const [timeLeft, setTimeLeft] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
    isOver: false
  });

  // State to simulate/test Birthday Mode since July 18 is in the future
  const [simulatedBirthday, setSimulatedBirthday] = useState(false);
  const [selectedMemoryIndex, setSelectedMemoryIndex] = useState(0);
  const [activeModalMemory, setActiveModalMemory] = useState(null);
  
  // Audio state
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioCtxRef = useRef(null);
  const audioTimerRef = useRef(null);

  // Envelope and gift state
  const [giftOpened, setGiftOpened] = useState(false);
  const [candleBlown, setCandleBlown] = useState(false);
  const [showSmoke, setShowSmoke] = useState(false);
  const [typedMessage, setTypedMessage] = useState('');
  const [typingIndex, setTypingIndex] = useState(0);
  const [isWishMade, setIsWishMade] = useState(false);
  const candleRef = useRef(null);

  const fullLetterMessage = `To Someone Special,

On this beautiful day, July 18th, I want to celebrate you. You bring so much warmth, laughter, and light into my world. Every memory we share is a treasure, and every moment spent with you is a gift.

May this new year of your life be filled with endless smiles, magical adventures, and the realization of all your dreams.

Happy Birthday! 🎂✨

With all my heart,
Your Special Someone ❤️`;

  // Calculate actual countdown time left
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft({
          days: '00',
          hours: '00',
          minutes: '00',
          seconds: '00',
          isOver: true
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({
        days: String(days).padStart(2, '0'),
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
        isOver: false
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, []);

  // Determine if it is Birthday Mode
  const isBirthday = timeLeft.isOver || simulatedBirthday;

  // Track isBirthday in a ref for the background canvas animation
  const isBirthdayRef = useRef(isBirthday);
  useEffect(() => {
    isBirthdayRef.current = isBirthday;
  }, [isBirthday]);

  // Secret "K" 5-times listener for simulating birthday
  const kCountRef = useRef(0);
  const kTimerRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 'k') {
        kCountRef.current += 1;
        
        // Reset count if they don't press it fast enough (within 3 seconds)
        if (kTimerRef.current) clearTimeout(kTimerRef.current);
        kTimerRef.current = setTimeout(() => {
          kCountRef.current = 0;
        }, 3000);

        // If 'K' is pressed 5 times, toggle birthday mode
        if (kCountRef.current >= 5) {
          kCountRef.current = 0;
          setSimulatedBirthday(prev => {
            const nextState = !prev;
            if (nextState) {
              // Reset all celebration states when activating
              setGiftOpened(false);
              setCandleBlown(false);
              setIsWishMade(false);
              setTypedMessage('');
              setTypingIndex(0);
              setSelectedMemoryIndex(0);
            }
            return nextState;
          });
        }
      } else {
        // Reset if any other key is pressed
        kCountRef.current = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (kTimerRef.current) clearTimeout(kTimerRef.current);
    };
  }, []);

  // Handle typing effect for the birthday letter
  useEffect(() => {
    if (giftOpened && typingIndex < fullLetterMessage.length) {
      const timer = setTimeout(() => {
        setTypedMessage(prev => prev + fullLetterMessage[typingIndex]);
        setTypingIndex(prev => prev + 1);
      }, 35);
      return () => clearTimeout(timer);
    }
  }, [giftOpened, typingIndex]);

  // Audio synthesis using Web Audio API (bell chimes / warm chords)
  const initAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  };

  const playSynthNote = (freq, time, duration, volume = 0.12) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, time);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 1.5, time); // Fifth overtone

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, time);
    filter.frequency.exponentialRampToValueAtTime(150, time + duration);

    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(volume, time + 0.08); // soft attack
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration); // smooth release

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration);
    osc2.stop(time + duration);
  };

  const playSynthesizedMelody = () => {
    if (!audioCtxRef.current) return;
    const now = audioCtxRef.current.currentTime;

    // A beautiful, nostalgic Cmaj9 - Fmaj7 - Am9 - Gsus chord/melody loop
    const chords = [
      // Fmaj9
      { freq: 174.61, delay: 0 },   // F3
      { freq: 261.63, delay: 0.2 }, // C4
      { freq: 329.63, delay: 0.4 }, // E4
      { freq: 392.00, delay: 0.6 }, // G4
      { freq: 523.25, delay: 1.2 }, // C5 chime

      // Cmaj9
      { freq: 130.81, delay: 3.0 }, // C3
      { freq: 196.00, delay: 3.2 }, // G3
      { freq: 293.66, delay: 3.4 }, // D4
      { freq: 329.63, delay: 3.6 }, // E4
      { freq: 587.33, delay: 4.2 }, // D5 chime

      // Am9
      { freq: 110.00, delay: 6.0 }, // A2
      { freq: 220.00, delay: 6.2 }, // A3
      { freq: 261.63, delay: 6.4 }, // C4
      { freq: 329.63, delay: 6.6 }, // E4
      { freq: 659.25, delay: 7.2 }, // E5 chime

      // Gsus4 -> G
      { freq: 98.00, delay: 9.0 },   // G2
      { freq: 196.00, delay: 9.2 },  // G3
      { freq: 261.63, delay: 9.4 },  // C4
      { freq: 293.66, delay: 9.6 },  // D4
      { freq: 493.88, delay: 10.2 }  // B4 chime
    ];

    chords.forEach(note => {
      playSynthNote(note.freq, now + note.delay, 3.5, 0.1);
    });

    // Loop every 12 seconds
    audioTimerRef.current = setTimeout(playSynthesizedMelody, 12000);
  };

  const toggleAudio = () => {
    initAudioContext();
    if (isAudioPlaying) {
      if (audioTimerRef.current) {
        clearTimeout(audioTimerRef.current);
      }
      setIsAudioPlaying(false);
    } else {
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      setIsAudioPlaying(true);
      playSynthesizedMelody();
    }
  };

  // Clean up audio loop
  useEffect(() => {
    return () => {
      if (audioTimerRef.current) {
        clearTimeout(audioTimerRef.current);
      }
    };
  }, []);

  // Canvas particle animations (Stars, sparks, confetti)
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // Particle arrays
    const stars = [];
    const confetti = [];
    const sparks = [];
    const shootingStars = [];

    // Initialize background stars
    for (let i = 0; i < 70; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.2 + 0.4,
        alpha: Math.random(),
        fadeSpeed: Math.random() * 0.008 + 0.002,
        glow: Math.random() > 0.85
      });
    }

    const confettiColors = ['#ffd1dc', '#ffb3c1', '#e2c275', '#c084fc', '#b39ddb', '#eae6df'];

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw and update stars
      stars.forEach(star => {
        star.alpha += star.fadeSpeed;
        if (star.alpha > 1 || star.alpha < 0) {
          star.fadeSpeed = -star.fadeSpeed;
        }
        star.alpha = Math.max(0, Math.min(1, star.alpha));

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fill();

        if (star.glow) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(226, 194, 117, ${star.alpha * 0.12})`;
          ctx.fill();
        }
      });

      // Draw and update confetti (if birthday mode active)
      if (isBirthdayRef.current && confetti.length < 90 && Math.random() < 0.12) {
        confetti.push({
          x: Math.random() * canvas.width,
          y: -10,
          size: Math.random() * 6 + 3,
          color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
          speedX: Math.random() * 2 - 1,
          speedY: Math.random() * 1.8 + 1,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: Math.random() * 0.02 - 0.01
        });
      }

      for (let i = confetti.length - 1; i >= 0; i--) {
        const c = confetti[i];
        c.x += c.speedX + Math.sin(c.y * 0.025) * 0.4;
        c.y += c.speedY;
        c.rotation += c.rotationSpeed;

        if (c.y > canvas.height + 10 || c.x < -10 || c.x > canvas.width + 10) {
          confetti.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rotation);
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size);
        ctx.restore();
      }

      // Draw and update sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.04; // gravity
        s.life -= 1;

        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * (s.life / 60), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(226, 194, 117, ${s.life / 60})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#e2c275';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw and update shooting stars
      if (Math.random() < 0.005 && shootingStars.length < 2) {
        shootingStars.push({
          x: Math.random() * canvas.width * 1.5,
          y: Math.random() * canvas.height * 0.5,
          length: Math.random() * 80 + 40,
          speed: Math.random() * 15 + 15,
          angle: Math.PI / 4 + Math.random() * 0.2, // angled downwards right-to-left
          opacity: 1
        });
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x -= Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.opacity -= 0.015;

        if (ss.opacity <= 0) {
          shootingStars.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        const grad = ctx.createLinearGradient(ss.x, ss.y, ss.x + Math.cos(ss.angle) * ss.length, ss.y - Math.sin(ss.angle) * ss.length);
        grad.addColorStop(0, `rgba(255, 255, 255, ${ss.opacity})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x + Math.cos(ss.angle) * ss.length, ss.y - Math.sin(ss.angle) * ss.length);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    // Trigger spark burst globally
    window.triggerSparkBurst = (x, y) => {
      for (let i = 0; i < 70; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1.2;
        sparks.push({
          x: x || canvas.width / 2,
          y: y || canvas.height / 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.2,
          size: Math.random() * 2.5 + 1.2,
          life: Math.random() * 30 + 30
        });
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      delete window.triggerSparkBurst;
    };
  }, []);

  // Handle candle blow action
  const blowCandle = (e) => {
    if (candleBlown) return;

    // Get candle client coords for spark position
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    if (candleRef.current) {
      const rect = candleRef.current.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top;
    }

    // Play a gentle soft wind/puff chime sound using Web Audio
    if (audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      playSynthNote(523.25, now, 0.15, 0.05); // C5
      playSynthNote(783.99, now + 0.08, 0.3, 0.08); // G5
      playSynthNote(1046.50, now + 0.16, 0.5, 0.05); // C6
    }

    setCandleBlown(true);
    setShowSmoke(true);
    setTimeout(() => setShowSmoke(false), 1500);

    // Trigger particle burst
    if (window.triggerSparkBurst) {
      window.triggerSparkBurst(x, y);
    }

    // Delay showing the wish message
    setTimeout(() => {
      setIsWishMade(true);
    }, 1000);
  };

  // Open memory modal detailed view
  const openMemoryDetail = (index) => {
    const memory = MEMORIES[index];
    // Check lock
    const isLocked = !memory.unlockedAtStart && !isBirthday;
    if (isLocked) {
      // Shimmer alert/sparkle to show it is locked
      if (window.triggerSparkBurst) {
        window.triggerSparkBurst();
      }
      return;
    }
    setActiveModalMemory(memory);
  };

  // Navigation on timeline
  const prevMemory = () => {
    setSelectedMemoryIndex(prev => Math.max(0, prev - 1));
  };

  const nextMemory = () => {
    setSelectedMemoryIndex(prev => Math.min(MEMORIES.length - 1, prev + 1));
  };

  const selectedMemory = MEMORIES[selectedMemoryIndex];
  const isSelectedMemoryLocked = !selectedMemory.unlockedAtStart && !isBirthday;

  return (
    <>
      {/* Visual background Canvas */}
      <canvas ref={canvasRef} className="bg-canvas" />

      {/* Nebula background overlay */}
      <div className="nebula-overlay"></div>

      {/* Floating Audio Controller */}
      <div className="audio-widget glass">
        <button className="audio-btn" onClick={toggleAudio} aria-label={isAudioPlaying ? "Pause music" : "Play music"}>
          {isAudioPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          )}
        </button>
        <div className={`audio-visualizer ${isAudioPlaying ? 'playing' : ''}`}>
          <div className="visualizer-bar"></div>
          <div className="visualizer-bar"></div>
          <div className="visualizer-bar"></div>
          <div className="visualizer-bar"></div>
        </div>
      </div>

      {/* Page Container */}
      <main className="app-container">
        
        {/* Floating Memory Planets */}
        <div className="planet-container">
          {!giftOpened && MEMORIES.map((memory, i) => {
            const isLocked = !memory.unlockedAtStart && !isBirthday;
            return (
              <div
                key={i}
                className={`memory-planet ${memory.planetClass} ${isLocked ? 'locked' : ''}`}
                style={{ top: memory.top, left: memory.left }}
                onClick={() => openMemoryDetail(i)}
              >
                {/* Visual lock icon for locked memories */}
                {isLocked ? '🔒' : ''}
                <div className="planet-tooltip">{isLocked ? `🔒 ${memory.date}` : memory.date}</div>
              </div>
            );
          })}
        </div>

        {/* Header */}
        <header className="app-header">
          <p className="header-subtitle">A Sweet Journey</p>
          <h1 className="header-title serif-title">
            {isBirthday ? 'Happy Birthday!' : 'birthday until'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {isBirthday ? 'July 18th • Celebrating someone incredibly special' : 'July 18th • Every second closer to celebrating you'}
          </p>
        </header>

        {/* Main interactive area */}
        <div className="main-display">
          
          {/* Display State: Countdown / Birthday Timer */}
          <div className="countdown-box glass">
            
            {/* The Timer display matching the glowing white digits */}
            <div className="countdown-timer">
              {isBirthday ? (
                // Birthday State shows zeroed out timer 00:00:00 just like the image
                <>
                  <div className="countdown-segment">
                    <span className="countdown-digits glow-text-white">00</span>
                    <span className="countdown-label">Days</span>
                  </div>
                  <span className="countdown-colon">:</span>
                  <div className="countdown-segment">
                    <span className="countdown-digits glow-text-white">00</span>
                    <span className="countdown-label">Hours</span>
                  </div>
                  <span className="countdown-colon">:</span>
                  <div className="countdown-segment">
                    <span className="countdown-digits glow-text-white">00</span>
                    <span className="countdown-label">Mins</span>
                  </div>
                  <span className="countdown-colon">:</span>
                  <div className="countdown-segment">
                    <span className="countdown-digits glow-text-white">00</span>
                    <span className="countdown-label">Secs</span>
                  </div>
                </>
              ) : (
                // Active Countdown State
                <>
                  <div className="countdown-segment">
                    <span className="countdown-digits glow-text-white">{timeLeft.days}</span>
                    <span className="countdown-label">Days</span>
                  </div>
                  <span className="countdown-colon">:</span>
                  <div className="countdown-segment">
                    <span className="countdown-digits glow-text-white">{timeLeft.hours}</span>
                    <span className="countdown-label">Hours</span>
                  </div>
                  <span className="countdown-colon">:</span>
                  <div className="countdown-segment">
                    <span className="countdown-digits glow-text-white">{timeLeft.minutes}</span>
                    <span className="countdown-label">Mins</span>
                  </div>
                  <span className="countdown-colon">:</span>
                  <div className="countdown-segment">
                    <span className="countdown-digits glow-text-white">{timeLeft.seconds}</span>
                    <span className="countdown-label">Secs</span>
                  </div>
                </>
              )}
            </div>

            {/* Birthday Gift Button when countdown is complete */}
            {isBirthday && !giftOpened && (
              <button 
                className="gift-button"
                onClick={() => {
                  setGiftOpened(true);
                  if (window.triggerSparkBurst) {
                    window.triggerSparkBurst();
                  }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
                Open Your Card
              </button>
            )}
          </div>

          {/* Letter / Envelope inside the Gift */}
          {isBirthday && giftOpened && (
            <div className="birthday-envelope">
              <div className="envelope-seal">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
              </div>
              <p className="letter-text">{typedMessage}</p>
              
              {typingIndex >= fullLetterMessage.length && (
                <div className="candle-wrapper animate-fade-in">
                  <p className="candle-caption">Blow out the candle to make a wish...</p>
                  
                  <div className="candle" ref={candleRef}>
                    <div className="candle-wick"></div>
                    {!candleBlown ? (
                      <div 
                        className="candle-flame"
                        onClick={blowCandle}
                        title="Click to blow out the candle!"
                        aria-label="Blow candle"
                      ></div>
                    ) : (
                      showSmoke && <div className="smoke-cloud">💨</div>
                    )}
                  </div>

                  {isWishMade && (
                    <p className="candle-caption glow-text-gold" style={{ fontSize: '0.9rem', marginTop: '1rem', fontWeight: 500 }}>
                      ✨ Wish sent! May all your dreams come true. ✨
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Timeline memories navigation removed - replaced by 3D Planets */}

        </div>


      </main>

      {/* Memory Details Modal Overlay */}
      {activeModalMemory && (
        <div className="modal-overlay" onClick={() => setActiveModalMemory(null)}>
          <div className="modal-content glass" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveModalMemory(null)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <div className="modal-date">{activeModalMemory.date}</div>
            <h2 className="modal-title serif-title">{activeModalMemory.title}</h2>
            <div className="modal-image-wrapper">
              {activeModalMemory.image ? (
                <img src={activeModalMemory.image} alt={activeModalMemory.title} className="modal-image" />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, rgba(226,194,117,0.1) 0%, rgba(192,132,252,0.1) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                  border: '1px solid var(--border)'
                }}>
                  {activeModalMemory.icon}
                </div>
              )}
            </div>
            <p className="modal-body">{activeModalMemory.desc}</p>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
