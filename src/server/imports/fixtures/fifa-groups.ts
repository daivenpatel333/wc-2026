import type { Confederation } from "#/domain/types";

/** Generated from tournament research on 2026-06-09. */
export interface FifaGroupsFixture {
  sourceUrl: string;
  note: string;
  groups: Array<{
    label: string;
    countries: Array<{ name: string; fifaCode: string; confederation: Confederation }>;
  }>;
}

export const fifaGroupsFixture: FifaGroupsFixture = {
  sourceUrl: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/standings",
  note: "Checked-in snapshot of the final 2026 World Cup draw, used as the manual fallback source for the fifa_groups import.",
  groups: [
    {
      label: "A",
      countries: [
        {
          name: "Mexico",
          fifaCode: "MEX",
          confederation: "CONCACAF",
        },
        {
          name: "South Africa",
          fifaCode: "RSA",
          confederation: "CAF",
        },
        {
          name: "South Korea",
          fifaCode: "KOR",
          confederation: "AFC",
        },
        {
          name: "Czechia",
          fifaCode: "CZE",
          confederation: "UEFA",
        },
      ],
    },
    {
      label: "B",
      countries: [
        {
          name: "Canada",
          fifaCode: "CAN",
          confederation: "CONCACAF",
        },
        {
          name: "Bosnia and Herzegovina",
          fifaCode: "BIH",
          confederation: "UEFA",
        },
        {
          name: "Qatar",
          fifaCode: "QAT",
          confederation: "AFC",
        },
        {
          name: "Switzerland",
          fifaCode: "SUI",
          confederation: "UEFA",
        },
      ],
    },
    {
      label: "C",
      countries: [
        {
          name: "Brazil",
          fifaCode: "BRA",
          confederation: "CONMEBOL",
        },
        {
          name: "Haiti",
          fifaCode: "HAI",
          confederation: "CONCACAF",
        },
        {
          name: "Morocco",
          fifaCode: "MAR",
          confederation: "CAF",
        },
        {
          name: "Scotland",
          fifaCode: "SCO",
          confederation: "UEFA",
        },
      ],
    },
    {
      label: "D",
      countries: [
        {
          name: "United States",
          fifaCode: "USA",
          confederation: "CONCACAF",
        },
        {
          name: "Paraguay",
          fifaCode: "PAR",
          confederation: "CONMEBOL",
        },
        {
          name: "Australia",
          fifaCode: "AUS",
          confederation: "AFC",
        },
        {
          name: "Türkiye",
          fifaCode: "TUR",
          confederation: "UEFA",
        },
      ],
    },
    {
      label: "E",
      countries: [
        {
          name: "Germany",
          fifaCode: "GER",
          confederation: "UEFA",
        },
        {
          name: "Curaçao",
          fifaCode: "CUW",
          confederation: "CONCACAF",
        },
        {
          name: "Côte d'Ivoire",
          fifaCode: "CIV",
          confederation: "CAF",
        },
        {
          name: "Ecuador",
          fifaCode: "ECU",
          confederation: "CONMEBOL",
        },
      ],
    },
    {
      label: "F",
      countries: [
        {
          name: "Netherlands",
          fifaCode: "NED",
          confederation: "UEFA",
        },
        {
          name: "Japan",
          fifaCode: "JPN",
          confederation: "AFC",
        },
        {
          name: "Sweden",
          fifaCode: "SWE",
          confederation: "UEFA",
        },
        {
          name: "Tunisia",
          fifaCode: "TUN",
          confederation: "CAF",
        },
      ],
    },
    {
      label: "G",
      countries: [
        {
          name: "Belgium",
          fifaCode: "BEL",
          confederation: "UEFA",
        },
        {
          name: "Egypt",
          fifaCode: "EGY",
          confederation: "CAF",
        },
        {
          name: "Iran",
          fifaCode: "IRN",
          confederation: "AFC",
        },
        {
          name: "New Zealand",
          fifaCode: "NZL",
          confederation: "OFC",
        },
      ],
    },
    {
      label: "H",
      countries: [
        {
          name: "Spain",
          fifaCode: "ESP",
          confederation: "UEFA",
        },
        {
          name: "Cape Verde",
          fifaCode: "CPV",
          confederation: "CAF",
        },
        {
          name: "Saudi Arabia",
          fifaCode: "KSA",
          confederation: "AFC",
        },
        {
          name: "Uruguay",
          fifaCode: "URU",
          confederation: "CONMEBOL",
        },
      ],
    },
    {
      label: "I",
      countries: [
        {
          name: "France",
          fifaCode: "FRA",
          confederation: "UEFA",
        },
        {
          name: "Senegal",
          fifaCode: "SEN",
          confederation: "CAF",
        },
        {
          name: "Iraq",
          fifaCode: "IRQ",
          confederation: "AFC",
        },
        {
          name: "Norway",
          fifaCode: "NOR",
          confederation: "UEFA",
        },
      ],
    },
    {
      label: "J",
      countries: [
        {
          name: "Argentina",
          fifaCode: "ARG",
          confederation: "CONMEBOL",
        },
        {
          name: "Algeria",
          fifaCode: "ALG",
          confederation: "CAF",
        },
        {
          name: "Austria",
          fifaCode: "AUT",
          confederation: "UEFA",
        },
        {
          name: "Jordan",
          fifaCode: "JOR",
          confederation: "AFC",
        },
      ],
    },
    {
      label: "K",
      countries: [
        {
          name: "Portugal",
          fifaCode: "POR",
          confederation: "UEFA",
        },
        {
          name: "DR Congo",
          fifaCode: "COD",
          confederation: "CAF",
        },
        {
          name: "Uzbekistan",
          fifaCode: "UZB",
          confederation: "AFC",
        },
        {
          name: "Colombia",
          fifaCode: "COL",
          confederation: "CONMEBOL",
        },
      ],
    },
    {
      label: "L",
      countries: [
        {
          name: "England",
          fifaCode: "ENG",
          confederation: "UEFA",
        },
        {
          name: "Croatia",
          fifaCode: "CRO",
          confederation: "UEFA",
        },
        {
          name: "Ghana",
          fifaCode: "GHA",
          confederation: "CAF",
        },
        {
          name: "Panama",
          fifaCode: "PAN",
          confederation: "CONCACAF",
        },
      ],
    },
  ],
};
