import { cafe, generic, type Lexicon } from "../lexicon";
import { restaurant } from "./restaurant";
import { retail } from "./retail";
import { ecommerce } from "./ecommerce";
import { salon } from "./salon";
import { fitness } from "./fitness";
import { services } from "./services";
import { studio } from "./studio";
import { tech } from "./tech";
import { education } from "./education";
import { tourism } from "./tourism";
import { logistics } from "./logistics";
import { automotive } from "./automotive";
import { events } from "./events";
import { manufacturing } from "./manufacturing";

export const lexicons: Record<string, Lexicon> = {
  cafe, restaurant, retail, ecommerce, salon, fitness, services, studio,
  tech, education, tourism, logistics, automotive, events, manufacturing,
  other: generic,
};

export const lexiconOf = (sector: string): Lexicon => lexicons[sector] ?? generic;
