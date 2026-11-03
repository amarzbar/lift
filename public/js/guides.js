// How-to content for every exercise in the plan.
// setup: before the first rep. steps: one rep, in order. cues: what to think
// mid-set. mistakes: what goes wrong. safety: how to not get hurt.

export const GUIDES = {
  squat: {
    muscles: 'Quads, glutes, adductors, lower back',
    setup: [
      'Set the bar in the rack at mid-chest height, and set the safety pins just below the depth you squat to.',
      'Step under the bar and rest it on your upper back, on the shelf of muscle just below the bony bump at the base of your neck — not on the neck itself.',
      'Grip the bar just outside your shoulders, squeeze your shoulder blades together and pull your elbows down.',
      'Stand up to unrack, then take two or three small steps back. Feet shoulder-width, toes turned out 15–30°.',
    ],
    steps: [
      'Big breath into your belly and brace like someone is about to poke you in the stomach.',
      'Break at the hips and knees together and sit down between your heels.',
      'Push your knees out so they track over your toes the whole way.',
      'Go down until the crease of your hip is just below the top of your knee.',
      'Drive up by pushing the floor away, chest and hips rising at the same speed. Breathe out at the top.',
    ],
    cues: ['Knees out', 'Chest up', 'Brace before every rep', 'Whole foot on the floor — heels down'],
    mistakes: [
      ['Knees caving in', 'Push them out over your toes; lighten the bar if you can\'t.'],
      ['Hips shooting up first', 'Lead with your chest and upper back out of the bottom.'],
      ['Cutting depth', 'Film one set from the side; hip crease must pass the knee.'],
      ['Heels lifting', 'Sit back more, widen your stance slightly, or turn toes out a bit more.'],
    ],
    safety: [
      'Always squat inside a rack with the safety pins set. If you fail a rep, sit down onto the pins — never try to throw the bar off your back.',
      'Lower back rounding at the bottom ("butt wink") under load: stop slightly higher until mobility improves.',
      'Sharp pain in the knee or back means stop the set. Dull muscle burn is normal; joint pain is not.',
    ],
  },
  bench: {
    muscles: 'Chest, front shoulders, triceps',
    setup: [
      'Lie on the bench with your eyes directly under the bar. Set the safety arms just below chest height.',
      'Grip the bar slightly wider than shoulder-width, so your forearms are vertical at the bottom. Wrap your thumbs around it.',
      'Pull your shoulder blades back and down into the bench and keep them there. A small arch in the lower back is fine; your butt stays on the bench.',
      'Feet flat on the floor, slightly behind your knees.',
    ],
    steps: [
      'Unrack with straight arms and move the bar over your shoulders.',
      'Breathe in and lower the bar under control to your lower chest (around the nipples). Elbows about 45–70° from your body, not flared straight out.',
      'Touch the chest lightly — no bouncing.',
      'Press back up and slightly toward your face, so the bar ends over your shoulders. Breathe out at the top.',
    ],
    cues: ['Shoulder blades pinned', 'Bend the bar', 'Drive your feet into the floor', 'Wrists stacked over elbows'],
    mistakes: [
      ['Elbows flared to 90°', 'Tuck them to roughly 45–70°. Flaring is the classic shoulder-hurter.'],
      ['Bouncing the bar off the chest', 'Lower under control and touch, then press.'],
      ['Butt lifting off the bench', 'Push through your feet toward your head, not straight up.'],
      ['Wrists bent back', 'Bar sits low in the palm, over the forearm bones.'],
    ],
    safety: [
      'Use the safety arms, or a spotter for heavy sets. Never bench with collars on without safeties — you need to be able to tip the plates off if trapped.',
      'Never use a thumbless ("suicide") grip.',
      'Front-of-shoulder pain: narrow your grip slightly and tuck your elbows more.',
    ],
  },
  row: {
    muscles: 'Upper back, lats, rear shoulders, biceps',
    setup: [
      'Bar on the floor over the middle of your feet, feet hip-width.',
      'Grip slightly wider than shoulder-width, palms facing you (overhand).',
      'Hinge at the hips with soft knees until your torso is roughly 30–45° above parallel. Back flat, neck neutral.',
    ],
    steps: [
      'Brace your core and lift the bar to hang at arms\' length below your shoulders.',
      'Pull the bar to your lower ribs/upper belly by driving your elbows back.',
      'Squeeze your shoulder blades together at the top.',
      'Lower under control to straight arms. Keep the torso angle the same every rep.',
    ],
    cues: ['Elbows back, not up', 'Chest proud', 'Torso stays still'],
    mistakes: [
      ['Standing up as you pull', 'If your torso rises a lot, the weight is too heavy.'],
      ['Rounding the lower back', 'Brace before every rep; lower the weight.'],
      ['Pulling with the arms only', 'Think of your hands as hooks and pull with your elbows.'],
    ],
    safety: [
      'Keep a flat back. If you feel your lower back doing the work, reduce the weight.',
      'A little body English on the last rep is fine; a jerky heave every rep is not.',
    ],
  },
  ohp: {
    muscles: 'Shoulders, triceps, upper chest, core',
    setup: [
      'Bar in the rack at upper-chest height. Grip just outside your shoulders.',
      'Unrack it so it sits on your front shoulders, elbows slightly in front of the bar. Step back.',
      'Feet hip-width. Squeeze your glutes and brace hard — your body is a rigid column.',
    ],
    steps: [
      'Breathe in and brace. Tuck your chin back slightly so the bar clears your face.',
      'Press straight up. Once it passes your forehead, move your head forward "through the window" under the bar.',
      'Lock out with the bar over the middle of your feet, shoulders shrugged up toward your ears.',
      'Lower under control back to your front shoulders.',
    ],
    cues: ['Squeeze glutes', 'Bar path straight up', 'Head through at the top'],
    mistakes: [
      ['Leaning way back', 'Squeeze glutes and abs; if you still lean, it\'s too heavy.'],
      ['Pressing in an arc around the face', 'Move your head back, not the bar forward.'],
      ['Using the legs', 'No knee dip — this is a strict press.'],
    ],
    safety: [
      'Excessive back arch loads the lower spine — brace and keep the ribs down.',
      'If you miss a rep, step back and let the bar come down in front of you; don\'t catch it awkwardly overhead.',
    ],
  },
  deadlift: {
    muscles: 'Hamstrings, glutes, back, grip — nearly everything',
    setup: [
      'Stand with the bar over the middle of your feet (about 3 cm from your shins). Feet hip-width, toes slightly out.',
      'Bend at the hips and grab the bar just outside your legs, double overhand (switch to mixed grip only when grip fails).',
      'Bend your knees until your shins touch the bar. Do not let the bar move.',
      'Chest up, back flat, pull the slack out of the bar until you hear it click against the plates. Shoulders slightly in front of the bar.',
    ],
    steps: [
      'Big breath and brace.',
      'Push the floor away with your legs, keeping the bar dragging up your shins.',
      'Once it passes your knees, drive your hips forward to stand tall. Don\'t lean back.',
      'Lower by pushing your hips back first, then bend the knees once the bar passes them. Reset each rep on the floor.',
    ],
    cues: ['Push the floor away', 'Bar stays on your legs', 'Proud chest, flat back', 'Hips and shoulders rise together'],
    mistakes: [
      ['Rounding the lower back', 'Stop the set. Reset tighter, or lower the weight. This is the one that injures people.'],
      ['Bar drifting away from the legs', 'Engage your lats: "bend the bar around your shins".'],
      ['Squatting the deadlift (hips too low)', 'Hips start higher than knees, lower than shoulders.'],
      ['Yanking the bar off the floor', 'Pull the slack out first, then squeeze it up.'],
      ['Hyperextending at the top', 'Just stand tall; squeeze glutes, don\'t lean back.'],
    ],
    safety: [
      'Back position is everything here. A rounded lower back under heavy load is the most common way lifters get hurt — if your form breaks, end the set.',
      'Only one work set of 5 — it\'s taxing. Don\'t add sets because it felt easy.',
      'Wear flat shoes (or socks) rather than squishy running shoes.',
    ],
  },
  pullup: {
    muscles: 'Lats, upper back, biceps, grip',
    setup: [
      'Grab the bar slightly wider than shoulder-width, palms facing away.',
      'Hang with straight arms, legs together, slight hollow (ribs down, legs slightly in front).',
    ],
    steps: [
      'Pull your shoulder blades down and back first.',
      'Drive your elbows down toward your hips until your chin clears the bar.',
      'Lower all the way to a dead hang under control.',
    ],
    cues: ['Elbows to your back pockets', 'Chest to the bar', 'Full hang every rep'],
    mistakes: [
      ['Half reps', 'Straight arms at the bottom, chin over at the top, or it doesn\'t count.'],
      ['Kipping/swinging', 'Stay still; this is strength work.'],
    ],
    safety: [
      'Can\'t do 5 yet? Switch to Lat Pulldown in Settings → Exercise swaps until you can.',
      'Don\'t drop from the top — control the descent to protect your elbows and shoulders.',
      'Weight in this app means weight added with a belt or dumbbell; 0 = bodyweight.',
    ],
  },
  pulldown: {
    muscles: 'Lats, upper back, biceps',
    setup: [
      'Set the knee pad so your thighs are locked in.',
      'Grip the bar slightly wider than shoulder-width, palms away.',
    ],
    steps: [
      'Lean back very slightly and pull your shoulder blades down.',
      'Pull the bar to your upper chest, elbows driving down and back.',
      'Pause, then let it rise until your arms are straight.',
    ],
    cues: ['Shoulders down first', 'Bar to collarbone', 'Control the way up'],
    mistakes: [
      ['Leaning way back to yank it down', 'Use less weight; torso stays almost upright.'],
      ['Pulling behind the neck', 'Always to the front.'],
    ],
    safety: ['Don\'t let the stack slam — control the return.'],
  },
  dip: {
    muscles: 'Chest, triceps, front shoulders',
    setup: [
      'Grip parallel bars, jump up to straight arms with shoulders over your hands.',
      'Shoulders down away from your ears, slight forward lean.',
    ],
    steps: [
      'Lower by bending your elbows until your shoulders are just below your elbows (upper arm about parallel to the floor).',
      'Press back up to straight arms.',
    ],
    cues: ['Shoulders down', 'Elbows back, not out', 'Slight lean forward'],
    mistakes: [
      ['Going too deep', 'Stop at roughly parallel — deeper puts the front of the shoulder at risk.'],
      ['Shrugging up', 'Keep the shoulders depressed the whole set.'],
    ],
    safety: [
      'Any pain at the front of the shoulder: shorten the range, or switch to Triceps Pushdown in Settings → Exercise swaps.',
      'Weight in this app means added weight; 0 = bodyweight.',
    ],
  },
  pushdown: {
    muscles: 'Triceps',
    setup: ['Rope or bar on a high cable. Stand close, elbows tucked at your sides.'],
    steps: ['Push down until your arms are straight.', 'Squeeze, then let the handle rise until forearms are just above parallel.'],
    cues: ['Elbows pinned to your sides', 'Only the forearms move'],
    mistakes: [['Elbows drifting forward', 'Lower the weight; the upper arm stays still.']],
    safety: ['Elbow pain: try a rope attachment and a slightly lighter weight.'],
  },
  goblet: {
    muscles: 'Quads, glutes, core, upper back',
    setup: [
      'Hold one dumbbell vertically against your chest, both hands cupping the top end like a goblet. Elbows point down.',
      'Feet slightly wider than shoulder-width, toes turned out 15–30°.',
    ],
    steps: [
      'Breathe in and brace your stomach.',
      'Sit straight down between your heels, keeping your chest tall and the dumbbell touching your chest.',
      'Let your elbows travel down inside your knees. Go as low as you can with a flat back.',
      'Push the floor away to stand up. Breathe out at the top.',
    ],
    cues: ['Chest tall', 'Elbows inside knees', 'Heels down'],
    mistakes: [
      ['Dumbbell drifting away from the chest', 'Keep it pinned to your sternum. If it pulls you forward, go lighter.'],
      ['Heels lifting', 'Widen your stance a little and sit back between your heels.'],
      ['Knees caving in', 'Use your elbows to nudge your knees out at the bottom.'],
    ],
    safety: [
      'Your arms and upper back tire before your legs here, which naturally keeps the load sensible.',
      'Set the dumbbell down by squatting, not by bending over with a round back.',
    ],
  },
  lunge: {
    muscles: 'Quads, glutes, balance',
    setup: [
      'Hold a dumbbell in each hand at your sides. Stand tall, feet hip-width.',
      'New to this? Do it with no weight first, near a rack you can touch for balance.',
    ],
    steps: [
      'Step one foot back about two feet.',
      'Lower straight down until the back knee hovers just above the floor. Front shin stays roughly vertical.',
      'Push through the front heel to step back up to standing.',
      'Alternate legs. The rep target is per leg.',
    ],
    cues: ['Tall torso', 'Front heel down', 'Drop straight down'],
    mistakes: [
      ['Front knee caving inward', 'Keep the knee in line with your middle toes.'],
      ['Steps too short', 'A short step forces the front knee far forward. Step back a bit further.'],
      ['Slamming the back knee down', 'Control the descent and stop just above the floor.'],
    ],
    safety: [
      'Reverse lunges are gentler on the knees than forward lunges because you never brake against the front leg.',
      'Knee discomfort: shorten how deep you go and use lighter dumbbells.',
    ],
  },
  dbincline: {
    muscles: 'Upper chest, front shoulders, triceps',
    setup: [
      'Set the bench to a low incline, about 15–30°.',
      'Sit with the dumbbells standing on your thighs. Lie back and use your knees to kick them up one at a time.',
      'Start with arms straight over your upper chest, shoulder blades pulled back into the bench.',
    ],
    steps: [
      'Lower the dumbbells to the sides of your upper chest, elbows about 45–60° from your body.',
      'Pause briefly at the bottom when you feel a stretch.',
      'Press up and slightly in, so the dumbbells finish over your shoulders.',
    ],
    cues: ['Shoulder blades back', 'Wrists straight', 'Control the way down'],
    mistakes: [
      ['Elbows flared out to 90°', 'Tuck them a little. Flaring is what irritates shoulders.'],
      ['Bench too steep', 'Above ~30° it turns into a shoulder press. Keep it low.'],
      ['Going too deep', 'Stop when the dumbbells are level with your chest.'],
    ],
    safety: [
      'To finish, bring the dumbbells to your chest and sit up with them on your thighs. Don\'t drop them out to the sides from the bottom.',
      'No spotter needed: if you can\'t finish a rep, just lower the dumbbells to your chest and sit up.',
    ],
  },
  cablerow: {
    muscles: 'Upper back, lats, rear shoulders, biceps',
    setup: [
      'Sit on the bench with your feet on the platform and knees slightly bent.',
      'Grab the handle (a close V-grip is easiest) and sit tall with your arms straight.',
    ],
    steps: [
      'Pull the handle to your lower ribs, keeping your elbows close to your sides.',
      'Squeeze your shoulder blades together and hold for a moment.',
      'Let the handle go back slowly until your arms are straight. Shoulders can reach forward slightly, but your lower back stays still.',
    ],
    cues: ['Chest tall', 'Elbows back', 'No rocking'],
    mistakes: [
      ['Leaning way back to swing the weight', 'Your torso should barely move. Go lighter.'],
      ['Rounding the back on the way forward', 'Stop the return when your arms are straight.'],
      ['Shrugging', 'Keep your shoulders down away from your ears.'],
    ],
    safety: [
      'Your legs and the seat support you, so there\'s far less load on the lower back than a barbell row.',
      'Cable stacks differ between machines, so the number may not match from gym to gym. Go by how the reps feel.',
    ],
  },
  dbrow: {
    muscles: 'Lats, upper back, rear shoulders, biceps',
    setup: [
      'Put one knee and the same-side hand on a flat bench. The other foot is on the floor, a little out to the side.',
      'Back flat, roughly parallel to the floor. The dumbbell hangs straight down from your free hand.',
    ],
    steps: [
      'Pull the dumbbell up toward your hip, elbow close to your body.',
      'Pause at the top, then lower it all the way to a full stretch.',
      'Do every rep on one side, then switch. The rep target is per arm.',
    ],
    cues: ['Elbow to back pocket', 'Hips square', 'Flat back'],
    mistakes: [
      ['Twisting the torso to heave it up', 'Keep your shoulders and hips facing the floor.'],
      ['Pulling to the chest', 'Aim for your hip; that\'s what works the lats.'],
    ],
    safety: [
      'The bench takes the load off your lower back. Keep it flat and let the bench do the bracing.',
    ],
  },
  dbpress: {
    muscles: 'Shoulders, triceps',
    setup: [
      'Set the bench upright, or one notch back from upright. Sit with your back against the pad.',
      'Bring the dumbbells to shoulder height using a knee kick, palms forward or turned slightly in.',
    ],
    steps: [
      'Brace and press the dumbbells up until your arms are straight, bringing them close together at the top.',
      'Lower under control back to about ear height.',
    ],
    cues: ['Back on the pad', 'Ribs down', 'Elbows slightly forward'],
    mistakes: [
      ['Arching off the pad', 'Keep your lower back touching the bench; lighten the weight if you can\'t.'],
      ['Elbows straight out to the sides', 'Bring them slightly forward. It\'s kinder to the shoulder joint.'],
      ['Half reps', 'Use the full range from ears to straight arms.'],
    ],
    safety: [
      'Pinch at the top of the shoulder: turn your palms to face each other and bring the elbows further forward.',
      'Finish by lowering the dumbbells to your thighs, not by dropping them.',
    ],
  },
  rdl: {
    muscles: 'Hamstrings, glutes, lower back',
    setup: [
      'Take the bar from a rack set at mid-thigh height, so you start standing instead of pulling from the floor.',
      'Hands just outside your thighs, feet hip-width, a soft bend in the knees.',
    ],
    steps: [
      'Brace, then push your hips back. The bar slides down the front of your thighs.',
      'Keep your back flat. Stop when you feel a strong stretch in your hamstrings, usually around or just below the knees.',
      'Drive your hips forward to stand tall again.',
    ],
    cues: ['Hips back, not down', 'Bar on your legs', 'Flat back'],
    mistakes: [
      ['Rounding the back to reach lower', 'Depth is set by your hamstrings, not the floor. Stop where your back stays flat.'],
      ['Squatting it', 'Knees stay softly bent the whole time; the hips do the moving.'],
      ['Bar drifting forward', 'Keep it brushing your thighs.'],
    ],
    safety: [
      'Start light. This movement teaches the hip hinge that makes deadlifts safe later.',
      'Dumbbells work just as well if a rack isn\'t free.',
    ],
  },
  hipthrust: {
    muscles: 'Glutes, hamstrings',
    setup: [
      'Sit on the floor with your upper back against the edge of a bench (just below the shoulder blades).',
      'Roll the bar over your legs to your hip crease. Always use a bar pad.',
      'Feet flat, about shoulder-width, close enough that your shins are vertical at the top.',
    ],
    steps: [
      'Tuck your chin and brace.',
      'Drive through your heels to lift your hips until your torso is parallel to the floor.',
      'Squeeze your glutes hard at the top, then lower under control.',
    ],
    cues: ['Chin tucked', 'Ribs down', 'Push through heels'],
    mistakes: [
      ['Arching the lower back at the top', 'Finish with your glutes, not your spine. Ribs stay down.'],
      ['Feet too close or too far', 'Adjust until your shins are vertical at the top.'],
    ],
    safety: [
      'Almost no load on your spine, which makes it a good deadlift stand-in while you rebuild.',
      'Try a bodyweight glute bridge first if hip thrusts feel awkward.',
    ],
  },

  calfraise: {
    muscles: 'Calves, feet, ankles',
    setup: ['Stand tall, feet hip-width, near a wall or rack for light balance.'],
    steps: ['Rise smoothly onto the balls of both feet.', 'Pause a beat at the top.', 'Lower slowly, all the way down.'],
    cues: ['Slow down', 'Full range', 'Weight through the big toe'],
    mistakes: [['Bouncing', 'Lower under control — the slow part is the point.'], ['Rolling to the outer foot', 'Press through the big-toe side so the arch stays supported.']],
    safety: ['A warm-up, not a max effort. Stop if the achilles or arch pinches.'],
  },
  shortfoot: {
    muscles: 'Arch, small foot muscles',
    setup: ['Barefoot or thin shoes. Sit or stand with the foot flat, toes relaxed.'],
    steps: ['Without curling the toes, draw the ball of the foot gently back toward the heel so the arch lifts into a small dome.', 'Hold for the seconds shown, breathing normally.', 'Relax fully, then repeat.'],
    cues: ['Toes stay long and flat', 'Lift the arch, not the toes', 'Small effort'],
    mistakes: [['Scrunching the toes', 'Keep them flat — the work is under the arch.'], ['Gripping hard', 'A light, steady dome is enough.']],
    safety: ['Log seconds in the rep counter. No pain — this is activation, not strain.'],
  },
  glutebridge: {
    muscles: 'Glutes, hamstrings',
    setup: ['Lie on your back, knees bent, feet flat and hip-width, heels a hand-span from your hips.'],
    steps: ['Tuck the ribs down and brace lightly.', 'Drive through your heels and lift the hips until your body is straight from knees to shoulders.', 'Squeeze the glutes at the top, then lower under control.'],
    cues: ['Push through the heels', 'Squeeze the glutes, not the back', 'Ribs down'],
    mistakes: [['Arching the lower back to go higher', 'Stop where your hips and ribs line up; finish with the glutes.'], ['Feeling it in the hamstrings only', 'Move the heels slightly closer and think "squeeze".']],
    safety: ['Spine-friendly. If the lower back pinches, lower the range.'],
  },
  bandedwalk: {
    muscles: 'Side glutes (hips), knee control',
    setup: ['Loop a band just above the knees. Soft knees, half-squat, feet hip-width.'],
    steps: ['Keeping tension on the band, step one foot out to the side.', 'Follow with the other, staying low — never let the knees cave in.', 'Do the reps leading with one leg, then the other.'],
    cues: ['Knees out against the band', 'Stay low', 'Small, controlled steps'],
    mistakes: [['Knees collapsing inward', 'Push out so the band stays stretched the whole time.'], ['Standing up tall between steps', 'Hold the half-squat for constant tension.']],
    safety: ['Directly trains the knees-out pattern your physio wants. Light band to start.'],
  },
  deadbug: {
    muscles: 'Deep core (anti-arch)',
    setup: ['Lie on your back, arms straight up over your shoulders, knees bent 90° over your hips.'],
    steps: ['Flatten your lower back into the floor and keep it there.', 'Slowly lower one arm overhead and the opposite leg toward the floor.', 'Only as far as the back stays flat; return and switch sides.'],
    cues: ['Lower back glued down', 'Move slowly', 'Breathe out as you reach'],
    mistakes: [['Lower back arching up', 'Shorten the range — go only as far as you can stay flat.'], ['Rushing', 'Slow and controlled is where the core work is.']],
    safety: ['Counts one rep per side. Stop a set if the back lifts and you can\'t re-flatten it.'],
  },
  birddog: {
    muscles: 'Core (anti-rotation), glutes, back',
    setup: ['On all fours, hands under shoulders, knees under hips, back flat and level.'],
    steps: ['Brace so the torso stays still.', 'Reach one arm forward and the opposite leg back until both are level with your body.', 'No twisting or tipping; return and switch sides.'],
    cues: ['Hips and shoulders stay square', 'Reach long, not high', 'Flat back like a table'],
    mistakes: [['Hips rotating open', 'Lift only as high as you can without twisting.'], ['Overarching the back', 'Keep the ribs down and the back flat.']],
    safety: ['One rep per side. A great low-load back exercise; stop on any pinching.'],
  },
  sideplank: {
    muscles: 'Side core, hips',
    setup: ['On your side, forearm under your shoulder, legs stacked (or knees bent to start easier).'],
    steps: ['Lift the hips so your body is a straight line from head to feet (or knees).', 'Hold for the seconds shown, breathing normally.', 'Lower and switch sides.'],
    cues: ['Straight line', 'Hips up and forward', 'Don\'t sag'],
    mistakes: [['Hips drooping', 'Reset and hold a shorter time with good position.'], ['Rolling forward', 'Stack the shoulders and hips vertically.']],
    safety: ['Log seconds in the rep counter, per side. Knees-down is a fine easier version.'],
  },
  pallof: {
    muscles: 'Core (anti-rotation)',
    setup: ['Stand side-on to a cable or band at chest height. Hold the handle at your chest with both hands.'],
    steps: ['Brace, then press the handle straight out in front of your chest.', 'Resist the pull that wants to twist you toward the machine.', 'Return to the chest under control. Finish the reps, then face the other way.'],
    cues: ['Resist the twist', 'Ribs down, glutes on', 'Slow press and return'],
    mistakes: [['Letting the torso rotate', 'Lighten the load until you can stay square.'], ['Holding your breath', 'Breathe out on the press.']],
    safety: ['One set per side. Light and controlled beats heavy here.'],
  },
  suitcase: {
    muscles: 'Core (anti-lean), grip, traps',
    setup: ['A single dumbbell at one side. Stand tall, shoulders level.'],
    steps: ['Pick it up and stand tall without leaning toward it.', 'Walk slowly and upright (or just hold in place) for the seconds shown.', 'Switch the weight to the other hand and repeat.'],
    cues: ['Stand tall, don\'t lean', 'Shoulders level', 'Squeeze the handle'],
    mistakes: [['Leaning away from or toward the weight', 'Drop the weight a size and stay vertical.'], ['Shrugging', 'Let the arm hang; brace the trunk instead.']],
    safety: ['Log seconds (or steps) in the rep counter, per side. A spine-friendly way to load the core.'],
  },
  facepull: {
    muscles: 'Rear shoulders, upper back',
    setup: ['Rope on a cable at face height (or a band). Hold both ends, step back to light tension.'],
    steps: ['Pull the rope toward your eyes, splitting the ends apart.', 'Lead with the elbows high and wide; squeeze the upper back.', 'Return slowly under control.'],
    cues: ['Elbows high', 'Pull to the eyes', 'Squeeze the shoulder blades'],
    mistakes: [['Turning it into a row', 'Keep the elbows up at shoulder height.'], ['Using the lower back', 'Stand tall and still; only the arms move.']],
    safety: ['Light and high-rep. Great for posture and shoulder health.'],
  },
  stepup: {
    muscles: 'Quads, glutes, knee control, balance',
    setup: ['A low box or bench (start low — knee below hip at the top). Optional light dumbbells.'],
    steps: ['Place one whole foot on the box.', 'Drive through that foot to stand up, keeping the knee tracking over the toes.', 'Lower slowly under control. Finish the reps, then switch legs.'],
    cues: ['Whole foot on the box', 'Knee over the toes', 'Lower slowly'],
    mistakes: [['Pushing off the back foot', 'Make the top leg do the work.'], ['Knee caving inward', 'Lower the box and cue the knee out.']],
    safety: ['Replaces lunges/running. Keep the box low while the knees settle; 0–3/10 discomfort only.'],
  },
};

export const GENERAL_SAFETY = [
  'Warm up every lift with the warm-up sets the app gives you. They are short on purpose.',
  'Use safety pins/arms for squat and bench. Every time.',
  'Muscle burn and fatigue are normal. Sharp, sudden, or joint pain is not — stop.',
  'Form before weight. If a rep looks different from the animation, the weight is too heavy.',
  'Sleep and eat enough protein; the plan only works if you recover.',
  'Rest 2–3 minutes between heavy sets. Rushing rests causes failed sets, not gains.',
  'If you have a medical condition or old injury, check with a doctor or physio before starting.',
];
