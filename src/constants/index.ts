export const tips: string[] = [
  'Remember to set your batsman to be very agressive before a free hit.',
  'Batsman with high agression is more likely to hit boundaries but is vulnerable to losing wicket.',
  'Defensive field settings will contain runs. But you are less likely to get a wicket.',
  'Batting Order cant be changed mid game. Finalize your strategy before game starts.',
  'Batsman order decides his performance. Its risky to experiment with it.',
];

export const COMMENTARY = {
  dot: [
    'Driven Straight to the bowler. No runs.',
    'Driven Straight to mid on. No runs.',
    'Driven Straight to mid off. No runs.',
    'Flicked straight to short fine leg. No runs.',
    'Flicked right to square leg. No runs.',
    'Edged towards short third man. No runs.',
    'Good delivery! He’s missed that completely!',
    'Cut straight to point. No runs.',
  ],

  run: {
    1: {
      bat: [
        'Flicked down to fine leg. One run.',
        'Defended onto the leg side. Quick single.',
        'Driven to extra cover. One run.',
      ],
      lb: ['Leg bye taken.', 'Off the pads, they sneak a run.'],
    },
    2: {
      bat: [
        'Driven past mid wicket. Two runs!',
        'Driven down to long on - Two runs!',
      ],
      lb: ['Two leg byes.', 'Off the pads, two runs.'],
    },
    3: {
      bat: ['Excellent running, three!', 'They push hard for three.'],
      lb: ['Three leg byes.', 'Risky running, but they get three.'],
    },
  },

  four: ['Over the covers! Four runs!', 'Smashed over midwicket! Four!'],

  six: ['Smashed over cover! Six!', 'Into the stands! Six runs!'],

  wicket: {
    bowled: [
      'Clean bowled!',
      'Knocked him over!',
      'That one rattles the stumps!',
    ],
    caught: [
      'Caught in the deep!',
      'Taken cleanly!',
      'Straight into the hands of the fielder!',
    ],
    lbw: ['Big appeal! Given LBW!', 'Trapped right in front!'],
    runOut: ['Direct hit! He’s run out!', 'Brilliant fielding – run out!'],
  },

  wide: ['That’s a wide down leg side!', 'Extras conceded.'],

  noBall: ['No ball!', 'Free hit coming up.'],
} as const;
