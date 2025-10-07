export type Location = {
  id: string;
  lat: number;
  lng: number;
  address_name: string;
  detail_address?: string;
  device_id?: string;
  segment?: string;
  isActive: boolean;
};

