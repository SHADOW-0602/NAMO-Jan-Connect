import type { Metadata } from "next";
import NamoApp from "./NamoApp";

export const metadata: Metadata = {
  title: "NAMO Jan Connect — Every concern, clearly tracked",
  description: "File a civic complaint, follow every update, and see how departments are delivering for citizens.",
};

export default function Home() {
  return <NamoApp />;
}

