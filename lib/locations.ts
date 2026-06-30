// lib/locations.ts
// Pickup/meet-up locations available when creating or filtering listings.
// Dublin stays split by postal district (most listings are there today),
// plus a few specific on-campus tags. Every other county in the Republic
// of Ireland is added as one broad option — list a more exact spot in the
// listing description if needed.

export const LOCATIONS: string[] = [
  "Dublin 1",
  "Dublin 2",
  "Dublin 4",
  "Dublin 6",
  "Dublin 8",
  "On-campus TCD",
  "On-campus UCD",
  "On-campus DCU",
  "NCIRL",
  "Carlow",
  "Cavan",
  "Clare",
  "Cork",
  "Donegal",
  "Galway",
  "Kerry",
  "Kildare",
  "Kilkenny",
  "Laois",
  "Leitrim",
  "Limerick",
  "Longford",
  "Louth",
  "Mayo",
  "Meath",
  "Monaghan",
  "Offaly",
  "Roscommon",
  "Sligo",
  "Tipperary",
  "Waterford",
  "Westmeath",
  "Wexford",
  "Wicklow",
  "Online only",
];
