import { Airline } from "../models/Airline";
import { Airplane } from "../models/airplane";
import { Airport } from "../models/Airport";
import { Route } from "../models/route";

export const users: {mail: string, password: string, isAdmin: boolean}[] = [
  {
    mail: "admin@gmail.com",
    password: "admin",
    isAdmin: true
  }
]

export const airlines: Partial<Airline>[] = [
  {
    PIVA: "IE123456789",
    name: "Ryanair",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Ryanair_logo_new.svg",
    mail: "contact@ryanair.com"
  },
  {
    PIVA: "GB987654321",
    name: "British Airways",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/d7/British_Airways_Logo.svg",
    mail: "contact@ba.com"
  },
  {
    PIVA: "FR456789123",
    name: "Air France",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Air_France_Logo.svg",
    mail: "contact@airfrance.com"
  },
  {
    PIVA: "DE852369741",
    name: "Lufthansa",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Lufthansa_Logo_2018.svg",
    mail: "contact@lufthansa.com"
  },
  {
    PIVA: "IT741852963",
    name: "ITA Airways",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f1/ITA_Airways_logo.svg",
    mail: "contact@itaairways.com"
  },
  {
  PIVA: "AE987654321",
  name: "Emirates",
  logo: "https://upload.wikimedia.org/wikipedia/commons/d/d8/Emirates_logo.svg",
  mail: "contact@emirates.com"
  }
];

export const airplanes: Airplane[] = [
  { code: 1, model: "Airbus A320neo" },
  { code: 2, model: "Boeing 737-800" },
  { code: 3, model: "Embraer E190" },
  { code: 4, model: "Bombardier CRJ900" },
  { code: 5, model: "Boeing 787-9 Dreamliner" }
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
    date: new Date('2025-09-10T08:30:00Z'),
    duration: 720,
    route: { from: "DXB", to: "SYD" },
    airline: "Emirates"
  },
  {
    date: new Date('2025-09-12T13:45:00Z'),
    duration: 660,
    route: { from: "FCO", to: "LAX" },
    airline: "Air France"
  },
  {
    date: new Date('2025-09-14T07:00:00Z'),
    duration: 90,
    route: { from: "VCE", to: "FCO" },
    airline: "ITA Airways"
  },
  {
    date: new Date('2025-09-15T22:00:00Z'),
    duration: 840,
    route: { from: "JFK", to: "HND" },
    airline: "Lufthansa"
  },
  {
    date: new Date('2025-09-16T09:30:00Z'),
    duration: 540,
    route: { from: "VCE", to: "JFK" },
    airline: "Ryanair"
  },
  {
    date: new Date('2025-09-18T11:15:00Z'),
    duration: 600,
    route: { from: "HND", to: "BER" },
    airline: "British Airways"
  },
  {
    date: new Date('2025-09-19T20:45:00Z'),
    duration: 720,
    route: { from: "LAX", to: "DXB" },
    airline: "Emirates"
  },
  {
    date: new Date('2025-09-20T06:00:00Z'),
    duration: 480,
    route: { from: "BER", to: "PEK" },
    airline: "Air France"
  },
  {
    date: new Date('2025-09-22T14:30:00Z'),
    duration: 480,
    route: { from: "EZE", to: "BCN" },
    airline: "Ryanair"
  },
  {
    date: new Date('2025-09-25T18:00:00Z'),
    duration: 360,
    route: { from: "CDG", to: "VCE" },
    airline: "ITA Airways"
  }
]