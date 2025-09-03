import { Airline } from "../models/Airline";
import { Airplane } from "../models/airplane";

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
];

export const airplanes: Airplane[] = [
  { code: 1, model: "Airbus A320neo" },
  { code: 2, model: "Boeing 737-800" },
  { code: 3, model: "Embraer E190" },
  { code: 4, model: "Bombardier CRJ900" },
  { code: 5, model: "Boeing 787-9 Dreamliner" }
];