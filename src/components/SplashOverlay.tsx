import { useEffect, useState } from "react";

const SplashOverlay = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999] animate-fadeOut">
      <img
        src="/assets/images/viewss.png"
        alt="Viewify"
        className="w-44 animate-fadeIn"
      />
    </div>
  );
};

export default SplashOverlay;
