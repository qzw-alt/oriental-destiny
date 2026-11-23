// =============================================================================
// quiz_questions.js — question bank for the birthday quiz.
//
// Every question is single-choice so the answers can be tallied.
// Option value -1 means "prefer not to say": it is stored, but the worker
// excludes it from every count and denominator.
//
// `note` is the line shown back to the reader on the result page — one
// human sentence, no diagnosis, no fortune-telling. Voice: plain, warm,
// conclusion first, no jargon.
// =============================================================================

(function () {
  'use strict';

  window.QUIZ_QUESTIONS = [
    {
      id: 'first_job',
      prompt: 'How did your first job out of school actually happen?',
      options: [
        { value: 0, label: 'My family arranged it — something safe',
          note: "You wanted solid ground under you before anything else. There's nothing timid about that." },
        { value: 1, label: 'I went after something I actually cared about',
          note: "You'd rather be broke and interested than comfortable and bored. You made that bet early." },
        { value: 2, label: 'I took whatever was there and figured it out later',
          note: "You didn't over-plan. You knew you think better on your feet than on paper." },
        { value: 3, label: 'More school — grad school, exams, or going abroad',
          note: "You bought yourself more time and more choices. You've never been in a rush to be finished." }
      ]
    },
    {
      id: 'path_match',
      prompt: 'Is what you do now the thing you once wanted to do?',
      options: [
        { value: 0, label: 'Pretty much exactly',
          note: "You knew early and nobody talked you out of it. That's rarer than people admit." },
        { value: 1, label: 'Sort of — same neighborhood, different house',
          note: "You kept the thread and changed the shape. Most people never stay that close to it." },
        { value: 2, label: 'Not even close',
          note: "Life took the wheel somewhere. You've either made peace with a road you didn't draw, or you're still deciding." },
        { value: 3, label: "Still not sure what I want",
          note: "Being honest about that puts you ahead of everyone who just names a job title." }
      ]
    },
    {
      id: 'marriage',
      prompt: 'Are you married?',
      options: [
        { value: 0, label: 'Married',
          note: "You picked someone and stayed. That's not one decision, it's a hundred of them in a row." },
        { value: 1, label: 'In a relationship, living together',
          note: "You built the life without the paperwork. Fair enough — you're not doing it for anyone's checklist." },
        { value: 2, label: 'Single',
          note: "You're on your own timeline and you're not apologizing for it." },
        { value: -1, label: 'Prefer not to say' }
      ]
    },
    {
      id: 'kids',
      prompt: 'Do you have kids?',
      options: [
        { value: 0, label: 'None',
          note: "Your time is your own. That's a real answer to the question, not a waiting room." },
        { value: 1, label: 'One',
          note: "One is its own kind of all-consuming. You know that by now." },
        { value: 2, label: 'Two',
          note: "You've been outnumbered for a while. You probably don't remember what quiet sounds like." },
        { value: 3, label: 'Three or more',
          note: "You built a crowd. It's loud and expensive and you wouldn't trade it." },
        { value: -1, label: 'Prefer not to say' }
      ]
    },
    {
      id: 'color',
      prompt: 'Off the top of your head — favorite color?',
      options: [
        { value: 0, label: 'Red, orange, warm tones',
          note: "You run hot. You'd rather be reacting to something than sitting still." },
        { value: 1, label: 'Blue, green, cool tones',
          note: "You want room to think. Cool colors are what calm looks like to you." },
        { value: 2, label: 'Black, white, grey',
          note: "You don't need the noise. Clean and quiet does more for you than bright does." },
        { value: 3, label: 'Purple, pink, gold',
          note: "You like a little drama in the frame. Nothing wrong with wanting things to be beautiful." }
      ]
    },
    {
      id: 'decide',
      prompt: 'When something big is on the line, what do you trust?',
      options: [
        { value: 0, label: 'Numbers — I want the data',
          note: "You don't move on a feeling. You want to see it before you believe it." },
        { value: 1, label: 'My gut',
          note: "You decide whole, then explain it afterwards. It usually holds up." },
        { value: 2, label: 'Talking it through with people close to me',
          note: "You think out loud. Other voices are part of how you hear your own." },
        { value: 3, label: 'I flip a coin, or see what comes',
          note: "You let something outside you break the tie. There's a kind of faith in that most people won't admit to." }
      ]
    },
    {
      id: 'fate',
      prompt: 'Do you believe some things are fated?',
      options: [
        { value: 0, label: 'Yes — certain things are written',
          note: "You've felt the shape of it. Something happened that you know you didn't arrange." },
        { value: 1, label: 'Half and half',
          note: "You act like it's all up to you and quietly suspect it isn't. Honestly, that's most people." },
        { value: 2, label: 'Not really — we make the choices',
          note: "You want the credit and you'll take the blame. At least it's consistent." },
        { value: 3, label: 'No. You make your own luck.',
          note: "You refuse to hand the wheel to anyone. Whether or not it's true, it's worked for you so far." }
      ]
    },
    {
      id: 'chronotype',
      prompt: 'Be honest — which one are you?',
      options: [
        { value: 0, label: 'Early riser',
          note: "You get your best hours before the world wakes up." },
        { value: 1, label: 'Night owl',
          note: "Your brain turns on when everyone else turns off." },
        { value: 2, label: 'Depends on the day',
          note: "You sleep on the schedule your life hands you." },
        { value: 3, label: 'Honestly, neither',
          note: "You've never fit either box. You're probably tired." }
      ]
    },
    {
      id: 'moves',
      prompt: 'How many times have you changed jobs or cities?',
      options: [
        { value: 0, label: 'Never',
          note: "You put down roots and stayed. That's its own kind of nerve." },
        { value: 1, label: 'Once or twice',
          note: "You moved when it counted, not when it was easy." },
        { value: 2, label: 'Three to five',
          note: "You've restarted more than most. You're good at beginnings by now." },
        { value: 3, label: 'Lost count',
          note: "You've left a lot of rooms. Some people need the door to keep swinging." }
      ]
    },
    {
      id: 'redo',
      prompt: 'If you got one do-over, where would you spend it?',
      options: [
        { value: 0, label: "Nowhere — I'd walk the same road",
          note: "You own the whole thing, good calls and bad. That's a grounded way to stand." },
        { value: 1, label: 'The career — the school or the field',
          note: "There's a version of you that took the other path and you still wonder about them." },
        { value: 2, label: 'The relationship',
          note: "That's the one you turn over the most. It usually is." },
        { value: 3, label: "I'd start making money earlier",
          note: "Practical to the end. You'd rather fix the foundation than the story." }
      ]
    }
  ];

  // Coarse age bands — the server never receives a birth year, only one of these.
  window.QUIZ_AGE_BANDS = ['teens', '20s', '30s', '40s', '50s', '60+'];

  // Minimum same-day responses before the match block is worth showing.
  // Below this, "most common answer" is noise and one person reads as 100%.
  window.QUIZ_MATCH_THRESHOLD = 20;
})();
