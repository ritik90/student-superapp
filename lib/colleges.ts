// lib/colleges.ts
// Master list of recognised Irish third-level institutions and their
// student email domains. Used to (a) gate signup/login to verified
// college emails, and (b) show a clean institution name on listings
// and profiles instead of an ugly raw domain string.

export type College = {
  name: string;
  domains: string[];
};

export const COLLEGES: College[] = [
  { name: "Atlantic Technological University", domains: ["atu.ie"] },
  { name: "Dublin City University", domains: ["dcu.ie"] },
  { name: "Maynooth University", domains: ["mu.ie", "nuim.ie"] },
  { name: "Munster Technological University", domains: ["mtu.ie"] },
  { name: "South East Technological University", domains: ["setu.ie"] },
  { name: "Technological University Dublin", domains: ["tudublin.ie"] },
  { name: "Technological University of the Shannon", domains: ["tus.ie"] },
  { name: "Trinity College Dublin", domains: ["tcd.ie"] },
  { name: "University College Cork", domains: ["ucc.ie"] },
  { name: "University College Dublin", domains: ["ucd.ie"] },
  { name: "University of Galway", domains: ["universityofgalway.ie", "nuigalway.ie"] },
  { name: "University of Limerick", domains: ["ul.ie"] },
  { name: "Marino Institute of Education", domains: ["mie.ie"] },
  { name: "Mary Immaculate College", domains: ["mic.ul.ie"] },
  { name: "National College of Art and Design", domains: ["ncad.ie"] },
  { name: "Royal College of Surgeons in Ireland", domains: ["rcsi.ie"] },
  { name: "American College Dublin", domains: ["amcd.ie"] },
  { name: "CCT College Dublin", domains: ["cct.ie"] },
  { name: "Dorset College", domains: ["dorset.ie"] },
  { name: "Dublin Business School", domains: ["dbs.ie"] },
  { name: "Griffith College", domains: ["griffith.ie"] },
  { name: "IBAT College Dublin", domains: ["ibat.ie"] },
  { name: "National College of Ireland", domains: ["ncirl.ie", "student.ncirl.ie"] },
];

export const ALLOWED_COLLEGE_DOMAINS: string[] = COLLEGES.flatMap(
  (c) => c.domains
).map((d) => d.toLowerCase());

const DOMAIN_TO_NAME = new Map<string, string>();
for (const college of COLLEGES) {
  for (const domain of college.domains) {
    DOMAIN_TO_NAME.set(domain.toLowerCase(), college.name);
  }
}

export function isAllowedCollegeDomain(domain: string | null | undefined): boolean {
  if (!domain) return false;
  return ALLOWED_COLLEGE_DOMAINS.includes(domain.toLowerCase());
}

export function getCollegeLabel(domain: string | null | undefined): string {
  if (!domain) return "Student seller";

  const known = DOMAIN_TO_NAME.get(domain.toLowerCase());
  if (known) return `${known} student`;

  if (domain.toLowerCase().endsWith(".ie")) {
    return `${domain} student`;
  }

  return "Student seller";
}
