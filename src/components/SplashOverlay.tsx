import { useEffect, useState } from "react";

const SplashOverlay = () => {
  const [visible, setVisible] = useState(true);
  const [startAnim, setStartAnim] = useState(false);

  useEffect(() => {
    setStartAnim(true);

    // optional sound
    const audio = new Audio("/startup.mp3");
    audio.volume = 0.4;
    audio.play().catch(() => {
      // autoplay may be blocked on some devices
    });

    const timer = setTimeout(() => {
      setVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999] overflow-hidden">

      {/* 🌫 Background Blur Glow */}
      <div className="absolute w-[500px] h-[500px] bg-purple-600 opacity-20 blur-[120px] animate-pulseSlow rounded-full" />

      {/* ✨ Logo Container */}
      <div
        className={`relative flex flex-col items-center justify-center transition-all duration-1000 ${
          startAnim ? "scale-100 opacity-100" : "scale-75 opacity-0"
        }`}
      >
        {/* 💡 Glow behind logo */}
        <div className="absolute w-48 h-48 bg-white opacity-10 blur-3xl rounded-full animate-pulse" />

        {/* 🔥 Logo */}
        <img
          src="/assets/images/viewss.png"
          alt="Viewify"
          className="w-40 z-10 animate-zoomReveal"
        />

        {/* ✍️ Tagline */}
        <p className="text-gray-400 text-sm mt-4 animate-fadeIn">
          Be Real. Be Heard.
        </p>
      </div>
    </div>
  );
};

export default SplashOverlay;
