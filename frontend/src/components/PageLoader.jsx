import { LoaderIcon } from "lucide-react";
import { useState, useEffect } from "react";

function PageLoader() {
  const [showSlowMessage, setShowSlowMessage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSlowMessage(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-slate-200">
      <LoaderIcon className="size-12 animate-spin text-cyan-500 mb-4" />
      {showSlowMessage && (
        <div className="text-center animate-in fade-in duration-1000">
          <p className="text-lg font-medium">Waking up the server...</p>
          <p className="text-sm text-slate-400 mt-2 px-6">Render's free tier can take up to a minute to start.</p>
        </div>
      )}
    </div>
  );
}
export default PageLoader;
