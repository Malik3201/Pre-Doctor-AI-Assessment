import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowUp, Building2 } from 'lucide-react';
import Card from '../ui/Card';

export default function HospitalSubdomainGuide({ hostname }) {
  const [currentSubdomain, setCurrentSubdomain] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  // Extract base domain, always ignoring any subdomain the user entered
  // For localhost: "gg.localhost" -> "localhost"
  // For production: "wrongsubdomain.predoctorai.online" -> "predoctorai.online"
  const baseDomain = useMemo(() => {
    const parts = hostname.split('.').filter(Boolean);
    
    // Handle localhost case: if last part is "localhost", base domain is just "localhost"
    if (parts[parts.length - 1] === 'localhost') {
      return 'localhost';
    }
    
    // For production domains, return last 2 parts (domain.tld)
    // e.g., "predoctorai.online" or "wrongsubdomain.predoctorai.online" -> "predoctorai.online"
    if (parts.length <= 2) {
      return hostname; // Already base domain (e.g., "predoctorai.online")
    }
    
    // Always return last two parts, ignoring any subdomain
    return parts.slice(-2).join('.');
  }, [hostname]);

  const subdomainExamples = ['dhq', 'alshifa', 'your-hospital'];

  useEffect(() => {
    let timeoutId;
    const currentExample = subdomainExamples[currentSubdomain];
    const targetLength = currentExample.length;

    if (isTyping) {
      // Typing animation
      if (displayText.length < targetLength) {
        timeoutId = setTimeout(() => {
          setDisplayText(currentExample.slice(0, displayText.length + 1));
        }, 100);
      } else {
        // Pause before erasing
        timeoutId = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    } else {
      // Erasing animation
      if (displayText.length > 0) {
        timeoutId = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 50);
      } else {
        // Move to next example
        const nextIndex = (currentSubdomain + 1) % subdomainExamples.length;
        setCurrentSubdomain(nextIndex);
        setIsTyping(true);
      }
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [displayText, isTyping, currentSubdomain]);

  return (
    <Card className="border-slate-200 bg-white shadow-xl">
      <div className="space-y-8 p-8">
        {/* Label */}
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Are you hospital staff or a patient?
          </p>
        </div>

        {/* Main Headline */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Use your hospital's own link to log in
          </h2>
        </div>

        {/* Explanatory Paragraph */}
        <div>
          <p className="leading-relaxed text-slate-600">
            Each hospital uses its own Pre-Doctor AI portal under a unique subdomain. Instead of
            logging in here, open the URL with your hospital's name in front of this address.
          </p>
        </div>

        {/* Arrow Animation */}
        <div className="flex justify-center">
          <motion.div
            animate={{
              y: [-4, 0, -4],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-xs font-medium text-slate-500">Look at the address bar</span>

            <ArrowDown className="h-6 w-6 text-teal-600" />
          </motion.div>
        </div>

        {/* Fake URL Bar */}
        <div className="rounded-lg border-2 border-slate-300 bg-slate-50 p-4 shadow-inner">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-400"></div>
              <div className="h-3 w-3 rounded-full bg-amber-400"></div>
              <div className="h-3 w-3 rounded-full bg-emerald-400"></div>
            </div>
            <div className="flex-1 font-mono text-sm text-slate-700">
              <span className="text-slate-400">https://</span>
              <span className="font-semibold text-teal-600">{displayText}</span>
              {displayText.length < (subdomainExamples[currentSubdomain]?.length || 0) && (
                <span className="animate-pulse text-teal-600">|</span>
              )}
              <span className="text-slate-400">.{baseDomain}</span>
            </div>
          </div>
        </div>

        {/* How-to List */}
        <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-600">
              1
            </span>
            <p className="text-sm text-slate-700">
              Add your hospital's short name before the dot.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-600">
              2
            </span>
            <p className="text-sm text-slate-700">
              For example: <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs">dhq.{baseDomain}</code>
            </p>
          </div>
          <div className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-600">
              3
            </span>
            <p className="text-sm text-slate-700">
              Then open that link to access your hospital portal.
            </p>
          </div>
        </div>

        {/* Icon */}
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
            <Building2 className="h-6 w-6 text-teal-600" />
          </div>
        </div>
      </div>
    </Card>
  );
}

