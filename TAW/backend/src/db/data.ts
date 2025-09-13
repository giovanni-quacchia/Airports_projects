import { Airline } from "../models/airline";
import { Airplane } from "../models/airplane";
import { Airport } from "../models/Airport";

export const users: {mail: string, password: string, isAdmin: boolean}[] = [
  {
    mail: "admin@gmail.com",
    password: "admin",
    isAdmin: true
  }
]

export const airlines: Partial<Airline>[] = [
  {
    code: "FR",
    PIVA: "IE123456789",
    name: "Ryanair",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Ryanair_logo_new.svg",
    mail: "contact@ryanair.com"
  },
  {
    code: "BA",
    PIVA: "GB987654321",
    name: "British Airways",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/d7/British_Airways_Logo.svg",
    mail: "contact@ba.com"
  },
  {
    code: "AF",
    PIVA: "FR456789123",
    name: "Air France",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Air_France_Logo.svg",
    mail: "contact@airfrance.com"
  },
  {
    code: "LH",
    PIVA: "DE852369741",
    name: "Lufthansa",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Lufthansa_Logo_2018.svg",
    mail: "contact@lufthansa.com"
  },
  {
    code: "AZ",
    PIVA: "IT741852963",
    name: "ITA Airways",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f1/ITA_Airways_logo.svg",
    mail: "contact@itaairways.com"
  },
  {
    code: "EK",
    PIVA: "AE987654321",
    name: "Emirates",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/d8/Emirates_logo.svg",
    mail: "contact@emirates.com"
  }
];

export const airplanes = [
  { code: 1, model: "Airbus A320neo", airline: "FR", rows: 30, letters: 6 },
  { code: 2, model: "Boeing 737-800", airline: "BA", rows: 32, letters: 6 },
  { code: 3, model: "Embraer E190", airline: "AF", rows: 28, letters: 4 },
  { code: 4, model: "Boeing 777-300ER", airline: "LH", rows: 40, letters: 9 },
  { code: 5, model: "Airbus A330-200", airline: "AZ", rows: 28, letters: 6 },
  { code: 6, model: "Boeing 777-200LR", airline: "EK", rows: 42, letters: 10 }
];

export const airports: Airport[] = [
  { name: "Venice Marco Polo Airport", city: "Venice", code: "VCE", country: "Italy" },
  { name: "Rome Fiumicino Airport", city: "Rome", code: "FCO", country: "Italy" },
  { name: "John F. Kennedy International Airport", city: "New York", code: "JFK", country: "USA" },
  { name: "Los Angeles International Airport", city: "Los Angeles", code: "LAX", country: "USA" },
  { name: "Tokyo Haneda Airport", city: "Tokyo", code: "HND", country: "Japan" },
  { name: "Dubai International Airport", city: "Dubai", code: "DXB", country: "UAE" },
  { name: "Berlin Brandenburg Airport", city: "Berlin", code: "BER", country: "Germany" },
  { name: "Sydney Kingsford Smith Airport", city: "Sydney", code: "SYD", country: "Australia" },
  { name: "Beijing Capital International Airport", city: "Beijing", code: "PEK", country: "China" },
  { name: "Ezeiza International Airport", city: "Buenos Aires", code: "EZE", country: "Argentina" },
  { name: "Charles de Gaulle Airport", city: "Paris", code: "CDG", country: "France" },
  { name: "Barcelona–El Prat Airport", city: "Barcelona", code: "BCN", country: "Spain" }
];

export const routes: {from: string, to: string}[] = [
  { from: "VCE", to: "FCO" },
  { from: "VCE", to: "JFK" },
  { from: "FCO", to: "LAX" },
  { from: "JFK", to: "HND" },
  { from: "LAX", to: "DXB" },
  { from: "HND", to: "BER" },
  { from: "DXB", to: "SYD" },
  { from: "BER", to: "PEK" },
  { from: "SYD", to: "EZE" },
  { from: "PEK", to: "CDG" },
  { from: "EZE", to: "BCN" },
  { from: "CDG", to: "VCE" },
  { from: "BCN", to: "FCO" },
  { from: "FCO", to: "DXB" },
  { from: "JFK", to: "SYD" },
  { from: "LAX", to: "PEK" },
  { from: "HND", to: "EZE" },
  { from: "DXB", to: "CDG" },
  { from: "BER", to: "BCN" },
  { from: "SYD", to: "JFK" },
  { from: "JFK", to: "BER" },
  { from: "HND", to: "DXB" },
];

export const flights = [
  {
    code: "EK101",
    departure: new Date('2025-09-10T08:30:00Z'),
    duration: 720,
    route: { from: "DXB", to: "SYD" },
    airline: "EK",  // Emirates code
    airplane: 6,
    arrival: new Date(new Date('2025-09-10T08:30:00Z').getTime() + 720 * 60000)
  },
  {
    code: "AF202",
    departure: new Date('2025-09-12T13:45:00Z'),
    duration: 660,
    route: { from: "FCO", to: "LAX" },
    airline: "AF",  // Air France code
    airplane: 3,
    arrival: new Date(new Date('2025-09-12T13:45:00Z').getTime() + 660 * 60000)
  },
  {
    code: "AZ303",
    departure: new Date('2025-09-14T07:00:00Z'),
    duration: 90,
    route: { from: "VCE", to: "FCO" },
    airline: "AZ",  // ITA Airways code
    airplane: 5,
    arrival: new Date(new Date('2025-09-14T07:00:00Z').getTime() + 90 * 60000)
  },
  {
    code: "LH404",
    departure: new Date('2025-09-16T22:00:00Z'),
    duration: 840,
    route: { from: "JFK", to: "HND" },
    airline: "LH",  // Lufthansa code
    airplane: 4,
    arrival: new Date(new Date('2025-09-16T22:00:00Z').getTime() + 840 * 60000)
  },
  {
    code: "FR505",
    departure: new Date('2025-09-16T09:30:00Z'),
    duration: 540,
    route: { from: "VCE", to: "JFK" },
    airline: "FR",  // Ryanair code
    airplane: 1,
    arrival: new Date(new Date('2025-09-16T09:30:00Z').getTime() + 540 * 60000)
  },
  {
    code: "FR505",
    departure: new Date('2025-10-16T09:30:00Z'),
    duration: 540,
    route: { from: "VCE", to: "JFK" },
    airline: "FR",  // Ryanair code
    airplane: 1,
    arrival: new Date(new Date('2025-10-16T09:30:00Z').getTime() + 540 * 60000)
  },
  {
    code: "BA606",
    departure: new Date('2025-09-18T11:15:00Z'),
    duration: 600,
    route: { from: "HND", to: "BER" },
    airline: "BA",  // British Airways code
    airplane: 2,
    arrival: new Date(new Date('2025-09-18T11:15:00Z').getTime() + 600 * 60000)
  },
  {
    code: "BA608",
    departure: new Date('2025-09-18T11:15:00Z'),
    duration: 600,
    route: { from: "JFK", to: "BER" },
    airline: "BA",  // British Airways code
    airplane: 2,
    arrival: new Date(new Date('2025-09-18T11:15:00Z').getTime() + 600 * 60000)
  },
  {
    code: "EK707",
    departure: new Date('2025-09-19T20:45:00Z'),
    duration: 720,
    route: { from: "LAX", to: "DXB" },
    airline: "EK",  // Emirates code
    airplane: 6,
    arrival: new Date(new Date('2025-09-19T20:45:00Z').getTime() + 720 * 60000)
  },
  {
    code: "AF808",
    departure: new Date('2025-09-20T06:00:00Z'),
    duration: 480,
    route: { from: "BER", to: "PEK" },
    airline: "AF",  // Air France code
    airplane: 3,
    arrival: new Date(new Date('2025-09-20T06:00:00Z').getTime() + 480 * 60000)
  },
  {
    code: "FR909",
    departure: new Date('2025-09-22T14:30:00Z'),
    duration: 480,
    route: { from: "EZE", to: "BCN" },
    airline: "FR",  // Ryanair code
    airplane: 1,
    arrival: new Date(new Date('2025-09-22T14:30:00Z').getTime() + 480 * 60000)
  },
  {
    code: "AZ010",
    departure: new Date('2025-09-25T18:00:00Z'),
    duration: 360,
    route: { from: "CDG", to: "VCE" },
    airline: "AZ",  // ITA Airways code
    airplane: 5,
    arrival: new Date(new Date('2025-09-25T18:00:00Z').getTime() + 360 * 60000)
  },
  {
    code: "EK312",
    departure: new Date('2025-09-20T09:30:00Z'),
    duration: 600,
    route: { from: "HND", to: "DXB" },
    airline: "EK",  // Emirates code
    airplane: 6,
    arrival: new Date(new Date('2025-09-20T09:30:00Z').getTime() + 600 * 60000)
  }
];

export const tickets = [
  { code: 1, type: 'ECONOMY', price: 500, quantity: 50, flight: 'EK101', departure: new Date('2025-09-10T08:30:00Z') },
  { code: 2, type: 'BUSINESS', price: 1200, quantity: 20, flight: 'EK101', departure: new Date('2025-09-10T08:30:00Z') },
  { code: 3, type: 'FIRST CLASS', price: 2500, quantity: 10, flight: 'AF202', departure: new Date('2025-09-12T13:45:00Z') },
  { code: 4, type: 'ECONOMY', price: 400, quantity: 60, flight: 'AZ303', departure: new Date('2025-09-14T07:00:00Z') },
  { code: 5, type: 'BUSINESS', price: 1000, quantity: 25, flight: 'LH404', departure: new Date('2025-09-16T22:00:00Z') },
  { code: 6, type: 'FIRST CLASS', price: 2200, quantity: 8, flight: 'FR505', departure: new Date('2025-09-16T09:30:00Z') },
  { code: 7, type: 'ECONOMY', price: 550, quantity: 55, flight: 'BA606', departure: new Date('2025-09-18T11:15:00Z') },
  { code: 8, type: 'BUSINESS', price: 1300, quantity: 18, flight: 'EK707', departure: new Date('2025-09-19T20:45:00Z') },
  { code: 9, type: 'ECONOMY', price: 450, quantity: 45, flight: 'AF808', departure: new Date('2025-09-20T06:00:00Z') },
  { code: 10, type: 'FIRST CLASS', price: 2000, quantity: 12, flight: 'FR909', departure: new Date('2025-09-22T14:30:00Z') },
  { code: 11, type: 'ECONOMY', price: 600, quantity: 8, flight: 'FR505', departure: new Date('2025-10-16T09:30:00Z') },
];


export const passengers = [
  {
    name: "Luca",
    surname: "Bianchi",
    CF: "LCABNC90A01H501Z",
    seat: "A1",
    ticket: 1, // EK101 - ECONOMY
    extra: ["PRIORITY"]
  },
  {
    name: "Maria",
    surname: "Rossi",
    passportNumber: "YA1234567",
    seat: "B2",
    ticket: 2, // EK101 - BUSINESS
    extra: ["LARGER SEAT"]
  },
  {
    name: "Jean",
    surname: "Dupont",
    passportNumber: "FR9876543",
    seat: "C3",
    ticket: 3, // AF202 - FIRST CLASS
    extra: ["EXTRA BAG", "PRIORITY"]
  },
  {
    name: "Giulia",
    surname: "Verdi",
    CF: "GLV1234567Z",
    seat: "D4",
    ticket: 4, // AZ303 - ECONOMY
    extra: []
  },
  {
    name: "Hans",
    surname: "Müller",
    passportNumber: "DE4567890",
    seat: "E5",
    ticket: 5, // LH404 - BUSINESS
    extra: ["LARGER SEAT"]
  },
  {
    name: "Patrick",
    surname: "O’Connor",
    passportNumber: "IE7654321",
    seat: "F6",
    ticket: 6, // FR505 - FIRST CLASS
    extra: []
  },
  {
    name: "Sofia",
    surname: "Martinez",
    passportNumber: "ES9988776",
    seat: "F7",
    ticket: 6, // FR505 - FIRST CLASS
    extra: []
  },
  {
    name: "Liam",
    surname: "Nguyen",
    passportNumber: "US1239874",
    seat: "F8",
    ticket: 11, // FR505 - ECONOMY
    extra: []
  },
  {
    name: "Sophie",
    surname: "Smith",
    passportNumber: "GB1230987",
    seat: "A7",
    ticket: 7, // BA606 - ECONOMY
    extra: ["EXTRA BAG"]
  },
  {
    name: "Ahmed",
    surname: "Al-Farsi",
    passportNumber: "AE9988776",
    seat: "B8",
    ticket: 8, // EK707 - BUSINESS
    extra: ["PRIORITY"]
  },
  {
    name: "Wei",
    surname: "Zhang",
    passportNumber: "CN12345678",
    seat: "C9",
    ticket: 9, // AF808 - ECONOMY
    extra: []
  },
  {
    name: "Carlos",
    surname: "Gonzalez",
    passportNumber: "AR11223344",
    seat: "D10",
    ticket: 10, // FR909 - FIRST CLASS
    extra: ["LARGER SEAT", "EXTRA BAG"]
  }
];
