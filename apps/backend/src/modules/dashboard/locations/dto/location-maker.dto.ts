export class LocationMarkerDto {
  deviceId!: string;
  deviceName!: string | null;
  segment!: string | null;
  status!: 'Active' | 'Inactive';
  addressName!: string | null;
  detailAddressName!: string | null;
  latitude!: number | null;
  longitude!: number | null;
}
