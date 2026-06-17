'use client';

import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { CustomEase } from 'gsap/CustomEase';
import { CustomBounce } from 'gsap/CustomBounce';
import { CustomWiggle } from 'gsap/CustomWiggle';
import { RoughEase, ExpoScaleEase, SlowMo } from 'gsap/EasePack';
import { Draggable } from 'gsap/Draggable';
import { Flip } from 'gsap/Flip';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { Observer } from 'gsap/Observer';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { SplitText } from 'gsap/SplitText';
import { TextPlugin } from 'gsap/TextPlugin';

// Register all plugins
gsap.registerPlugin(
  useGSAP,
  CustomEase,
  CustomBounce,
  CustomWiggle,
  RoughEase,
  ExpoScaleEase,
  SlowMo,
  Draggable,
  Flip,
  MotionPathPlugin,
  Observer,
  ScrambleTextPlugin,
  ScrollTrigger,
  ScrollToPlugin,
  SplitText,
  TextPlugin,
);

// Custom eases for GreenPath
CustomEase.create('greenIn', 'M0,0 C0.25,0.1 0.25,1 1,1');
CustomEase.create('leafFloat', 'M0,0 C0.14,0 0.242,0.438 0.272,0.561 0.313,0.728 0.354,0.963 0.362,1 0.37,0.985 0.414,0.736 0.454,0.553 0.481,0.428 0.547,0 0.562,0 0.578,0 0.616,0.165 0.626,0.228 0.698,0.7 0.736,1 1,1');

export { gsap, useGSAP, ScrollTrigger, SplitText, Flip, Observer, ScrambleTextPlugin, TextPlugin, Draggable, MotionPathPlugin, ScrollToPlugin };

// Animation presets
export const animations = {
  fadeInUp: (target: gsap.TweenTarget, delay = 0) =>
    gsap.fromTo(target, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, delay, ease: 'greenIn', clearProps: 'all' }),

  staggerFadeIn: (targets: gsap.TweenTarget, staggerTime = 0.1) =>
    gsap.fromTo(targets, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: staggerTime, ease: 'greenIn', clearProps: 'all' }),

  scaleIn: (target: gsap.TweenTarget, delay = 0) =>
    gsap.fromTo(target, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, delay, ease: 'back.out(1.7)', clearProps: 'all' }),

  glowPulse: (target: gsap.TweenTarget) =>
    gsap.to(target, {
      boxShadow: '0 0 30px rgba(74, 222, 128, 0.6), 0 0 60px rgba(74, 222, 128, 0.3)',
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    }),

  countUp: (target: Element, endValue: number, duration = 1.5) => {
    const obj = { value: 0 };
    return gsap.to(obj, {
      value: endValue,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        target.textContent = Math.round(obj.value).toString();
      },
    });
  },
};
