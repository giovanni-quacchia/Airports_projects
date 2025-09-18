const usersId = {
  admin: "650f0a4f3b7e41b94cfe4d09",
  user: "650f0a4f3b7e41b94cfe4d10",
  user2: "650f0a4f3b7e41b94cfe4d11"
}

export const users = [
  {
    _id: usersId.admin,
    mail: "admin@gmail.com",
    password: "admin",
    isAdmin: true
  },
  {
    _id: usersId.user,
    mail: "user@gmail.com",
    password: "user",
    balance: 0,
  },
  {
    _id: usersId.user2,
    mail: "user2@gmail.com",
    password: "user2",
    balance: 5000,
  }
]

const airlinesId = {
  FR: "650f0a4f3b7e41b94cfe4d12",
  U2: "650f0a4f3b7e41b94cfe4d13",
  LH: "650f0a4f3b7e41b94cfe4d14",
  AZ: "650f0a4f3b7e41b94cfe4d15",
  AF: "650f0a4f3b7e41b94cfe4d16",
  BA: "650f0a4f3b7e41b94cfe4d17",
  EK: "650f0a4f3b7e41b94cfe4d18"
}

export const airlines = [
  {
    _id: airlinesId.FR,
    code: "FR",
    PIVA: "IE123456789",
    name: "Ryanair",
    logo: "https://cdn.worldvectorlogo.com/logos/ryanair-1.svg",
    mail: "contact@ryanair.com"
  },
  {
    _id: airlinesId.BA,
    code: "BA",
    PIVA: "GB987654321",
    name: "British Airways",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/d7/British_Airways_Logo.svg",
    mail: "contact@ba.com"
  },
  {
    _id: airlinesId.AF,
    code: "AF",
    PIVA: "FR456789123",
    name: "Air France",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Air_France_Logo.svg",
    mail: "contact@airfrance.com"
  },
  {
    _id: airlinesId.LH,
    code: "LH",
    PIVA: "DE852369741",
    name: "Lufthansa",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Lufthansa_Logo_2018.svg",
    mail: "contact@lufthansa.com"
  },
  {
    _id: airlinesId.AZ,
    code: "AZ",
    PIVA: "IT741852963",
    name: "ITA Airways",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f1/ITA_Airways_logo.svg",
    mail: "contact@itaairways.com"
  },
  {
    _id: airlinesId.EK,
    code: "EK",
    PIVA: "AE987654321",
    name: "Emirates",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/d8/Emirates_logo.svg",
    mail: "contact@emirates.com"
  }
];

const airplanesId = {
  1: "6540a1f43b7e41b94cfe6d01",
  2: "6540a1f43b7e41b94cfe6d02",
  3: "6540a1f43b7e41b94cfe6d03",
  4: "6540a1f43b7e41b94cfe6d04",
  5: "6540a1f43b7e41b94cfe6d05",
  6: "6540a1f43b7e41b94cfe6d06"
};

export const airplanes = [
  { _id: airplanesId[1], code: 1, model: "Airbus A320neo", airline: airlinesId.FR, rows: 30, letters: 6 },
  { _id: airplanesId[2], code: 2, model: "Boeing 737-800", airline: airlinesId.BA, rows: 32, letters: 6 },
  { _id: airplanesId[3], code: 3, model: "Embraer E190", airline: airlinesId.AF, rows: 28, letters: 4 },
  { _id: airplanesId[4], code: 4, model: "Boeing 777-300ER", airline: airlinesId.LH, rows: 40, letters: 9 },
  { _id: airplanesId[5], code: 5, model: "Airbus A330-200", airline: airlinesId.AZ, rows: 28, letters: 6 },
  { _id: airplanesId[6], code: 6, model: "Boeing 777-200LR", airline: airlinesId.EK, rows: 42, letters: 10 }
];

const airportsId = {
  VCE: "6510a1f43b7e41b94cfe4d12",
  FCO: "6510a1f43b7e41b94cfe4d13",
  JFK: "6510a1f43b7e41b94cfe4d14",
  LAX: "6510a1f43b7e41b94cfe4d15",
  HND: "6510a1f43b7e41b94cfe4d16",
  DXB: "6510a1f43b7e41b94cfe4d17",
  BER: "6510a1f43b7e41b94cfe4d18",
  SYD: "6510a1f43b7e41b94cfe4d19",
  PEK: "6510a1f43b7e41b94cfe4d1a",
  EZE: "6510a1f43b7e41b94cfe4d1b",
  CDG: "6510a1f43b7e41b94cfe4d1c",
  BCN: "6510a1f43b7e41b94cfe4d1d"
};

export const airports = [
  { _id: airportsId.VCE, name: "Venice Marco Polo Airport", city: "Venice", code: "VCE", country: "Italy" },
  { _id: airportsId.FCO, name: "Rome Fiumicino Airport", city: "Rome", code: "FCO", country: "Italy" },
  { _id: airportsId.JFK, name: "John F. Kennedy International Airport", city: "New York", code: "JFK", country: "USA" },
  { _id: airportsId.LAX, name: "Los Angeles International Airport", city: "Los Angeles", code: "LAX", country: "USA" },
  { _id: airportsId.HND, name: "Tokyo Haneda Airport", city: "Tokyo", code: "HND", country: "Japan" },
  { _id: airportsId.DXB, name: "Dubai International Airport", city: "Dubai", code: "DXB", country: "UAE" },
  { _id: airportsId.BER, name: "Berlin Brandenburg Airport", city: "Berlin", code: "BER", country: "Germany" },
  { _id: airportsId.SYD, name: "Sydney Kingsford Smith Airport", city: "Sydney", code: "SYD", country: "Australia" },
  { _id: airportsId.PEK, name: "Beijing Capital International Airport", city: "Beijing", code: "PEK", country: "China" },
  { _id: airportsId.EZE, name: "Ezeiza International Airport", city: "Buenos Aires", code: "EZE", country: "Argentina" },
  { _id: airportsId.CDG, name: "Charles de Gaulle Airport", city: "Paris", code: "CDG", country: "France" },
  { _id: airportsId.BCN, name: "Barcelona–El Prat Airport", city: "Barcelona", code: "BCN", country: "Spain" }
];

const routesId = {
  VCE_FCO: "6520a1f43b7e41b94cfe4d21",
  VCE_JFK: "6520a1f43b7e41b94cfe4d22",
  FCO_LAX: "6520a1f43b7e41b94cfe4d23",
  JFK_HND: "6520a1f43b7e41b94cfe4d24",
  LAX_DXB: "6520a1f43b7e41b94cfe4d25",
  HND_BER: "6520a1f43b7e41b94cfe4d26",
  DXB_SYD: "6520a1f43b7e41b94cfe4d27",
  BER_PEK: "6520a1f43b7e41b94cfe4d28",
  SYD_EZE: "6520a1f43b7e41b94cfe4d29",
  PEK_CDG: "6520a1f43b7e41b94cfe4d2a",
  EZE_BCN: "6520a1f43b7e41b94cfe4d2b",
  CDG_VCE: "6520a1f43b7e41b94cfe4d2c",
  BCN_FCO: "6520a1f43b7e41b94cfe4d2d",
  FCO_DXB: "6520a1f43b7e41b94cfe4d2e",
  JFK_SYD: "6520a1f43b7e41b94cfe4d2f",
  LAX_PEK: "6520a1f43b7e41b94cfe4d30",
  HND_EZE: "6520a1f43b7e41b94cfe4d31",
  DXB_CDG: "6520a1f43b7e41b94cfe4d32",
  BER_BCN: "6520a1f43b7e41b94cfe4d33",
  SYD_JFK: "6520a1f43b7e41b94cfe4d34",
  JFK_BER: "6520a1f43b7e41b94cfe4d35",
  HND_DXB: "6520a1f43b7e41b94cfe4d36"
};

export const routes = [
  { _id: routesId.VCE_FCO, from: airportsId.VCE, to: airportsId.FCO },
  { _id: routesId.VCE_JFK, from: airportsId.VCE, to: airportsId.JFK },
  { _id: routesId.FCO_LAX, from: airportsId.FCO, to: airportsId.LAX },
  { _id: routesId.JFK_HND, from: airportsId.JFK, to: airportsId.HND },
  { _id: routesId.LAX_DXB, from: airportsId.LAX, to: airportsId.DXB },
  { _id: routesId.HND_BER, from: airportsId.HND, to: airportsId.BER },
  { _id: routesId.DXB_SYD, from: airportsId.DXB, to: airportsId.SYD },
  { _id: routesId.BER_PEK, from: airportsId.BER, to: airportsId.PEK },
  { _id: routesId.SYD_EZE, from: airportsId.SYD, to: airportsId.EZE },
  { _id: routesId.PEK_CDG, from: airportsId.PEK, to: airportsId.CDG },
  { _id: routesId.EZE_BCN, from: airportsId.EZE, to: airportsId.BCN },
  { _id: routesId.CDG_VCE, from: airportsId.CDG, to: airportsId.VCE },
  { _id: routesId.BCN_FCO, from: airportsId.BCN, to: airportsId.FCO },
  { _id: routesId.FCO_DXB, from: airportsId.FCO, to: airportsId.DXB },
  { _id: routesId.JFK_SYD, from: airportsId.JFK, to: airportsId.SYD },
  { _id: routesId.LAX_PEK, from: airportsId.LAX, to: airportsId.PEK },
  { _id: routesId.HND_EZE, from: airportsId.HND, to: airportsId.EZE },
  { _id: routesId.DXB_CDG, from: airportsId.DXB, to: airportsId.CDG },
  { _id: routesId.BER_BCN, from: airportsId.BER, to: airportsId.BCN },
  { _id: routesId.SYD_JFK, from: airportsId.SYD, to: airportsId.JFK },
  { _id: routesId.JFK_BER, from: airportsId.JFK, to: airportsId.BER },
  { _id: routesId.HND_DXB, from: airportsId.HND, to: airportsId.DXB }
];

const flightsId = {
  EK101: "6530a1f43b7e41b94cfe5d01",
  AF202: "6530a1f43b7e41b94cfe5d02",
  AZ303: "6530a1f43b7e41b94cfe5d03",
  LH404: "6530a1f43b7e41b94cfe5d04",
  FR505_1: "6530a1f43b7e41b94cfe5d05",
  FR505_2: "6530a1f43b7e41b94cfe5d06",
  BA606: "6530a1f43b7e41b94cfe5d07",
  BA608: "6530a1f43b7e41b94cfe5d08",
  EK707: "6530a1f43b7e41b94cfe5d09",
  AF808: "6530a1f43b7e41b94cfe5d0a",
  FR909: "6530a1f43b7e41b94cfe5d0b",
  AZ010: "6530a1f43b7e41b94cfe5d0c",
  EK312: "6530a1f43b7e41b94cfe5d0d"
};

export const flights = [
  {
    _id: flightsId.EK101,
    code: "EK101",
    departure: new Date('2025-09-10T08:30:00Z'),
    duration: 720,
    route: routesId.DXB_SYD,
    airline: airlinesId.EK,
    airplane: airplanesId[6],
    arrival: new Date(new Date('2025-09-10T08:30:00Z').getTime() + 720 * 60000)
  },
  {
    _id: flightsId.AF202,
    code: "AF202",
    departure: new Date('2025-09-12T13:45:00Z'),
    duration: 660,
    route: routesId.FCO_LAX,
    airline: airlinesId.AF,
    airplane: airplanesId[3],
    arrival: new Date(new Date('2025-09-12T13:45:00Z').getTime() + 660 * 60000)
  },
  {
    _id: flightsId.AZ303,
    code: "AZ303",
    departure: new Date('2025-09-14T07:00:00Z'),
    duration: 90,
    route: routesId.VCE_FCO,
    airline: airlinesId.AZ,
    airplane: airplanesId[5],
    arrival: new Date(new Date('2025-09-14T07:00:00Z').getTime() + 90 * 60000)
  },
  {
    _id: flightsId.LH404,
    code: "LH404",
    departure: new Date('2025-09-16T22:00:00Z'),
    duration: 840,
    route: routesId.JFK_HND,
    airline: airlinesId.LH,
    airplane: airplanesId[4],
    arrival: new Date(new Date('2025-09-16T22:00:00Z').getTime() + 840 * 60000)
  },
  {
    _id: flightsId.FR505_1,
    code: "FR505",
    departure: new Date('2025-09-16T09:30:00Z'),
    duration: 540,
    route: routesId.VCE_JFK,
    airline: airlinesId.FR,
    airplane: airplanesId[1],
    arrival: new Date(new Date('2025-09-16T09:30:00Z').getTime() + 540 * 60000)
  },
  {
    _id: flightsId.FR505_2,
    code: "FR505",
    departure: new Date('2025-10-16T09:30:00Z'),
    duration: 540,
    route: routesId.VCE_JFK,
    airline: airlinesId.FR,
    airplane: airplanesId[1],
    arrival: new Date(new Date('2025-10-16T09:30:00Z').getTime() + 540 * 60000)
  },
  {
    _id: flightsId.BA606,
    code: "BA606",
    departure: new Date('2025-09-18T11:15:00Z'),
    duration: 600,
    route: routesId.HND_BER,
    airline: airlinesId.BA,
    airplane: airplanesId[2],
    arrival: new Date(new Date('2025-09-18T11:15:00Z').getTime() + 600 * 60000)
  },
  {
    _id: flightsId.BA608,
    code: "BA608",
    departure: new Date('2025-09-18T11:15:00Z'),
    duration: 600,
    route: routesId.JFK_BER,
    airline: airlinesId.BA,
    airplane: airplanesId[2],
    arrival: new Date(new Date('2025-09-18T11:15:00Z').getTime() + 600 * 60000)
  },
  {
    _id: flightsId.EK707,
    code: "EK707",
    departure: new Date('2025-09-19T20:45:00Z'),
    duration: 720,
    route: routesId.LAX_DXB,
    airline: airlinesId.EK,
    airplane: airplanesId[6],
    arrival: new Date(new Date('2025-09-19T20:45:00Z').getTime() + 720 * 60000)
  },
  {
    _id: flightsId.AF808,
    code: "AF808",
    departure: new Date('2025-09-20T06:00:00Z'),
    duration: 480,
    route: routesId.BER_PEK,
    airline: airlinesId.AF,
    airplane: airplanesId[3],
    arrival: new Date(new Date('2025-09-20T06:00:00Z').getTime() + 480 * 60000)
  },
  {
    _id: flightsId.FR909,
    code: "FR909",
    departure: new Date('2025-09-22T14:30:00Z'),
    duration: 480,
    route: routesId.EZE_BCN,
    airline: airlinesId.FR,
    airplane: airplanesId[1],
    arrival: new Date(new Date('2025-09-22T14:30:00Z').getTime() + 480 * 60000)
  },
  {
    _id: flightsId.AZ010,
    code: "AZ010",
    departure: new Date('2025-09-25T18:00:00Z'),
    duration: 360,
    route: routesId.CDG_VCE,
    airline: airlinesId.AZ,
    airplane: airplanesId[5],
    arrival: new Date(new Date('2025-09-25T18:00:00Z').getTime() + 360 * 60000)
  },
  {
    _id: flightsId.EK312,
    code: "EK312",
    departure: new Date('2025-09-20T09:30:00Z'),
    duration: 600,
    route: routesId.HND_DXB,
    airline: airlinesId.EK,
    airplane: airplanesId[6],
    arrival: new Date(new Date('2025-09-20T09:30:00Z').getTime() + 600 * 60000)
  }
];

const ticketsId = {
  1: "6550a1f43b7e41b94cfe7d01",
  2: "6550a1f43b7e41b94cfe7d02",
  3: "6550a1f43b7e41b94cfe7d03",
  4: "6550a1f43b7e41b94cfe7d04",
  5: "6550a1f43b7e41b94cfe7d05",
  6: "6550a1f43b7e41b94cfe7d06",
  7: "6550a1f43b7e41b94cfe7d07",
  8: "6550a1f43b7e41b94cfe7d08",
  9: "6550a1f43b7e41b94cfe7d09",
  10: "6550a1f43b7e41b94cfe7d0a",
  11: "6550a1f43b7e41b94cfe7d0b"
};

export const tickets = [
  { _id: ticketsId[1], code: 1, type: 'ECONOMY', price: 500, quantity: 50, flight: flightsId.EK101, departure: new Date('2025-09-10T08:30:00Z') },
  { _id: ticketsId[2], code: 2, type: 'BUSINESS', price: 1200, quantity: 20, flight: flightsId.EK101, departure: new Date('2025-09-10T08:30:00Z') },
  { _id: ticketsId[3], code: 3, type: 'FIRST CLASS', price: 2500, quantity: 10, flight: flightsId.AF202, departure: new Date('2025-09-12T13:45:00Z') },
  { _id: ticketsId[4], code: 4, type: 'ECONOMY', price: 400, quantity: 60, flight: flightsId.AZ303, departure: new Date('2025-09-14T07:00:00Z') },
  { _id: ticketsId[5], code: 5, type: 'BUSINESS', price: 1000, quantity: 25, flight: flightsId.LH404, departure: new Date('2025-09-16T22:00:00Z') },
  { _id: ticketsId[6], code: 6, type: 'FIRST CLASS', price: 2200, quantity: 8, flight: flightsId.FR505_1, departure: new Date('2025-09-16T09:30:00Z') },
  { _id: ticketsId[7], code: 7, type: 'ECONOMY', price: 550, quantity: 55, flight: flightsId.BA606, departure: new Date('2025-09-18T11:15:00Z') },
  { _id: ticketsId[8], code: 8, type: 'BUSINESS', price: 1300, quantity: 18, flight: flightsId.EK707, departure: new Date('2025-09-19T20:45:00Z') },
  { _id: ticketsId[9], code: 9, type: 'ECONOMY', price: 450, quantity: 45, flight: flightsId.AF808, departure: new Date('2025-09-20T06:00:00Z') },
  { _id: ticketsId[10], code: 10, type: 'FIRST CLASS', price: 2000, quantity: 12, flight: flightsId.FR909, departure: new Date('2025-09-22T14:30:00Z') },
  { _id: ticketsId[11], code: 11, type: 'ECONOMY', price: 600, quantity: 8, flight: flightsId.FR505_2, departure: new Date('2025-10-16T09:30:00Z') },
];

const purchasesId = {
  1: "6560a1f43b7e41b94cfe8d01",
  2: "6560a1f43b7e41b94cfe8d02",
  3: "6560a1f43b7e41b94cfe8d03",
  4: "6560a1f43b7e41b94cfe8d04",
  5: "6560a1f43b7e41b94cfe8d05",
  6: "6560a1f43b7e41b94cfe8d06",
  7: "6560a1f43b7e41b94cfe8d07",
  8: "6560a1f43b7e41b94cfe8d08",
  9: "6560a1f43b7e41b94cfe8d09",
  10: "6560a1f43b7e41b94cfe8d0a",
  11: "6560a1f43b7e41b94cfe8d0b",
  12: "6560a1f43b7e41b94cfe8d0c"
};

export const purchases = [
  { _id: purchasesId[1], price: 1200, date: new Date('2024-08-01T10:00:00Z'), quantity: 1, user: usersId.user, ticket: ticketsId[2] },
  { _id: purchasesId[2], price: 400, date: new Date('2024-08-02T09:00:00Z'), quantity: 1, user: usersId.user2, ticket: ticketsId[4] },
  { _id: purchasesId[3], price: 4400, date: new Date('2024-08-03T15:00:00Z'), quantity: 2, user: usersId.user, ticket: ticketsId[6] },
  { _id: purchasesId[4], price: 500, date: new Date('2024-08-04T11:00:00Z'), quantity: 1, user: usersId.user, ticket: ticketsId[1] },
  { _id: purchasesId[5], price: 2500, date: new Date('2024-08-05T14:30:00Z'), quantity: 1, user: usersId.user, ticket: ticketsId[3] },
  { _id: purchasesId[6], price: 1000, date: new Date('2024-08-06T12:45:00Z'), quantity: 1, user: usersId.user2, ticket: ticketsId[5] },
  { _id: purchasesId[7], price: 550, date: new Date('2024-08-07T08:15:00Z'), quantity: 1, user: usersId.user2, ticket: ticketsId[7] },
  { _id: purchasesId[8], price: 1300, date: new Date('2024-08-08T16:00:00Z'), quantity: 1, user: usersId.user2, ticket: ticketsId[8] },
  { _id: purchasesId[9], price: 450, date: new Date('2024-08-09T10:20:00Z'), quantity: 1, user: usersId.user, ticket: ticketsId[9] },
  { _id: purchasesId[10], price: 2000, date: new Date('2024-08-10T13:50:00Z'), quantity: 1, user: usersId.user, ticket: ticketsId[10] },
  { _id: purchasesId[11], price: 600, date: new Date('2024-08-11T09:40:00Z'), quantity: 1, user: usersId.user2, ticket: ticketsId[11] }
];

const passengersId = {
  1: "6570a1f43b7e41b94cfe9d01",
  2: "6570a1f43b7e41b94cfe9d02",
  3: "6570a1f43b7e41b94cfe9d03",
  4: "6570a1f43b7e41b94cfe9d04",
  5: "6570a1f43b7e41b94cfe9d05",
  6: "6570a1f43b7e41b94cfe9d06",
  7: "6570a1f43b7e41b94cfe9d07",
  8: "6570a1f43b7e41b94cfe9d08",
  9: "6570a1f43b7e41b94cfe9d09",
  10: "6570a1f43b7e41b94cfe9d0a",
  11: "6570a1f43b7e41b94cfe9d0b",
  12: "6570a1f43b7e41b94cfe9d0c"
};



export const passengers = [
  { _id: passengersId[1], name: "Luca", surname: "Bianchi", CF: "LCABNC90A01H501Z", seat: "A1", purchase: purchasesId[4], extra: ["PRIORITY"] },
  { _id: passengersId[2], name: "Maria", surname: "Rossi", passportNumber: "YA1234567", seat: "B2", purchase: purchasesId[1], extra: ["LARGER SEAT"] },
  { _id: passengersId[3], name: "Jean", surname: "Dupont", passportNumber: "FR9876543", seat: "C3", purchase: purchasesId[5], extra: ["EXTRA BAG", "PRIORITY"] },
  { _id: passengersId[4], name: "Giulia", surname: "Verdi", CF: "GLV1234567Z", seat: "D4", purchase: purchasesId[2], extra: [] },
  { _id: passengersId[5], name: "Hans", surname: "Müller", passportNumber: "DE4567890", seat: "E5", purchase: purchasesId[6], extra: ["LARGER SEAT"] },
  { _id: passengersId[6], name: "Patrick", surname: "O’Connor", passportNumber: "IE7654321", seat: "F6", purchase: purchasesId[3], extra: [] },
  { _id: passengersId[7], name: "Sofia", surname: "Martinez", passportNumber: "ES9988776", seat: "F7", purchase: purchasesId[3], extra: [] },
  { _id: passengersId[8], name: "Liam", surname: "Nguyen", passportNumber: "US1239874", seat: "F8", purchase: purchasesId[11], extra: [] },
  { _id: passengersId[9], name: "Sophie", surname: "Smith", passportNumber: "GB1230987", seat: "A7", purchase: purchasesId[7], extra: ["EXTRA BAG"] },
  { _id: passengersId[10], name: "Ahmed", surname: "Al-Farsi", passportNumber: "AE9988776", seat: "B8", purchase: purchasesId[8], extra: ["PRIORITY"] },
  { _id: passengersId[11], name: "Wei", surname: "Zhang", passportNumber: "CN12345678", seat: "C9", purchase: purchasesId[9], extra: [] },
  { _id: passengersId[12], name: "Carlos", surname: "Gonzalez", passportNumber: "AR11223344", seat: "D10", purchase: purchasesId[10], extra: ["LARGER SEAT", "EXTRA BAG"] }
];