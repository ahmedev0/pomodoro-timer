# Answers

---

## 1. How to run

No installation needed. Just download the project, open it, and double-click `index.html`. It opens directly in any browser.

## Run

```
start index.html
```

No server required. No npm. No build step.

---

## 2. Stack and design choices

I used plain HTML, CSS, and JavaScript, no framework. I chose this because the app is simple enough that a framework would just add unnecessary complexity. One file, open in browser, done. That felt right for a self-contained timer app.

**Design decision 1 — the circular progress ring**

I wanted the timer to feel alive, not just like numbers counting down. So I put a circular SVG ring around the countdown that shrinks as time passes. This makes it easy to see at a glance how much time is left without reading the numbers. It takes up the top 60% of the screen because the timer is the main thing, everything else is secondary. The ring changes color when you go from focus mode (red) to break mode (teal) so you always know what mode you're in.

**Design decision 2 — color for mode, not just text**

Instead of just showing a text label that says "Focus" or "Break", I made the whole color theme of the timer change. Focus mode is red/pink, break mode is teal/green, paused is yellow. This way even if you glance at the screen from far away, the color tells you the state. This affects the mode label text, the progress ring, and the button colors all at once.

---

## 3. Responsive and accessibility

**On a 360px phone:** The timer circle shrinks from 240px to 200px so it still fits without scrolling. Buttons wrap into two rows if needed. Font sizes go down slightly. Everything stays usable with thumbs.

**On a 1440px laptop:** The layout stays centered with a max-width on the settings and history sections so they don't stretch too wide and become hard to read.

**Accessibility thing I handled:** All buttons have clear visible labels ("Start", "Pause", "Reset"). The pause button is disabled when the timer isn't running, so you can't accidentally click something that does nothing, this also helps screen readers understand the state.

**Accessibility thing I skipped:** I didn't add ARIA live region announcements for the timer countdown. A screen reader won't read out the countdown every second. I skipped this because reading a number every second would be very annoying and spammy. I would fix it by announcing only important moments, like when the session ends or the mode switches, using `aria-live="polite"`.

---

## 4. AI usage

I used Claude during this project in one area: figuring out how to draw the SVG circular progress ring and make it animate smoothly as time passes.

I asked it how `strokeDasharray` and `strokeDashoffset` work together to make a circle appear to "drain" as the countdown goes. It explained the math — the circumference formula `2 * Math.PI * radius` and gave me a basic version of the code.

**What I changed:** The AI's version recalculated the circumference inside the tick function every second, which was wasteful. I moved that calculation outside the tick function so it only runs once when the page loads. I also added the `stroke-linecap: round` CSS property myself because without it the end of the arc looked sharp and ugly. The AI didn't include that.

Everything else, the timer logic, button states, history with localStorage, the color switching between modes, the settings inputs, I wrote myself by thinking through what the app needed step by step.

---

## 5. Honest gap

The settings inputs can be changed while the timer is running, but the running timer doesn't react to those changes until you reset. So if you change "focus time" mid-session, nothing happens until you hit Reset. It's a bit confusing.

With another day, I would add a small note that appears near the settings saying "Changes will apply after reset" whenever the timer is running. Or better I would disable the inputs while the timer is running and re-enable them only after a reset, so there's no confusion at all.