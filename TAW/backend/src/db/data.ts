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

export const airplanes: Airplane[] = [
  { code: 1, model: "Airbus A320neo", rows: 30, letters: 6 },  // A-F
  { code: 2, model: "Boeing 737-800", rows: 32, letters: 6 },  // A-F
  { code: 3, model: "Embraer E190", rows: 28, letters: 4 },    // A-D
  { code: 4, model: "Bombardier CRJ900", rows: 24, letters: 4 }, // A-D
  { code: 5, model: "Boeing 787-9 Dreamliner", rows: 40, letters: 9 } // A-I
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
  { from: "SYD", to: "JFK" }
];

export const flights = [
  {
    code: "EK101",
    date: new Date('2025-09-10T08:30:00Z'),
    duration: 720,
    route: { from: "DXB", to: "SYD" },
    airline: "Emirates"
  },
  {
    code: "AF202",
    date: new Date('2025-09-12T13:45:00Z'),
    duration: 660,
    route: { from: "FCO", to: "LAX" },
    airline: "Air France"
  },
  {
    code: "AZ303",
    date: new Date('2025-09-14T07:00:00Z'),
    duration: 90,
    route: { from: "VCE", to: "FCO" },
    airline: "ITA Airways"
  },
  {
    code: "LH404",
    date: new Date('2025-09-15T22:00:00Z'),
    duration: 840,
    route: { from: "JFK", to: "HND" },
    airline: "Lufthansa"
  },
  {
    code: "FR505",
    date: new Date('2025-09-16T09:30:00Z'),
    duration: 540,
    route: { from: "VCE", to: "JFK" },
    airline: "Ryanair"
  },
  {
    code: "BA606",
    date: new Date('2025-09-18T11:15:00Z'),
    duration: 600,
    route: { from: "HND", to: "BER" },
    airline: "British Airways"
  },
  {
    code: "EK707",
    date: new Date('2025-09-19T20:45:00Z'),
    duration: 720,
    route: { from: "LAX", to: "DXB" },
    airline: "Emirates"
  },
  {
    code: "AF808",
    date: new Date('2025-09-20T06:00:00Z'),
    duration: 480,
    route: { from: "BER", to: "PEK" },
    airline: "Air France"
  },
  {
    code: "FR909",
    date: new Date('2025-09-22T14:30:00Z'),
    duration: 480,
    route: { from: "EZE", to: "BCN" },
    airline: "Ryanair"
  },
  {
    code: "AZ010",
    date: new Date('2025-09-25T18:00:00Z'),
    duration: 360,
    route: { from: "CDG", to: "VCE" },
    airline: "ITA Airways"
  }
]

export const tickets = [
  { type: "ECONOMY", price: 500, quantity: 50, flight: "EK101" },
  { type: "BUSINESS", price: 1200, quantity: 20, flight: "EK101" },
  { type: "FIRST CLASS", price: 2500, quantity: 10, flight: "AF202" },
  { type: "ECONOMY", price: 400, quantity: 60, flight: "AZ303" },
  { type: "BUSINESS", price: 1000, quantity: 25, flight: "LH404" },
  { type: "FIRST CLASS", price: 2200, quantity: 8, flight: "FR505" },
  { type: "ECONOMY", price: 550, quantity: 55, flight: "BA606" },
  { type: "BUSINESS", price: 1300, quantity: 18, flight: "EK707" },
  { type: "ECONOMY", price: 450, quantity: 45, flight: "AF808" },
  { type: "FIRST CLASS", price: 2000, quantity: 12, flight: "FR909" }
];