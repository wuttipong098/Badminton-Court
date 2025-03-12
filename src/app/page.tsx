import { redirect } from "next/navigation";

export default function Home() {
  redirect("BadmintonCourt/login"); 
  return null;
}

