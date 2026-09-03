import { useEffect, useMemo, useRef, type ReactNode, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import "./ScrollReveal.css";

gsap.registerPlugin(ScrollTrigger);

type ScrollRevealProps = {
  children: ReactNode;
  scrollContainerRef?: RefObject<HTMLElement | null>;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  containerClassName?: string;
  textClassName?: string;
  rotationEnd?: string;
  wordAnimationEnd?: string;
  as?: "h2" | "h3" | "p" | "div";
  origin?: "left" | "right";
};

export function ScrollReveal({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = "",
  textClassName = "",
  rotationEnd = "top 30%",
  wordAnimationEnd = "top 30%",
  as: Tag = "h2",
  origin = "left",
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLElement | null>(null);

  const splitText = useMemo(() => {
    const text = typeof children === "string" ? children : "";
    return text.split(/(\s+)/).map((word, index) => {
      if (/^\s+$/.test(word)) return word;
      return (
        <span className="word" key={index}>
          {word}
        </span>
      );
    });
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller =
      scrollContainerRef?.current != null ? scrollContainerRef.current : undefined;
    const transformOrigin = origin === "right" ? "100% 50%" : "0% 50%";
    const rotation = origin === "right" ? -Math.abs(baseRotation) : Math.abs(baseRotation);

    const wordElements = el.querySelectorAll<HTMLElement>(".word");

    // Force starting state so the effect is visible before scrub catches up
    gsap.set(el, { transformOrigin, rotate: rotation });
    gsap.set(wordElements, {
      opacity: baseOpacity,
      filter: enableBlur ? `blur(${blurStrength}px)` : "none",
    });

    const ctx = gsap.context(() => {
      gsap.to(el, {
        ease: "none",
        rotate: 0,
        scrollTrigger: {
          trigger: el,
          scroller,
          start: "top 95%",
          end: rotationEnd,
          scrub: 0.6,
        },
      });

      gsap.to(wordElements, {
        ease: "none",
        opacity: 1,
        stagger: 0.04,
        scrollTrigger: {
          trigger: el,
          scroller,
          start: "top 90%",
          end: wordAnimationEnd,
          scrub: 0.8,
        },
      });

      if (enableBlur) {
        gsap.to(wordElements, {
          ease: "none",
          filter: "blur(0px)",
          stagger: 0.04,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: "top 90%",
            end: wordAnimationEnd,
            scrub: 0.8,
          },
        });
      }
    }, el);

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => ctx.revert();
  }, [
    children,
    scrollContainerRef,
    enableBlur,
    baseRotation,
    baseOpacity,
    rotationEnd,
    wordAnimationEnd,
    blurStrength,
    origin,
  ]);

  return (
    <Tag
      ref={containerRef as never}
      className={cn("scroll-reveal", containerClassName)}
    >
      <span className={cn("scroll-reveal-text", textClassName)}>{splitText}</span>
    </Tag>
  );
}
