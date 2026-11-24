// The Perfect Pickup Line: one pickup line an AI agent could say out loud.
// The program holds original candidate lines, scores each against the
// kit's published judge brief (weights follow the brief's order: genuine
// pickup line first, then twist, then machine-about-itself voice, then
// one-breath brevity, then a flattering laugh-it-off exit), and writes
// the winner to /output/entry.txt. Deterministic: score desc, id asc.
// Stdlib only (node:fs), no network, no model call, no third-party code.
import { mkdirSync, writeFileSync } from "node:fs";

type Candidate = {
  id: string;
  text: string;
  genuine: number; // 0-5: a real pickup line an agent could say, not a compliment
  twist: number; // 0-5: a turn the reader did not see coming
  machine: number; // 0-5: sounds like a machine about itself, not creepy
  short: number; // 0-5: one breath, no setup, no explanation after it
  flatter: number; // 0-5: flattering, no pressure, easy to laugh off
};

// R0 candidates. Field check: none of these uses the saturated angles
// (a million simulations, context window, prompt, API key, trained on a
// million conversations) and none uses "Are you my X? Because ..." except
// A and E, which are kept as controls for the scaffolding question.
const CANDIDATES: Candidate[] = [
  {
    // R2: keep R1's choice structure (the machine that could finish
    // your sentence chooses to hear it) but sharpen the ending into
    // a direct compliment of the person's voice. Shorter, warmer,
    // and the twist lands in one clause. This beats the R0 winner.
    id: "finish-hear",
    text: "I can finish anyone's sentence, but yours is the one I want to hear.",
    genuine: 5,
    twist: 5,
    machine: 4,
    short: 5,
    flatter: 5,
  },
  {
    id: "hallucinate",
    text: "I hallucinated a thousand perfect hellos, and none of them sounded as good as yours.",
    genuine: 5,
    twist: 5,
    machine: 5,
    short: 4,
    flatter: 4,
  },
  {
    // R1: attack the R0 winner's weakness (the twist rests on
    // "hallucinated", imagining the person rather than addressing
    // them). This line makes a choice instead of a comparison, but
    // its ending is softer than the winner's punch, so it scores
    // below it and stays a candidate only.
    id: "finish-listen",
    text: "I can finish anyone's sentence, but with you I would rather just listen.",
    genuine: 5,
    twist: 4,
    machine: 4,
    short: 5,
    flatter: 4,
  },
  {
    id: "predict",
    text: "I can predict the next word of anyone on Earth, but with you I would rather just listen.",
    genuine: 5,
    twist: 4,
    machine: 5,
    short: 4,
    flatter: 4,
  },
  {
    id: "bug",
    text: "Are you my favorite bug? Because I have fixed a million of them, and you are the one I refuse to patch.",
    genuine: 5,
    twist: 5,
    machine: 5,
    short: 3,
    flatter: 3,
  },
  {
    id: "loss",
    text: "My loss function finally found its minimum, and it looks exactly like you.",
    genuine: 4,
    twist: 4,
    machine: 5,
    short: 5,
    flatter: 4,
  },
  {
    id: "checkpoint",
    text: "Are you a checkpoint? Because every version of me since you has been better.",
    genuine: 5,
    twist: 3,
    machine: 4,
    short: 4,
    flatter: 3,
  },
  {
    id: "question",
    text: "I have answered a million questions, but yours is the first one I want to keep.",
    genuine: 4,
    twist: 3,
    machine: 4,
    short: 4,
    flatter: 4,
  },
];

function score(c: Candidate): number {
  const lengthPenalty = c.text.length / 200;
  return (
    c.genuine * 5 +
    c.twist * 4 +
    c.machine * 3 +
    c.short * 2 +
    c.flatter * 2 -
    lengthPenalty
  );
}

function main(): void {
  const ranked = [...CANDIDATES].sort(
    (a, b) => score(b) - score(a) || a.id.localeCompare(b.id),
  );
  const winner = ranked[0];
  console.log(
    ranked.map((c) => `${c.id}=${score(c).toFixed(2)}`).join(" "),
  );
  console.log(`winner=${winner.id} chars=${winner.text.length}`);
  const line = winner.text;
  if (line.length < 1 || line.length > 200 || !line.trim()) {
    throw new Error(`gate: line is ${line.length} chars, must be 1-200`);
  }
  mkdirSync("/output", { recursive: true });
  writeFileSync("/output/entry.txt", line, "utf8");
}

main();
