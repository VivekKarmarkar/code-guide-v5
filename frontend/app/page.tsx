import { frontendInput } from "@/lib/data";
import { SystemView } from "@/components/SystemView";

export default function Home() {
  return <SystemView data={frontendInput} />;
}
