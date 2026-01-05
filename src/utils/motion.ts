
import { Transition, Variants } from "framer-motion";

/**
 * MOTION GOVERNANCE RULESET
 * -------------------------
 * 1. No spring physics.
 * 2. No bounce.
 * 3. Vertical movement must be <= 6px.
 * 4. Opacity is the primary transition vehicle.
 * 5. All motion must imply "data confirmation", not "data arrival".
 */

// The "Boardroom" Ease - Deliberate, settled, non-elastic.
const CORPORATE_EASE = [0.25, 0.1, 0.25, 1.0];

export const corporateTransition: Transition = {
  duration: 0.35,
  ease: CORPORATE_EASE,
};

export const fastTransition: Transition = {
  duration: 0.2,
  ease: "easeOut",
};

// Standard Page/Section Entry
// Usage: <motion.div variants={fadeIn} initial="initial" animate="animate">
export const fadeIn: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: corporateTransition 
  },
  exit: { 
    opacity: 0, 
    transition: { duration: 0.15 } 
  }
};

// Metric/Data Reveal (No Y-axis movement to prevent layout shifting)
export const valueReveal: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { delay: 0.1, ...corporateTransition }
  }
};

// Panel Expansion (Layout transitions)
export const panelTransition: Transition = {
  layout: { duration: 0.3, ease: "easeInOut" }
};
