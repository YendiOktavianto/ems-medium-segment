import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationMarkerDto } from './dto/location-maker.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

type JwtUser = {
  sub?: string;
  userId?: string;
  email?: string;
  role?: string;
};
type AuthenticatedRequest = Request & { user?: JwtUser };

@Controller(['locations', 'api/locations'])
@UseGuards(JwtAuthGuard)
export class LocationController {
  constructor(private readonly service: LocationService) {}

  @Get()
  async list(
    @Req() req: AuthenticatedRequest,
    @Query('userId') userId?: string,
  ): Promise<LocationMarkerDto[]> {
    const jwtUser = req.user;

    // aman & terketik: hasil akhirnya string | undefined
    const uidFromJwt =
      (typeof jwtUser?.sub === 'string' ? jwtUser.sub : undefined) ??
      (typeof jwtUser?.userId === 'string' ? jwtUser.userId : undefined);

    const uid = userId ?? uidFromJwt;
    if (!uid) return [];

    return this.service.findMarkersByUser(uid);
  }

  // Optional convenience: tanpa query, pakai user dari JWT
  async listForMe(@Req() req: AuthenticatedRequest): Promise<LocationMarkerDto[]> {
    const jwtUser = req.user;

    const uid =
      (typeof jwtUser?.sub === 'string' ? jwtUser.sub : undefined) ??
      (typeof jwtUser?.userId === 'string' ? jwtUser.userId : undefined);

    if (!uid) return [];
    return this.service.findMarkersByUser(uid);
  }
}
