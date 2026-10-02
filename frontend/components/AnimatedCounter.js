"use client";

import { useEffect, useState } from "react";

export default function AnimatedCounter({ value, duration = 1200 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10);
    if (isNaN(end) || end <= 0) {
      setCount(0);
      return;
    }

    const totalSteps = 40;
    const stepTime = Math.max(16, Math.floor(duration / totalSteps));
    const increment = Math.ceil(end / totalSteps);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count.toLocaleString()}</span>;
}