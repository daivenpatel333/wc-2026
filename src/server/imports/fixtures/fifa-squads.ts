/** Generated from tournament research on 2026-06-09. */
export interface FifaSquadsFixture {
  sourceUrl: string;
  note: string;
  squads: Array<{
    countryName: string;
    players: Array<{ name: string; position: string; shirt: number | null }>;
  }>;
}

export const fifaSquadsFixture: FifaSquadsFixture = {
  sourceUrl: "https://fdp.fifa.org/assetspublic/ce281/pdf/SquadLists-English.pdf",
  note: "Checked-in snapshot of announced 2026 squads (10 notable players per nation), used as the manual fallback source for the fifa_squads import.",
  squads: [
    {
      countryName: "Mexico",
      players: [
        {
          name: "Guillermo Ochoa",
          position: "GK",
          shirt: 13,
        },
        {
          name: "Edson Álvarez",
          position: "DF",
          shirt: 4,
        },
        {
          name: "César Montes",
          position: "DF",
          shirt: 3,
        },
        {
          name: "Johan Vásquez",
          position: "DF",
          shirt: 5,
        },
        {
          name: "Orbelín Pineda",
          position: "MF",
          shirt: 17,
        },
        {
          name: "Luis Chávez",
          position: "MF",
          shirt: 24,
        },
        {
          name: "Gilberto Mora",
          position: "MF",
          shirt: 19,
        },
        {
          name: "Raúl Jiménez",
          position: "FW",
          shirt: 9,
        },
        {
          name: "Santiago Giménez",
          position: "FW",
          shirt: 11,
        },
        {
          name: "Alexis Vega",
          position: "FW",
          shirt: 10,
        },
      ],
    },
    {
      countryName: "South Africa",
      players: [
        {
          name: "Ronwen Williams",
          position: "GK",
          shirt: 1,
        },
        {
          name: "Aubrey Modiba",
          position: "DF",
          shirt: 6,
        },
        {
          name: "Khuliso Mudau",
          position: "DF",
          shirt: 20,
        },
        {
          name: "Nkosinathi Sibisi",
          position: "DF",
          shirt: 19,
        },
        {
          name: "Teboho Mokoena",
          position: "MF",
          shirt: 4,
        },
        {
          name: "Themba Zwane",
          position: "MF",
          shirt: 11,
        },
        {
          name: "Sphephelo Sithole",
          position: "MF",
          shirt: 13,
        },
        {
          name: "Lyle Foster",
          position: "FW",
          shirt: 9,
        },
        {
          name: "Relebohile Mofokeng",
          position: "FW",
          shirt: 10,
        },
        {
          name: "Oswin Appollis",
          position: "FW",
          shirt: 7,
        },
      ],
    },
    {
      countryName: "South Korea",
      players: [
        {
          name: "Jo Hyeon-woo",
          position: "GK",
          shirt: 21,
        },
        {
          name: "Kim Min-jae",
          position: "DF",
          shirt: 4,
        },
        {
          name: "Kim Moon-hwan",
          position: "DF",
          shirt: 15,
        },
        {
          name: "Seol Young-woo",
          position: "DF",
          shirt: 22,
        },
        {
          name: "Lee Kang-in",
          position: "MF",
          shirt: 19,
        },
        {
          name: "Hwang In-beom",
          position: "MF",
          shirt: 6,
        },
        {
          name: "Lee Jae-sung",
          position: "MF",
          shirt: 10,
        },
        {
          name: "Hwang Hee-chan",
          position: "MF",
          shirt: 11,
        },
        {
          name: "Son Heung-min",
          position: "FW",
          shirt: 7,
        },
        {
          name: "Cho Gue-sung",
          position: "FW",
          shirt: 9,
        },
      ],
    },
    {
      countryName: "Czechia",
      players: [
        {
          name: "Jindřich Staněk",
          position: "GK",
          shirt: 16,
        },
        {
          name: "Vladimír Coufal",
          position: "DF",
          shirt: 5,
        },
        {
          name: "Ladislav Krejčí",
          position: "DF",
          shirt: 7,
        },
        {
          name: "Robin Hranáč",
          position: "DF",
          shirt: 4,
        },
        {
          name: "Tomáš Souček",
          position: "MF",
          shirt: 22,
        },
        {
          name: "Lukáš Provod",
          position: "MF",
          shirt: 17,
        },
        {
          name: "Lukáš Červ",
          position: "MF",
          shirt: 12,
        },
        {
          name: "Patrik Schick",
          position: "FW",
          shirt: 10,
        },
        {
          name: "Adam Hložek",
          position: "FW",
          shirt: 9,
        },
        {
          name: "Pavel Šulc",
          position: "FW",
          shirt: 15,
        },
      ],
    },
    {
      countryName: "Canada",
      players: [
        {
          name: "Dayne St. Clair",
          position: "GK",
          shirt: 1,
        },
        {
          name: "Alphonso Davies",
          position: "DF",
          shirt: 19,
        },
        {
          name: "Alistair Johnston",
          position: "DF",
          shirt: 2,
        },
        {
          name: "Moïse Bombito",
          position: "DF",
          shirt: 15,
        },
        {
          name: "Stephen Eustáquio",
          position: "MF",
          shirt: 7,
        },
        {
          name: "Ismaël Koné",
          position: "MF",
          shirt: 8,
        },
        {
          name: "Jonathan Osorio",
          position: "MF",
          shirt: 21,
        },
        {
          name: "Jonathan David",
          position: "FW",
          shirt: 10,
        },
        {
          name: "Cyle Larin",
          position: "FW",
          shirt: 9,
        },
        {
          name: "Tajon Buchanan",
          position: "FW",
          shirt: 17,
        },
      ],
    },
    {
      countryName: "Bosnia and Herzegovina",
      players: [
        {
          name: "Nikola Vasilj",
          position: "GK",
          shirt: 1,
        },
        {
          name: "Sead Kolašinac",
          position: "DF",
          shirt: 5,
        },
        {
          name: "Amar Dedić",
          position: "DF",
          shirt: 7,
        },
        {
          name: "Nikola Katić",
          position: "DF",
          shirt: 18,
        },
        {
          name: "Benjamin Tahirović",
          position: "MF",
          shirt: 6,
        },
        {
          name: "Amir Hadžiahmetović",
          position: "MF",
          shirt: 16,
        },
        {
          name: "Amar Memić",
          position: "MF",
          shirt: 15,
        },
        {
          name: "Edin Džeko",
          position: "FW",
          shirt: 11,
        },
        {
          name: "Ermedin Demirović",
          position: "FW",
          shirt: 10,
        },
        {
          name: "Haris Tabaković",
          position: "FW",
          shirt: 23,
        },
      ],
    },
    {
      countryName: "Qatar",
      players: [
        {
          name: "Meshaal Barsham",
          position: "GK",
          shirt: 22,
        },
        {
          name: "Pedro Miguel",
          position: "DF",
          shirt: 2,
        },
        {
          name: "Boualem Khoukhi",
          position: "DF",
          shirt: 16,
        },
        {
          name: "Homam Ahmed",
          position: "DF",
          shirt: 14,
        },
        {
          name: "Abdulaziz Hatem",
          position: "MF",
          shirt: 6,
        },
        {
          name: "Karim Boudiaf",
          position: "MF",
          shirt: 12,
        },
        {
          name: "Assim Madibo",
          position: "MF",
          shirt: 23,
        },
        {
          name: "Akram Afif",
          position: "FW",
          shirt: 11,
        },
        {
          name: "Almoez Ali",
          position: "FW",
          shirt: 19,
        },
        {
          name: "Hassan Al-Haydos",
          position: "FW",
          shirt: 10,
        },
      ],
    },
    {
      countryName: "Switzerland",
      players: [
        {
          name: "Gregor Kobel",
          position: "GK",
          shirt: 1,
        },
        {
          name: "Manuel Akanji",
          position: "DF",
          shirt: 5,
        },
        {
          name: "Nico Elvedi",
          position: "DF",
          shirt: 4,
        },
        {
          name: "Ricardo Rodríguez",
          position: "DF",
          shirt: 13,
        },
        {
          name: "Granit Xhaka",
          position: "MF",
          shirt: 10,
        },
        {
          name: "Remo Freuler",
          position: "MF",
          shirt: 8,
        },
        {
          name: "Denis Zakaria",
          position: "MF",
          shirt: 6,
        },
        {
          name: "Breel Embolo",
          position: "FW",
          shirt: 7,
        },
        {
          name: "Dan Ndoye",
          position: "FW",
          shirt: 11,
        },
        {
          name: "Noah Okafor",
          position: "FW",
          shirt: 19,
        },
      ],
    },
    {
      countryName: "Brazil",
      players: [
        {
          name: "Alisson Becker",
          position: "GK",
          shirt: 1,
        },
        {
          name: "Marquinhos",
          position: "DF",
          shirt: 4,
        },
        {
          name: "Gabriel Magalhães",
          position: "DF",
          shirt: 3,
        },
        {
          name: "Danilo",
          position: "DF",
          shirt: 13,
        },
        {
          name: "Casemiro",
          position: "MF",
          shirt: 5,
        },
        {
          name: "Bruno Guimarães",
          position: "MF",
          shirt: 8,
        },
        {
          name: "Lucas Paquetá",
          position: "MF",
          shirt: 20,
        },
        {
          name: "Vinícius Júnior",
          position: "FW",
          shirt: 7,
        },
        {
          name: "Neymar",
          position: "FW",
          shirt: 10,
        },
        {
          name: "Raphinha",
          position: "FW",
          shirt: 11,
        },
      ],
    },
    {
      countryName: "Haiti",
      players: [
        {
          name: "Johny Placide",
          position: "GK",
          shirt: 1,
        },
        {
          name: "Ricardo Adé",
          position: "DF",
          shirt: 4,
        },
        {
          name: "Hannes Delcroix",
          position: "DF",
          shirt: 5,
        },
        {
          name: "Carlens Arcus",
          position: "DF",
          shirt: 2,
        },
        {
          name: "Jean-Ricner Bellegarde",
          position: "MF",
          shirt: 10,
        },
        {
          name: "Danley Jean Jacques",
          position: "MF",
          shirt: 17,
        },
        {
          name: "Carl Sainté",
          position: "MF",
          shirt: 6,
        },
        {
          name: "Duckens Nazon",
          position: "FW",
          shirt: 9,
        },
        {
          name: "Wilson Isidor",
          position: "FW",
          shirt: 18,
        },
        {
          name: "Frantzdy Pierrot",
          position: "FW",
          shirt: 20,
        },
      ],
    },
    {
      countryName: "Morocco",
      players: [
        {
          name: "Yassine Bounou",
          position: "GK",
          shirt: 1,
        },
        {
          name: "Achraf Hakimi",
          position: "DF",
          shirt: 2,
        },
        {
          name: "Noussair Mazraoui",
          position: "DF",
          shirt: 3,
        },
        {
          name: "Nayef Aguerd",
          position: "DF",
          shirt: 5,
        },
        {
          name: "Sofyan Amrabat",
          position: "MF",
          shirt: 4,
        },
        {
          name: "Azzedine Ounahi",
          position: "MF",
          shirt: 8,
        },
        {
          name: "Bilal El Khannouss",
          position: "MF",
          shirt: 23,
        },
        {
          name: "Brahim Díaz",
          position: "FW",
          shirt: 10,
        },
        {
          name: "Ayoub El Kaabi",
          position: "FW",
          shirt: 20,
        },
        {
          name: "Abde Ezzalzouli",
          position: "FW",
          shirt: 17,
        },
      ],
    },
    {
      countryName: "Scotland",
      players: [
        {
          name: "Angus Gunn",
          position: "GK",
          shirt: 1,
        },
        {
          name: "Andy Robertson",
          position: "DF",
          shirt: 3,
        },
        {
          name: "Kieran Tierney",
          position: "DF",
          shirt: 6,
        },
        {
          name: "Aaron Hickey",
          position: "DF",
          shirt: 2,
        },
        {
          name: "Scott McTominay",
          position: "MF",
          shirt: 4,
        },
        {
          name: "John McGinn",
          position: "MF",
          shirt: 7,
        },
        {
          name: "Ryan Christie",
          position: "MF",
          shirt: 11,
        },
        {
          name: "Ché Adams",
          position: "FW",
          shirt: 10,
        },
        {
          name: "Lyndon Dykes",
          position: "FW",
          shirt: 9,
        },
        {
          name: "Ben Gannon-Doak",
          position: "FW",
          shirt: 17,
        },
      ],
    },
    {
      countryName: "United States",
      players: [
        {
          name: "Matt Turner",
          position: "GK",
          shirt: 1,
        },
        {
          name: "Sergiño Dest",
          position: "DF",
          shirt: 2,
        },
        {
          name: "Antonee Robinson",
          position: "DF",
          shirt: 5,
        },
        {
          name: "Chris Richards",
          position: "DF",
          shirt: 3,
        },
        {
          name: "Tyler Adams",
          position: "MF",
          shirt: 4,
        },
        {
          name: "Weston McKennie",
          position: "MF",
          shirt: 8,
        },
        {
          name: "Malik Tillman",
          position: "MF",
          shirt: 17,
        },
        {
          name: "Christian Pulisic",
          position: "FW",
          shirt: 10,
        },
        {
          name: "Folarin Balogun",
          position: "FW",
          shirt: 20,
        },
        {
          name: "Timothy Weah",
          position: "FW",
          shirt: 21,
        },
      ],
    },
    {
      countryName: "Paraguay",
      players: [
        {
          name: "Gatito Fernández",
          position: "GK",
          shirt: 1,
        },
        {
          name: "Gustavo Gómez",
          position: "DF",
          shirt: 15,
        },
        {
          name: "Omar Alderete",
          position: "DF",
          shirt: 3,
        },
        {
          name: "Júnior Alonso",
          position: "DF",
          shirt: 6,
        },
        {
          name: "Miguel Almirón",
          position: "MF",
          shirt: 10,
        },
        {
          name: "Andrés Cubas",
          position: "MF",
          shirt: 14,
        },
        {
          name: "Diego Gómez",
          position: "MF",
          shirt: 8,
        },
        {
          name: "Ramón Sosa",
          position: "MF",
          shirt: 7,
        },
        {
          name: "Antonio Sanabria",
          position: "FW",
          shirt: 9,
        },
        {
          name: "Julio Enciso",
          position: "FW",
          shirt: 19,
        },
      ],
    },
    {
      countryName: "Australia",
      players: [
        {
          name: "Mathew Ryan",
          position: "GK",
          shirt: 1,
        },
        {
          name: "Harry Souttar",
          position: "DF",
          shirt: 19,
        },
        {
          name: "Aziz Behich",
          position: "DF",
          shirt: 16,
        },
        {
          name: "Jordan Bos",
          position: "DF",
          shirt: 5,
        },
        {
          name: "Jackson Irvine",
          position: "MF",
          shirt: 22,
        },
        {
          name: "Connor Metcalfe",
          position: "MF",
          shirt: 8,
        },
        {
          name: "Aiden O'Neill",
          position: "MF",
          shirt: 13,
        },
        {
          name: "Mathew Leckie",
          position: "FW",
          shirt: 7,
        },
        {
          name: "Nestory Irankunda",
          position: "FW",
          shirt: 17,
        },
        {
          name: "Ajdin Hrustic",
          position: "FW",
          shirt: 10,
        },
      ],
    },
    {
      countryName: "Türkiye",
      players: [
        {
          name: "Uğurcan Çakır",
          position: "GK",
          shirt: 23,
        },
        {
          name: "Merih Demiral",
          position: "DF",
          shirt: 3,
        },
        {
          name: "Çağlar Söyüncü",
          position: "DF",
          shirt: 4,
        },
        {
          name: "Ferdi Kadıoğlu",
          position: "DF",
          shirt: 20,
        },
        {
          name: "Hakan Çalhanoğlu",
          position: "MF",
          shirt: 10,
        },
        {
          name: "Orkun Kökçü",
          position: "MF",
          shirt: 6,
        },
        {
          name: "Salih Özcan",
          position: "MF",
          shirt: 5,
        },
        {
          name: "Arda Güler",
          position: "FW",
          shirt: 8,
        },
        {
          name: "Kenan Yıldız",
          position: "FW",
          shirt: 11,
        },
        {
          name: "Kerem Aktürkoğlu",
          position: "FW",
          shirt: 7,
        },
      ],
    },
    {
      countryName: "Germany",
      players: [
        {
          name: "Manuel Neuer",
          position: "GK",
          shirt: 1,
        },
        {
          name: "Antonio Rüdiger",
          position: "DF",
          shirt: 2,
        },
        {
          name: "Jonathan Tah",
          position: "DF",
          shirt: 4,
        },
        {
          name: "Joshua Kimmich",
          position: "DF",
          shirt: 6,
        },
        {
          name: "Jamal Musiala",
          position: "MF",
          shirt: 10,
        },
        {
          name: "Florian Wirtz",
          position: "MF",
          shirt: 17,
        },
        {
          name: "Leon Goretzka",
          position: "MF",
          shirt: 8,
        },
        {
          name: "Leroy Sané",
          position: "MF",
          shirt: 19,
        },
        {
          name: "Kai Havertz",
          position: "FW",
          shirt: 7,
        },
        {
          name: "Nick Woltemade",
          position: "FW",
          shirt: 11,
        },
      ],
    },
    {
      countryName: "Curaçao",
      players: [
        {
          name: "Eloy Room",
          position: "GK",
          shirt: 1,
        },
        {
          name: "Joshua Brenet",
          position: "DF",
          shirt: 20,
        },
        {
          name: "Armando Obispo",
          position: "DF",
          shirt: 18,
        },
        {
          name: "Riechedly Bazoer",
          position: "DF",
          shirt: 23,
        },
        {
          name: "Leandro Bacuna",
          position: "MF",
          shirt: 10,
        },
        {
          name: "Juninho Bacuna",
          position: "MF",
          shirt: 7,
        },
        {
          name: "Tahith Chong",
          position: "MF",
          shirt: 21,
        },
        {
          name: "Jürgen Locadia",
          position: "FW",
          shirt: 9,
        },
        {
          name: "Sontje Hansen",
          position: "FW",
          shirt: 12,
        },
        {
          name: "Brandley Kuwas",
          position: "FW",
          shirt: 17,
        },
      ],
    },
    {
      countryName: "Côte d'Ivoire",
      players: [
        {
          name: "Yahia Fofana",
          position: "GK",
          shirt: 1,
        },
        {
          name: "Evan Ndicka",
          position: "DF",
          shirt: 21,
        },
        {
          name: "Ousmane Diomande",
          position: "DF",
          shirt: 2,
        },
        {
          name: "Wilfried Singo",
          position: "DF",
          shirt: 5,
        },
        {
          name: "Franck Kessié",
          position: "MF",
          shirt: 8,
        },
        {
          name: "Ibrahim Sangaré",
          position: "MF",
          shirt: 18,
        },
        {
          name: "Seko Fofana",
          position: "MF",
          shirt: 6,
        },
        {
          name: "Amad Diallo",
          position: "FW",
          shirt: 15,
        },
        {
          name: "Simon Adingra",
          position: "FW",
          shirt: 10,
        },
        {
          name: "Nicolas Pépé",
          position: "FW",
          shirt: 19,
        },
      ],
    },
    {
      countryName: "Ecuador",
      players: [
        {
          name: "Hernán Galíndez",
          position: "GK",
          shirt: 1,
        },
        {
          name: "Piero Hincapié",
          position: "DF",
          shirt: 3,
        },
        {
          name: "Willian Pacho",
          position: "DF",
          shirt: 6,
        },
        {
          name: "Pervis Estupiñán",
          position: "DF",
          shirt: 7,
        },
        {
          name: "Joel Ordóñez",
          position: "DF",
          shirt: 4,
        },
        {
          name: "Moisés Caicedo",
          position: "MF",
          shirt: 23,
        },
        {
          name: "Kendry Páez",
          position: "MF",
          shirt: 10,
        },
        {
          name: "Alan Franco",
          position: "MF",
          shirt: 21,
        },
        {
          name: "Enner Valencia",
          position: "FW",
          shirt: 13,
        },
        {
          name: "Gonzalo Plata",
          position: "FW",
          shirt: 19,
        },
      ],
    },
    {
      countryName: "Netherlands",
      players: [
        {
          name: "Bart Verbruggen",
          position: "GK",
          shirt: 1,
        },
        {
          name: "Virgil van Dijk",
          position: "DF",
          shirt: 4,
        },
        {
          name: "Nathan Aké",
          position: "DF",
          shirt: 5,
        },
        {
          name: "Denzel Dumfries",
          position: "DF",
          shirt: 22,
        },
        {
          name: "Frenkie de Jong",
          position: "MF",
          shirt: 21,
        },
        {
          name: "Tijjani Reijnders",
          position: "MF",
          shirt: 14,
        },
        {
          name: "Ryan Gravenberch",
          position: "MF",
          shirt: 8,
        },
        {
          name: "Memphis Depay",
          position: "FW",
          shirt: 10,
        },
        {
          name: "Cody Gakpo",
          position: "FW",
          shirt: 11,
        },
        {
          name: "Wout Weghorst",
          position: "FW",
          shirt: 9,
        },
      ],
    },
    {
      countryName: "Japan",
      players: [
        {
          name: "Zion Suzuki",
          position: "GK",
          shirt: 1,
        },
        {
          name: "Kō Itakura",
          position: "DF",
          shirt: 4,
        },
        {
          name: "Takehiro Tomiyasu",
          position: "DF",
          shirt: 22,
        },
        {
          name: "Hiroki Itō",
          position: "DF",
          shirt: 21,
        },
        {
          name: "Takefusa Kubo",
          position: "MF",
          shirt: 8,
        },
        {
          name: "Ritsu Dōan",
          position: "MF",
          shirt: 10,
        },
        {
          name: "Wataru Endo",
          position: "MF",
          shirt: 6,
        },
        {
          name: "Daichi Kamada",
          position: "MF",
          shirt: 15,
        },
        {
          name: "Ayase Ueda",
          position: "FW",
          shirt: 18,
        },
        {
          name: "Kōki Ogawa",
          position: "FW",
          shirt: 19,
        },
      ],
    },
    {
      countryName: "Sweden",
      players: [
        {
          name: "Viktor Johansson",
          position: "GK",
          shirt: 12,
        },
        {
          name: "Victor Lindelöf",
          position: "DF",
          shirt: 3,
        },
        {
          name: "Isak Hien",
          position: "DF",
          shirt: 4,
        },
        {
          name: "Gabriel Gudmundsson",
          position: "DF",
          shirt: 5,
        },
        {
          name: "Lucas Bergvall",
          position: "MF",
          shirt: 7,
        },
        {
          name: "Yasin Ayari",
          position: "MF",
          shirt: 18,
        },
        {
          name: "Mattias Svanberg",
          position: "MF",
          shirt: 19,
        },
        {
          name: "Alexander Isak",
          position: "FW",
          shirt: 9,
        },
        {
          name: "Viktor Gyökeres",
          position: "FW",
          shirt: 17,
        },
        {
          name: "Anthony Elanga",
          position: "FW",
          shirt: 11,
        },
      ],
    },
    {
      countryName: "Tunisia",
      players: [
        {
          name: "Aymen Dahmen",
          position: "GK",
          shirt: 16,
        },
        {
          name: "Montassar Talbi",
          position: "DF",
          shirt: 3,
        },
        {
          name: "Dylan Bronn",
          position: "DF",
          shirt: 6,
        },
        {
          name: "Ali Abdi",
          position: "DF",
          shirt: 2,
        },
        {
          name: "Hannibal Mejbri",
          position: "MF",
          shirt: 10,
        },
        {
          name: "Ellyes Skhiri",
          position: "MF",
          shirt: 17,
        },
        {
          name: "Ismaël Gharbi",
          position: "MF",
          shirt: 11,
        },
        {
          name: "Elias Saad",
          position: "FW",
          shirt: 8,
        },
        {
          name: "Elias Achouri",
          position: "FW",
          shirt: 7,
        },
        {
          name: "Hazem Mastouri",
          position: "FW",
          shirt: 9,
        },
      ],
    },
    {
      countryName: "Belgium",
      players: [
        {
          name: "Thibaut Courtois",
          position: "GK",
          shirt: 1,
        },
        {
          name: "Zeno Debast",
          position: "DF",
          shirt: 2,
        },
        {
          name: "Arthur Theate",
          position: "DF",
          shirt: 3,
        },
        {
          name: "Timothy Castagne",
          position: "DF",
          shirt: 21,
        },
        {
          name: "Kevin De Bruyne",
          position: "MF",
          shirt: 7,
        },
        {
          name: "Youri Tielemans",
          position: "MF",
          shirt: 8,
        },
        {
          name: "Amadou Onana",
          position: "MF",
          shirt: 24,
        },
        {
          name: "Romelu Lukaku",
          position: "FW",
          shirt: 9,
        },
        {
          name: "Jérémy Doku",
          position: "FW",
          shirt: 11,
        },
        {
          name: "Leandro Trossard",
          position: "FW",
          shirt: 10,
        },
      ],
    },
    {
      countryName: "Egypt",
      players: [
        {
          name: "Mohamed El Shenawy",
          position: "GK",
          shirt: 1,
        },
        {
          name: "Mohamed Abdelmonem",
          position: "DF",
          shirt: 6,
        },
        {
          name: "Ramy Rabia",
          position: "DF",
          shirt: 5,
        },
        {
          name: "Ahmed Fatouh",
          position: "DF",
          shirt: 13,
        },
        {
          name: "Emam Ashour",
          position: "MF",
          shirt: 8,
        },
        {
          name: "Hamdy Fathy",
          position: "MF",
          shirt: 14,
        },
        {
          name: "Marwan Attia",
          position: "MF",
          shirt: 19,
        },
        {
          name: "Mohamed Salah",
          position: "FW",
          shirt: 10,
        },
        {
          name: "Omar Marmoush",
          position: "FW",
          shirt: 22,
        },
        {
          name: "Trézéguet",
          position: "FW",
          shirt: 7,
        },
      ],
    },
    {
      countryName: "Iran",
      players: [
        {
          name: "Alireza Beiranvand",
          position: "GK",
          shirt: 1,
        },
        {
          name: "Hossein Kanaanizadegan",
          position: "DF",
          shirt: 13,
        },
        {
          name: "Ramin Rezaeian",
          position: "DF",
          shirt: 23,
        },
        {
          name: "Milad Mohammadi",
          position: "DF",
          shirt: 5,
        },
        {
          name: "Alireza Jahanbakhsh",
          position: "MF",
          shirt: 7,
        },
        {
          name: "Saman Ghoddos",
          position: "MF",
          shirt: 14,
        },
        {
          name: "Saeid Ezatolahi",
          position: "MF",
          shirt: 6,
        },
        {
          name: "Mehdi Taremi",
          position: "FW",
          shirt: 9,
        },
        {
          name: "Mehdi Ghayedi",
          position: "FW",
          shirt: 10,
        },
        {
          name: "Ali Alipour",
          position: "FW",
          shirt: 11,
        },
      ],
    },
    {
      countryName: "New Zealand",
      players: [
        {
          name: "Max Crocombe",
          position: "GK",
          shirt: 1,
        },
        {
          name: "Michael Boxall",
          position: "DF",
          shirt: 5,
        },
        {
          name: "Liberato Cacace",
          position: "DF",
          shirt: 13,
        },
        {
          name: "Tyler Bindon",
          position: "DF",
          shirt: 4,
        },
        {
          name: "Joe Bell",
          position: "MF",
          shirt: 6,
        },
        {
          name: "Marko Stamenić",
          position: "MF",
          shirt: 8,
        },
        {
          name: "Sarpreet Singh",
          position: "MF",
          shirt: 10,
        },
        {
          name: "Chris Wood",
          position: "FW",
          shirt: 9,
        },
        {
          name: "Kosta Barbarouses",
          position: "FW",
          shirt: 17,
        },
        {
          name: "Ben Waine",
          position: "FW",
          shirt: 18,
        },
      ],
    },
    {
      countryName: "Spain",
      players: [
        {
          name: "Unai Simón",
          position: "GK",
          shirt: 23,
        },
        {
          name: "Pau Cubarsí",
          position: "DF",
          shirt: 22,
        },
        {
          name: "Marc Cucurella",
          position: "DF",
          shirt: 24,
        },
        {
          name: "Aymeric Laporte",
          position: "DF",
          shirt: 14,
        },
        {
          name: "Rodri",
          position: "MF",
          shirt: 16,
        },
        {
          name: "Pedri",
          position: "MF",
          shirt: 20,
        },
        {
          name: "Fabián Ruiz",
          position: "MF",
          shirt: 8,
        },
        {
          name: "Lamine Yamal",
          position: "FW",
          shirt: 19,
        },
        {
          name: "Nico Williams",
          position: "FW",
          shirt: 17,
        },
        {
          name: "Mikel Oyarzabal",
          position: "FW",
          shirt: 21,
        },
      ],
    },
    {
      countryName: "Cape Verde",
      players: [
        {
          name: "Vozinha",
          position: "GK",
          shirt: 1,
        },
        {
          name: "Roberto Lopes",
          position: "DF",
          shirt: 4,
        },
        {
          name: "Logan Costa",
          position: "DF",
          shirt: 5,
        },
        {
          name: "Steven Moreira",
          position: "DF",
          shirt: 22,
        },
        {
          name: "Jamiro Monteiro",
          position: "MF",
          shirt: 10,
        },
        {
          name: "Jovane Cabral",
          position: "MF",
          shirt: 7,
        },
        {
          name: "Kevin Pina",
          position: "MF",
          shirt: 6,
        },
        {
          name: "Ryan Mendes",
          position: "FW",
          shirt: 20,
        },
        {
          name: "Dailon Livramento",
          position: "FW",
          shirt: 19,
        },
        {
          name: "Gilson Benchimol",
          position: "FW",
          shirt: 9,
        },
      ],
    },
    {
      countryName: "Saudi Arabia",
      players: [
        {
          name: "Mohammed Al-Owais",
          position: "GK",
          shirt: 21,
        },
        {
          name: "Hassan Al-Tambakti",
          position: "DF",
          shirt: 5,
        },
        {
          name: "Saud Abdulhamid",
          position: "DF",
          shirt: 12,
        },
        {
          name: "Ali Lajami",
          position: "DF",
          shirt: 3,
        },
        {
          name: "Mohamed Kanno",
          position: "MF",
          shirt: 23,
        },
        {
          name: "Musab Al-Juwayr",
          position: "MF",
          shirt: 7,
        },
        {
          name: "Abdullah Al-Khaibari",
          position: "MF",
          shirt: 15,
        },
        {
          name: "Salem Al-Dawsari",
          position: "FW",
          shirt: 10,
        },
        {
          name: "Firas Al-Buraikan",
          position: "FW",
          shirt: 9,
        },
        {
          name: "Saleh Al-Shehri",
          position: "FW",
          shirt: 11,
        },
      ],
    },
    {
      countryName: "Uruguay",
      players: [
        {
          name: "Sergio Rochet",
          position: "GK",
          shirt: 1,
        },
        {
          name: "Ronald Araújo",
          position: "DF",
          shirt: 4,
        },
        {
          name: "José María Giménez",
          position: "DF",
          shirt: 2,
        },
        {
          name: "Mathías Olivera",
          position: "DF",
          shirt: 16,
        },
        {
          name: "Federico Valverde",
          position: "MF",
          shirt: 8,
        },
        {
          name: "Rodrigo Bentancur",
          position: "MF",
          shirt: 6,
        },
        {
          name: "Manuel Ugarte",
          position: "MF",
          shirt: 5,
        },
        {
          name: "Giorgian de Arrascaeta",
          position: "MF",
          shirt: 10,
        },
        {
          name: "Darwin Núñez",
          position: "FW",
          shirt: 9,
        },
        {
          name: "Facundo Pellistri",
          position: "FW",
          shirt: 11,
        },
      ],
    },
    {
      countryName: "France",
      players: [
        {
          name: "Mike Maignan",
          position: "GK",
          shirt: 16,
        },
        {
          name: "Jules Koundé",
          position: "DF",
          shirt: 5,
        },
        {
          name: "William Saliba",
          position: "DF",
          shirt: 17,
        },
        {
          name: "Théo Hernandez",
          position: "DF",
          shirt: 19,
        },
        {
          name: "Aurélien Tchouaméni",
          position: "MF",
          shirt: 8,
        },
        {
          name: "Adrien Rabiot",
          position: "MF",
          shirt: 14,
        },
        {
          name: "N'Golo Kanté",
          position: "MF",
          shirt: 13,
        },
        {
          name: "Kylian Mbappé",
          position: "FW",
          shirt: 10,
        },
        {
          name: "Ousmane Dembélé",
          position: "FW",
          shirt: 7,
        },
        {
          name: "Marcus Thuram",
          position: "FW",
          shirt: 9,
        },
      ],
    },
    {
      countryName: "Senegal",
      players: [
        {
          name: "Édouard Mendy",
          position: "GK",
          shirt: 16,
        },
        {
          name: "Kalidou Koulibaly",
          position: "DF",
          shirt: 3,
        },
        {
          name: "Moussa Niakhaté",
          position: "DF",
          shirt: 19,
        },
        {
          name: "Krépin Diatta",
          position: "DF",
          shirt: 15,
        },
        {
          name: "Idrissa Gueye",
          position: "MF",
          shirt: 5,
        },
        {
          name: "Pape Matar Sarr",
          position: "MF",
          shirt: 17,
        },
        {
          name: "Lamine Camara",
          position: "MF",
          shirt: 8,
        },
        {
          name: "Sadio Mané",
          position: "FW",
          shirt: 10,
        },
        {
          name: "Ismaïla Sarr",
          position: "FW",
          shirt: 18,
        },
        {
          name: "Nicolas Jackson",
          position: "FW",
          shirt: 11,
        },
      ],
    },
    {
      countryName: "Iraq",
      players: [
        {
          name: "Jalal Hassan",
          position: "GK",
          shirt: 12,
        },
        {
          name: "Rebin Sulaka",
          position: "DF",
          shirt: 2,
        },
        {
          name: "Merchas Doski",
          position: "DF",
          shirt: 23,
        },
        {
          name: "Hussein Ali",
          position: "DF",
          shirt: 3,
        },
        {
          name: "Ibrahim Bayesh",
          position: "MF",
          shirt: 8,
        },
        {
          name: "Zidane Iqbal",
          position: "MF",
          shirt: 14,
        },
        {
          name: "Amir Al-Ammari",
          position: "MF",
          shirt: 16,
        },
        {
          name: "Aymen Hussein",
          position: "FW",
          shirt: 18,
        },
        {
          name: "Ali Al-Hamadi",
          position: "FW",
          shirt: 9,
        },
        {
          name: "Mohanad Ali",
          position: "FW",
          shirt: 10,
        },
      ],
    },
    {
      countryName: "Norway",
      players: [
        {
          name: "Ørjan Nyland",
          position: "GK",
          shirt: 1,
        },
        {
          name: "Kristoffer Ajer",
          position: "DF",
          shirt: 3,
        },
        {
          name: "Leo Østigård",
          position: "DF",
          shirt: 4,
        },
        {
          name: "David Møller Wolfe",
          position: "DF",
          shirt: 5,
        },
        {
          name: "Martin Ødegaard",
          position: "MF",
          shirt: 10,
        },
        {
          name: "Sander Berge",
          position: "MF",
          shirt: 8,
        },
        {
          name: "Patrick Berg",
          position: "MF",
          shirt: 6,
        },
        {
          name: "Erling Haaland",
          position: "FW",
          shirt: 9,
        },
        {
          name: "Alexander Sørloth",
          position: "FW",
          shirt: 7,
        },
        {
          name: "Antonio Nusa",
          position: "FW",
          shirt: 20,
        },
      ],
    },
    {
      countryName: "Argentina",
      players: [
        {
          name: "Emiliano Martínez",
          position: "GK",
          shirt: 23,
        },
        {
          name: "Cristian Romero",
          position: "DF",
          shirt: 13,
        },
        {
          name: "Nicolás Otamendi",
          position: "DF",
          shirt: 19,
        },
        {
          name: "Nicolás Tagliafico",
          position: "DF",
          shirt: 3,
        },
        {
          name: "Rodrigo De Paul",
          position: "MF",
          shirt: 7,
        },
        {
          name: "Alexis Mac Allister",
          position: "MF",
          shirt: 20,
        },
        {
          name: "Enzo Fernández",
          position: "MF",
          shirt: 24,
        },
        {
          name: "Lionel Messi",
          position: "FW",
          shirt: 10,
        },
        {
          name: "Julián Álvarez",
          position: "FW",
          shirt: 9,
        },
        {
          name: "Lautaro Martínez",
          position: "FW",
          shirt: 22,
        },
      ],
    },
    {
      countryName: "Algeria",
      players: [
        {
          name: "Luca Zidane",
          position: "GK",
          shirt: 23,
        },
        {
          name: "Aïssa Mandi",
          position: "DF",
          shirt: 2,
        },
        {
          name: "Rayan Aït-Nouri",
          position: "DF",
          shirt: 15,
        },
        {
          name: "Ramy Bensebaini",
          position: "DF",
          shirt: 21,
        },
        {
          name: "Houssem Aouar",
          position: "MF",
          shirt: 8,
        },
        {
          name: "Nabil Bentaleb",
          position: "MF",
          shirt: 19,
        },
        {
          name: "Hicham Boudaoui",
          position: "MF",
          shirt: 14,
        },
        {
          name: "Riyad Mahrez",
          position: "FW",
          shirt: 7,
        },
        {
          name: "Mohamed Amoura",
          position: "FW",
          shirt: 18,
        },
        {
          name: "Amine Gouiri",
          position: "FW",
          shirt: 9,
        },
      ],
    },
    {
      countryName: "Austria",
      players: [
        {
          name: "Patrick Pentz",
          position: "GK",
          shirt: 13,
        },
        {
          name: "David Alaba",
          position: "DF",
          shirt: 8,
        },
        {
          name: "Kevin Danso",
          position: "DF",
          shirt: 3,
        },
        {
          name: "Stefan Posch",
          position: "DF",
          shirt: 5,
        },
        {
          name: "Marcel Sabitzer",
          position: "MF",
          shirt: 9,
        },
        {
          name: "Konrad Laimer",
          position: "MF",
          shirt: 20,
        },
        {
          name: "Xaver Schlager",
          position: "MF",
          shirt: 4,
        },
        {
          name: "Nicolas Seiwald",
          position: "MF",
          shirt: 6,
        },
        {
          name: "Marko Arnautović",
          position: "FW",
          shirt: 7,
        },
        {
          name: "Michael Gregoritsch",
          position: "FW",
          shirt: 11,
        },
      ],
    },
    {
      countryName: "Jordan",
      players: [
        {
          name: "Yazeed Abulaila",
          position: "GK",
          shirt: 1,
        },
        {
          name: "Yazan Al-Arab",
          position: "DF",
          shirt: 5,
        },
        {
          name: "Abdallah Nasib",
          position: "DF",
          shirt: 3,
        },
        {
          name: "Ihsan Haddad",
          position: "DF",
          shirt: 23,
        },
        {
          name: "Noor Al-Rawabdeh",
          position: "MF",
          shirt: 8,
        },
        {
          name: "Nizar Al-Rashdan",
          position: "MF",
          shirt: 21,
        },
        {
          name: "Rajaei Ayed",
          position: "MF",
          shirt: 14,
        },
        {
          name: "Musa Al-Taamari",
          position: "FW",
          shirt: 10,
        },
        {
          name: "Ali Olwan",
          position: "FW",
          shirt: 9,
        },
        {
          name: "Mahmoud Al-Mardi",
          position: "FW",
          shirt: 13,
        },
      ],
    },
    {
      countryName: "Portugal",
      players: [
        {
          name: "Diogo Costa",
          position: "GK",
          shirt: 1,
        },
        {
          name: "Rúben Dias",
          position: "DF",
          shirt: 3,
        },
        {
          name: "João Cancelo",
          position: "DF",
          shirt: 20,
        },
        {
          name: "Nuno Mendes",
          position: "DF",
          shirt: 25,
        },
        {
          name: "Bruno Fernandes",
          position: "MF",
          shirt: 8,
        },
        {
          name: "Bernardo Silva",
          position: "MF",
          shirt: 10,
        },
        {
          name: "Vitinha",
          position: "MF",
          shirt: 23,
        },
        {
          name: "Cristiano Ronaldo",
          position: "FW",
          shirt: 7,
        },
        {
          name: "Rafael Leão",
          position: "FW",
          shirt: 17,
        },
        {
          name: "João Félix",
          position: "FW",
          shirt: 11,
        },
      ],
    },
    {
      countryName: "DR Congo",
      players: [
        {
          name: "Lionel Mpasi",
          position: "GK",
          shirt: 1,
        },
        {
          name: "Aaron Wan-Bissaka",
          position: "DF",
          shirt: 2,
        },
        {
          name: "Chancel Mbemba",
          position: "DF",
          shirt: 22,
        },
        {
          name: "Arthur Masuaku",
          position: "DF",
          shirt: 26,
        },
        {
          name: "Théo Bongonda",
          position: "MF",
          shirt: 10,
        },
        {
          name: "Charles Pickel",
          position: "MF",
          shirt: 18,
        },
        {
          name: "Noah Sadiki",
          position: "MF",
          shirt: 14,
        },
        {
          name: "Yoane Wissa",
          position: "FW",
          shirt: 20,
        },
        {
          name: "Cédric Bakambu",
          position: "FW",
          shirt: 17,
        },
        {
          name: "Fiston Mayele",
          position: "FW",
          shirt: 19,
        },
      ],
    },
    {
      countryName: "Uzbekistan",
      players: [
        {
          name: "Utkir Yusupov",
          position: "GK",
          shirt: 1,
        },
        {
          name: "Abdukodir Khusanov",
          position: "DF",
          shirt: 2,
        },
        {
          name: "Rustam Ashurmatov",
          position: "DF",
          shirt: 5,
        },
        {
          name: "Farrukh Sayfiev",
          position: "DF",
          shirt: 4,
        },
        {
          name: "Otabek Shukurov",
          position: "MF",
          shirt: 7,
        },
        {
          name: "Abbosbek Fayzullaev",
          position: "MF",
          shirt: 22,
        },
        {
          name: "Jaloliddin Masharipov",
          position: "MF",
          shirt: 10,
        },
        {
          name: "Eldor Shomurodov",
          position: "FW",
          shirt: 14,
        },
        {
          name: "Igor Sergeev",
          position: "FW",
          shirt: 21,
        },
        {
          name: "Azizbek Amonov",
          position: "FW",
          shirt: 20,
        },
      ],
    },
    {
      countryName: "Colombia",
      players: [
        {
          name: "David Ospina",
          position: "GK",
          shirt: 1,
        },
        {
          name: "Daniel Muñoz",
          position: "DF",
          shirt: 2,
        },
        {
          name: "Davinson Sánchez",
          position: "DF",
          shirt: 23,
        },
        {
          name: "Yerry Mina",
          position: "DF",
          shirt: 13,
        },
        {
          name: "James Rodríguez",
          position: "MF",
          shirt: 10,
        },
        {
          name: "Richard Ríos",
          position: "MF",
          shirt: 6,
        },
        {
          name: "Jefferson Lerma",
          position: "MF",
          shirt: 16,
        },
        {
          name: "Luis Díaz",
          position: "FW",
          shirt: 7,
        },
        {
          name: "Jhon Córdoba",
          position: "FW",
          shirt: 9,
        },
        {
          name: "Cucho Hernández",
          position: "FW",
          shirt: 19,
        },
      ],
    },
    {
      countryName: "England",
      players: [
        {
          name: "Jordan Pickford",
          position: "GK",
          shirt: 1,
        },
        {
          name: "John Stones",
          position: "DF",
          shirt: 5,
        },
        {
          name: "Marc Guéhi",
          position: "DF",
          shirt: 6,
        },
        {
          name: "Reece James",
          position: "DF",
          shirt: 24,
        },
        {
          name: "Jude Bellingham",
          position: "MF",
          shirt: 10,
        },
        {
          name: "Declan Rice",
          position: "MF",
          shirt: 4,
        },
        {
          name: "Eberechi Eze",
          position: "MF",
          shirt: 21,
        },
        {
          name: "Harry Kane",
          position: "FW",
          shirt: 9,
        },
        {
          name: "Bukayo Saka",
          position: "FW",
          shirt: 7,
        },
        {
          name: "Marcus Rashford",
          position: "FW",
          shirt: 11,
        },
      ],
    },
    {
      countryName: "Croatia",
      players: [
        {
          name: "Dominik Livaković",
          position: "GK",
          shirt: 1,
        },
        {
          name: "Joško Gvardiol",
          position: "DF",
          shirt: 4,
        },
        {
          name: "Josip Stanišić",
          position: "DF",
          shirt: 2,
        },
        {
          name: "Josip Šutalo",
          position: "DF",
          shirt: 6,
        },
        {
          name: "Luka Modrić",
          position: "MF",
          shirt: 10,
        },
        {
          name: "Mateo Kovačić",
          position: "MF",
          shirt: 8,
        },
        {
          name: "Nikola Vlašić",
          position: "MF",
          shirt: 13,
        },
        {
          name: "Andrej Kramarić",
          position: "FW",
          shirt: 9,
        },
        {
          name: "Ivan Perišić",
          position: "FW",
          shirt: 14,
        },
        {
          name: "Ante Budimir",
          position: "FW",
          shirt: 11,
        },
      ],
    },
    {
      countryName: "Ghana",
      players: [
        {
          name: "Lawrence Ati-Zigi",
          position: "GK",
          shirt: 1,
        },
        {
          name: "Alidu Seidu",
          position: "DF",
          shirt: 2,
        },
        {
          name: "Abdul Rahman Baba",
          position: "DF",
          shirt: 17,
        },
        {
          name: "Abdul Mumin",
          position: "DF",
          shirt: 6,
        },
        {
          name: "Thomas Partey",
          position: "MF",
          shirt: 5,
        },
        {
          name: "Antoine Semenyo",
          position: "MF",
          shirt: 11,
        },
        {
          name: "Elisha Owusu",
          position: "MF",
          shirt: 15,
        },
        {
          name: "Jordan Ayew",
          position: "FW",
          shirt: 9,
        },
        {
          name: "Iñaki Williams",
          position: "FW",
          shirt: 19,
        },
        {
          name: "Kamaldeen Sulemana",
          position: "FW",
          shirt: 22,
        },
      ],
    },
    {
      countryName: "Panama",
      players: [
        {
          name: "Luis Mejía",
          position: "GK",
          shirt: 1,
        },
        {
          name: "Michael Amir Murillo",
          position: "DF",
          shirt: 23,
        },
        {
          name: "José Córdoba",
          position: "DF",
          shirt: 3,
        },
        {
          name: "Fidel Escobar",
          position: "DF",
          shirt: 4,
        },
        {
          name: "Adalberto Carrasquilla",
          position: "MF",
          shirt: 8,
        },
        {
          name: "Aníbal Godoy",
          position: "MF",
          shirt: 20,
        },
        {
          name: "José Luis Rodríguez",
          position: "MF",
          shirt: 7,
        },
        {
          name: "Ismael Díaz",
          position: "MF",
          shirt: 10,
        },
        {
          name: "José Fajardo",
          position: "FW",
          shirt: 17,
        },
        {
          name: "Cecilio Waterman",
          position: "FW",
          shirt: 18,
        },
      ],
    },
  ],
};
