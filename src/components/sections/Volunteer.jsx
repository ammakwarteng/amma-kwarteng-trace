import { volunteering } from "../../data/site.js";
import { Directory } from "./Community.jsx";

// Volunteer roles: same directory layout as community. Hidden until "volunteer" is set ready in site.js.
export default function Volunteer() {
  return <Directory items={volunteering.map((v) => ({ name: v.org, role: v.role, url: v.url, when: v.when, about: v.what }))} prefix="VOL" label="Volunteer roles" />;
}
