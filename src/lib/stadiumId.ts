export async function fetchStadiumId(userId: string): Promise<number> {
  const res = await fetch(`/api/BS/getStadiumId?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) {
    throw new Error('Could not load stadiumId');
  }
  const { stadiumId } = await res.json();
  return stadiumId;
}