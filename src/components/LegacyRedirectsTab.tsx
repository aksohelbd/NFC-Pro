import { useState } from 'react';
import {
  ArrowRightLeft,
  Copy,
  Check,
  ExternalLink,
  Code,
  FileCode,
  Globe,
  Sparkles,
  HelpCircle,
  Play,
} from 'lucide-react';
import { UserProfile } from '../types';

interface LegacyRedirectsTabProps {
  profiles: UserProfile[];
  onViewCard: (slugOrToken: string) => void;
}

export function LegacyRedirectsTab({ profiles, onViewCard }: LegacyRedirectsTabProps) {
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://nfc.cards';
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Live Simulator State
  const [testInputUrl, setTestInputUrl] = useState('https://myblog.blogspot.com/p/aks316.html');
  const [simulatedDestination, setSimulatedDestination] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(key);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  // Blogger / Blogspot JavaScript Snippet
  const bloggerSnippet = `<!-- ========================================================
  SMART NFC & QR CODE REDIRECT BRIDGE
  Paste in Blogger -> Theme -> Customize -> Edit HTML
  Place right above </head> tag or below <head> tag
======================================================== -->
<script type='text/javascript'>
//<![CDATA[
(function() {
  var TARGET_APP_URL = "${currentOrigin}";
  var fullUrl = window.location.href;
  var path = window.location.pathname.toLowerCase();

  // 1. Detect AKS ID from URL (e.g. /p/aks316.html, /aks317, or ?card=aks316)
  var match = fullUrl.match(/aks-?(\\d+)/i);
  
  if (match && match[1]) {
    // Redirect directly to the exact NFC Card profile
    window.location.replace(TARGET_APP_URL + "/nfc/aks" + match[1]);
  } else {
    // Default fallback to primary NFC business card
    window.location.replace(TARGET_APP_URL);
  }
})();
//]]>
</script>`;

  // WordPress / PHP / HTML Snippet
  const wordpressSnippet = `// Add this to your child theme's functions.php OR via the 'WPCode' / 'Insert Headers' plugin
add_action('wp_head', function() {
    ?>
    <script>
    (function() {
        var targetBase = '${currentOrigin}';
        var m = window.location.href.match(/aks-?(\\d+)/i);
        if (m && m[1]) {
            window.location.replace(targetBase + '/nfc/aks' + m[1]);
        } else {
            window.location.replace(targetBase);
        }
    })();
    </script>
    <?php
});`;

  // Universal HTML Meta Refresh Snippet
  const metaRefreshSnippet = `<!-- Universal Instant Redirect for Any Static HTML / Web Page -->
<meta http-equiv="refresh" content="0; url=${currentOrigin}">
<script>
  window.location.replace("${currentOrigin}");
</script>`;

  const handleRunSimulation = () => {
    const raw = testInputUrl.trim();
    const match = raw.match(/aks-?(\d+)/i);
    if (match && match[1]) {
      setSimulatedDestination(`${currentOrigin}/nfc/aks${match[1]}`);
    } else {
      setSimulatedDestination(currentOrigin);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto pt-3 space-y-4 max-w-3xl">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/10 border border-amber-500/30">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-black shrink-0 shadow-md">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
              <span>Legacy NFC Card & QR Code Bridge (স্মার্ট রিডাইরেক্ট ম্যানেজার)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30 font-mono">
                Printed Card Compatible
              </span>
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1 leading-relaxed">
              আপনার যে ফিজিক্যাল NFC কার্ড বা QR কোডগুলো আগে প্রিন্ট হয়ে গেছে, সেগুলোতে হয়তো আপনার পুরোনো ব্লগ ওয়েবসাইটের লিঙ্ক দেওয়া আছে। 
              চিন্তার কোনো কারণ নেই! আপনার ব্লগে নিচের ১ লাইনের কোডটি বসিয়ে দিলে, <strong>যেকেউ সেই পুরোনো কার্ড স্ক্যান বা ট্যাপ করলেই অটোমেটিক আপনার বর্তমান ওয়েবসাইটে চলে আসবে।</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Target Origin Box */}
      <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 block">
            Current Active Target Website (Destination URL)
          </span>
          <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 break-all">
            {currentOrigin}
          </span>
        </div>
        <button
          type="button"
          onClick={() => handleCopy(currentOrigin, 'origin')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-700 hover:bg-amber-500 hover:text-neutral-950 text-xs font-semibold transition-all cursor-pointer shrink-0"
        >
          {copiedSnippet === 'origin' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedSnippet === 'origin' ? 'Copied!' : 'Copy URL'}</span>
        </button>
      </div>

      {/* METHOD 1: BLOGGER / BLOGSPOT */}
      <div className="bg-white dark:bg-neutral-850 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-neutral-950 font-bold text-xs flex items-center justify-center">1</span>
            <h5 className="font-bold text-xs text-neutral-900 dark:text-white">
              Blogger / Blogspot Auto-Redirect (সবচেয়ে সহজ ও দ্রুত)
            </h5>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(bloggerSnippet, 'blogger')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
          >
            {copiedSnippet === 'blogger' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSnippet === 'blogger' ? 'Blogger Code Copied!' : 'Copy Blogger Code'}</span>
          </button>
        </div>

        <div className="text-xs text-neutral-600 dark:text-neutral-300 space-y-1.5 pl-8">
          <p><strong>কীভাবে সেটআপ করবেন:</strong></p>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-neutral-500 dark:text-neutral-400">
            <li>আপনার <span className="font-semibold text-neutral-700 dark:text-neutral-300">Blogger.com</span> ড্যাশবোর্ডে লগইন করুন।</li>
            <li>বাম পাশের মেনু থেকে <span className="font-semibold text-neutral-700 dark:text-neutral-300">Theme (থিম)</span> এ যান।</li>
            <li><span className="font-semibold text-neutral-700 dark:text-neutral-300">Customize</span> এর ডান পাশের ছোট্ট তীর (ড্রপডাউন) আইকনে ক্লিক করে <span className="font-semibold text-amber-500">Edit HTML</span> নির্বাচন করুন।</li>
            <li><code className="font-mono text-amber-500">&lt;/head&gt;</code> ট্যাগের ঠিক উপরে নিচের কোডটি পেস্ট করে দিয়ে <strong>Save</strong> আইকনে ক্লিক করুন।</li>
          </ol>
        </div>

        <div className="pl-8 pt-1">
          <pre className="p-3 rounded-xl bg-neutral-900 text-neutral-200 font-mono text-[11px] overflow-x-auto border border-neutral-800 leading-relaxed max-h-48">
            {bloggerSnippet}
          </pre>
        </div>
      </div>

      {/* METHOD 2: WORDPRESS */}
      <div className="bg-white dark:bg-neutral-850 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-500 text-white font-bold text-xs flex items-center justify-center">2</span>
            <h5 className="font-bold text-xs text-neutral-900 dark:text-white">
              WordPress Website Redirect
            </h5>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(wordpressSnippet, 'wordpress')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-xs font-semibold transition-all cursor-pointer"
          >
            {copiedSnippet === 'wordpress' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSnippet === 'wordpress' ? 'Copied!' : 'Copy WP Code'}</span>
          </button>
        </div>

        <p className="text-xs text-neutral-500 dark:text-neutral-400 pl-8 leading-relaxed">
          ওয়ার্ডপ্রেস সাইটে <span className="font-semibold text-neutral-700 dark:text-neutral-200">Redirection</span> ফ্রি প্লাগইন ব্যবহার করে সব লিঙ্ক বর্তমান সাইটে রিডাইরেক্ট করতে পারেন, অথবা <span className="font-semibold text-neutral-700 dark:text-neutral-200">WPCode</span> প্লাগইন দিয়ে হেডারে কোডটি যুক্ত করতে পারেন।
        </p>

        <div className="pl-8 pt-1">
          <pre className="p-3 rounded-xl bg-neutral-900 text-neutral-200 font-mono text-[11px] overflow-x-auto border border-neutral-800 leading-relaxed max-h-36">
            {wordpressSnippet}
          </pre>
        </div>
      </div>

      {/* METHOD 3: UNIVERSAL HTML META REFRESH */}
      <div className="bg-white dark:bg-neutral-850 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center">3</span>
            <h5 className="font-bold text-xs text-neutral-900 dark:text-white">
              Custom HTML / Index.html Meta Refresh
            </h5>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(metaRefreshSnippet, 'meta')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-xs font-semibold transition-all cursor-pointer"
          >
            {copiedSnippet === 'meta' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSnippet === 'meta' ? 'Copied!' : 'Copy HTML Code'}</span>
          </button>
        </div>

        <div className="pl-8 pt-1">
          <pre className="p-3 rounded-xl bg-neutral-900 text-neutral-200 font-mono text-[11px] overflow-x-auto border border-neutral-800 leading-relaxed">
            {metaRefreshSnippet}
          </pre>
        </div>
      </div>

      {/* LIVE REDIRECT SIMULATOR & TESTER */}
      <div className="p-5 rounded-2xl bg-neutral-100/90 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h5 className="font-bold text-xs text-neutral-900 dark:text-white">
            Live Legacy URL Redirect Simulator (লাইভ টেস্ট টুল)
          </h5>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          আপনার পূর্বে প্রিন্ট করা কোনো একটি লিংক (যেমন ব্লগের লিংক) এখানে লিখে টেস্ট করে দেখতে পারেন সেটি কীভাবে স্বয়ংক্রিয়ভাবে বর্তমান সাইটের কার্ডে রূপান্তর হবে:
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={testInputUrl}
            onChange={(e) => setTestInputUrl(e.target.value)}
            placeholder="e.g. https://myblog.blogspot.com/p/aks316.html"
            className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-mono"
          />
          <button
            type="button"
            onClick={handleRunSimulation}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-all cursor-pointer shrink-0"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Test Redirect</span>
          </button>
        </div>

        {simulatedDestination && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1">
            <span className="text-neutral-500 dark:text-neutral-400 font-semibold block">
              Resulting Live Destination:
            </span>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 break-all">
                {simulatedDestination}
              </span>
              <button
                type="button"
                onClick={() => {
                  const match = simulatedDestination.match(/aks-?(\d+)/i);
                  const target = match ? `aks${match[1]}` : 'aks316';
                  onViewCard(target);
                }}
                className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer shrink-0"
              >
                <span>Preview Card</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
