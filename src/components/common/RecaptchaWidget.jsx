import React, { useEffect, useImperativeHandle, useRef, forwardRef } from "react";

const RECAPTCHA_SCRIPT_ID = "google-recaptcha-script";

function loadRecaptchaScript(onReady) {
  if (window.grecaptcha && typeof window.grecaptcha.render === "function") {
    onReady();
    return;
  }

  window.__onRecaptchaLoadCallbacks = window.__onRecaptchaLoadCallbacks || [];
  window.__onRecaptchaLoadCallbacks.push(onReady);

  if (!document.getElementById(RECAPTCHA_SCRIPT_ID)) {
    window.__onRecaptchaScriptLoaded = () => {
      const callbacks = window.__onRecaptchaLoadCallbacks || [];
      window.__onRecaptchaLoadCallbacks = [];
      callbacks.forEach((cb) => cb());
    };

    const script = document.createElement("script");
    script.id = RECAPTCHA_SCRIPT_ID;
    script.src = "https://www.google.com/recaptcha/api.js?onload=__onRecaptchaScriptLoaded&render=explicit";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
}

const RecaptchaWidget = forwardRef(function RecaptchaWidget(
  { siteKey, theme = "light", onChange, onExpired },
  ref
) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const callbacksRef = useRef({ onChange, onExpired });

  callbacksRef.current = { onChange, onExpired };

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (
        widgetIdRef.current !== null &&
        window.grecaptcha &&
        typeof window.grecaptcha.reset === "function"
      ) {
        window.grecaptcha.reset(widgetIdRef.current);
      }
    },
  }));

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;

    loadRecaptchaScript(() => {
      if (cancelled || !containerRef.current || widgetIdRef.current !== null) return;
      widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
        sitekey: siteKey,
        theme,
        callback: (token) => callbacksRef.current.onChange?.(token),
        "expired-callback": () => {
          callbacksRef.current.onChange?.("");
          callbacksRef.current.onExpired?.();
        },
        "error-callback": () => {
          callbacksRef.current.onChange?.("");
        },
      });
    });

    return () => {
      cancelled = true;
    };
  }, [siteKey, theme]);

  if (!siteKey) return null;

  return <div ref={containerRef} className="flex justify-center" />;
});

export default RecaptchaWidget;

