export interface GiftCardOption {
  id: string;
  name: string;
  usernameLabel: string;
  usernamePlaceholder: string;
  helperText: string;
}

export interface ConsoleOption {
  id: string;
  name: string;
}

export interface RetroConsoleOption {
  id: string;
  name: string;
}

export const giftCardOptions: GiftCardOption[] = [
  {
    id: 'roblox',
    name: 'Roblox',
    usernameLabel: 'Roblox Username',
    usernamePlaceholder: 'Enter your Roblox username',
    helperText: 'Your Roblox username as it appears in the game'
  },
  {
    id: 'amazon',
    name: 'Amazon',
    usernameLabel: 'Amazon Email',
    usernamePlaceholder: 'Enter your Amazon email',
    helperText: 'The email address associated with your Amazon account'
  },
  {
    id: 'itunes',
    name: 'Apple iTunes',
    usernameLabel: 'Apple ID Email',
    usernamePlaceholder: 'Enter your Apple ID email',
    helperText: 'Your Apple ID email address'
  },
  {
    id: 'fortnite',
    name: 'Fortnite V-Bucks',
    usernameLabel: 'Epic Games Username',
    usernamePlaceholder: 'Enter your Epic Games username',
    helperText: 'Your Epic Games username for Fortnite'
  },
  {
    id: 'freefire',
    name: 'FreeFire Diamonds',
    usernameLabel: 'FreeFire Player ID',
    usernamePlaceholder: 'Enter your FreeFire Player ID',
    helperText: 'Your FreeFire Player ID (found in game settings)'
  },
  {
    id: 'playstation',
    name: 'PlayStation Network',
    usernameLabel: 'PSN ID',
    usernamePlaceholder: 'Enter your PSN ID',
    helperText: 'Your PlayStation Network ID as it appears on PlayStation Network'
  },
  {
    id: 'xbox',
    name: 'Microsoft XBOX',
    usernameLabel: 'Xbox Gamertag',
    usernamePlaceholder: 'Enter your Xbox Gamertag',
    helperText: 'Your Xbox Gamertag as it appears on Xbox Live'
  },
  {
    id: 'nintendo',
    name: 'Nintendo eShop',
    usernameLabel: 'Nintendo Network ID',
    usernamePlaceholder: 'Enter your Nintendo Network ID',
    helperText: 'Your Nintendo Network ID for the Nintendo eShop'
  },
  {
    id: 'pubg',
    name: 'PUBG UC',
    usernameLabel: 'PUBG Player ID',
    usernamePlaceholder: 'Enter your PUBG Player ID',
    helperText: 'Your PUBG Player ID (found in game settings)'
  },
  {
    id: 'riot',
    name: 'RIOT Points',
    usernameLabel: 'Riot Games Username',
    usernamePlaceholder: 'Enter your Riot Games username',
    helperText: 'Your Riot Games username (for League of Legends, Valorant, etc.)'
  },
  {
    id: 'steam',
    name: 'Steam',
    usernameLabel: 'Steam Username',
    usernamePlaceholder: 'Enter your Steam username',
    helperText: 'Your Steam username as it appears on Steam'
  },
  {
    id: 'wizard101',
    name: 'Wizard 101',
    usernameLabel: 'Wizard 101 Username',
    usernamePlaceholder: 'Enter your Wizard 101 username',
    helperText: 'Your Wizard 101 username as it appears in the game'
  }
];

export const consoleOptions: ConsoleOption[] = [
  {
    id: 'xboxone',
    name: 'Xbox One'
  },
  {
    id: 'xbox360',
    name: 'Xbox 360'
  },
  {
    id: 'ps4',
    name: 'PlayStation 4'
  },
  {
    id: 'ps5',
    name: 'PlayStation 5'
  },
  {
    id: 'nintendoswitch',
    name: 'Nintendo Switch'
  },
  {
    id: 'nintendoswitch2',
    name: 'Nintendo Switch 2'
  },
  {
    id: 'pc',
    name: 'PC'
  },
  {
    id: 'retro',
    name: 'Retro'
  }
];

export const retroConsoleOptions: RetroConsoleOption[] = [
  {
    id: 'ps1',
    name: 'PS1'
  },
  {
    id: 'ps2',
    name: 'PS2'
  },
  {
    id: 'xbox',
    name: 'Xbox'
  },
  {
    id: 'psp',
    name: 'PSP'
  },
  {
    id: 'nintendo64-snes',
    name: 'Nintendo 64/SNES'
  },
  {
    id: 'nintendo3ds-ds-wii',
    name: 'Nintendo 3DS/DS/WII'
  }
];
