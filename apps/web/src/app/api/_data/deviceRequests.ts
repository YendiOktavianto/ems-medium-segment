export type RequestItem = {
  id: number;
  username: string;
  address: string;
  segmen: string;
  detail_address: string;
  lat: number;
  lng: number;
  status: string; // "pending" | "approved" | "rejected"
  time: number;   // timestamp ms
};

let requests: RequestItem[] = [];

export function getAll() { return requests; }
export function setAll(next: RequestItem[]) { requests = next; }
export function nextId() { return (requests.at(-1)?.id ?? 0) + 1; }

export function add(item: RequestItem) {
  requests.push(item);
  return item;
}

export function update(id: number, patch: Partial<RequestItem>) {
  const idx = requests.findIndex(r => r.id === id);
  if (idx === -1) return null;
  requests[idx] = { ...requests[idx], ...patch };
  return requests[idx];
}

export function remove(id: number) {
  const idx = requests.findIndex(r => r.id === id);
  if (idx === -1) return false;
  requests.splice(idx, 1);
  return true;
}
