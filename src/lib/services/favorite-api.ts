// ==============================================================================
// TheVrindaGroup - Property Favorite & Saved Properties API Service
// Connects frontend to real PostgreSQL backend endpoints:
//   - POST   /api/properties/:propertyId/favorite (add to favorites)
//   - DELETE /api/properties/:propertyId/favorite (remove from favorites)
//   - GET    /api/properties/:propertyId/favorite (check favorite status)
//   - GET    /api/favorites                       (get buyer's saved properties)
// ==============================================================================

import { apiClient } from "../api-client";
import { BackendProperty, BackendPagination } from "./property-api";

export interface BackendPropertyFavorite {
  id: string;
  propertyId: string;
  buyerId: string;
  createdAt: string;
  property: BackendProperty;
}

export interface PaginatedFavoritesResponse {
  favorites: BackendPropertyFavorite[];
  pagination: BackendPagination;
}

export interface FavoriteActionResponse {
  message: string;
  isFavorited: boolean;
}

export interface FavoriteStatusResponse {
  isFavorited: boolean;
}

export class FavoriteApiService {
  /**
   * Add a published property to authenticated buyer's favorites
   * POST /api/properties/:propertyId/favorite (BUYER role required)
   */
  static async addFavorite(propertyId: string): Promise<FavoriteActionResponse> {
    const res = await apiClient.post<FavoriteActionResponse>(
      `/properties/${propertyId}/favorite`
    );
    return res.data;
  }

  /**
   * Remove a property from authenticated buyer's favorites
   * DELETE /api/properties/:propertyId/favorite (BUYER role required)
   */
  static async removeFavorite(propertyId: string): Promise<FavoriteActionResponse> {
    const res = await apiClient.delete<FavoriteActionResponse>(
      `/properties/${propertyId}/favorite`
    );
    return res.data;
  }

  /**
   * Check whether a property is favorited by the authenticated buyer
   * GET /api/properties/:propertyId/favorite (BUYER role required)
   */
  static async getFavoriteStatus(propertyId: string): Promise<FavoriteStatusResponse> {
    const res = await apiClient.get<FavoriteStatusResponse>(
      `/properties/${propertyId}/favorite`
    );
    return res.data;
  }

  /**
   * Toggle favorite state for a property
   * Automatically adds or removes based on currently known state
   */
  static async toggleFavorite(
    propertyId: string,
    currentlyFavorited: boolean
  ): Promise<FavoriteActionResponse> {
    if (currentlyFavorited) {
      return this.removeFavorite(propertyId);
    } else {
      return this.addFavorite(propertyId);
    }
  }

  /**
   * Get paginated saved/favorite properties for the authenticated buyer
   * GET /api/favorites?page=1&limit=20 (BUYER role required)
   */
  static async getMyFavorites(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedFavoritesResponse> {
    const queryParams: Record<string, string | number> = {};
    if (params?.page) queryParams.page = params.page;
    if (params?.limit) queryParams.limit = params.limit;

    const res = await apiClient.get<PaginatedFavoritesResponse>(
      "/favorites",
      queryParams
    );
    return res.data;
  }
}
