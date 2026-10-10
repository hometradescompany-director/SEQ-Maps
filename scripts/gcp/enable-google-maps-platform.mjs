import { spawnSync } from "node:child_process";
import { getGoogleMapsServiceIds } from "../../src/adapters/google-maps/capabilities.mjs";

const args = new Set(process.argv.slice(2));
const apply = args.has("--apply");
const includeLegacy = args.has("--include-legacy");
const project = process.env.GOOGLE_CLOUD_PROJECT?.trim();

if (!project) {
  console.error("GOOGLE_CLOUD_PROJECT is required.");
  process.exit(2);
}

const services = getGoogleMapsServiceIds({ includeLegacy });

console.log(`Google Cloud project: ${project}`);
console.log(`Mode: ${apply ? "apply" : "dry-run"}`);
console.log(`Services: ${services.length}`);
for (const service of services) console.log(`- ${service}`);

if (!apply) process.exit(0);

let failures = 0;
for (const service of services) {
  const result = spawnSync(
    "gcloud",
    ["services", "enable", service, "--project", project],
    { stdio: "inherit" }
  );

  if (result.error) {
    console.error(`Failed to execute gcloud for ${service}: ${result.error.message}`);
    failures += 1;
    continue;
  }

  if (result.status !== 0) failures += 1;
}

if (failures > 0) {
  console.error(`${failures} service enablement operation(s) failed.`);
  process.exit(1);
}

console.log("Google Maps Platform service enablement completed.");
