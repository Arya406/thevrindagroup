"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin, BedDouble, Maximize2, ExternalLink, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { EmptyState } from "./EmptyState";
import { useAuth } from "@/lib/auth/auth-context";
import { FavoriteApiService, BackendPropertyFavorite } from "@/lib/services/favorite-api";

interface SavedItem {
  id: string;
  favoriteId: string;
  title: string;
  location: string;
  price: string;
  bhk?: string;
  area: string;
  category: "buy" | "rent" | "commercial";
  image: string;
  postedAt: string;
  link: string;
}

type SavedTabType = "ALL" | "buy" | "rent" | "commercial";

function mapFavoriteToSavedItem(fav: BackendPropertyFavorite): SavedItem {
  const prop = fav.property;
  const isCommercial = prop.propertyType === "COMMERCIAL" || prop.propertyType === "OFFICE";
  const isRental = prop.listingType === "RENT";
  const category: SavedItem["category"] = isCommercial
    ? "commercial"
    : isRental
    ? "rent"
    : "buy";

  const locality = prop.location ? `${prop.location.locality}, ${prop.location.city}` : "Bangalore";
  const formattedPrice =
    prop.price >= 10000000
      ? `₹${(prop.price / 10000000).toFixed(2)} Cr`
      : prop.price >= 100000
      ? `₹${(prop.price / 100000).toFixed(2)} L`
      : `₹${prop.price.toLocaleString("en-IN")}`;

  const primaryImage =
    prop.images?.find((img) => img.isPrimary)?.url ||
    prop.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";

  const link = isCommercial
    ? `/commercial/property/${prop.id}`
    : `/property/${prop.id}`;

  return {
    id: prop.id,
    favoriteId: fav.id,
    title: prop.title,
    location: locality,
    price: isRental ? `${formattedPrice} / mo` : formattedPrice,
    bhk: prop.bedrooms ? `${prop.bedrooms} BHK` : undefined,
    area: prop.area ? `${prop.area.toLocaleString("en-IN")} sq.ft` : "Spacious",
    category,
    image: primaryImage,
    postedAt: `Saved ${new Date(fav.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}`,
    link,
  };
}

export function SavedPropertiesManager() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [currentTab, setCurrentTab] = useState<SavedTabType>("ALL");
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (isAuthenticated) {
      FavoriteApiService.getMyFavorites({ limit: 50 })
        .then((res) => {
          if (isMounted && res.favorites) {
            setSavedItems(res.favorites.map(mapFavoriteToSavedItem));
          }
        })
        .catch((err: unknown) => {
          if (isMounted) {
            const msg = err instanceof Error ? err.message : "Failed to load saved properties.";
            setError(msg);
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsFetching(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const handleRetry = () => {
    setIsFetching(true);
    setError(null);
    FavoriteApiService.getMyFavorites({ limit: 50 })
      .then((res) => {
        if (res.favorites) {
          setSavedItems(res.favorites.map(mapFavoriteToSavedItem));
        }
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Failed to load saved properties.";
        setError(msg);
      })
      .finally(() => {
        setIsFetching(false);
      });
  };

  const handleRemove = async (propertyId: string) => {
    const previousItems = [...savedItems];
    setSavedItems((prev) => prev.filter((item) => item.id !== propertyId));

    try {
      await FavoriteApiService.removeFavorite(propertyId);
    } catch (err: unknown) {
      setSavedItems(previousItems);
      const msg = err instanceof Error ? err.message : "Unable to remove favorite.";
      setError(msg);
    }
  };

  const filteredItems = savedItems.filter((item) => {
    if (currentTab === "ALL") return true;
    return item.category === currentTab;
  });

  const showLoading = isAuthLoading || (isAuthenticated && isFetching);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-primary-navy tracking-tight">
            Saved Properties
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Your shortlisted properties across residential sales, rental homes, and commercial spaces.
          </p>
        </div>

        <Link href="/buy">
          <Button variant="outline" size="sm" className="text-xs font-semibold">
            Explore More Listings
          </Button>
        </Link>
      </div>

      {/* Error State Banner */}
      {error && (
        <div className="rounded-xl bg-error-red-light/80 border border-error-red/30 p-4 text-xs text-error-red flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            className="text-xs h-8"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex gap-2 border-b border-border-default pb-1">
        {[
          { id: "ALL" as const, label: "All Saved" },
          { id: "buy" as const, label: "For Sale" },
          { id: "rent" as const, label: "For Rent" },
          { id: "commercial" as const, label: "Commercial" },
        ].map((tab) => {
          const isSelected = currentTab === tab.id;
          const count =
            tab.id === "ALL"
              ? savedItems.length
              : savedItems.filter((i) => i.category === tab.id).length;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCurrentTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                isSelected
                  ? "border-primary-navy text-primary-navy"
                  : "border-transparent text-text-secondary hover:text-primary-navy"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected
                    ? "bg-primary-navy text-white"
                    : "bg-bg-light text-text-muted"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Loading Skeleton */}
      {showLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="rounded-2xl border border-border-default bg-white p-4 space-y-3 animate-pulse"
            >
              <div className="w-full aspect-16/10 bg-slate-200 rounded-xl" />
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        /* Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-border-default bg-white overflow-hidden shadow-soft hover:shadow-soft-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Image */}
                <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Unsave Heart Button */}
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    title="Remove from saved"
                    className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 hover:bg-white text-error-red shadow-soft-xs transition-colors cursor-pointer"
                  >
                    <Heart className="w-4 h-4 fill-error-red" />
                  </button>

                  <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-dark-navy/80 text-white text-[10px] font-bold uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <div className="text-base font-extrabold text-primary-navy">
                    {item.price}
                  </div>

                  <h3 className="text-xs font-bold text-text-primary line-clamp-1">
                    {item.title}
                  </h3>

                  <p className="text-[11px] text-text-secondary flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-accent-gold shrink-0" />
                    {item.location}
                  </p>

                  <div className="flex items-center gap-3 pt-2 text-[11px] text-text-muted border-t border-border-subtle">
                    {item.bhk && (
                      <span className="flex items-center gap-1">
                        <BedDouble className="w-3.5 h-3.5 text-text-muted" />
                        {item.bhk}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5 text-text-muted" />
                      {item.area}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Action Link */}
              <div className="p-4 pt-0">
                <Link href={item.link} className="w-full block">
                  <Button
                    variant="outline"
                    size="sm"
                    rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                    className="w-full text-xs font-semibold"
                  >
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Heart}
          title="No saved properties yet"
          description="Save properties you like while searching across Buy, Rent, and Commercial marketplaces to compare them later."
          actionText="Explore Properties"
          actionHref="/buy"
        />
      )}
    </div>
  );
}

export default SavedPropertiesManager;
