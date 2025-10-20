// device-request.dto.ts
import { IsNumber, IsString, IsIn, IsOptional } from "class-validator";

export class CreateDeviceRequestDto {
  @IsString() username: string;
  @IsString() address: string;
  @IsString() segmen: string;
  @IsString() detail_address: string;
  @IsNumber() lat: number;
  @IsNumber() lng: number;
}

export class PatchDeviceRequestDto {
  @IsNumber() id: number;
  @IsIn(["pending", "approved", "rejected"]) status: "pending" | "approved" | "rejected";
  @IsOptional() @IsString() device_id?: string;
}
